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

    .player-title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: .85rem;
      font-weight: 600;
    }

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

    .time {
      min-width: 36px;
      color: var(--muted);
      font: .68rem ui-monospace, monospace;
    }

    .time:last-child { text-align: right; }

    .bar {
      flex: 1;
      height: 5px;
      overflow: hidden;
      border-radius: 10px;
      background: var(--surface2);
      cursor: pointer;
    }

    .fill {
      width: 0;
      height: 100%;
      border-radius: inherit;
      background: var(--accent);
    }

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
