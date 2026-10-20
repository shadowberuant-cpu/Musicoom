
/**
 * Discovery Service
 * Trending music, radio mixes, top artists/tracks by country
 */

import { YTMusic } from "./ytmusic.ts";
import {
  LastFM,
  getTopArtists as lastfmTopArtists,
  getTopTracks as lastfmTopTracks,
} from "./lastfm.ts";

export async function getTrendingMusic(
  country = "United States",
  ytmusic?: YTMusic
) {
  try {
    if (ytmusic) {
      const countryName = country.trim();

      const searchQueries = [
        `${countryName} music 2026`,
        `${countryName} songs`,
        `${countryName} hits`,
        `popular music in ${countryName}`,
        `new songs in ${countryName} 2026`,
      ];

      const allTracks: any[] = [];
      const seenIds = new Set<string>();

      for (const query of searchQueries) {
        if (allTracks.length >= 30) break;

        const results = await ytmusic.search(query, "songs");

        if (Array.isArray(results?.results)) {
          for (const track of results.results) {
            if (track?.videoId && !seenIds.has(track.videoId)) {
              seenIds.add(track.videoId);

              allTracks.push({
                name: track.title,
                artist: track.artists
                  ?.map((artist: any) => artist.name)
                  .filter(Boolean)
                  .join(", "),
                videoId: track.videoId,
                thumbnail: track.thumbnails?.[0]?.url,
                duration: track.duration,
              });
            }

            if (allTracks.length >= 30) break;
          }
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
  } catch (err) {
    console.error("getTrendingMusic error:", err);

    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function getRadio(videoId: string, ytmusic: YTMusic) {
  try {
    if (!videoId?.trim()) {
      return {
        success: false,
        error: "Missing videoId",
      };
    }

    const data = await ytmusic.getWatchPlaylist(
      videoId,
      undefined,
      true,
      false,
      50
    );

    if (data?.tracks && data.tracks.length > 0) {
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
  } catch (err) {
    console.error("getRadio error:", err);

    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
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
        `${countryName} artists`,
        `${countryName} singers`,
        `${countryName} rappers`,
        `${countryName} musicians`,
        `artists from ${countryName}`,
        `singers from ${countryName}`,
      ];

      const allArtists: any[] = [];
      const seenIds = new Set<string>();

      for (const query of searchQueries) {
        if (allArtists.length >= safeLimit) break;

        const results = await ytmusic.search(query, "artists");

        if (Array.isArray(results?.results)) {
          for (const artist of results.results) {
            if (artist?.browseId && !seenIds.has(artist.browseId)) {
              seenIds.add(artist.browseId);

              allArtists.push({
                name: artist.title,
                browseId: artist.browseId,
                thumbnail: artist.thumbnails?.[0]?.url,
              });
            }

            if (allArtists.length >= safeLimit) break;
          }
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

    // Fallback to Last.fm global
    return await lastfmTopArtists(undefined, safeLimit);
  } catch (err) {
    console.error("getTopArtists error:", err);

    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
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
        `${countryName} music`,
        `${countryName} songs`,
        `${countryName} rap`,
        `${countryName} hits 2026`,
        `music from ${countryName}`,
        `songs from ${countryName}`,
      ];

      const allTracks: any[] = [];
      const seenIds = new Set<string>();

      for (const query of searchQueries) {
        if (allTracks.length >= safeLimit) break;

        const results = await ytmusic.search(query, "songs");

        if (Array.isArray(results?.results)) {
          for (const track of results.results) {
            if (track?.videoId && !seenIds.has(track.videoId)) {
              seenIds.add(track.videoId);

              allTracks.push({
                name: track.title,
                artist: track.artists
                  ?.map((artist: any) => artist.name)
                  .filter(Boolean)
                  .join(", "),
                videoId: track.videoId,
                thumbnail: track.thumbnails?.[0]?.url,
                duration: track.duration,
              });
            }

            if (allTracks.length >= safeLimit) break;
          }
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

    // Fallback to Last.fm global
    return await lastfmTopTracks(undefined, safeLimit);
  } catch (err) {
    console.error("getTopTracks error:", err);

    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function getSimilarTracks(
  title: string,
  artist: string,
  limit: string | number,
  youtubeSearch: any
) {
  const cleanTitle = title?.trim();
  const cleanArtist = artist?.trim();

  if (!cleanTitle || !cleanArtist) {
    return {
      error: "Missing title or artist",
    };
  }

  if (
    !youtubeSearch ||
    typeof youtubeSearch.searchVideos !== "function"
  ) {
    return {
      error: "YouTube search service is unavailable",
    };
  }

  const parsedLimit = Number.parseInt(String(limit), 10);
  const safeLimit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(parsedLimit, 1), 20)
    : 5;

  try {
    const similar = await LastFM.getSimilarTracks(
      cleanTitle,
      cleanArtist,
      String(safeLimit)
    );

    if (!Array.isArray(similar)) {
      return {
        error:
          similar && typeof similar.error === "string"
            ? similar.error
            : "Last.fm returned an invalid similar-tracks response",
      };
    }

    const tracks = similar.filter(
      (track: any) =>
        typeof track?.title === "string" &&
        track.title.trim() &&
        typeof track?.artist === "string" &&
        track.artist.trim()
    );

    const results = await Promise.all(
      tracks.slice(0, safeLimit).map(async (track: any) => {
        try {
          const trackTitle = track.title.trim();
          const trackArtist = track.artist.trim();

          const response = await youtubeSearch.searchVideos(
            `${trackTitle} ${trackArtist}`
          );

          const videos = Array.isArray(response?.results)
            ? response.results
            : [];

          const video = videos.find(
            (item: any) =>
              typeof item?.videoId === "string" &&
              item.videoId.trim() &&
              typeof item?.title === "string" &&
              item.title.trim()
          );

          if (!video) {
            return null;
          }

          return {
            ...video,
            similarTrack: {
              title: trackTitle,
              artist: trackArtist,
            },
          };
        } catch (err) {
          console.error(
            `Similar-track YouTube search failed for "${track.title}":`,
            err
          );

          return null;
        }
      })
    );

    return results.filter(Boolean);
  } catch (err) {
    console.error("getSimilarTracks error:", err);

    return {
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
