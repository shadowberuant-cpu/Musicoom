
/**
 * Entity Helpers
 * Complete data fetchers that combine multiple API calls
 * (song complete, album complete, artist complete, full chain)
 */

import { YTMusic } from "./ytmusic.ts";

export async function getSongComplete(
  videoId: string,
  ytmusic: YTMusic,
) {
  if (!videoId || !/^[\w-]{11}$/.test(videoId)) {
    return { success: false, error: "Invalid video ID" };
  }

  let song: any;

  try {
    song = await ytmusic.getSong(videoId);
  } catch (err) {
    console.error("getSong failed:", err);
    return {
      success: false,
      error: "Unable to fetch song details",
    };
  }

  if (!song?.videoId) {
    return { success: false, error: "Song not found" };
  }

  // Use the player response as the primary source.
  // Search is only used to enrich artist and album information.
  let match: any = null;

  if (song.title) {
    try {
      const query = [song.title, song.author]
        .filter(Boolean)
        .join(" ");

      const searchResults = await ytmusic.search(query, "songs");

      match = searchResults?.results?.find(
        (result: any) => result.videoId === videoId,
      ) ?? null;
    } catch (err) {
      console.warn("Song metadata enrichment failed:", err);
    }
  }

  return {
    success: true,
    song: {
      videoId: song.videoId,
      title: song.title || "Unknown title",
      duration: song.lengthSeconds ?? null,
      thumbnail: song.thumbnail ?? null,
    },
    artist: {
      name: song.author || match?.artists?.[0]?.name || null,
      browseId: match?.artists?.[0]?.id ||
        match?.artists?.[0]?.browseId ||
        null,
    },
    album: match?.browseId?.startsWith("MPRE")
      ? { browseId: match.browseId }
      : null,
  };
}

export async function getAlbumComplete(
  browseId: string,
  ytmusic: YTMusic,
) {
  const album = await ytmusic.getAlbum(browseId);

  if (!album?.title) {
    return { success: false, error: "Album not found" };
  }

  let artistBrowseId = null;

  if (album.artist) {
    try {
      const artistSearch = await ytmusic.search(
        album.artist,
        "artists",
      );

      artistBrowseId = artistSearch?.results?.[0]?.browseId || null;
    } catch (err) {
      console.warn("Album artist lookup failed:", err);
    }
  }

  return {
    success: true,
    album: {
      browseId: album.browseId || browseId,
      title: album.title,
      year: album.year || null,
      thumbnail: album.thumbnail || null,
      trackCount: album.trackCount ?? album.tracks?.length ?? 0,
    },
    artist: {
      name: album.artist || null,
      browseId: artistBrowseId,
    },
    tracks: (album.tracks || []).map((track: any, index: number) => ({
      videoId: track.videoId || null,
      title: track.title || "Unknown title",
      duration: track.duration ?? null,
      trackNumber: index + 1,
    })),
  };
}

export async function getArtistComplete(
  browseId: string,
  ytmusic: YTMusic,
) {
  const artist = await ytmusic.getArtist(browseId);

  if (!artist?.name) {
    return { success: false, error: "Artist not found" };
  }

  return {
    success: true,
    artist: {
      browseId: artist.browseId || browseId,
      name: artist.name,
      description: artist.description || null,
      thumbnail: artist.thumbnail || null,
      subscribers: artist.subscribers || null,
    },
    topSongs: (artist.topSongs || []).map((song: any) => ({
      videoId: song.videoId || null,
      title: song.title || "Unknown title",
      thumbnail: song.thumbnails?.[0]?.url ||
        song.thumbnail ||
        null,
    })),
    albums: (artist.albums || []).map((album: any) => ({
      browseId: album.browseId || null,
      title: album.title || "Unknown album",
      year: album.subtitle?.match(/\d{4}/)?.[0] || null,
      thumbnail: album.thumbnails?.[0]?.url ||
        album.thumbnail ||
        null,
    })),
    singles: (artist.singles || []).map((single: any) => ({
      browseId: single.browseId || null,
      title: single.title || "Unknown single",
      year: single.subtitle?.match(/\d{4}/)?.[0] || null,
      thumbnail: single.thumbnails?.[0]?.url ||
        single.thumbnail ||
        null,
    })),
  };
}

export async function getFullChain(
  videoId: string,
  ytmusic: YTMusic,
) {
  const songData = await getSongComplete(videoId, ytmusic);

  if (!songData.success) {
    return songData;
  }

  const result: any = {
    success: true,
    song: songData.song,
    artist: songData.artist,
  };

  if (songData.artist?.browseId) {
    try {
      const artistData = await getArtistComplete(
        songData.artist.browseId,
        ytmusic,
      );

      if (artistData.success) {
        result.artistDetails = {
          description: artistData.artist.description,
          subscribers: artistData.artist.subscribers,
          thumbnail: artistData.artist.thumbnail,
        };

        result.discography = {
          albums: artistData.albums,
          singles: artistData.singles,
        };

        result.otherSongs = artistData.topSongs
          .filter((song: any) => song.videoId !== videoId)
          .slice(0, 5);
      }
    } catch (err) {
      console.warn("Artist chain enrichment failed:", err);
    }
  }

  return result;
}
