
/**
 * Discovery Service
 * Trending music, radio mixes, top artists/tracks by country,
 * and similar-track discovery.
 */

import { YTMusic } from "./ytmusic.ts";
import {
  LastFM,
  getTopArtists as lastfmTopArtists,
  getTopTracks as lastfmTopTracks,
} from "./lastfm.ts";

type SimilarTrack = {
  title: string;
  artist: string;
};

function normalizeText(value: unknown): string {
  return typeof value === "string"
    ? value.trim().toLowerCase().replace(/\s+/g, " ")
    : "";
}

function getLimit(value: string | number, fallback = 5): number {
  const parsed = Number.parseInt(String(value), 10);

  return Number.isFinite(parsed)
    ? Math.min(Math.max(parsed, 1), 20)
    : fallback;
}

function getArtistNames(artists: any): string {
  if (Array.isArray(artists)) {
    return artists
      .map((artist: any) =>
        typeof artist === "string" ? artist : artist?.name
      )
      .filter(Boolean)
      .join(", ");
  }

  if (typeof artists === "string") return artists;
  if (typeof artists?.name === "string") return artists.name;

  return "";
}

export async function getTrendingMusic(
  country = "United States",
  ytmusic?: YTMusic
) {
  try {
    if (ytmusic) {
      const countryName = country.trim();

      const searchQueries = [
        `popular music in ${countryName}`,
        `top songs ${countryName} 2026`,
        `popular songs ${countryName}`,
        `new music ${countryName} 2026`,
        `hits from ${countryName}`,
      ];

      const allTracks: any[] = [];
      const seenIds = new Set<string>();

      for (const query of searchQueries) {
        if (allTracks.length >= 30) break;

        const response = await ytmusic.search(query, "songs");
        const tracks = Array.isArray(response?.results)
          ? response.results
          : [];

        for (const track of tracks) {
          if (!track?.videoId || seenIds.has(track.videoId)) continue;

          seenIds.add(track.videoId);

          allTracks.push({
            name: track.title,
            artist: getArtistNames(track.artists),
            videoId: track.videoId,
            thumbnail: track.thumbnails?.[0]?.url,
            duration: track.duration,
          });

          if (allTracks.length >= 30) break;
        }
      }

      if (allTracks.length > 0) {
        return {
          success: true,
          country: countryName,
          tracks: allTracks,
        };
      }
    }

    return {
      success: false,
      error: "Could not fetch trending",
    };
  } catch (error) {
    console.error("getTrendingMusic error:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getRadio(videoId: string, ytmusic: YTMusic) {
  try {
    if (!videoId?.trim()) {
      return { success: false, error: "Missing videoId" };
    }

    const data = await ytmusic.getWatchPlaylist(
      videoId,
      undefined,
      true,
      false,
      50
    );

    if (Array.isArray(data?.tracks) && data.tracks.length > 0) {
      return {
        success: true,
        seedVideoId: videoId,
        tracks: data.tracks,
      };
    }

    return {
      success: false,
      error: "Could not generate radio",
    };
  } catch (error) {
    console.error("getRadio error:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getTopArtists(
  country?: string,
  limit = 20,
  ytmusic?: YTMusic
) {
  try {
    const safeLimit = Number.isFinite(Number(limit))
      ? Math.min(Math.max(Math.floor(Number(limit)), 1), 50)
      : 20;

    if (country?.trim() && ytmusic) {
      const countryName = country.trim();

      const searchQueries = [
        `popular artists in ${countryName}`,
        `top singers from ${countryName}`,
        `popular musicians ${countryName}`,
        `top rappers ${countryName}`,
        `artists from ${countryName}`,
      ];

      const allArtists: any[] = [];
      const seenIds = new Set<string>();

      for (const query of searchQueries) {
        if (allArtists.length >= safeLimit) break;

        const response = await ytmusic.search(query, "artists");
        const artists = Array.isArray(response?.results)
          ? response.results
          : [];

        for (const artist of artists) {
          if (!artist?.browseId || seenIds.has(artist.browseId)) continue;

          seenIds.add(artist.browseId);

          allArtists.push({
            name: artist.title,
            browseId: artist.browseId,
            thumbnail: artist.thumbnails?.[0]?.url,
          });

          if (allArtists.length >= safeLimit) break;
        }
      }

      if (allArtists.length > 0) {
        return {
          success: true,
          country: countryName,
          artists: allArtists.slice(0, safeLimit),
        };
      }
    }

    return await lastfmTopArtists(undefined, safeLimit);
  } catch (error) {
    console.error("getTopArtists error:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getTopTracks(
  country?: string,
  limit = 20,
  ytmusic?: YTMusic
) {
  try {
    const safeLimit = Number.isFinite(Number(limit))
      ? Math.min(Math.max(Math.floor(Number(limit)), 1), 50)
      : 20;

    if (country?.trim() && ytmusic) {
      const countryName = country.trim();

      const searchQueries = [
        `popular songs in ${countryName}`,
        `top music ${countryName}`,
        `hit songs from ${countryName}`,
        `popular rap ${countryName}`,
        `music from ${countryName}`,
      ];

      const allTracks: any[] = [];
      const seenIds = new Set<string>();

      for (const query of searchQueries) {
        if (allTracks.length >= safeLimit) break;

        const response = await ytmusic.search(query, "songs");
        const tracks = Array.isArray(response?.results)
          ? response.results
          : [];

        for (const track of tracks) {
          if (!track?.videoId || seenIds.has(track.videoId)) continue;

          seenIds.add(track.videoId);

          allTracks.push({
            name: track.title,
            artist: getArtistNames(track.artists),
            videoId: track.videoId,
            thumbnail: track.thumbnails?.[0]?.url,
            duration: track.duration,
          });

          if (allTracks.length >= safeLimit) break;
        }
      }

      if (allTracks.length > 0) {
        return {
          success: true,
          country: countryName,
          tracks: allTracks.slice(0, safeLimit),
        };
      }
    }

    return await lastfmTopTracks(undefined, safeLimit);
  } catch (error) {
    console.error("getTopTracks error:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Find similar tracks using Last.fm first, then YouTube search
 * as a fallback if Last.fm returns no usable tracks.
 */
export async function getSimilarTracks(
  title: string,
  artist: string,
  limit: string | number,
  youtubeSearch: any
) {
  const cleanTitle = title?.trim();
  const cleanArtist = artist?.trim();
  const safeLimit = getLimit(limit);

  if (!cleanTitle || !cleanArtist) {
    return { error: "Missing title or artist" };
  }

  if (typeof youtubeSearch?.searchVideos !== "function") {
    return { error: "YouTube search service is unavailable" };
  }

  const seenVideoIds = new Set<string>();
  const output: any[] = [];

  // First try Last.fm similar-track recommendations.
  try {
    const lastfmResult = await LastFM.getSimilarTracks(
      cleanTitle,
      cleanArtist,
      String(safeLimit)
    );

    if (!Array.isArray(lastfmResult)) {
      console.error("Last.fm similar-tracks error:", lastfmResult);
    } else {
      const similarTracks: SimilarTrack[] = lastfmResult
        .map((track: any) => ({
          title: String(track?.title ?? "").trim(),
          artist: String(track?.artist ?? "").trim(),
        }))
        .filter(
          (track: SimilarTrack) =>
            track.title &&
            track.artist &&
            !(
              normalizeText(track.title) === normalizeText(cleanTitle) &&
              normalizeText(track.artist) === normalizeText(cleanArtist)
            )
        );

      for (const track of similarTracks) {
        if (output.length >= safeLimit) break;

        try {
          const response = await youtubeSearch.searchVideos(
            `${track.title} ${track.artist}`
          );

          const videos = Array.isArray(response?.results)
            ? response.results
            : [];

          const video = videos.find(
            (item: any) =>
              typeof item?.videoId === "string" &&
              item.videoId.trim() &&
              !seenVideoIds.has(item.videoId)
          );

          if (!video) continue;

          seenVideoIds.add(video.videoId);

          output.push({
            ...video,
            similarTrack: {
              title: track.title,
              artist: track.artist,
            },
          });
        } catch (error) {
          console.error("YouTube similar-track lookup failed:", error);
        }
      }
    }
  } catch (error) {
    console.error("Last.fm similar-track lookup failed:", error);
  }

  // If Last.fm provides no usable results, search YouTube using
  // the original track and artist. These are fallback search matches,
  // not guaranteed Last.fm similarity recommendations.
  if (output.length === 0) {
    const fallbackQueries = [
      `${cleanTitle} ${cleanArtist} similar songs`,
      `songs like ${cleanTitle} by ${cleanArtist}`,
      `${cleanArtist} similar songs`,
    ];

    for (const query of fallbackQueries) {
      if (output.length >= safeLimit) break;

      try {
        const response = await youtubeSearch.searchVideos(query);
        const videos = Array.isArray(response?.results)
          ? response.results
          : [];

        for (const video of videos) {
          if (
            !video?.videoId ||
            seenVideoIds.has(video.videoId) ||
            typeof video.title !== "string"
          ) {
            continue;
          }

          // Avoid returning the exact input video by title match.
          if (
            normalizeText(video.title).includes(normalizeText(cleanTitle)) &&
            normalizeText(video.title).includes(normalizeText(cleanArtist))
          ) {
            continue;
          }

          seenVideoIds.add(video.videoId);

          output.push({
            ...video,
            similarTrack: null,
            source: "youtube-search-fallback",
            searchQuery: query,
          });

          if (output.length >= safeLimit) break;
        }
      } catch (error) {
        console.error("YouTube fallback search failed:", error);
      }
    }
  }

  return output.slice(0, safeLimit);
}
