
/**
 * Last.fm API Service
 * Artist info, track info, similar tracks, and global charts
 */

const API_KEY = "0867bcb6f36c879398969db682a7b69b";
const API_BASE = "https://ws.audioscrobbler.com/2.0/";

async function fetchLastFM(
  params: Record<string, string>
): Promise<any> {
  const url = new URL(API_BASE);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("format", "json");

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Last.fm HTTP error: ${response.status}`);
  }

  const data = await response.json();

  if (data?.error) {
    throw new Error(data.message || "Last.fm API error");
  }

  return data;
}

function normalizeText(value: unknown): string {
  return typeof value === "string"
    ? value.trim().toLowerCase()
    : "";
}

function cleanLimit(limit: string | number, fallback = 5): number {
  const parsed = Number.parseInt(String(limit), 10);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, 1), 50);
}

export const LastFM = {
  API_KEY,

  async getSimilarTracks(
    title: string,
    artist: string,
    limit: string | number = "5"
  ) {
    const cleanTitle = title?.trim();
    const cleanArtist = artist?.trim();

    if (!cleanTitle || !cleanArtist) {
      return { error: "Missing track title or artist" };
    }

    try {
      const data = await fetchLastFM({
        method: "track.getsimilar",
        artist: cleanArtist,
        track: cleanTitle,
        limit: String(cleanLimit(limit)),
        autocorrect: "1",
      });

      const rawTracks = data?.similartracks?.track;

      if (!Array.isArray(rawTracks)) {
        return [];
      }

      return rawTracks
        .map((track: any) => ({
          title:
            typeof track?.name === "string"
              ? track.name.trim()
              : "",
          artist:
            typeof track?.artist?.name === "string"
              ? track.artist.name.trim()
              : typeof track?.artist === "string"
                ? track.artist.trim()
                : "",
        }))
        .filter((track: any) => {
          if (!track.title || !track.artist) {
            return false;
          }

          // Exclude the exact input track if Last.fm includes it.
          return !(
            normalizeText(track.title) === normalizeText(cleanTitle) &&
            normalizeText(track.artist) === normalizeText(cleanArtist)
          );
        });
    } catch (error) {
      console.error("Last.fm getSimilarTracks error:", error);

      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch similar tracks",
      };
    }
  },
};

export async function getArtistInfo(artist: string) {
  if (!artist?.trim()) {
    return { success: false, error: "Missing artist" };
  }

  try {
    const data = await fetchLastFM({
      method: "artist.getinfo",
      artist: artist.trim(),
      autocorrect: "1",
    });

    const a = data?.artist;

    if (!a) {
      return { success: false, error: "Artist not found" };
    }

    return {
      success: true,
      name: a.name,
      bio: a.bio?.summary?.replace(/<[^>]*>/g, ""),
      tags: Array.isArray(a.tags?.tag)
        ? a.tags.tag.map((tag: any) => tag.name).filter(Boolean)
        : [],
      similar: Array.isArray(a.similar?.artist)
        ? a.similar.artist.map((item: any) => item.name).filter(Boolean)
        : [],
      stats: {
        listeners: a.stats?.listeners,
        playcount: a.stats?.playcount,
      },
      image: Array.isArray(a.image)
        ? a.image.find((item: any) => item.size === "large")?.["#text"]
        : undefined,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getTrackInfo(title: string, artist: string) {
  if (!title?.trim() || !artist?.trim()) {
    return {
      success: false,
      error: "Missing track title or artist",
    };
  }

  try {
    const data = await fetchLastFM({
      method: "track.getInfo",
      artist: artist.trim(),
      track: title.trim(),
      autocorrect: "1",
    });

    const track = data?.track;

    if (!track) {
      return { success: false, error: "Track not found" };
    }

    return {
      success: true,
      name: track.name,
      artist: track.artist?.name,
      album: track.album?.title,
      duration: track.duration,
      listeners: track.listeners,
      playcount: track.playcount,
      tags: Array.isArray(track.toptags?.tag)
        ? track.toptags.tag.map((tag: any) => tag.name).filter(Boolean)
        : [],
      wiki: track.wiki?.summary?.replace(/<[^>]*>/g, ""),
    };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getTopArtists(
  country: string | undefined,
  limit: number
) {
  try {
    const safeLimit = cleanLimit(limit, 20);

    if (!country) {
      const data = await fetchLastFM({
        method: "chart.gettopartists",
        limit: String(safeLimit),
      });

      const artists = data?.artists?.artist || [];

      return {
        success: true,
        country: "Global",
        artists: artists.map((artist: any) => ({
          name: artist.name,
          playcount: artist.playcount,
          listeners: artist.listeners,
          url: artist.url,
          image: Array.isArray(artist.image)
            ? artist.image.find((item: any) => item.size === "large")?.["#text"]
            : undefined,
        })),
      };
    }

    // Caller handles country-based YTMusic search.
    return null;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : String(error),
    };
  }
}

export async function getTopTracks(
  country: string | undefined,
  limit: number
) {
  try {
    const safeLimit = cleanLimit(limit, 20);

    if (!country) {
      const data = await fetchLastFM({
        method: "chart.gettoptracks",
        limit: String(safeLimit),
      });

      const tracks = data?.tracks?.track || [];

      return {
        success: true,
        country: "Global",
        tracks: tracks.map((track: any) => ({
          name: track.name,
          artist: track.artist?.name,
          playcount: track.playcount,
          listeners: track.listeners,
          url: track.url,
        })),
      };
    }

    // Caller handles country-based YTMusic search.
    return null;
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : String(error),
    };
  }
}
