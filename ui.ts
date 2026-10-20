
/* =========================================================
   Musicoom — Music Player UI
   Features:
   - Search and play YouTube music results
   - Discover related tracks in the background
   - Automatically play the next track when a song ends
   - Skip to the next track manually
   - Never replay a video ID already played in this session
   - Avoid duplicate tracks in the related queue
   ========================================================= */

type Track = {
  title: string;
  artist: string;
  videoId: string;
  thumbnail: string;
  duration?: string;
  url?: string;
};

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const API = {
  search: "/api/yt_search",
  related: (id: string) => `/api/related/${encodeURIComponent(id)}`,
  similar: (title: string, artist: string) =>
    `/api/similar?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`,
};

let player: any = null;
let playerReady = false;
let currentTrack: Track | null = null;
let searchResults: Track[] = [];
let searchIndex = -1;

let relatedQueue: Track[] = [];
let playedIds = new Set<string>();
let queuedIds = new Set<string>();
let discoveredIds = new Set<string>();

let isAdvancing = false;
let playbackToken = 0;
let searchToken = 0;
let relatedCount = 0;

const $ = <T extends HTMLElement>(selector: string): T => {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Missing UI element: ${selector}`);
  return element;
};

function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[char];
  });
}

function getVideoId(item: any): string {
  if (!item) return "";

  const direct =
    item.videoId ??
    item.video_id ??
    item.youtubeId ??
    item.youtube_id ??
    item.id?.videoId;

  if (typeof direct === "string" && direct.length === 11) {
    return direct;
  }

  const url = String(
    item.url ??
    item.videoUrl ??
    item.video_url ??
    item.link ??
    item.id ??
    ""
  );

  const match = url.match(
    /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );

  return match?.[1] ?? "";
}

function getArtist(item: any): string {
  const artists = item?.artists;

  if (Array.isArray(artists)) {
    return artists
      .map((artist: any) =>
        typeof artist === "string"
          ? artist
          : artist?.name ?? artist?.title ?? ""
      )
      .filter(Boolean)
      .join(", ") || "Unknown artist";
  }

  if (typeof artists === "string" && artists.trim()) {
    return artists;
  }

  return (
    item?.artist ??
    item?.author ??
    item?.channelTitle ??
    item?.channel ??
    item?.subtitle ??
    "Unknown artist"
  );
}

function getThumbnail(item: any, videoId = ""): string {
  const thumbnails = item?.thumbnails;

  if (Array.isArray(thumbnails) && thumbnails.length) {
    const last = thumbnails[thumbnails.length - 1];
    const url = typeof last === "string" ? last : last?.url;
    if (url) return url;
  }

  return (
    item?.thumbnail ??
    item?.thumbnailUrl ??
    item?.thumbnail_url ??
    item?.image ??
    (videoId
      ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
      : "")
  );
}

function normalizeTrack(item: any): Track | null {
  if (!item || typeof item !== "object") return null;

  const videoId = getVideoId(item);
  const title = String(
    item.title ?? item.name ?? item.track ?? "Unknown title"
  ).trim();

  if (!title) return null;

  return {
    title,
    artist: String(getArtist(item)).trim() || "Unknown artist",
    videoId,
    thumbnail: getThumbnail(item, videoId),
    duration: String(item.duration?.label ?? item.duration ?? ""),
    url: item.url ?? "",
  };
}

function unwrapTracks(data: any): any[] {
  if (Array.isArray(data)) return data;

  const possible = [
    data?.results,
    data?.tracks,
    data?.songs,
    data?.videos,
    data?.items,
    data?.data?.results,
    data?.data?.tracks,
    data?.data?.songs,
    data?.data?.items,
  ];

  return possible.find(Array.isArray) ?? [];
}

async function apiGet(url: string): Promise<any> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`API request failed (${response.status})`);
  }

  return response.json();
}

function setStatus(message: string): void {
  const status = document.querySelector<HTMLElement>("#status");
  if (status) status.textContent = message;
}

function updateQueueCount(): void {
  const count = document.querySelector<HTMLElement>("#queue-count");
  if (count) count.textContent = String(relatedQueue.length);
}

function renderCurrentTrack(): void {
  const title = $("#current-title");
  const artist = $("#current-artist");
  const image = $("#current-cover") as HTMLImageElement;

  if (!currentTrack) {
    title.textContent = "Nothing playing";
    artist.textContent = "Search for a song to get started";
    image.src = "";
    return;
  }

  title.textContent = currentTrack.title;
  artist.textContent = currentTrack.artist;
  image.src = currentTrack.thumbnail;
  image.alt = currentTrack.title;

  const nowPlaying = document.querySelector<HTMLElement>("#now-playing");
  if (nowPlaying) nowPlaying.hidden = false;
}

function renderSearchResults(): void {
  const container = $("#search-results");

  if (!searchResults.length) {
    container.innerHTML =
      '<p class="empty">No songs found. Try another search.</p>';
    return;
  }

  container.innerHTML = searchResults
    .map((track, index) => {
      const image = track.thumbnail
        ? `<img src="${escapeHtml(track.thumbnail)}" alt="" loading="lazy">`
        : `<div class="placeholder">♫</div>`;

      return `
        <button class="track-card" data-index="${index}" type="button">
          ${image}
          <span class="track-info">
            <strong>${escapeHtml(track.title)}</strong>
            <small>${escapeHtml(track.artist)}</small>
          </span>
          <span class="play-icon" aria-hidden="true">▶</span>
        </button>
      `;
    })
    .join("");

  container.querySelectorAll<HTMLButtonElement>("[data-index]").forEach(
    (button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.index);
        const track = searchResults[index];
        if (track) playTrack(track, "search");
      });
    }
  );
}

function renderRelatedQueue(): void {
  const container = $("#related-queue");

  if (!relatedQueue.length) {
    container.innerHTML =
      '<p class="empty">Related songs will appear here as you listen.</p>';
    updateQueueCount();
    return;
  }

  container.innerHTML = relatedQueue
    .slice(0, 30)
    .map(
      (track, index) => `
        <button class="queue-card" data-queue-index="${index}" type="button">
          <img src="${escapeHtml(track.thumbnail)}" alt="" loading="lazy">
          <span class="track-info">
            <strong>${escapeHtml(track.title)}</strong>
            <small>${escapeHtml(track.artist)}</small>
          </span>
          <span aria-hidden="true">▶</span>
        </button>
      `
    )
    .join("");

  container
    .querySelectorAll<HTMLButtonElement>("[data-queue-index]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.queueIndex);
        const track = relatedQueue[index];
        if (!track) return;

        relatedQueue.splice(index, 1);
        queuedIds.delete(track.videoId);
        renderRelatedQueue();
        playTrack(track, "related");
      });
    });

  updateQueueCount();
}

async function searchForVideoId(track: Track): Promise<string> {
  if (track.videoId) return track.videoId;

  const query = `${track.title} ${track.artist}`.trim();

  try {
    const data = await apiGet(
      `${API.search}?q=${encodeURIComponent(query)}&filter=videos`
    );

    const candidate = unwrapTracks(data)
      .map(normalizeTrack)
      .find((item): item is Track => Boolean(item?.videoId));

    return candidate?.videoId ?? "";
  } catch (error) {
    console.warn("Could not resolve video ID:", error);
    return "";
  }
}

function isUnavailable(track: Track): boolean {
  return (
    !track.videoId ||
    playedIds.has(track.videoId) ||
    queuedIds.has(track.videoId) ||
    track.videoId === currentTrack?.videoId
  );
}

function addRelatedTracks(items: any[]): void {
  for (const item of items) {
    const track = normalizeTrack(item);
    if (!track || isUnavailable(track)) continue;

    queuedIds.add(track.videoId);
    relatedQueue.push(track);
  }

  renderRelatedQueue();
}

async function fetchRelatedForTrack(track: Track): Promise<void> {
  if (!track.videoId || discoveredIds.has(track.videoId)) return;

  discoveredIds.add(track.videoId);

  // Discover tracks in the background without blocking playback.
  const results = await Promise.allSettled([
    apiGet(API.related(track.videoId)),
    apiGet(API.similar(track.title, track.artist)),
  ]);

  const candidates: Track[] = [];

  for (const result of results) {
    if (result.status !== "fulfilled") continue;

    for (const item of unwrapTracks(result.value)) {
      const candidate = normalizeTrack(item);
      if (candidate) candidates.push(candidate);
    }
  }

  // Deduplicate candidates before resolving any missing video IDs.
  const seen = new Set<string>();
  const uniqueCandidates = candidates.filter((candidate) => {
    const key = candidate.videoId ||
      `${candidate.title.toLowerCase()}|${candidate.artist.toLowerCase()}`;

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Resolve missing IDs concurrently, with a small concurrency limit.
  let cursor = 0;
  const workers = Array.from({ length: 3 }, async () => {
    while (cursor < uniqueCandidates.length) {
      const index = cursor++;
      const candidate = uniqueCandidates[index];

      if (!candidate.videoId) {
        candidate.videoId = await searchForVideoId(candidate);
        if (candidate.videoId) {
          candidate.thumbnail = getThumbnail(candidate, candidate.videoId);
        }
      }
    }
  });

  await Promise.all(workers);

  // Recheck all IDs because another request may have queued or played them.
  addRelatedTracks(uniqueCandidates);
}

function takeNextRelated(): Track | null {
  while (relatedQueue.length) {
    const track = relatedQueue.shift()!;
    queuedIds.delete(track.videoId);

    if (isUnavailable(track)) continue;

    renderRelatedQueue();
    return track;
  }

  renderRelatedQueue();
  return null;
}

function takeNextSearchResult(): Track | null {
  // Prefer results after the current search result, then wrap around.
  if (!searchResults.length) return null;

  for (let offset = 1; offset <= searchResults.length; offset++) {
    const index = (searchIndex + offset + searchResults.length) %
      searchResults.length;
    const track = searchResults[index];

    if (track.videoId && !playedIds.has(track.videoId)) {
      searchIndex = index;
      return track;
    }
  }

  return null;
}

async function playTrack(
  input: Track,
  source: "search" | "related" | "other" = "other"
): Promise<void> {
  const track = { ...input };

  if (!track.videoId) {
    track.videoId = await searchForVideoId(track);
  }

  if (!track.videoId) {
    setStatus(`Couldn't find a playable video for "${track.title}".`);
    return;
  }

  // A manual selection is allowed to replay a song, but automatic queues
  // must never replay IDs that have already played in this session.
  if (source !== "other" && playedIds.has(track.videoId)) {
    setStatus("That song has already played. Choosing another track…");
    await advanceToNext();
    return;
  }

  playbackToken++;
  isAdvancing = false;

  currentTrack = track;
  playedIds.add(track.videoId);

  const index = searchResults.findIndex(
    (song) => song.videoId === track.videoId
  );
  if (index >= 0) searchIndex = index;

  renderCurrentTrack();
  setStatus("Loading: " + track.title);

  if (!playerReady || !player) {
    setStatus("Player is still loading. Please try again in a moment.");
    return;
  }

  player.loadVideoById(track.videoId);
  fetchRelatedForTrack(track).catch((error) => {
    console.warn("Related-track discovery failed:", error);
  });
}

async function advanceToNext(): Promise<void> {
  if (isAdvancing) return;

  isAdvancing = true;
  const token = playbackToken;

  try {
    let next = takeNextRelated();

    // Allow a short window for related-track discovery to finish.
    if (!next && currentTrack) {
      setStatus("Finding your next song…");

      for (let attempt = 0; attempt < 6; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (token !== playbackToken) return;

        next = takeNextRelated();
        if (next) break;
      }
    }

    if (token !== playbackToken) return;

    // Fall back to unplayed results from the latest search.
    if (!next) next = takeNextSearchResult();

    if (next) {
      // Clear advancing before playTrack changes the playback token.
      isAdvancing = false;
      await playTrack(next, "other");
      return;
    }

    setStatus("No more unplayed songs. Search for more music!");
  } finally {
    isAdvancing = false;
  }
}

function previousTrack(): void {
  // The player intentionally avoids replaying played tracks automatically.
  // Previous is a manual action, so it may replay the current search list.
  if (searchIndex > 0) {
    const track = searchResults[searchIndex - 1];
    if (track) {
      searchIndex--;
      playbackToken++;
      isAdvancing = false;
      playTrack(track, "other");
      return;
    }
  }

  setStatus("No previous search result.");
}

async function performSearch(query: string): Promise<void> {
  const trimmed = query.trim();
  if (!trimmed) return;

  const token = ++searchToken;
  const container = $("#search-results");
  container.innerHTML = '<p class="empty">Searching…</p>';
  setStatus(`Searching for "${trimmed}"…`);

  try {
    const data = await apiGet(
      `${API.search}?q=${encodeURIComponent(trimmed)}&filter=videos`
    );

    if (token !== searchToken) return;

    const normalized = unwrapTracks(data)
      .map(normalizeTrack)
      .filter((track): track is Track => Boolean(track))
      .filter((track) => Boolean(track.videoId));

    const seen = new Set<string>();
    searchResults = normalized.filter((track) => {
      if (seen.has(track.videoId)) return false;
      seen.add(track.videoId);
      return true;
    });

    searchIndex = -1;
    renderSearchResults();

    setStatus(
      searchResults.length
        ? `Found ${searchResults.length} results.`
        : "No playable results found."
    );
  } catch (error) {
    console.error("Search failed:", error);
    if (token === searchToken) {
      container.innerHTML =
        '<p class="empty">Search failed. Check that the API server is running.</p>';
      setStatus("Search failed.");
    }
  }
}

function onPlayerStateChange(event: any): void {
  const YT = window.YT;
  if (!YT) return;

  if (event.data === YT.PlayerState.PLAYING) {
    setStatus("Playing now");
  } else if (event.data === YT.PlayerState.PAUSED) {
    setStatus("Paused");
  } else if (event.data === YT.PlayerState.ENDED) {
    void advanceToNext();
  } else if (event.data === YT.PlayerState.BUFFERING) {
    setStatus("Buffering…");
  }
}

function onPlayerError(event: any): void {
  console.warn("YouTube player error:", event.data);
  setStatus("This video can't be played. Trying another song…");
  void advanceToNext();
}

function loadYouTubeAPI(): void {
  if (window.YT?.Player) {
    createPlayer();
    return;
  }

  if (!document.querySelector('script[data-youtube-iframe-api]')) {
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.dataset.youtubeIframeApi = "true";
    document.head.appendChild(script);
  }

  window.onYouTubeIframeAPIReady = createPlayer;
}

function createPlayer(): void {
  if (player) return;

  const YT = window.YT;
  if (!YT?.Player) return;

  player = new YT.Player("youtube-player", {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 0,
      controls: 1,
      playsinline: 1,
      rel: 0,
    },
    events: {
      onReady: () => {
        playerReady = true;
        setStatus("Ready to play");
      },
      onStateChange: onPlayerStateChange,
      onError: onPlayerError,
    },
  });
}

function installUI(): void {
  document.title = "Musicoom — Music Player";

  document.body.innerHTML = `
    <style>
      :root {
        color-scheme: dark;
        font-family: Inter, system-ui, -apple-system, sans-serif;
        background: #0d0d12;
        color: #f6f6fb;
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100vh;
        background:
          radial-gradient(ellipse at top left, #25204a 0, transparent 42%),
          #0d0d12;
      }

      button, input { font: inherit; }

      button {
        cursor: pointer;
        color: inherit;
      }

      .app {
        max-width: 1200px;
        margin: auto;
        padding: 24px;
      }

      header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 24px;
      }

      .brand {
        font-size: 26px;
        font-weight: 850;
        letter-spacing: -1px;
      }

      .brand span { color: #a89aff; }

      .status {
        color: #b9b8c9;
        font-size: 13px;
      }

      .search {
        display: flex;
        gap: 10px;
        margin-bottom: 24px;
      }

      .search input {
        min-width: 0;
        flex: 1;
        border: 1px solid #343342;
        border-radius: 14px;
        padding: 14px 16px;
        color: white;
        background: #171720;
        outline: none;
      }

      .search input:focus { border-color: #9383ff; }

      .primary {
        border: 0;
        border-radius: 14px;
        padding: 12px 20px;
        background: #9584ff;
        color: #100d20;
        font-weight: 800;
      }

      .layout {
        display: grid;
        grid-template-columns: minmax(0, 1.25fr) minmax(280px, .75fr);
        gap: 22px;
        align-items: start;
      }

      .panel {
        border: 1px solid #302e3e;
        background: rgb(22 21 31 / 90%);
        border-radius: 20px;
        padding: 18px;
        min-width: 0;
      }

      h2 {
        font-size: 17px;
        margin: 0 0 16px;
      }

      .now-playing {
        display: flex;
        gap: 14px;
        align-items: center;
        margin-bottom: 16px;
      }

      .cover {
        width: 68px;
        height: 68px;
        flex-shrink: 0;
        object-fit: cover;
        border-radius: 12px;
        background: #242332;
      }

      .track-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 5px;
        text-align: left;
        min-width: 0;
      }

      .track-info strong {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-size: 14px;
      }

      .track-info small {
        color: #a6a4b8;
        font-size: 12px;
      }

      .video-frame {
        width: 100%;
        aspect-ratio: 16 / 9;
        overflow: hidden;
        border-radius: 14px;
        background: #050508;
      }

      #youtube-player {
        width: 100%;
        height: 100%;
      }

      .controls {
        display: flex;
        gap: 10px;
        margin: 14px 0 22px;
      }

      .controls button {
        flex: 1;
        padding: 12px;
        border: 1px solid #3b394b;
        border-radius: 12px;
        background: #211f2d;
      }

      .controls .play {
        background: #9584ff;
        color: #100d20;
        border-color: transparent;
        font-weight: 800;
      }

      .track-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .track-card, .queue-card {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 9px;
        border: 1px solid transparent;
        border-radius: 12px;
        background: #1b1a25;
        text-align: left;
      }

      .track-card:hover, .queue-card:hover {
        background: #28263a;
        border-color: #514a77;
      }

      .track-card img, .queue-card img, .placeholder {
        width: 54px;
        height: 54px;
        flex-shrink: 0;
        border-radius: 9px;
        object-fit: cover;
        background: #2a283a;
      }

      .placeholder {
        display: grid;
        place-items: center;
      }

      .track-card .track-info, .queue-card .track-info { flex: 1; }

      .play-icon { color: #b7aaff; }

      .empty {
        color: #a6a4b8;
        text-align: center;
        padding: 20px 8px;
        font-size: 13px;
      }

      .queue-heading {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .queue-count {
        background: #302b49;
        color: #c9c0ff;
        padding: 4px 9px;
        border-radius: 999px;
        font-size: 12px;
      }

      @media (max-width: 760px) {
        .app { padding: 16px; }
        header { align-items: flex-start; flex-direction: column; }
        .layout { grid-template-columns: 1fr; }
        .search { gap: 7px; }
        .primary { padding: 12px 14px; }
      }
    </style>

    <main class="app">
      <header>
        <div class="brand">♫ Musi<span>coom</span></div>
        <div id="status" class="status">Loading player…</div>
      </header>

      <form id="search-form" class="search">
        <input
          id="search-input"
          type="search"
          placeholder="Search songs, artists, or albums…"
          autocomplete="off"
          aria-label="Search music"
        >
        <button class="primary" type="submit">Search</button>
      </form>

      <div class="layout">
        <section class="panel">
          <h2>Now playing</h2>

          <div id="now-playing" class="now-playing">
            <img id="current-cover" class="cover" alt="">
            <div class="track-info">
              <strong id="current-title">Nothing playing</strong>
              <small id="current-artist">Search for a song to get started</small>
            </div>
          </div>

          <div class="video-frame">
            <div id="youtube-player"></div>
          </div>

          <div class="controls">
            <button id="previous-button" type="button">Previous</button>
            <button id="play-button" class="play" type="button">Play / Pause</button>
            <button id="next-button" type="button">Next ▶</button>
          </div>

          <h2>Search results</h2>
          <div id="search-results" class="track-list">
            <p class="empty">Search for music to get started.</p>
          </div>
        </section>

        <aside class="panel">
          <div class="queue-heading">
            <h2>Related music</h2>
            <span id="queue-count" class="queue-count">0</span>
          </div>
          <p class="status" style="margin-top:-8px;margin-bottom:16px">
            Discovered in the background as you listen.
          </p>
          <div id="related-queue" class="track-list">
            <p class="empty">Related songs will appear here as you listen.</p>
          </div>
        </aside>
      </div>
    </main>
  `;

  $("#search-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const query = $("#search-input" as string as never);
    void performSearch((query as HTMLInputElement).value);
  });

  $("#previous-button").addEventListener("click", previousTrack);

  $("#next-button").addEventListener("click", () => {
    void advanceToNext();
  });

  $("#play-button").addEventListener("click", () => {
    if (!playerReady || !player) {
      setStatus("Player is still loading.");
      return;
    }

    const state = player.getPlayerState();
    const YT = window.YT;

    if (state === YT?.PlayerState?.PLAYING) {
      player.pauseVideo();
    } else if (currentTrack) {
      player.playVideo();
    } else {
      const first = searchResults[0];
      if (first) void playTrack(first, "search");
      else setStatus("Search for a song first.");
    }
  });

  loadYouTubeAPI();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", installUI, { once: true });
} else {
  installUI();
}
