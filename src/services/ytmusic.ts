
/**
 * YouTube Music API - Core class
 * Handles search, browse, and player requests to YouTube Music's internal API
 */

import {
  parseSearchResults,
  parseSuggestions,
  parseMusicItem,
  parseTwoRowItem,
} from "./ytmusic-parser.ts";

export class YTMusic {
  private baseURL = "https://music.youtube.com/youtubei/v1";

  private apiKey = "AIzaSyC9XL3ZjWjXClIX1FmUxJq--EohcD4_oSs";

  private context = {
    client: {
      hl: "en",
      gl: "US",
      clientName: "WEB_REMIX",
      clientVersion: "1.20251015.03.00",
      platform: "DESKTOP",
      utcOffsetMinutes: 0,
    },
  };

  // ─── Search ───────────────────────────────────────────────

  async search(
    query: string,
    filter?: string,
    continuationToken?: string,
    _ignoreSpelling = false,
    region?: string,
    language?: string,
  ) {
    const normalizedQuery = query.normalize("NFC");
    const filterParams = this.getFilterParams(filter);

    const params: Record<string, unknown> = continuationToken
      ? { continuation: continuationToken }
      : filterParams
      ? { query: normalizedQuery, params: filterParams }
      : { query: normalizedQuery };

    const context = (region || language)
      ? {
        client: {
          ...this.context.client,
          gl: region || this.context.client.gl,
          hl: language || this.context.client.hl,
        },
      }
      : this.context;

    const data = await this.makeRequestWithContext(
      "search",
      params,
      context,
    );

    return parseSearchResults(data);
  }

  async getSearchSuggestions(query: string): Promise<string[]> {
    const data = await this.makeRequest(
      "music/get_search_suggestions",
      { input: query.normalize("NFC") },
    );

    return parseSuggestions(data);
  }

  // ─── Player ───────────────────────────────────────────────

  async getSong(videoId: string) {
    if (!/^[\w-]{11}$/.test(videoId)) {
      return null;
    }

    // 1. Try YouTube Music's player endpoint.
    try {
      const data = await this.makeRequest("player", {
        videoId,
      });

      const details = data?.videoDetails;

      if (details?.videoId === videoId) {
        return {
          videoId: details.videoId,
          title: details.title || "Unknown title",
          author: details.author || null,
          lengthSeconds: details.lengthSeconds ?? null,
          thumbnail:
            details.thumbnail?.thumbnails?.slice(-1)[0]?.url ??
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        };
      }

      console.warn(
        `YouTube Music player returned no usable details for ${videoId}`,
      );
    } catch (err) {
      console.warn(
        `YouTube Music player lookup failed for ${videoId}:`,
        err,
      );
    }

    // 2. Try YouTube's oEmbed endpoint for public video metadata.
    try {
      const oembedUrl =
        "https://www.youtube.com/oembed?url=" +
        encodeURIComponent(
          `https://www.youtube.com/watch?v=${videoId}`,
        ) +
        "&format=json";

      const response = await fetch(oembedUrl, {
        headers: {
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (response.ok) {
        const data = await response.json();

        if (data?.title) {
          return {
            videoId,
            title: data.title,
            author: data.author_name || null,
            lengthSeconds: null,
            thumbnail:
              data.thumbnail_url ||
              `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          };
        }
      }
    } catch (err) {
      console.warn(
        `YouTube oEmbed lookup failed for ${videoId}:`,
        err,
      );
    }

    // 3. Last fallback: search YouTube Music using the exact video ID.
    try {
      const result = await this.search(videoId);
      const results = Array.isArray(result?.results)
        ? result.results
        : [];

      const match = results.find(
        (item: any) => item?.videoId === videoId,
      );

      if (match) {
        return {
          videoId,
          title: match.title || "Unknown title",
          author:
            match.artists?.map((artist: any) => artist.name)
              .filter(Boolean)
              .join(", ") ||
            match.author ||
            null,
          lengthSeconds: match.duration_seconds ??
            match.lengthSeconds ??
            null,
          thumbnail:
            match.thumbnails?.slice(-1)[0]?.url ||
            match.thumbnail ||
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        };
      }
    } catch (err) {
      console.warn(
        `YouTube Music search fallback failed for ${videoId}:`,
        err,
      );
    }

    return null;
  }

  // ─── Browse: Album ────────────────────────────────────────

  async getAlbum(browseId: string) {
    const data = await this.makeRequest("browse", { browseId });

    const singleColumn =
      data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]
        ?.tabRenderer?.content?.sectionListRenderer?.contents;

    const twoColumnPrimary =
      data?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]
        ?.tabRenderer?.content?.sectionListRenderer?.contents;

    const twoColumnSecondary =
      data?.contents?.twoColumnBrowseResultsRenderer?.secondaryContents
        ?.sectionListRenderer?.contents;

    let title = "";
    let artist = "";
    let thumbnail = "";
    let year = "";

    const oldHeader = data?.header?.musicDetailHeaderRenderer ||
      data?.header?.musicImmersiveHeaderRenderer ||
      data?.header?.musicVisualHeaderRenderer;

    if (oldHeader) {
      title = oldHeader.title?.runs?.[0]?.text || "";

      const subtitleRuns = oldHeader.subtitle?.runs ||
        oldHeader.straplineTextOne?.runs ||
        [];

      artist = subtitleRuns.find((r: any) => r.navigationEndpoint)?.text ||
        subtitleRuns[0]?.text ||
        "";

      thumbnail =
        oldHeader.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails
          ?.slice(-1)[0]?.url ||
        oldHeader.thumbnail?.croppedSquareThumbnailRenderer?.thumbnail
          ?.thumbnails?.slice(-1)[0]?.url ||
        "";
    }

    const primaryContents = twoColumnPrimary || singleColumn || [];

    for (const section of primaryContents) {
      if (section.musicResponsiveHeaderRenderer) {
        const h = section.musicResponsiveHeaderRenderer;

        title = h.title?.runs?.[0]?.text || title;

        const subtitleRuns = h.straplineTextOne?.runs ||
          h.subtitle?.runs ||
          [];

        artist = subtitleRuns.find((r: any) => r.navigationEndpoint)?.text ||
          subtitleRuns[0]?.text ||
          artist;

        thumbnail =
          h.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails
            ?.slice(-1)[0]?.url ||
          thumbnail;

        for (const run of (h.subtitle?.runs || [])) {
          const yearMatch = run.text?.match(/\d{4}/);

          if (yearMatch) {
            year = yearMatch[0];
          }
        }
      }

      if (section.musicDescriptionShelfRenderer) {
        const subHeader =
          section.musicDescriptionShelfRenderer.subheader?.runs?.[0]?.text ||
          "";

        const yearMatch = subHeader.match(/\d{4}/);

        if (yearMatch && !year) {
          year = yearMatch[0];
        }
      }
    }

    const trackContents = twoColumnSecondary || singleColumn || [];
    const tracks: any[] = [];

    for (const section of trackContents) {
      for (const item of (section.musicShelfRenderer?.contents || [])) {
        const parsed = parseMusicItem(
          item.musicResponsiveListItemRenderer,
        );

        if (parsed) {
          tracks.push(parsed);
        }
      }
    }

    return {
      browseId,
      title,
      artist,
      thumbnail,
      year,
      trackCount: tracks.length,
      tracks,
    };
  }

  // ─── Browse: Artist ───────────────────────────────────────

  async getArtist(browseId: string) {
    const data = await this.makeRequest("browse", { browseId });

    const header = data?.header?.musicImmersiveHeaderRenderer ||
      data?.header?.musicVisualHeaderRenderer ||
      {};

    const contents =
      data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]
        ?.tabRenderer?.content?.sectionListRenderer?.contents ||
      [];

    const topSongs: any[] = [];
    const albums: any[] = [];
    const singles: any[] = [];
    const videos: any[] = [];

    for (const section of contents) {
      const shelf = section.musicShelfRenderer;
      const carousel = section.musicCarouselShelfRenderer;

      if (shelf) {
        const title = shelf.title?.runs?.[0]?.text?.toLowerCase() || "";

        if (title.includes("song")) {
          for (const item of (shelf.contents || [])) {
            const parsed = parseMusicItem(
              item.musicResponsiveListItemRenderer,
            );

            if (parsed) {
              topSongs.push(parsed);
            }
          }
        }
      }

      if (carousel) {
        const title = carousel.header
          ?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.[0]?.text
          ?.toLowerCase() || "";

        const items = (carousel.contents || [])
          .map((item: any) =>
            parseTwoRowItem(item.musicTwoRowItemRenderer)
          )
          .filter(Boolean);

        if (title.includes("album")) {
          albums.push(...items);
        } else if (title.includes("single")) {
          singles.push(...items);
        } else if (title.includes("video")) {
          videos.push(...items);
        }
      }
    }

    return {
      browseId,
      name: header.title?.runs?.[0]?.text,
      description: header.description?.runs?.[0]?.text,
      thumbnail: header.thumbnail?.musicThumbnailRenderer?.thumbnail
        ?.thumbnails?.slice(-1)[0]?.url,
      subscribers: header.subscriptionButton?.subscribeButtonRenderer
        ?.subscriberCountText?.runs?.[0]?.text,
      topSongs,
      albums,
      singles,
      videos,
    };
  }

  async getArtistSummary(artistId: string, country = "US") {
    const url =
      `${this.baseURL}/browse?key=${encodeURIComponent(this.apiKey)}` +
      "&prettyPrint=false";

    const body = {
      browseId: artistId,
      context: {
        client: {
          ...this.context.client,
          gl: country,
        },
      },
    };

    const data = await this.requestJson(url, body);

    const header = data?.header?.musicImmersiveHeaderRenderer ||
      data?.header?.musicVisualHeaderRenderer;

    const contents =
      data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]
        ?.tabRenderer?.content?.sectionListRenderer?.contents ||
      [];

    let playlistId = null;

    for (const item of contents) {
      if (item.musicShelfRenderer?.title?.runs?.[0]?.text === "Top songs") {
        playlistId =
          item.musicShelfRenderer.contents?.[0]
            ?.musicResponsiveListItemRenderer?.flexColumns?.[0]
            ?.musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]
            ?.navigationEndpoint?.watchEndpoint?.playlistId;

        break;
      }
    }

    let recommendedArtists = null;

    for (const item of contents) {
      const headerTitle = item.musicCarouselShelfRenderer?.header
        ?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.[0]?.text;

      if (headerTitle === "Fans might also like") {
        recommendedArtists = (
          item.musicCarouselShelfRenderer.contents || []
        ).map((it: any) => ({
          name: it.musicTwoRowItemRenderer?.title?.runs?.[0]?.text,
          browseId: it.musicTwoRowItemRenderer?.navigationEndpoint
            ?.browseEndpoint?.browseId,
          thumbnail: it.musicTwoRowItemRenderer?.thumbnailRenderer
            ?.musicThumbnailRenderer?.thumbnail?.thumbnails?.[0]?.url,
        }));

        break;
      }
    }

    return {
      artistName: header?.title?.runs?.[0]?.text,
      artistAvatar: header?.thumbnail?.musicThumbnailRenderer?.thumbnail
        ?.thumbnails?.[0]?.url,
      playlistId,
      recommendedArtists,
    };
  }

  // ─── Browse: Playlist ─────────────────────────────────────

  async getPlaylist(playlistId: string) {
    const browseId = `VL${playlistId.replace(/^VL/, "")}`;
    const data = await this.makeRequest("browse", { browseId });

    const primaryContents =
      data?.contents?.twoColumnBrowseResultsRenderer?.tabs?.[0]
        ?.tabRenderer?.content?.sectionListRenderer?.contents ||
      [];

    let title = "";
    let author = "";
    let description = "";
    let thumbnail = "";

    for (const section of primaryContents) {
      if (section.musicResponsiveHeaderRenderer) {
        const h = section.musicResponsiveHeaderRenderer;

        title = h.title?.runs?.[0]?.text || "";

        const subtitleRuns = h.straplineTextOne?.runs || [];

        author = subtitleRuns.find((r: any) => r.navigationEndpoint)?.text ||
          subtitleRuns[0]?.text ||
          "";

        description = h.description?.musicDescriptionShelfRenderer
          ?.description?.runs?.[0]?.text || "";

        thumbnail =
          h.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails
            ?.slice(-1)[0]?.url ||
          "";
      }
    }

    const oldHeader = data?.header?.musicDetailHeaderRenderer ||
      data?.header?.musicEditablePlaylistDetailHeaderRenderer?.header
        ?.musicDetailHeaderRenderer;

    if (oldHeader && !title) {
      title = oldHeader.title?.runs?.[0]?.text || "";

      const subtitleRuns = oldHeader.subtitle?.runs || [];

      author = subtitleRuns.find((r: any) => r.navigationEndpoint)?.text ||
        subtitleRuns[0]?.text ||
        "";

      thumbnail =
        oldHeader.thumbnail?.croppedSquareThumbnailRenderer?.thumbnail
          ?.thumbnails?.slice(-1)[0]?.url ||
        oldHeader.thumbnail?.musicThumbnailRenderer?.thumbnail?.thumbnails
          ?.slice(-1)[0]?.url ||
        "";
    }

    const secondaryContents =
      data?.contents?.twoColumnBrowseResultsRenderer?.secondaryContents
        ?.sectionListRenderer?.contents ||
      [];

    const tracks: any[] = [];

    for (const section of secondaryContents) {
      if (section.musicPlaylistShelfRenderer) {
        for (const item of (section.musicPlaylistShelfRenderer.contents || [])) {
          const parsed = parseMusicItem(
            item.musicResponsiveListItemRenderer,
          );

          if (parsed) {
            tracks.push(parsed);
          }
        }
      }

      if (section.musicShelfRenderer) {
        for (const item of (section.musicShelfRenderer.contents || [])) {
          const parsed = parseMusicItem(
            item.musicResponsiveListItemRenderer,
          );

          if (parsed) {
            tracks.push(parsed);
          }
        }
      }
    }

    if (tracks.length === 0) {
      const singleColumn =
        data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]
          ?.tabRenderer?.content?.sectionListRenderer?.contents ||
        [];

      for (const section of singleColumn) {
        if (section.musicShelfRenderer) {
          for (const item of (section.musicShelfRenderer.contents || [])) {
            const parsed = parseMusicItem(
              item.musicResponsiveListItemRenderer,
            );

            if (parsed) {
              tracks.push(parsed);
            }
          }
        }
      }
    }

    return {
      playlistId: playlistId.replace(/^VL/, ""),
      title,
      author,
      description,
      thumbnail,
      trackCount: tracks.length,
      tracks,
    };
  }

  // ─── Browse: Charts & Moods ───────────────────────────────

  async getCharts(country?: string) {
    const data = await this.makeRequest("browse", {
      browseId: "FEmusic_charts",
      formData: {
        selectedValues: [country || "US"],
      },
    });

    return this.parseChartsData(data);
  }

  async getMoodCategories() {
    const data = await this.makeRequest("browse", {
      browseId: "FEmusic_moods_and_genres",
    });

    return this.parseMoodsData(data);
  }

  async getMoodPlaylists(categoryId: string) {
    const data = await this.makeRequest("browse", {
      browseId: categoryId,
    });

    const contents =
      data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]
        ?.tabRenderer?.content?.sectionListRenderer?.contents ||
      [];

    const playlists: any[] = [];

    for (const section of contents) {
      for (const item of (section.musicShelfRenderer?.contents || [])) {
        const parsed = parseMusicItem(
          item.musicResponsiveListItemRenderer,
        );

        if (parsed) {
          playlists.push(parsed);
        }
      }
    }

    return playlists;
  }

  // ─── Watch Playlist & Related ─────────────────────────────

  async getWatchPlaylist(
    videoId?: string,
    playlistId?: string,
    radio = false,
    shuffle = false,
    limit = 25,
  ) {
    const data = await this.makeRequest("next", {
      videoId,
      playlistId,
      radio,
      shuffle,
    });

    const contents =
      data?.contents?.singleColumnMusicWatchNextResultsRenderer
        ?.tabbedRenderer?.watchNextTabbedResultsRenderer?.tabs?.[0]
        ?.tabRenderer?.content?.musicQueueRenderer?.content
        ?.playlistPanelRenderer?.contents ||
      [];

    const tracks = contents.map((item: any) => {
      const video = item.playlistPanelVideoRenderer;

      if (!video) {
        return null;
      }

      return {
        videoId: video.videoId,
        title: video.title?.runs?.[0]?.text,
        author: video.shortBylineText?.runs?.[0]?.text,
        thumbnail: video.thumbnail?.thumbnails?.[0]?.url,
      };
    }).filter(Boolean);

    return {
      tracks: tracks.slice(0, limit),
    };
  }

  async getRelated(videoId: string) {
    if (!/^[\w-]{11}$/.test(videoId)) {
      return [];
    }

    const url =
      `https://www.youtube.com/youtubei/v1/next?key=${encodeURIComponent(this.apiKey)}`;

    const body = {
      videoId,
      context: {
        client: {
          clientName: "WEB",
          clientVersion: "2.20251013.01.00",
        },
      },
    };

    const data = await this.requestJson(url, body);

    const secondaryResults =
      data?.contents?.twoColumnWatchNextResults?.secondaryResults
        ?.secondaryResults?.results ||
      [];

    const results: {
      videoId: string;
      title: string;
      artist: string;
      thumbnail: string;
      duration: string;
    }[] = [];

    const seen = new Set<string>();

    const compilationPattern =
      /\b(full album|full movie|jukebox|nonstop|non-stop|mega\s*mix|long mix|music compilation|song collection|complete album|all songs|top \d+ songs|1 hour mix|2 hour mix|3 hour mix|mashup|karaoke compilation|playlist mix)\b/i;

    const nonMusicPattern =
      /\b(gameplay|walkthrough|reaction video|daily vlog|prank video|news report|tutorial|unboxing|podcast episode)\b/i;

    const musicTitlePattern =
      /\b(official audio|official video|official music video|lyric video|lyrics|visualizer|audio|vevo|music video|lirik|lyrycs)\b/i;

    const musicChannelPattern =
      /\b(vevo|topic|records|music|entertainment|t-series|sony music|saregama|zee music|tips music|speed records|white hill|universal music|warner music|atlantic records|arista records|yash raj|yrf|times music|island records)\b/i;

    const getText = (value: any): string => {
      if (typeof value === "string") {
        return value.trim();
      }

      if (Array.isArray(value?.runs)) {
        return value.runs
          .map((run: any) => run?.text || "")
          .join("")
          .trim();
      }

      return value?.simpleText?.trim?.() || "";
    };

    const parseDurationSeconds = (value: string): number => {
      if (!value) return 0;

      const parts = value.split(":").map((part) => {
        const number = Number(part);
        return Number.isFinite(number) ? number : NaN;
      });

      if (
        parts.length < 2 ||
        parts.length > 3 ||
        parts.some((part) => Number.isNaN(part) || part < 0)
      ) {
        return 0;
      }

      return parts.reduce(
        (total, part) => total * 60 + part,
        0,
      );
    };

    const addVideo = (
      id: string,
      title: string,
      artist: string,
      thumbnail: string,
      duration: string,
      channel = "",
    ) => {
      const cleanId = id.trim();
      const cleanTitle = title.trim();
      const cleanArtist = artist.trim();
      const cleanChannel = channel.trim();

      if (!/^[\w-]{11}$/.test(cleanId)) return;
      if (cleanId === videoId || seen.has(cleanId)) return;
      if (!cleanTitle || cleanTitle.length < 2) return;

      if (compilationPattern.test(cleanTitle)) return;
      if (nonMusicPattern.test(cleanTitle)) return;

      const seconds = parseDurationSeconds(duration);

      // Exclude short clips while retaining videos with unknown duration.
      if (seconds > 0 && seconds < 60) return;

      const hasMusicSignal =
        musicTitlePattern.test(cleanTitle) ||
        musicChannelPattern.test(cleanChannel) ||
        musicChannelPattern.test(cleanArtist);

      // Don't blindly reject independent artists; require a music signal
      // only when the result includes channel metadata.
      if (cleanChannel && !hasMusicSignal) return;

      seen.add(cleanId);

      results.push({
        videoId: cleanId,
        title: cleanTitle,
        artist: cleanArtist || cleanChannel || "Unknown Artist",
        thumbnail: thumbnail ||
          `https://i.ytimg.com/vi/${cleanId}/hqdefault.jpg`,
        duration,
      });
    };

    for (const item of secondaryResults) {
      const lockup = item?.lockupViewModel;

      if (lockup) {
        const metadata = lockup?.metadata?.lockupMetadataViewModel;

        const id =
          lockup?.rendererContext?.commandContext?.onTap
            ?.innertubeCommand?.watchEndpoint?.videoId ||
          lockup?.contentId ||
          "";

        const title = getText(metadata?.title);

        const metadataRows =
          metadata?.metadata?.contentMetadataViewModel
            ?.metadataRows || [];

        const metadataParts = metadataRows.flatMap(
          (row: any) => row?.metadataParts || [],
        );

        const textParts = metadataParts
          .map((part: any) => getText(part?.text))
          .filter(Boolean);

        const duration = textParts.find((text: string) =>
          /^\d{1,2}:\d{2}(:\d{2})?$/.test(text)
        ) || "";

        const artist = textParts.find((text: string) =>
          text !== duration
        ) || "";

        const thumbnail =
          lockup?.contentImage?.collectionThumbnailViewModel
            ?.primaryThumbnail?.thumbnailViewModel?.image?.sources
            ?.slice(-1)?.[0]?.url ||
          lockup?.contentImage?.thumbnailViewModel?.image?.sources
            ?.slice(-1)?.[0]?.url ||
          "";

        addVideo(id, title, artist, thumbnail, duration);
        continue;
      }

      const video = item?.compactVideoRenderer;
      if (!video) continue;

      const title = getText(video?.title);
      const artist = getText(video?.shortBylineText);
      const thumbnail =
        video?.thumbnail?.thumbnails?.slice(-1)?.[0]?.url || "";
      const duration = video?.lengthText?.simpleText || "";

      addVideo(
        video?.videoId || "",
        title,
        artist,
        thumbnail,
        duration,
        artist,
      );
    }

    return results.slice(0, 20);
  }

  // ─── Private: HTTP ────────────────────────────────────────

  private async makeRequest(
    endpoint: string,
    params: Record<string, unknown>,
  ) {
    const url =
      `${this.baseURL}/${endpoint}?key=${encodeURIComponent(this.apiKey)}`;

    return await this.requestJson(url, {
      context: this.context,
      ...params,
    });
  }

  private async makeRequestWithContext(
    endpoint: string,
    params: Record<string, unknown>,
    context: unknown,
  ) {
    const url =
      `${this.baseURL}/${endpoint}?key=${encodeURIComponent(this.apiKey)}`;

    return await this.requestJson(url, {
      context,
      ...params,
    });
  }

  /**
   * Sends a request to YouTube's internal API.
   * Fails clearly on HTTP errors, invalid JSON, and slow upstream responses.
   */
  private async requestJson(
    url: string,
    body: unknown,
  ): Promise<any> {
    let response: Response;

    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15_000),
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === "TimeoutError") {
        throw new Error("YouTube API request timed out");
      }

      throw new Error(
        `Unable to reach YouTube API: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }

    if (!response.ok) {
      try {
        await response.body?.cancel();
      } catch {
        // Ignore errors while closing an upstream response body.
      }

      throw new Error(`YouTube API returned HTTP ${response.status}`);
    }

    try {
      return await response.json();
    } catch {
      throw new Error("YouTube API returned invalid JSON");
    }
  }

  // ─── Private: Filters ─────────────────────────────────────

  private getFilterParams(filter?: string): string | undefined {
    if (!filter) {
      return undefined;
    }

    const filterMap: Record<string, string> = {
      songs: "EgWKAQIIAWoKEAkQAxAEEAoQBQ==",
      videos: "EgWKAQIQAWoKEAkQAxAEEAoQBQ==",
      albums: "EgWKAQIYAWoKEAkQAxAEEAoQBQ==",
      artists: "EgWKAQIgAWoKEAkQAxAEEAoQBQ==",
      playlists: "EgWKAQIoAWoKEAkQAxAEEAoQBQ==",
      community_playlists: "EgeKAQQoAEABagoQAxAEEAkQChAF",
      featured_playlists: "EgeKAQQoADgBagoQAxAEEAkQChAF",
    };

    return filterMap[filter] || undefined;
  }

  // ─── Private: Charts/Moods parsing ────────────────────────

  private parseChartsData(data: any) {
    const results: any[] = [];

    const contents =
      data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]
        ?.tabRenderer?.content?.sectionListRenderer?.contents ||
      [];

    for (const section of contents) {
      if (section.musicCarouselShelfRenderer) {
        const title = section.musicCarouselShelfRenderer?.header
          ?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.[0]?.text;

        const items = (
          section.musicCarouselShelfRenderer?.contents || []
        ).map((item: any) =>
          parseTwoRowItem(
            item.musicTwoRowItemRenderer ||
              item.musicResponsiveListItemRenderer,
          )
        ).filter(Boolean);

        if (title && items.length) {
          results.push({ title, items });
        }
      }

      if (section.musicShelfRenderer) {
        const title = section.musicShelfRenderer?.title?.runs?.[0]?.text;

        const items = (section.musicShelfRenderer?.contents || [])
          .map((item: any) =>
            parseMusicItem(item.musicResponsiveListItemRenderer)
          )
          .filter(Boolean);

        if (title && items.length) {
          results.push({ title, items });
        }
      }
    }

    return results;
  }

  private parseMoodsData(data: any) {
    const results: any[] = [];

    const contents =
      data?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]
        ?.tabRenderer?.content?.sectionListRenderer?.contents ||
      [];

    for (const section of contents) {
      if (section.gridRenderer) {
        const items = (section.gridRenderer?.items || []).map((item: any) => {
          const nav = item.musicNavigationButtonRenderer;

          if (!nav) {
            return null;
          }

          return {
            title: nav.buttonText?.runs?.[0]?.text,
            browseId: nav.clickCommand?.browseEndpoint?.browseId,
            color: nav.solid?.leftStripeColor,
          };
        }).filter(Boolean);

        if (items.length) {
          results.push({
            title: "Moods & Genres",
            items,
          });
        }
      }

      if (section.musicCarouselShelfRenderer) {
        const title = section.musicCarouselShelfRenderer?.header
          ?.musicCarouselShelfBasicHeaderRenderer?.title?.runs?.[0]?.text;

        const items = (
          section.musicCarouselShelfRenderer?.contents || []
        ).map((item: any) => {
          const nav = item.musicNavigationButtonRenderer;

          if (!nav) {
            return null;
          }

          return {
            title: nav.buttonText?.runs?.[0]?.text,
            browseId: nav.clickCommand?.browseEndpoint?.browseId,
            color: nav.solid?.leftStripeColor,
          };
        }).filter(Boolean);

        if (title && items.length) {
          results.push({ title, items });
        }
      }
    }

    return results;
  }
}
