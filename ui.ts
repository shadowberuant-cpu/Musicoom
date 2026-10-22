
/**
 * Verome API - Music Player UI
 * Render-friendly TypeScript module exporting a complete HTML page.
 *
 * Expected server endpoints include:
 * /api/search
 * /api/yt_search
 * /api/songs/:videoId
 * /api/albums/:browseId
 * /api/artists/:browseId
 * /api/playlists/:playlistId
 * /api/related/:videoId
 * /api/similar?title=&artist=
 * /api/artist/info?artist=
 * /api/stream
 * /api/lyrics
 * /api/charts
 */

export const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#090b0a">
  <title>Verome API</title>
  <link rel="icon" href="/assets/logo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --accent: #10b981;
      --accent-soft: rgba(16,185,129,.13);
      --bg: #090b0a;
      --surface: #111412;
      --surface2: #191d1a;
      --border: #272c28;
      --text: #f5f7f5;
      --muted: #929b94;
      --dim: #657067;
      --danger: #f87171;
    }

    body {
      min-height: 100vh;
      background: var(--bg);
      color: var(--text);
      font-family: Inter, system-ui, -apple-system, sans-serif;
    }

    button, input, select { font: inherit; }
    button { -webkit-tap-highlight-color: transparent; }

    .background {
      position: fixed;
      inset: 0;
      z-index: -1;
      pointer-events: none;
      background: radial-gradient(ellipse 75% 45% at 50% -15%, rgba(16,185,129,.11), transparent);
    }

    .container {
      width: min(900px, 100%);
      margin: auto;
      padding: 48px 24px 190px;
    }

    .hero { text-align: center; margin-bottom: 46px; }
    .logo {
      width: 112px;
      height: 112px;
      object-fit: contain;
      margin-bottom: 20px;
      filter: drop-shadow(0 12px 32px rgba(16,185,129,.2));
    }

    .title {
      font-size: clamp(2rem, 5vw, 3rem);
      letter-spacing: -1.5px;
      font-weight: 700;
      margin-bottom: 10px;
    }

    .subtitle { color: var(--muted); font-size: .95rem; line-height: 1.6; }

    .nav {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-bottom: 34px;
    }

    .nav-btn {
      padding: 11px 24px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: transparent;
      color: var(--muted);
      cursor: pointer;
      transition: .18s ease;
    }

    .nav-btn:hover { color: var(--text); border-color: #414941; }
    .nav-btn.active {
      color: var(--accent);
      background: var(--accent-soft);
      border-color: var(--accent);
    }

    .tab { display: none; }
    .tab.active { display: block; }

    .section { margin-bottom: 32px; }
    .section-title {
      margin-bottom: 12px;
      color: var(--accent);
      font-size: .7rem;
      font-weight: 700;
      letter-spacing: 1.6px;
      text-transform: uppercase;
    }

    .api-list { display: grid; gap: 8px; }

    .api-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 15px 16px;
      border: 1px solid var(--border);
      border-radius: 11px;
      background: var(--surface);
      transition: border-color .15s, transform .15s;
    }

    .api-item:hover { border-color: #3a443c; transform: translateX(2px); }

    .method {
      min-width: 38px;
      padding: 5px 7px;
      border-radius: 6px;
      background: var(--accent-soft);
      color: var(--accent);
      text-align: center;
      font-size: .63rem;
      font-weight: 700;
    }

    .path {
      flex: 1;
      min-width: 0;
      overflow-wrap: anywhere;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: .8rem;
    }

    .desc { color: var(--dim); font-size: .73rem; text-align: right; }

    .search-row, .tester-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-bottom: 16px;
    }

    .input, .select {
      min-width: 0;
      padding: 13px 14px;
      border: 1px solid var(--border);
      border-radius: 10px;
      background: var(--surface);
      color: var(--text);
      outline: none;
    }

    .input { flex: 1; }
    .input:focus, .select:focus { border-color: var(--accent); }
    .input::placeholder { color: var(--dim); }
    .select { cursor: pointer; }
    .select option { background: var(--surface); color: var(--text); }

    .btn {
      padding: 12px 20px;
      border: 1px solid var(--accent);
      border-radius: 10px;
      background: var(--accent);
      color: #04110b;
      font-weight: 700;
      cursor: pointer;
      transition: opacity .15s;
    }

    .btn:hover { opacity: .88; }
    .btn:disabled { opacity: .5; cursor: wait; }

    .loading, .empty {
      padding: 30px 12px;
      text-align: center;
      color: var(--muted);
    }

    .loading { display: none; color: var(--accent); }

    .results { max-height: 58vh; overflow-y: auto; }
    .result {
      display: flex;
      align-items: center;
      gap: 13px;
      padding: 11px;
      border: 1px solid transparent;
      border-radius: 11px;
      cursor: pointer;
      transition: background .15s, border-color .15s;
    }

    .result:hover { background: var(--surface); }
    .result.active {
      background: var(--accent-soft);
      border-color: rgba(16,185,129,.25);
    }

    .thumb {
      flex-shrink: 0;
      width: 54px;
      height: 54px;
      object-fit: cover;
      border-radius: 8px;
      background: var(--surface2);
    }

    .info { flex: 1; min-width: 0; }
    .name, .artist {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .name { font-size: .88rem; font-weight: 600; }
    .artist { margin-top: 5px; color: var(--muted); font-size: .77rem; }
    .dur { color: var(--dim); font-family: monospace; font-size: .72rem; }

    .url-preview {
      padding: 12px;
      margin-bottom: 14px;
      overflow-wrap: anywhere;
      border: 1px solid var(--border);
      border-radius: 9px;
      background: var(--surface);
      color: var(--muted);
      font: .78rem ui-monospace, monospace;
    }

    .response {
      max-height: 440px;
      margin-top: 18px;
      padding: 16px;
      overflow: auto;
      border: 1px solid var(--border);
      border-radius: 11px;
      background: var(--surface);
    }

    .response pre {
      color: #9ce7bd;
      font: .76rem/1.6 ui-monospace, SFMono-Regular, Menlo, monospace;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
    }

    .status { margin-bottom: 10px; color: var(--muted); font-size: .75rem; }

    .player {
      position: fixed;
      z-index: 100;
      right: 0;
      bottom: 0;
      left: 0;
      display: none;
      padding: 14px 22px 16px;
      border-top: 1px solid var(--border);
      background: rgba(9,11,10,.96);
      backdrop-filter: blur(18px);
    }

    .player.visible { display: block; }
    .player-inner { width: min(900px, 100%); margin: auto; }

    .player-row { display: flex; align-items: center; gap: 13px; margin-bottom: 12px; }
    .player-thumb {
      width: 48px;
      height: 48px;
      flex-shrink: 0;
      border-radius: 8px;
      object-fit: cover;
      background: var(--surface2);
    }

    .player-info { flex: 1; min-width: 0; }
    .player-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .85rem; font-weight: 600; }
    .player-artist { margin-top: 4px; color: var(--muted); font-size: .75rem; }

    .controls { display: flex; align-items: center; gap: 7px; }
    .ctrl {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border: 1px solid var(--border);
      border-radius: 50%;
      background: var(--surface);
      color: var(--text);
      cursor: pointer;
    }

    .ctrl:hover { background: var(--surface2); }
    .ctrl.play {
      width: 42px;
      height: 42px;
      border-color: var(--accent);
      background: var(--accent);
      color: #04110b;
      font-weight: 700;
    }

    .progress-row { display: flex; align-items: center; gap: 10px; }
    .time { min-width: 36px; color: var(--muted); font: .68rem ui-monospace, monospace; }
    .time:last-child { text-align: right; }

    .bar {
      flex: 1;
      height: 5px;
      overflow: hidden;
      border-radius: 10px;
      background: var(--surface2);
      cursor: pointer;
    }

    .fill { width: 0; height: 100%; border-radius: inherit; background: var(--accent); }

    #ytplayer {
      position: fixed;
      width: 1px;
      height: 1px;
      right: -10px;
      bottom: -10px;
      overflow: hidden;
      opacity: .01;
      pointer-events: none;
    }

    .notice { margin: 8px 0 14px; color: var(--muted); font-size: .78rem; line-height: 1.6; }
    .notice.error { color: var(--danger); }

    @media (max-width: 600px) {
      .container { padding: 30px 14px 180px; }
      .hero { margin-bottom: 30px; }
      .logo { width: 76px; height: 76px; }
      .nav-btn { flex: 1; padding: 11px 10px; }
      .desc { display: none; }
      .search-row { flex-direction: column; }
      .search-row .select, .search-row .btn { width: 100%; }
      .player { padding: 12px 12px 14px; }
      .player-row { gap: 9px; }
      .player-thumb { width: 42px; height: 42px; }
      .ctrl { width: 34px; height: 34px; }
      .ctrl.play { width: 38px; height: 38px; }
    }
  </style>
</head>

<body>
  <div class="background"></div>

  <main class="container">
    <header class="hero">
      <img src="/assets/logo.png" alt="Verome logo" class="logo"
           onerror="this.style.display='none'">
      <h1 class="title">Verome API</h1>
      <p class="subtitle">Music discovery, YouTube Music search, lyrics and streaming APIs</p>
    </header>

    <nav class="nav" aria-label="Main navigation">
      <button class="nav-btn active" data-tab="docs" onclick="showTab('docs')">Docs</button>
      <button class="nav-btn" data-tab="player" onclick="showTab('player')">Player</button>
      <button class="nav-btn" data-tab="tester" onclick="showTab('tester')">Tester</button>
    </nav>

    <section id="docs" class="tab active">
      <div class="section">
        <h2 class="section-title">Search</h2>
        <div class="api-list">
          <div class="api-item"><span class="method">GET</span><span class="path">/api/search?q=</span><span class="desc">Search music</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/search/suggestions?q=</span><span class="desc">Search suggestions</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/yt_search?q=</span><span class="desc">YouTube videos</span></div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Content</h2>
        <div class="api-list">
          <div class="api-item"><span class="method">GET</span><span class="path">/api/songs/:videoId</span><span class="desc">Song details</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/albums/:browseId</span><span class="desc">Album tracks</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/artists/:browseId</span><span class="desc">Artist information</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/playlists/:playlistId</span><span class="desc">Playlist tracks</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/chain/:videoId</span><span class="desc">Song relationship chain</span></div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Discovery</h2>
        <div class="api-list">
          <div class="api-item"><span class="method">GET</span><span class="path">/api/related/:videoId</span><span class="desc">Related tracks</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/radio?videoId=</span><span class="desc">Radio mix</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/similar?title=&amp;artist=</span><span class="desc">Similar tracks</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/charts?country=</span><span class="desc">Music charts</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/trending?country=</span><span class="desc">Trending tracks</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/moods</span><span class="desc">Mood categories</span></div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Streaming and lyrics</h2>
        <div class="api-list">
          <div class="api-item"><span class="method">GET</span><span class="path">/api/stream?id=</span><span class="desc">Stream metadata</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/proxy?url=</span><span class="desc">Media proxy</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/lyrics?title=&amp;artist=</span><span class="desc">Lyrics lookup</span></div>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Artist and track information</h2>
        <div class="api-list">
          <div class="api-item"><span class="method">GET</span><span class="path">/api/artist/info?artist=</span><span class="desc">Artist biography</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/track/info?title=&amp;artist=</span><span class="desc">Track information</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/top/artists?country=</span><span class="desc">Top artists</span></div>
          <div class="api-item"><span class="method">GET</span><span class="path">/api/top/tracks?country=</span><span class="desc">Top tracks</span></div>
        </div>
      </div>
    </section>

    <section id="player-tab" class="tab">
      <div class="search-row">
        <select class="select" id="filter" aria-label="Search category">
          <option value="">All results</option>
          <option value="songs">Songs</option>
          <option value="albums">Albums</option>
          <option value="artists">Artists</option>
        </select>
        <input class="input" id="query" type="search" placeholder="Search songs, artists or albums..." autocomplete="off">
        <button class="btn" id="searchBtn" onclick="searchMusic()">Search</button>
      </div>

      <p class="notice" id="playerNotice">Search for a track to get started. Related tracks are discovered while music plays when your API endpoints support them.</p>
      <div class="loading" id="loading">Searching...</div>
      <div class="results" id="results"><div class="empty">Search for music to see results.</div></div>
    </section>

    <section id="tester" class="tab">
      <p class="notice">Choose an endpoint, enter its parameters and send a request to this server.</p>
      <div class="tester-row">
        <select class="select" id="endpoint" onchange="updateInputs()" aria-label="API endpoint">
          <option value="search">Search</option>
          <option value="yt_search">YouTube Search</option>
          <option value="stream">Stream</option>
          <option value="song">Song Details</option>
          <option value="album">Album</option>
          <option value="artist">Artist</option>
          <option value="playlist">Playlist</option>
          <option value="chain">Full Chain</option>
          <option value="related">Related Tracks</option>
          <option value="radio">Radio</option>
          <option value="similar">Similar Tracks</option>
          <option value="lyrics">Lyrics</option>
          <option value="charts">Charts</option>
        </select>
      </div>
      <div class="tester-row" id="inputs"></div>
      <div class="url-preview" id="urlPreview">GET /api/search?q=coldplay</div>
      <button class="btn" id="testBtn" onclick="testApi()">Send request</button>
      <div class="response" id="response">
        <div class="status" id="responseStatus">Waiting for request</div>
        <pre id="responseBody">The API response will appear here.</pre>
      </div>
    </section>
  </main>

  <div class="player" id="playerBar">
    <div class="player-inner">
      <div class="player-row">
        <img class="player-thumb" id="pThumb" alt="Current track artwork" src="">
        <div class="player-info">
          <div class="player-title" id="pTitle">Nothing playing</div>
          <div class="player-artist" id="pArtist">Choose a song to begin</div>
        </div>
        <div class="controls">
          <button class="ctrl" onclick="prevTrack()" aria-label="Previous track">|&lt;</button>
          <button class="ctrl play" id="playBtn" onclick="togglePlayback()" aria-label="Play or pause">▶</button>
          <button class="ctrl" onclick="nextTrack()" aria-label="Next track">&gt;|</button>
        </div>
      </div>
      <div class="progress-row">
        <span class="time" id="cur">0:00</span>
        <div class="bar" id="bar" role="slider" aria-label="Seek playback" tabindex="0"
             onclick="seekTrack(event)" onkeydown="seekKeyboard(event)">
          <div class="fill" id="fill"></div>
        </div>
        <span class="time" id="total">0:00</span>
      </div>
    </div>
  </div>

  <div id="ytplayer"></div>

<script>
(function () {
  'use strict';

  var songs = [];
  var yt = null;
  var ready = false;
  var playing = false;
  var currentTrack = null;
  var currentKey = '';
  var history = [];
  var historyIndex = -1;
  var relatedQueue = [];
  // Incremented whenever the user manually starts a new song.
  // It invalidates old recommendations and pending auto-advance work.
  var queueGeneration = 0;
  var playedIds = new Set();
  var queuedIds = new Set();
  var discoveryKeys = new Set();
  var progressTimer = null;
  var advancePending = false;
  var pendingTrack = null;
  var searchRequest = 0;
  var searchContext = 'search';
  var currentHeader = null;
  var lastError = '';

  var cfg = {
    search: {
      inputs: [{ n: 'q', p: 'Search query', v: 'coldplay' }],
      url: '/api/search'
    },
    yt_search: {
      inputs: [
        { n: 'q', p: 'Search query', v: 'coldplay official' },
        { n: 'filter', p: 'Filter', v: 'videos' }
      ],
      url: '/api/yt_search'
    },
    stream: {
      inputs: [{ n: 'id', p: 'Video ID', v: 'dQw4w9WgXcQ' }],
      url: '/api/stream'
    },
    song: {
      inputs: [{ n: 'videoId', p: 'Video ID', v: 'dQw4w9WgXcQ' }],
      url: '/api/songs/{videoId}'
    },
    album: {
      inputs: [{ n: 'browseId', p: 'Album ID', v: '' }],
      url: '/api/albums/{browseId}'
    },
    artist: {
      inputs: [{ n: 'browseId', p: 'Artist ID', v: '' }],
      url: '/api/artists/{browseId}'
    },
    playlist: {
      inputs: [{ n: 'playlistId', p: 'Playlist ID', v: '' }],
      url: '/api/playlists/{playlistId}'
    },
    chain: {
      inputs: [{ n: 'videoId', p: 'Video ID', v: 'dQw4w9WgXcQ' }],
      url: '/api/chain/{videoId}'
    },
    related: {
      inputs: [{ n: 'videoId', p: 'Video ID', v: 'dQw4w9WgXcQ' }],
      url: '/api/related/{videoId}'
    },
    radio: {
      inputs: [{ n: 'videoId', p: 'Video ID', v: 'dQw4w9WgXcQ' }],
      url: '/api/radio'
    },
    similar: {
      inputs: [
        { n: 'title', p: 'Track title', v: 'Yellow' },
        { n: 'artist', p: 'Artist', v: 'Coldplay' }
      ],
      url: '/api/similar'
    },
    lyrics: {
      inputs: [
        { n: 'title', p: 'Track title', v: 'Yellow' },
        { n: 'artist', p: 'Artist', v: 'Coldplay' }
      ],
      url: '/api/lyrics'
    },
    charts: {
      inputs: [{ n: 'country', p: 'Country code', v: 'US' }],
      url: '/api/charts'
    }
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    var el = byId(id);
    if (el) el.textContent = value == null ? '' : String(value);
  }

  function esc(value) {
    var el = document.createElement('span');
    el.textContent = value == null ? '' : String(value);
    return el.innerHTML;
  }

  function safeImage(url, videoId) {
    var value = typeof url === 'string' ? url : '';
    if (value.indexOf('//') === 0) value = 'https:' + value;
    if (value && /^https?:\\/\\//i.test(value)) return value;
    if (videoId) return 'https://img.youtube.com/vi/' + encodeURIComponent(videoId) + '/mqdefault.jpg';
    return '';
  }

  function getArtist(item) {
    if (!item) return '';
    var artists = item.artists || item.artist;
    if (Array.isArray(artists)) {
      return artists.map(function (a) {
        return typeof a === 'string' ? a : (a && (a.name || a.title)) || '';
      }).filter(Boolean).join(', ');
    }
    if (typeof artists === 'string') return artists;
    return item.subtitle || item.author || item.channelTitle || '';
  }

  function getVideoId(item) {
    if (!item) return '';
    var id = item.videoId || item.video_id || item.videoID;
    if (!id && item.id && typeof item.id === 'string') id = item.id;
    if (!id && item.video && typeof item.video.id === 'string') id = item.video.id;
    if (!id && item.id && typeof item.id === 'object') id = item.id.videoId;
    if (!id && item.navigationEndpoint && item.navigationEndpoint.watchEndpoint) {
      id = item.navigationEndpoint.watchEndpoint.videoId;
    }
    return typeof id === 'string' ? id : '';
  }

  function getBrowseId(item) {
    if (!item) return '';
    return item.browseId ||
      (item.id && typeof item.id === 'object' ? item.id.browseId : '') ||
      (item.navigationEndpoint && item.navigationEndpoint.browseEndpoint
        ? item.navigationEndpoint.browseEndpoint.browseId : '') || '';
  }

  function getThumb(item) {
    if (!item) return '';
    var thumbs = item.thumbnails || item.thumbnail;
    if (Array.isArray(thumbs)) {
      var last = thumbs[thumbs.length - 1];
      return safeImage(last && (last.url || last.src), getVideoId(item));
    }
    if (typeof thumbs === 'string') return safeImage(thumbs, getVideoId(item));
    if (thumbs && typeof thumbs === 'object') return safeImage(thumbs.url || thumbs.src, getVideoId(item));
    return safeImage(item.thumbnailUrl || item.image || '', getVideoId(item));
  }

  function normalizeTrack(item) {
    var id = getVideoId(item);
    var title = item && (item.title || item.name) || 'Unknown track';
    var artist = getArtist(item);
    return {
      raw: item || {},
      videoId: id,
      title: String(title),
      artist: String(artist || 'Unknown artist'),
      thumbnail: getThumb(item),
      duration: item && (item.duration || item.durationText || item.length) || '',
      resultType: item && (item.resultType || item.type || item.category) || 'song',
      browseId: getBrowseId(item),
      fallbackVideoId: item && item.fallbackVideoId || ''
    };
  }

  function extractItems(data) {
    if (Array.isArray(data)) return data;
    if (!data || typeof data !== 'object') return [];
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.tracks)) return data.tracks;
    if (Array.isArray(data.songs)) return data.songs;
    if (data.songs && Array.isArray(data.songs.results)) return data.songs.results;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.data)) return data.data;
    if (data.data && Array.isArray(data.data.results)) return data.data.results;
    if (data.radio && Array.isArray(data.radio.results)) return data.radio.results;
    return [];
  }

  async function fetchJson(url) {
    var response = await fetch(url, { headers: { Accept: 'application/json' } });
    var text = await response.text();
    var data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      data = { message: text };
    }
    if (!response.ok) {
      var message = data && (data.error || data.message);
      throw new Error(message || ('Request failed with HTTP ' + response.status));
    }
    return data;
  }

  function showNotice(message, isError) {
    var el = byId('playerNotice');
    if (!el) return;
    el.textContent = message;
    el.className = isError ? 'notice error' : 'notice';
  }

  window.showTab = function (tab) {
    var targetId = tab === 'player' ? 'player-tab' : tab;
    var target = byId(targetId);
    if (!target) return;

    document.querySelectorAll('.tab').forEach(function (el) {
      el.classList.toggle('active', el === target);
    });
    document.querySelectorAll('.nav-btn').forEach(function (button) {
      button.classList.toggle('active', button.getAttribute('data-tab') === tab);
    });
  };

  async function searchMusic() {
    var query = byId('query').value.trim();
    if (!query) {
      showNotice('Enter a search term first.', true);
      return;
    }

    var requestId = ++searchRequest;
    var filter = byId('filter').value;
    searchContext = 'search';
    currentHeader = null;

    byId('searchBtn').disabled = true;
    byId('loading').style.display = 'block';
    byId('results').innerHTML = '';

    try {
      var url = '/api/search?q=' + encodeURIComponent(query);
      if (filter) url += '&filter=' + encodeURIComponent(filter);

      var data = await fetchJson(url);
      if (requestId !== searchRequest) return;

      songs = extractItems(data).map(normalizeTrack);
      renderResults();
      showNotice(songs.length
        ? 'Select a playable result. Related-track discovery runs in the background when supported.'
        : 'No results were returned by the search endpoint.', false);
    } catch (error) {
      if (requestId === searchRequest) {
        songs = [];
        byId('results').innerHTML = '<div class="empty">Search failed: ' + esc(error.message) + '</div>';
        showNotice('The search request failed. Check that /api/search is available.', true);
      }
    } finally {
      if (requestId === searchRequest) {
        byId('searchBtn').disabled = false;
        byId('loading').style.display = 'none';
      }
    }
  }

  window.searchMusic = searchMusic;

  function renderResults() {
    var results = byId('results');
    results.innerHTML = '';

    if (currentHeader) {
      var header = document.createElement('div');
      header.className = 'api-item';
      header.style.marginBottom = '12px';
      header.innerHTML =
        '<img class="thumb" src="' + esc(currentHeader.thumbnail || '') + '" alt="" onerror="this.style.visibility=\\'hidden\\'">' +
        '<div class="info"><div class="name">' + esc(currentHeader.title) + '</div>' +
        '<div class="artist">' + esc(currentHeader.subtitle || '') + '</div></div>' +
        '<button class="btn" onclick="goBack()" style="padding:8px 12px">Back</button>';
      results.appendChild(header);
    }

    if (!songs.length) {
      var empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = 'No results to display.';
      results.appendChild(empty);
      return;
    }

    songs.forEach(function (song, index) {
      var row = document.createElement('div');
      var isActive = currentKey && song.videoId && song.videoId === currentKey;
      row.className = 'result' + (isActive ? ' active' : '');

      var thumb = document.createElement('img');
      thumb.className = 'thumb';
      thumb.alt = '';
      thumb.src = song.thumbnail || safeImage('', song.videoId);
      thumb.onerror = function () { this.style.visibility = 'hidden'; };

      var info = document.createElement('div');
      info.className = 'info';

      var title = document.createElement('div');
      title.className = 'name';
      title.textContent = song.title;

      var artist = document.createElement('div');
      artist.className = 'artist';
      artist.textContent = song.artist;

      info.appendChild(title);
      info.appendChild(artist);

      var duration = document.createElement('div');
      duration.className = 'dur';
      duration.textContent = song.duration || '';

      row.appendChild(thumb);
      row.appendChild(info);
      row.appendChild(duration);

      row.addEventListener('click', function () {
        if (song.videoId) {
          // Manual selection starts a fresh chain for this song.
          playTrack(song, true, true);
        } else {
          openCollection(song);
        }
      });

      results.appendChild(row);
    });
  }

  function stableKey(track) {
    if (track && track.videoId) return 'id:' + track.videoId;
    return 'text:' + String(track && track.title || '').toLowerCase().trim() +
      '|' + String(track && track.artist || '').toLowerCase().trim();
  }

  function trackFromRaw(item) {
    return normalizeTrack(item);
  }

  function setCurrentTrack(track) {
    currentTrack = track;
    currentKey = track.videoId || stableKey(track);

    setText('pTitle', track.title);
    setText('pArtist', track.artist);
    byId('pThumb').src = track.thumbnail || safeImage('', track.videoId);
    byId('playerBar').classList.add('visible');

    renderResults();
  }

  function resetQueueForManualTrack() {
    queueGeneration += 1;
    relatedQueue = [];
    playedIds.clear();
    queuedIds.clear();
    discoveryKeys.clear();
    advancePending = false;
  }

  function playTrack(track, addHistory, resetQueue) {
    if (!track) return;

    if (!track.videoId) {
      showNotice('This result does not contain a playable YouTube video ID.', true);
      return;
    }

    // Only a manual song selection resets the chain. Auto-next and fallback
    // playback keep the current queue intact. Reset before waiting for the
    // YouTube player so a pending manual selection invalidates old work now.
    if (resetQueue) resetQueueForManualTrack();

    if (!ready || !yt) {
      pendingTrack = { track: track, addHistory: addHistory, resetQueue: false };
      showNotice('The embedded player is loading. Your track will play when it is ready.', false);
      return;
    }

    if (addHistory !== false) {
      if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
      }
      history.push(track);
      historyIndex = history.length - 1;
    }

    currentTrack = track;
    currentKey = track.videoId;
    playedIds.add(track.videoId);
    queuedIds.delete(track.videoId);
    advancePending = false;

    setCurrentTrack(track);
    setText('playBtn', '⏸');
    playing = true;

    try {
      yt.loadVideoById(track.videoId);
    } catch (error) {
      playing = false;
      setText('playBtn', '▶');
      showNotice('Could not start the embedded player. Try another track.', true);
      return;
    }

    discoverRelated(track);
    showNotice('Playing: ' + track.title + '. Looking for related tracks in the background.', false);
  }

  window.playTrack = playTrack;

  function togglePlayback() {
    if (!yt || !ready) {
      showNotice('The player is still loading.', false);
      return;
    }
    if (!currentTrack) {
      showNotice('Search for a song and select a result first.', false);
      return;
    }

    try {
      if (playing) yt.pauseVideo();
      else yt.playVideo();
    } catch (error) {
      showNotice('Playback control failed. Try selecting the track again.', true);
    }
  }

  window.togglePlayback = togglePlayback;

  function prevTrack() {
    if (historyIndex > 0) {
      historyIndex -= 1;
      playTrack(history[historyIndex], false);
      return;
    }
    showNotice('There is no previous track in this session.', false);
  }

  window.prevTrack = prevTrack;

  async function nextTrack() {
    if (advancePending) return;
    advancePending = true;
    var generationAtStart = queueGeneration;

    try {
      var next = takeRelated();
      if (!next) {
        next = await waitForRelated(4500);
      }

      // If the user manually selected another song while waiting, abandon
      // this auto-advance so it cannot interrupt the new song.
      if (generationAtStart !== queueGeneration) return;

      if (!next) {
        next = songs.find(function (song) {
          return song.videoId && !playedIds.has(song.videoId);
        }) || null;
      }

      if (next) {
        playTrack(next, true, false);
      } else {
        advancePending = false;
        playing = false;
        setText('playBtn', '▶');
        showNotice('No new tracks found. Try another search or play a different song.', false);
      }
    } catch (error) {
      if (generationAtStart === queueGeneration) {
        advancePending = false;
        showNotice('Could not find the next track.', true);
      }
    }
  }

  window.nextTrack = nextTrack;

  function takeRelated() {
    while (relatedQueue.length) {
      var track = relatedQueue.shift();
      if (!track || !track.videoId) continue;
      queuedIds.delete(track.videoId);
      if (playedIds.has(track.videoId)) continue;
      if (currentTrack && track.videoId === currentTrack.videoId) continue;
      return track;
    }
    return null;
  }

  function waitForRelated(ms) {
    return new Promise(function (resolve) {
      var started = Date.now();
      function check() {
        var found = takeRelated();
        if (found) {
          resolve(found);
          return;
        }
        if (Date.now() - started >= ms) {
          resolve(null);
          return;
        }
        setTimeout(check, 250);
      }
      check();
    });
  }

  async function discoverRelated(track) {
    if (!track || !track.videoId) return;

    var generationAtStart = queueGeneration;
    var key = track.videoId;
    if (discoveryKeys.has(key)) return;
    discoveryKeys.add(key);

    var requests = [
      fetchJson('/api/related/' + encodeURIComponent(track.videoId))
        .then(function (data) { return extractItems(data); })
        .catch(function () { return []; }),
      fetchJson('/api/similar?title=' + encodeURIComponent(track.title) +
        '&artist=' + encodeURIComponent(track.artist))
        .then(function (data) { return extractItems(data); })
        .catch(function () { return []; })
    ];

    var lists = await Promise.all(requests);
    if (generationAtStart !== queueGeneration) return;

    var candidates = [];
    lists.forEach(function (list) {
      list.forEach(function (item) {
        var candidate = trackFromRaw(item);
        if (!candidate.title || candidate.title === 'Unknown track') return;
        if (candidate.videoId && candidate.videoId === track.videoId) return;
        candidates.push(candidate);
      });
    });

    var seen = new Set();
    candidates = candidates.filter(function (candidate) {
      var candidateKey = stableKey(candidate);
      if (seen.has(candidateKey)) return false;
      seen.add(candidateKey);
      return true;
    });

    var missingIds = candidates.filter(function (candidate) {
      return !candidate.videoId;
    }).slice(0, 5);

    if (missingIds.length) {
      await Promise.all(missingIds.map(async function (candidate) {
        var resolved = await searchYouTube(candidate.title, candidate.artist);
        if (resolved) {
          candidate.videoId = resolved;
          candidate.thumbnail = candidate.thumbnail || safeImage('', resolved);
        }
      }));
    }

    // A newer manual selection may have happened while IDs were resolving.
    if (generationAtStart !== queueGeneration) return;

    candidates.forEach(function (candidate) {
      if (!candidate.videoId) return;
      if (playedIds.has(candidate.videoId)) return;
      if (queuedIds.has(candidate.videoId)) return;
      if (currentTrack && candidate.videoId === currentTrack.videoId) return;

      queuedIds.add(candidate.videoId);
      relatedQueue.push(candidate);
    });

    if (candidates.length) {
      showNotice('Related-track discovery checked ' + candidates.length +
        ' candidates. ' + relatedQueue.length + ' new tracks are queued.', false);
    }
  }

  async function searchYouTube(title, artist) {
    try {
      var query = String(title || '') + ' ' + String(artist || '') + ' official audio';
      var data = await fetchJson('/api/yt_search?q=' + encodeURIComponent(query) + '&filter=videos');
      var items = extractItems(data);

      var usable = items.find(function (item) {
        return !!getVideoId(item);
      });

      return usable ? getVideoId(usable) : '';
    } catch (error) {
      return '';
    }
  }

  function onYouTubeState(event) {
    if (!window.YT) return;

    if (event.data === window.YT.PlayerState.PLAYING) {
      playing = true;
      advancePending = false;
      setText('playBtn', '⏸');
      startProgress();
    } else if (event.data === window.YT.PlayerState.PAUSED) {
      playing = false;
      setText('playBtn', '▶');
      stopProgress();
    } else if (event.data === window.YT.PlayerState.ENDED) {
      playing = false;
      stopProgress();
      nextTrack();
    } else if (event.data === window.YT.PlayerState.BUFFERING) {
      setText('playBtn', '…');
    } else if (event.data === window.YT.PlayerState.CUED) {
      setText('playBtn', '▶');
    }
  }

  async function onYouTubeError(event) {
    var code = event && event.data;
    var track = currentTrack;
    if (!track) return;

    lastError = 'YouTube player error: ' + code;

    if ((code === 101 || code === 150) && track.fallbackVideoId &&
        track.fallbackVideoId !== track.videoId) {
      var fallback = normalizeTrack(Object.assign({}, track, {
        videoId: track.fallbackVideoId,
        fallbackVideoId: ''
      }));
      playTrack(fallback, false);
      showNotice('The original video could not be embedded. Trying the fallback video.', false);
      return;
    }

    if (code === 101 || code === 150 || code === 100) {
      showNotice('This video cannot be played in the embedded player. Searching for an alternative...', true);
      var alternativeId = await searchYouTube(track.title, track.artist);
      if (alternativeId && alternativeId !== track.videoId) {
        var replacement = normalizeTrack(Object.assign({}, track, {
          videoId: alternativeId,
          thumbnail: safeImage('', alternativeId)
        }));
        playTrack(replacement, false);
        showNotice('Playing an alternative result for ' + track.title + '.', false);
        return;
      }
    }

    playing = false;
    stopProgress();
    setText('playBtn', '▶');
    showNotice(lastError + '. Try another result.', true);
  }

  window.onYouTubeIframeAPIReady = function () {
    if (!window.YT || !window.YT.Player) return;

    yt = new window.YT.Player('ytplayer', {
      width: '1',
      height: '1',
      host: 'https://www.youtube-nocookie.com',
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        playsinline: 1,
        rel: 0
      },
      events: {
        onReady: function () {
          ready = true;
          if (pendingTrack) {
            var pending = pendingTrack;
            pendingTrack = null;
            playTrack(pending.track, pending.addHistory, pending.resetQueue);
          }
        },
        onStateChange: onYouTubeState,
        onError: onYouTubeError
      }
    });
  };

  function startProgress() {
    stopProgress();
    progressTimer = setInterval(updateProgress, 500);
  }

  function stopProgress() {
    if (progressTimer) {
      clearInterval(progressTimer);
      progressTimer = null;
    }
  }

  function formatTime(seconds) {
    var total = Math.max(0, Math.floor(Number(seconds) || 0));
    var minutes = Math.floor(total / 60);
    var secs = total % 60;
    return minutes + ':' + (secs < 10 ? '0' : '') + secs;
  }

  function updateProgress() {
    if (!yt || !ready) return;
    try {
      var current = yt.getCurrentTime() || 0;
      var duration = yt.getDuration() || 0;
      setText('cur', formatTime(current));
      setText('total', formatTime(duration));
      byId('fill').style.width = duration > 0
        ? Math.min(100, Math.max(0, current / duration * 100)) + '%'
        : '0%';
    } catch (error) {
      // The player can briefly be unavailable while a video changes.
    }
  }

  function seekToFraction(fraction) {
    if (!yt || !ready) return;
    try {
      var duration = yt.getDuration() || 0;
      if (duration > 0) {
        var safeFraction = Math.max(0, Math.min(1, fraction));
        yt.seekTo(duration * safeFraction, true);
      }
    } catch (error) {
      showNotice('Seeking is unavailable for this video.', true);
    }
  }

  window.seekTrack = function (event) {
    var bar = byId('bar');
    var rect = bar.getBoundingClientRect();
    if (!rect.width) return;
    seekToFraction((event.clientX - rect.left) / rect.width);
  };

  window.seekKeyboard = function (event) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    if (!yt || !ready) return;

    try {
      var duration = yt.getDuration() || 0;
      var current = yt.getCurrentTime() || 0;
      if (duration <= 0) return;
      var delta = event.key === 'ArrowRight' ? 5 : -5;
      yt.seekTo(Math.max(0, Math.min(duration, current + delta)), true);
    } catch (error) {
      // Ignore transient player seek errors.
    }
  };

  async function openCollection(track) {
    var type = String(track.resultType || '').toLowerCase();
    var browseId = track.browseId;

    if (!browseId) {
      showNotice('This result has no playable video ID or collection ID.', true);
      return;
    }

    if (type.indexOf('album') !== -1 || browseId.indexOf('MPRE') === 0) {
      await loadCollection('/api/albums/' + encodeURIComponent(browseId), 'album', track);
    } else if (type.indexOf('artist') !== -1 || browseId.indexOf('UC') === 0) {
      await loadCollection('/api/artists/' + encodeURIComponent(browseId), 'artist', track);
    } else if (type.indexOf('playlist') !== -1 || browseId.indexOf('VL') === 0 ||
               browseId.indexOf('RDCLAK') === 0) {
      var playlistId = browseId.indexOf('VL') === 0 ? browseId.substring(2) : browseId;
      await loadCollection('/api/playlists/' + encodeURIComponent(playlistId), 'playlist', track);
    } else {
      showNotice('This result is not directly playable. Try searching under Songs.', true);
    }
  }

  async function loadCollection(url, type, sourceTrack) {
    byId('loading').style.display = 'block';
    showNotice('Loading ' + type + '...', false);

    try {
      var data = await fetchJson(url);
      var collection = data[type] || data;
      var items = extractItems(data);

      if (type === 'artist') {
        if (Array.isArray(data.topSongs)) items = items.concat(data.topSongs);
        if (Array.isArray(data.albums)) items = items.concat(data.albums);
        if (Array.isArray(data.singles)) items = items.concat(data.singles);
      }

      songs = items.map(function (item) {
        var normalized = normalizeTrack(item);
        if (!normalized.thumbnail) normalized.thumbnail = sourceTrack.thumbnail;
        if (!normalized.resultType || normalized.resultType === 'song') {
          normalized.resultType = item && (item.resultType || item.type) || 'song';
        }
        return normalized;
      });

      var title = collection.title || collection.name || sourceTrack.title;
      var subtitle = collection.author || collection.artist ||
        (Array.isArray(collection.artists) ? collection.artists.map(function (a) {
          return typeof a === 'string' ? a : a.name;
        }).join(', ') : '') || type;

      currentHeader = {
        title: title,
        subtitle: subtitle,
        thumbnail: sourceTrack.thumbnail || getThumb(collection)
      };

      searchContext = type;
      renderResults();
      showNotice('Loaded ' + type + '. Select a playable track to start listening.', false);
    } catch (error) {
      showNotice('Could not load ' + type + ': ' + error.message, true);
    } finally {
      byId('loading').style.display = 'none';
    }
  }

  window.goBack = function () {
    currentHeader = null;
    searchMusic();
  };

  function buildTesterUrl() {
    var endpoint = byId('endpoint').value;
    var config = cfg[endpoint];
    if (!config) return '/api/search';

    var url = config.url;
    var params = new URLSearchParams();

    config.inputs.forEach(function (input) {
      var field = byId('api_' + input.n);
      var value = field ? field.value.trim() : input.v;
      if (!value) return;

      var placeholder = '{' + input.n + '}';
      if (url.indexOf(placeholder) !== -1) {
        url = url.split(placeholder).join(encodeURIComponent(value));
      } else {
        params.append(input.n, value);
      }
    });

    var query = params.toString();
    return url + (query ? (url.indexOf('?') === -1 ? '?' : '&') + query : '');
  }

  window.updateInputs = function () {
    var config = cfg[byId('endpoint').value];
    var holder = byId('inputs');
    holder.innerHTML = '';

    if (!config) return;

    config.inputs.forEach(function (input) {
      var field = document.createElement('input');
      field.className = 'input';
      field.id = 'api_' + input.n;
      field.placeholder = input.p;
      field.value = input.v;
      field.setAttribute('aria-label', input.p);
      field.addEventListener('input', updateUrl);
      holder.appendChild(field);
    });

    updateUrl();
  };

  window.updateUrl = function () {
    byId('urlPreview').textContent = 'GET ' + buildTesterUrl();
  };

  window.testApi = async function () {
    var button = byId('testBtn');
    var status = byId('responseStatus');
    var body = byId('responseBody');
    var url = buildTesterUrl();

    button.disabled = true;
    status.textContent = 'Requesting ' + url;
    body.textContent = 'Loading...';

    try {
      var response = await fetch(url, { headers: { Accept: 'application/json' } });
      var text = await response.text();
      var output;

      try {
        output = text ? JSON.parse(text) : {};
        body.textContent = JSON.stringify(output, null, 2);
      } catch (error) {
        body.textContent = text || '(Empty response)';
      }

      status.textContent = 'HTTP ' + response.status + (response.ok ? ' OK' : ' Error');
    } catch (error) {
      status.textContent = 'Request failed';
      body.textContent = error.message || 'Network error';
    } finally {
      button.disabled = false;
    }
  };

  byId('query').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') searchMusic();
  });

  byId('filter').addEventListener('change', function () {
    if (byId('query').value.trim()) searchMusic();
  });

  window.addEventListener('beforeunload', function () {
    stopProgress();
  });

  window.updateInputs();

  var script = document.createElement('script');
  script.src = 'https://www.youtube.com/iframe_api';
  script.async = true;
  script.onerror = function () {
    showNotice('The YouTube player API could not load. Check your network or content-security settings.', true);
  };
  document.head.appendChild(script);
})();
</script>
</body>
</html>`;
