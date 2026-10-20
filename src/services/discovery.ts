
/**
 * Discovery Service
 * Trending music, radio mixes, top artists/tracks by country,
 * and improved similar-track discovery.
 */

import { YTMusic } from "./ytmusic.ts";
import {
  LastFM,
  getTopArtists as lastfmTopArtists,
  getTopTracks as lastfmTopTracks,
} from "./lastfm.ts";

/**
 * Normalize titles and artist names so small formatting differences
 * don't prevent a match.
 */
function normalizeMusicText(value: unknown): string {
  if (typeof value !== "string") return "";

  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\([^)]*\)|\[[^\]]*\]|\{[^}]*\}/g, " ")
    .replace(
      /\b(official\s+)?(music\s+)?(video|audio|lyrics?|visualizer|visualiser|hd|hq|4k|topic|remaster(ed)?|live|explicit|clean|mv|lyric video)\b/g,
      " ",
    )
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Calculate the proportion of meaningful query words that appear
 * in the candidate text.
 */
function tokenOverlap(query: string, candidate: string): number {
  const queryTokens = new Set(
    normalizeMusicText(query)
      .split(" ")
      .filter((word) => word.length > 1),
  );

  const candidateTokens = new Set(
    normalizeMusicText(candidate)
      .split(" ")
      .filter((word) => word.length > 1),
  );

  if (queryTokens.size === 0 || candidateTokens.size === 0) {
    return 0;
  }

  let matches = 0;

  for (const token of queryTokens) {
    if (candidateTokens.has(token)) matches++;
  }

  return matches / queryTokens.size;
}

/**
 * Read artist names from common YouTube search-result shapes.
 */
function getVideoArtistText(video: any): string {
  const possibleArtists = [
    video?.artist,
    video?.author,
    video?.channelTitle,
    video?.channelName,
    video?.artists,
  ];

  return possibleArtists
    .map((value: any) => {
      if (typeof value === "string") return value;

      if (Array.isArray(value)) {
        return value
          .map((artist: any) =>
            typeof artist === "string"
              ? artist
              : artist?.name ?? artist?.title ?? ""
          )
          .filter(Boolean)
          .join(" ");
      }

      if (value && typeof value === "object") {
        return value.name ?? value.title ?? "";
      }

      return "";
    })
    .filter(Boolean)
    .join(" ");
}

/**
 * Score a YouTube candidate against the intended similar track.
 * Higher scores indicate stronger title and artist relevance.
 */
function scoreVideoCandidate(
  video: any,
  expectedTitle: string,
  expectedArtist: string,
): number {
  if (
    typeof video?.videoId !== "string" ||
    !video.videoId.trim() ||
    typeof video?.title !== "string" ||
    !video.title.trim()
  ) {
    return -1;
  }

  const title = normalizeMusicText(video.title);
  const wantedTitle = normalizeMusicText(expectedTitle);
  const wantedArtist = normalizeMusicText(expectedArtist);
  const artistText = normalizeMusicText(getVideoArtistText(video));

  if (!title || !wantedTitle || !wantedArtist) return -1;

  let score = 0;

  // Title relevance is the most important signal.
  if (title === wantedTitle) {
    score += 10;
  } else if (title.includes(wantedTitle)) {
    score += 7;
  } else if (wantedTitle.includes(title) && title.length > 2) {
    score += 5;
  } else {
    score += tokenOverlap(wantedTitle, title) * 6;
  }

  // Artist information can appear in the title or channel metadata.
  if (title.includes(wantedArtist)) {
    score += 5;
  } else if (artistText.includes(wantedArtist)) {
    score += 5;
  } else {
    const titleArtistOverlap = tokenOverlap(wantedArtist, title);
    const metadataArtistOverlap = tokenOverlap(wantedArtist, artistText);

    score += Math.max(titleArtistOverlap, metadataArtistOverlap) * 4;
  }

  // Small preference for useful music uploads over obvious low-relevance
  // edits, reaction videos, and unrelated compilations.
  if (/\b(official|audio|lyrics|lyric video)\b/i.test(video.title)) {
    score += 0.25;
  }

  if (
    /\b(reaction|review|tutorial|karaoke|instrumental|nightcore|slowed|speed up|sped up|mashup|compilation)\b/i.test(
      video.title,
    )
  ) {
    score -= 2;
  }

  return score;
}

/**
 * Get trending music for a country using YouTube Music search.
 */
export async function getTrendingMusic(
  country = "United States",
  ytmusic?: YTMusic,
) {
  try {
    if (ytmusic) {
      const countryName = country.trim() || "United States";

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

/**
 * Generate a radio playlist from a seed YouTube video ID.
 */
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
      50,
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

/**
 * Get artists for a country, with a Last.fm fallback.
 */
export async function getTopArtists(
  country?: string,
  limit = 20,
  ytmusic?: YTMusic,
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

    // Fallback to Last.fm global artists.
    return await lastfmTopArtists(undefined, safeLimit);
  } catch (err) {
    console.error("getTopArtists error:", err);

    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Get tracks for a country, with a Last.fm fallback.
 */
export async function getTopTracks(
  country?: string,
  limit = 20,
  ytmusic?: YTMusic,
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

    // Fallback to Last.fm global tracks.
    return await lastfmTopTracks(undefined, safeLimit);
  } catch (err) {
    console.error("getTopTracks error:", err);

    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Find similar tracks through Last.fm, then locate the most relevant
 * playable YouTube result for each recommendation.
 *
 * The result remains an array of YouTube video objects, with the
 * original Last.fm recommendation attached as `similarTrack`.
 */
export async function getSimilarTracks(
  title: string,
  artist: string,
  limit: string | number,
  youtubeSearch: any,
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
      String(safeLimit),
    );

    if (!Array.isArray(similar)) {
      return {
        error:
          similar && typeof similar.error === "string"
            ? similar.error
            : "Last.fm returned an invalid similar-tracks response",
      };
    }

    // Remove malformed tracks and duplicate recommendations.
    const seenRecommendations = new Set<string>();

    const tracks = similar.filter((track: any) => {
      if (
        typeof track?.title !== "string" ||
        !track.title.trim() ||
        typeof track?.artist !== "string" ||
        !track.artist.trim()
      ) {
        return false;
      }

      const key = `${normalizeMusicText(track.title)}::${normalizeMusicText(track.artist)}`;

      if (seenRecommendations.has(key)) return false;

      seenRecommendations.add(key);
      return true;
    });

    // Search recommendations concurrently. Each search is evaluated
    // independently, so one failed search does not break the whole list.
    const results = await Promise.all(
      tracks.slice(0, safeLimit).map(async (track: any) => {
        const trackTitle = track.title.trim();
        const trackArtist = track.artist.trim();

        try {
          // Quoting the title helps reduce unrelated search results.
          const query = `"${trackTitle}" "${trackArtist}"`;
          const response = await youtubeSearch.searchVideos(query);

          const videos = Array.isArray(response?.results)
            ? response.results
            : [];

          if (videos.length === 0) {
            return null;
          }

          const rankedVideos = videos
            .map((video: any, index: number) => ({
              video,
              index,
              score: scoreVideoCandidate(
                video,
                trackTitle,
                trackArtist,
              ),
            }))
            .filter((candidate: any) => candidate.score >= 0)
            .sort(
              (a: any, b: any) =>
                b.score - a.score || a.index - b.index,
            );

          const bestMatch = rankedVideos[0];

          // Reject weak matches rather than returning an obviously
          // unrelated song just to fill the requested limit.
          if (!bestMatch || bestMatch.score < 5) {
            return null;
          }

          return {
            ...bestMatch.video,
            similarTrack: {
              title: trackTitle,
              artist: trackArtist,
            },
            matchScore: Number(bestMatch.score.toFixed(2)),
          };
        } catch (err) {
          console.error(
            `Similar-track YouTube search failed for "${trackTitle}" by "${trackArtist}":`,
            err,
          );

          return null;
        }
      }),
    );

    // Remove duplicate YouTube videos and keep the requested result count.
    const seenVideoIds = new Set<string>();
    const matchedTracks: any[] = [];

    for (const result of results) {
      if (!result?.videoId || seenVideoIds.has(result.videoId)) {
        continue;
      }

      seenVideoIds.add(result.videoId);
      matchedTracks.push(result);

      if (matchedTracks.length >= safeLimit) break;
    }

    return matchedTracks;
  } catch (err) {
    console.error("getSimilarTracks error:", err);

    return {
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
