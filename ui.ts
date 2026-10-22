/**
 * Musicoom - Music for All
 * Render-friendly TypeScript module exporting a complete HTML page.
 *
 * Expected server endpoints include:
 * /api/search              /api/yt_search
 * /api/songs/:videoId      /api/albums/:browseId
 * /api/artists/:browseId   /api/playlists/:playlistId
 * /api/related/:videoId    /api/similar?title=&artist=
 * /api/charts?country=     /api/trending?country=
 * /api/top/artists         /api/top/tracks
 * /api/stream              /api/lyrics
 */

export const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#05080a">
<title>Musicoom — Music for All</title>
<link rel="icon" href="/assets/logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --accent: #22d3ee;
    --accent-2: #67e8f9;
    --accent-ink: #04212a;
    --accent-soft: rgba(34, 211, 238, .12);
    --accent-line: rgba(34, 211, 238, .38);

    --bg: #05080a;
    --surface: #0b1216;
    --surface-2: #111b21;
    --surface-3: #17242c;
    --border: #1b2a32;
    --border-2: #24363f;

    --text: #eaf7fa;
    --muted: #8ba3ad;
    --dim: #5b6f79;
    --danger: #fb7185;

    --nav-h: 64px;
  }

  [hidden] { display: none !important; }

  html { -webkit-text-size-adjust: 100%; }

  body {
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: Inter, system-ui, -apple-system, "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }

  button { font: inherit; color: inherit; background: none; border: 0; cursor: pointer; }
  input { font: inherit; }
  img { display: block; }
  button, a { -webkit-tap-highlight-color: transparent; }

  .sprite { position: absolute; width: 0; height: 0; overflow: hidden; }
  .ic { width: 22px; height: 22px; display: block; flex: 0 0 auto; }

  .glow {
    position: fixed;
    inset: 0;
    z-index: -1;
    pointer-events: none;
    background:
      radial-gradient(900px 520px at 10% -10%, rgba(34, 211, 238, .16), transparent 62%),
      radial-gradient(720px 460px at 96% 2%, rgba(14, 165, 233, .11), transparent 60%),
      radial-gradient(700px 500px at 50% 110%, rgba(34, 211, 238, .07), transparent 65%);
  }

  /* ---------------- Topbar ---------------- */

  .topbar {
    position: sticky;
    top: 0;
    z-index: 45;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 11px 16px;
    background: linear-gradient(180deg, rgba(5, 8, 10, .97), rgba(5, 8, 10, .72));
    backdrop-filter: blur(18px);
    border-bottom: 1px solid rgba(27, 42, 50, .7);
  }

  .brand { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .brand-mark { position: relative; width: 36px; height: 36px; flex: 0 0 auto; }
  .brand-logo {
    width: 36px; height: 36px;
    object-fit: contain;
    border-radius: 11px;
    filter: drop-shadow(0 8px 20px rgba(34, 211, 238, .38));
  }
  .brand-fallback {
    position: absolute; inset: 0;
    display: none;
    place-items: center;
    border-radius: 11px;
    color: var(--accent);
    background: radial-gradient(circle at 30% 20%, rgba(34,211,238,.28), rgba(5,8,10,.9));
    border: 1px solid var(--accent-line);
  }
  .brand-fallback svg { width: 24px; height: 24px; }

  .brand-text { min-width: 0; }
  .brand-name {
    display: block;
    font-weight: 800;
    font-size: 1.02rem;
    letter-spacing: -.5px;
    line-height: 1.15;
  }
  .brand-name b { color: var(--accent); }
  .brand-tag {
    display: block;
    font-size: .6rem;
    letter-spacing: 1.6px;
    text-transform: uppercase;
    color: var(--dim);
    font-weight: 600;
    margin-top: 1px;
  }

  .icon-btn {
    display: grid; place-items: center;
    width: 42px; height: 42px;
    flex: 0 0 auto;
    border-radius: 50%;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    transition: border-color .18s, color .18s, background .18s;
  }
  .icon-btn:hover { border-color: var(--accent-line); color: var(--accent); }
  .icon-btn.liked { color: var(--accent); border-color: var(--accent-line); background: var(--accent-soft); }

  /* ---------------- Main ---------------- */

  .main {
    position: relative;
    z-index: 1;
    max-width: 1040px;
    margin: 0 auto;
    padding: 18px 16px calc(var(--nav-h) + 170px + env(safe-area-inset-bottom));
  }

  .view { animation: fade .3s ease both; }
  @keyframes fade {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: none; }
  }

  .h1 {
    font-size: clamp(1.45rem, 5vw, 2.05rem);
    font-weight: 800;
    letter-spacing: -1px;
    line-height: 1.15;
  }
  .h1 em { font-style: normal; color: var(--accent); }
  .eyebrow {
    font-size: .67rem;
    letter-spacing: 1.9px;
    text-transform: uppercase;
    font-weight: 700;
    color: var(--dim);
    margin-bottom: 8px;
  }
  .para { color: var(--muted); font-size: .82rem; line-height: 1.65; margin-top: 8px; }

  /* ---------------- Shelves ---------------- */

  .shelf { margin-top: 26px; }
  .shelf-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;
  }
  .shelf-title { font-size: 1rem; font-weight: 700; letter-spacing: -.3px; }
  .shelf-action { font-size: .74rem; font-weight: 700; color: var(--accent); padding: 4px 8px; border-radius: 8px; }
  .shelf-action:hover { background: var(--accent-soft); }

  .rail {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding: 2px 2px 8px;
    scroll-snap-type: x proximity;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  .rail::-webkit-scrollbar { height: 0; }

  .card {
    flex: 0 0 auto;
    width: 132px;
    text-align: left;
    scroll-snap-align: start;
  }
  .card-art {
    position: relative;
    width: 132px; height: 132px;
    border-radius: 14px;
    overflow: hidden;
    background: var(--surface-2);
    border: 1px solid var(--border);
  }
  .card-art.round { border-radius: 50%; }
  .card-art img {
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform .45s cubic-bezier(.2,.8,.3,1);
  }
  .card:hover .card-art img { transform: scale(1.07); }
  .card-title {
    margin-top: 9px;
    font-size: .81rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .card-sub {
    margin-top: 3px;
    font-size: .72rem;
    color: var(--dim);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ---------------- Rows ---------------- */

  .rows { display: flex; flex-direction: column; gap: 2px; }

  .row {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 8px;
    border-radius: 12px;
    text-align: left;
    transition: background .16s ease;
  }
  .row:hover { background: var(--surface); }
  .row.active { background: var(--accent-soft); }
  .row.active .row-title { color: var(--accent); }

  .row-index {
    width: 18px;
    flex: 0 0 auto;
    text-align: center;
    font-size: .74rem;
    color: var(--dim);
    font-variant-numeric: tabular-nums;
  }
  .row-art {
    width: 46px; height: 46px;
    flex: 0 0 auto;
    border-radius: 9px;
    object-fit: cover;
    background: var(--surface-2);
  }
  .row-info { flex: 1; min-width: 0; }
  .row-title {
    font-size: .86rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .row-sub {
    margin-top: 3px;
    font-size: .74rem;
    color: var(--muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .row-dur {
    flex: 0 0 auto;
    font-size: .72rem;
    color: var(--dim);
    font-variant-numeric: tabular-nums;
  }

  /* ---------------- Search ---------------- */

  .search-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 15px;
    border: 1px solid var(--border);
    border-radius: 14px;
    background: var(--surface);
    transition: border-color .18s;
  }
  .search-bar:focus-within { border-color: var(--accent-line); }
  .search-bar .ic { color: var(--dim); width: 19px; height: 19px; }
  .search-bar input {
    flex: 1;
    min-width: 0;
    background: none;
    border: 0;
    outline: none;
    color: var(--text);
    font-size: .92rem;
  }
  .search-bar input::placeholder { color: var(--dim); }

  .chips { display: flex; gap: 8px; overflow-x: auto; margin: 14px 0 10px; scrollbar-width: none; }
  .chips::-webkit-scrollbar { height: 0; }
  .chip {
    flex: 0 0 auto;
    padding: 8px 16px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--muted);
    font-size: .77rem;
    font-weight: 600;
    transition: .18s ease;
  }
  .chip.active { color: var(--accent-ink); background: var(--accent); border-color: var(--accent); }

  /* ---------------- Detail ---------------- */

  .detail-head { display: flex; gap: 16px; align-items: flex-end; margin-bottom: 22px; }
  .detail-art {
    width: 122px; height: 122px;
    flex: 0 0 auto;
    border-radius: 16px;
    object-fit: cover;
    background: var(--surface-2);
    box-shadow: 0 22px 48px rgba(0, 0, 0, .62);
  }
  .detail-meta { min-width: 0; padding-bottom: 2px; }
  .detail-title {
    font-size: clamp(1.2rem, 5.2vw, 1.85rem);
    font-weight: 800;
    letter-spacing: -.9px;
    line-height: 1.14;
  }
  .detail-sub { margin-top: 8px; font-size: .8rem; color: var(--muted); line-height: 1.5; }
  .detail-actions { display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap; }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 11px 20px;
    border-radius: 999px;
    background: var(--accent);
    color: var(--accent-ink);
    font-size: .83rem;
    font-weight: 700;
    transition: filter .18s, background .18s;
  }
  .btn:hover { filter: brightness(1.08); }
  .btn .ic { width: 16px; height: 16px; }
  .btn-ghost {
    background: var(--surface-2);
    color: var(--text);
    border: 1px solid var(--border);
  }
  .btn-ghost:hover { border-color: var(--border-2); }

  /* ---------------- Footer nav ---------------- */

  .bottom-nav {
    position: fixed;
    z-index: 60;
    left: 0; right: 0; bottom: 0;
    height: calc(var(--nav-h) + env(safe-area-inset-bottom));
    padding-bottom: env(safe-area-inset-bottom);
    background: rgba(6, 11, 14, .94);
    backdrop-filter: blur(22px);
    border-top: 1px solid var(--border);
  }
  .bottom-nav-inner {
    width: min(560px, 100%);
    height: 100%;
    margin: 0 auto;
    display: flex;
  }
  .nav-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: var(--dim);
    font-size: .63rem;
    font-weight: 600;
    letter-spacing: .2px;
    transition: color .18s;
  }
  .nav-item .ic { width: 22px; height: 22px; }
  .nav-item:hover { color: var(--muted); }
  .nav-item.active { color: var(--accent); }
  .nav-item.active .ic { filter: drop-shadow(0 0 9px rgba(34, 211, 238, .5)); }

  /* ---------------- Mini player ---------------- */

  .mini-wrap {
    position: fixed;
    z-index: 61;
    left: 0; right: 0;
    bottom: calc(var(--nav-h) + env(safe-area-inset-bottom));
    display: flex;
    justify-content: center;
    padding: 0 10px 10px;
    pointer-events: none;
  }

  .mini {
    pointer-events: auto;
    position: relative;
    width: 100%;
    max-width: 720px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px;
    border: 1px solid var(--border-2);
    border-radius: 16px;
    background: rgba(13, 21, 26, .96);
    backdrop-filter: blur(24px);
    box-shadow: 0 18px 42px rgba(0, 0, 0, .6);
    overflow: hidden;
    animation: rise .3s cubic-bezier(.2,.9,.3,1) both;
  }
  @keyframes rise {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: none; }
  }

  .mini-main {
    display: flex;
    align-items: center;
    gap: 11px;
    flex: 1;
    min-width: 0;
    text-align: left;
    border-radius: 11px;
    padding: 2px;
  }
  .mini-art {
    width: 44px; height: 44px;
    flex: 0 0 auto;
    border-radius: 10px;
    object-fit: cover;
    background: var(--surface-2);
  }
  .mini-text { min-width: 0; flex: 1; }
  .mini-title {
    display: block;
    font-size: .81rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .mini-artist {
    display: block;
    margin-top: 3px;
    font-size: .7rem;
    color: var(--muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .mini-btn {
    display: grid;
    place-items: center;
    width: 38px; height: 38px;
    flex: 0 0 auto;
    border-radius: 50%;
    color: var(--text);
    transition: background .18s;
  }
  .mini-btn:hover { background: var(--surface-3); }
  .mini-btn .ic { width: 18px; height: 18px; }
  .mini-btn.play { width: 40px; height: 40px; background: var(--accent); color: var(--accent-ink); }
  .mini-btn.play .ic { width: 17px; height: 17px; }
  .mini-btn.play:hover { filter: brightness(1.08); }

  .mini-progress {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: 2px;
    background: rgba(255, 255, 255, .07);
  }
  .mini-progress i {
    display: block;
    height: 100%;
    width: 0;
    background: var(--accent);
    transition: width .3s linear;
  }

  /* ---------------- Expanded player ---------------- */

  .sheet {
    position: fixed;
    inset: 0;
    z-index: 120;
    display: flex;
    background: #05080a;
    animation: slideUp .34s cubic-bezier(.22,.9,.3,1) both;
  }
  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: none; }
  }

  .sheet-bg {
    position: absolute;
    inset: -12%;
    width: 124%;
    height: 124%;
    object-fit: cover;
    filter: blur(66px) saturate(1.5);
    opacity: .45;
    pointer-events: none;
  }
  .sheet-shade {
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(5, 8, 10, .5) 0%, rgba(5, 8, 10, .9) 62%, rgba(5, 8, 10, .99) 100%);
    pointer-events: none;
  }

  .sheet-inner {
    position: relative;
    z-index: 2;
    margin: auto;
    width: min(470px, 100%);
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 14px 22px calc(28px + env(safe-area-inset-bottom));
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .sheet-top {
    position: sticky;
    top: 0;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 2px 0 10px;
    background: linear-gradient(180deg, rgba(5, 8, 10, .9), rgba(5, 8, 10, 0));
  }
  .sheet-label {
    font-size: .66rem;
    letter-spacing: 1.8px;
    text-transform: uppercase;
    font-weight: 700;
    color: var(--muted);
  }

  .sheet-art { display: grid; place-items: center; padding: 18px 0 6px; }
  .sheet-art img {
    width: min(74vw, 42vh, 320px);
    height: min(74vw, 42vh, 320px);
    object-fit: cover;
    border-radius: 20px;
    box-shadow: 0 34px 70px rgba(0, 0, 0, .7);
    background: var(--surface-2);
  }

  .sheet-meta { display: flex; align-items: flex-start; gap: 12px; margin-top: 20px; }
  .sheet-meta-text { flex: 1; min-width: 0; }
  .sheet-title {
    font-size: 1.22rem;
    font-weight: 800;
    letter-spacing: -.6px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .sheet-artist {
    margin-top: 6px;
    font-size: .85rem;
    color: var(--muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .sheet-progress { margin-top: 20px; }
  .bar {
    height: 5px;
    border-radius: 999px;
    background: rgba(255, 255, 255, .12);
    overflow: hidden;
    cursor: pointer;
  }
  .bar i {
    display: block;
    height: 100%;
    width: 0;
    border-radius: inherit;
    background: var(--accent);
    transition: width .25s linear;
  }
  .times {
    display: flex;
    justify-content: space-between;
    margin-top: 8px;
    font-size: .69rem;
    color: var(--dim);
    font-variant-numeric: tabular-nums;
  }

  .sheet-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    margin-top: 18px;
  }
  .sheet-btn {
    display: grid;
    place-items: center;
    width: 50px; height: 50px;
    border-radius: 50%;
    color: var(--text);
    transition: background .18s;
  }
  .sheet-btn:hover { background: rgba(255, 255, 255, .07); }
  .sheet-btn .ic { width: 25px; height: 25px; }
  .sheet-btn.play {
    width: 68px; height: 68px;
    background: var(--accent);
    color: var(--accent-ink);
    box-shadow: 0 14px 34px rgba(34, 211, 238, .35);
  }
  .sheet-btn.play .ic { width: 29px; height: 29px; }
  .sheet-btn.play:hover { filter: brightness(1.08); background: var(--accent); }

  .sheet-volume { display: flex; align-items: center; gap: 12px; margin-top: 20px; color: var(--dim); }
  .sheet-volume input { flex: 1; accent-color: var(--accent); height: 4px; }

  /* ---------------- Lyrics (expanded player only) ---------------- */

  .lyrics-block {
    margin-top: 22px;
    padding-top: 18px;
    border-top: 1px solid rgba(255, 255, 255, .08);
  }
  .lyrics-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
  }
  .lyrics-title {
    font-size: .68rem;
    letter-spacing: 1.8px;
    text-transform: uppercase;
    font-weight: 700;
    color: var(--accent);
  }
  .lyrics-state { font-size: .66rem; color: var(--dim); text-align: right; }

  .lyrics-body {
    max-height: 260px;
    overflow-y: auto;
    padding-right: 6px;
    font-size: .87rem;
    line-height: 1.85;
    color: #cfe9ee;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    scrollbar-width: thin;
  }
  .lyrics-body::-webkit-scrollbar { width: 4px; }
  .lyrics-body::-webkit-scrollbar-thumb { background: var(--surface-3); border-radius: 999px; }
  .lyrics-body.loading-lyrics { color: var(--accent); }
  .lyrics-body.empty-lyrics { color: var(--muted); }

  /* ---------------- Misc ---------------- */

  .empty, .loading {
    padding: 26px 12px;
    text-align: center;
    font-size: .82rem;
    color: var(--muted);
    border: 1px dashed var(--border);
    border-radius: 14px;
    background: rgba(11, 18, 22, .5);
  }
  .loading { color: var(--accent); border-color: var(--accent-line); }

  .toast {
    position: fixed;
    z-index: 300;
    left: 50%;
    bottom: calc(var(--nav-h) + 96px + env(safe-area-inset-bottom));
    transform: translate(-50%, 14px);
    max-width: min(400px, 88vw);
    padding: 11px 18px;
    border-radius: 999px;
    border: 1px solid var(--border-2);
    background: rgba(13, 21, 26, .97);
    backdrop-filter: blur(18px);
    color: var(--text);
    font-size: .78rem;
    text-align: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity .22s, transform .22s;
  }
  .toast.show { opacity: 1; transform: translate(-50%, 0); }

  #ytplayer {
    position: fixed;
    width: 1px; height: 1px;
    right: -10px; bottom: -10px;
    opacity: .01;
    pointer-events: none;
    overflow: hidden;
  }

  .profile-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 18px;
    border: 1px solid var(--border);
    border-radius: 18px;
    background: linear-gradient(150deg, rgba(34, 211, 238, .12), rgba(11, 18, 22, .7));
  }
  .avatar {
    width: 62px; height: 62px;
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: var(--accent);
    color: var(--accent-ink);
    font-size: 1.5rem;
    font-weight: 800;
    box-shadow: 0 12px 30px rgba(34, 211, 238, .3);
  }
  .profile-name { font-size: 1.1rem; font-weight: 800; letter-spacing: -.4px; }
  .profile-sub { margin-top: 5px; font-size: .78rem; color: var(--muted); }

  .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 16px; }
  .stat {
    padding: 16px;
    border: 1px solid var(--border);
    border-radius: 16px;
    background: var(--surface);
  }
  .stat b { display: block; font-size: 1.4rem; font-weight: 800; color: var(--accent); letter-spacing: -1px; }
  .stat span { display: block; margin-top: 4px; font-size: .74rem; color: var(--muted); }

  /* ---------------- Desktop ---------------- */

  @media (min-width: 900px) {
    .main { padding: 30px 32px calc(var(--nav-h) + 180px + env(safe-area-inset-bottom)); }
    .card, .card-art { width: 152px; }
    .card-art { height: 152px; }
    .detail-art { width: 168px; height: 168px; }

    .sheet {
      background: rgba(3, 6, 8, .72);
      backdrop-filter: blur(14px);
      align-items: center;
    }
    .sheet-inner {
      width: min(540px, 92vw);
      height: auto;
      max-height: 92vh;
      margin: auto;
      padding: 20px 28px 30px;
      border: 1px solid var(--border-2);
      border-radius: 26px;
      background: rgba(8, 13, 17, .94);
      box-shadow: 0 40px 90px rgba(0, 0, 0, .7);
    }
    .sheet-art img { width: min(320px, 36vh); height: min(320px, 36vh); }
    .lyrics-body { max-height: 300px; }
  }

  @media (max-width: 380px) {
    .card, .card-art { width: 114px; }
    .card-art { height: 114px; }
    .detail-art { width: 96px; height: 96px; }
  }

  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: .01ms !important; transition-duration: .01ms !important; }
  }
</style>
</head>

<body>
  <div class="glow"></div>

  <!-- SVG icon sprite -->
  <svg class="sprite" aria-hidden="true" focusable="false">
    <symbol id="i-home" viewBox="0 0 24 24">
      <path d="M3.2 10.4 12 3.2l8.8 7.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M5.4 9.6V20a.9.9 0 0 0 .9.9h3.6V15h4.2v5.9h3.6a.9.9 0 0 0 .9-.9V9.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </symbol>
    <symbol id="i-search" viewBox="0 0 24 24">
      <circle cx="10.8" cy="10.8" r="6.8" fill="none" stroke="currentColor" stroke-width="1.8"/>
      <path d="m20.2 20.2-4.4-4.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </symbol>
    <symbol id="i-library" viewBox="0 0 24 24">
      <rect x="3.4" y="4" width="3.4" height="16" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.8"/>
      <rect x="9.4" y="4" width="3.4" height="16" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.8"/>
      <path d="m16.4 5.4 3.6-1v15.2l-3.6-1z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
    </symbol>
    <symbol id="i-user" viewBox="0 0 24 24">
      <circle cx="12" cy="8.2" r="3.9" fill="none" stroke="currentColor" stroke-width="1.8"/>
      <path d="M4.4 20.6c.9-3.9 3.9-6.1 7.6-6.1s6.7 2.2 7.6 6.1" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </symbol>
    <symbol id="i-play" viewBox="0 0 24 24">
      <path d="M8 5.4v13.2L19 12z" fill="currentColor"/>
    </symbol>
    <symbol id="i-pause" viewBox="0 0 24 24">
      <rect x="7" y="5" width="3.5" height="14" rx="1.2" fill="currentColor"/>
      <rect x="13.5" y="5" width="3.5" height="14" rx="1.2" fill="currentColor"/>
    </symbol>
    <symbol id="i-next" viewBox="0 0 24 24">
      <path d="M6.4 6.2v11.6L15.6 12z" fill="currentColor"/>
      <rect x="16.4" y="5" width="2.4" height="14" rx="1.2" fill="currentColor"/>
    </symbol>
    <symbol id="i-prev" viewBox="0 0 24 24">
      <path d="M17.6 6.2v11.6L8.4 12z" fill="currentColor"/>
      <rect x="5.2" y="5" width="2.4" height="14" rx="1.2" fill="currentColor"/>
    </symbol>
    <symbol id="i-down" viewBox="0 0 24 24">
      <path d="m6.5 9.5 5.5 5.5 5.5-5.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
    </symbol>
    <symbol id="i-back" viewBox="0 0 24 24">
      <path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>
    </symbol>
    <symbol id="i-heart" viewBox="0 0 24 24">
      <path d="M12 20.2S4.6 15.7 4.6 10.7A4.3 4.3 0 0 1 12 7.5a4.3 4.3 0 0 1 7.4 3.2c0 5-7.4 9.5-7.4 9.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
    </symbol>
    <symbol id="i-heart-fill" viewBox="0 0 24 24">
      <path d="M12 20.2S4.6 15.7 4.6 10.7A4.3 4.3 0 0 1 12 7.5a4.3 4.3 0 0 1 7.4 3.2c0 5-7.4 9.5-7.4 9.5z" fill="currentColor"/>
    </symbol>
    <symbol id="i-volume" viewBox="0 0 24 24">
      <path d="M4 9.4h3.4L12 5.6v12.8L7.4 14.6H4z" fill="currentColor"/>
      <path d="M15.6 9.2a3.9 3.9 0 0 1 0 5.6M18.2 6.6a7.6 7.6 0 0 1 0 10.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </symbol>
    <symbol id="i-logo" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" stroke-width="2.4" opacity=".38"/>
      <path d="M15 17.5 24 32l9-14.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="24" cy="12.6" r="2.6" fill="currentColor"/>
    </symbol>
  </svg>

  <!-- Topbar: logo left, search right -->
  <header class="topbar">
    <div class="brand">
      <span class="brand-mark">
        <img class="brand-logo" src="/assets/logo.png" alt="Musicoom"
             onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">
        <span class="brand-fallback"><svg viewBox="0 0 48 48"><use href="#i-logo"></use></svg></span>
      </span>
      <span class="brand-text">
        <span class="brand-name">Musicoom<b>.</b></span>
        <span class="brand-tag">Music for All</span>
      </span>
    </div>
    <button class="icon-btn" id="topSearch" type="button" aria-label="Search">
      <svg class="ic"><use href="#i-search"></use></svg>
    </button>
  </header>

  <main class="main">
    <!-- HOME -->
    <section id="homeView" class="view">
      <p class="eyebrow">Music for All · India</p>
      <h1 class="h1">Good vibes,<br><em>India</em></h1>
      <p class="para">Trending tracks, top artists and albums — all in one column, just scroll.</p>

      <section class="shelf">
        <div class="shelf-head">
          <h2 class="shelf-title">Trending now</h2>
          <button class="shelf-action" id="trendingAll" type="button">See all</button>
        </div>
        <div class="rail" id="trendingRail">
          <div class="loading" style="width:100%">Loading trending…</div>
        </div>
      </section>

      <section class="shelf">
        <div class="shelf-head">
          <h2 class="shelf-title">Top artists</h2>
        </div>
        <div class="rail" id="artistRail">
          <div class="loading" style="width:100%">Loading artists…</div>
        </div>
      </section>

      <section class="shelf">
        <div class="shelf-head">
          <h2 class="shelf-title">Albums for you</h2>
        </div>
        <div class="rail" id="albumRail">
          <div class="loading" style="width:100%">Loading albums…</div>
        </div>
      </section>
    </section>

    <!-- SEARCH -->
    <section id="searchView" class="view" hidden>
      <h1 class="h1" style="margin-bottom:14px">Search</h1>
      <div class="search-bar">
        <svg class="ic"><use href="#i-search"></use></svg>
        <input id="searchInput" type="search" placeholder="Songs, artists, albums…" autocomplete="off" aria-label="Search music">
      </div>
      <div class="chips" id="chips">
        <button class="chip active" data-filter="" type="button">All</button>
        <button class="chip" data-filter="songs" type="button">Songs</button>
        <button class="chip" data-filter="albums" type="button">Albums</button>
        <button class="chip" data-filter="artists" type="button">Artists</button>
      </div>
      <div class="rows" id="searchResults">
        <div class="empty">Search for songs, artists or albums.</div>
      </div>
    </section>

    <!-- LIBRARY -->
    <section id="libraryView" class="view" hidden></section>

    <!-- PROFILE -->
    <section id="profileView" class="view" hidden>
      <p class="eyebrow">Account</p>
      <div class="profile-card">
        <div class="avatar">M</div>
        <div>
          <div class="profile-name">Musicoom Listener</div>
          <div class="profile-sub">India · Music for All</div>
        </div>
      </div>

      <div class="stat-grid">
        <div class="stat"><b id="statRecent">0</b><span>Recently played</span></div>
        <div class="stat"><b id="statLiked">0</b><span>Liked songs</span></div>
      </div>

      <section class="shelf">
        <div class="shelf-head"><h2 class="shelf-title">About this build</h2></div>
        <p class="para">
          Musicoom streams audio through YouTube's embedded player and pulls metadata from the
          Musicoom music API. Trending, charts and top artists are tuned to the India region,
          and lyrics load in the expanded player whenever the lyrics endpoint has them.
        </p>
      </section>

      <div style="margin-top:20px;display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-ghost" id="clearData" type="button">Clear local data</button>
        <button class="btn" id="goHomeBtn" type="button">Back to Home</button>
      </div>
    </section>

    <!-- DETAIL -->
    <section id="detailView" class="view" hidden></section>
  </main>

  <!-- Mini player (sits directly above the footer nav) -->
  <div class="mini-wrap">
    <div class="mini" id="mini" hidden>
      <button class="mini-main" id="miniOpen" type="button" aria-label="Open player">
        <img class="mini-art" id="miniArt" alt="">
        <span class="mini-text">
          <span class="mini-title" id="miniTitle"></span>
          <span class="mini-artist" id="miniArtist"></span>
        </span>
      </button>
      <button class="mini-btn play" id="miniPlay" type="button" aria-label="Play or pause">
        <svg class="ic"><use href="#i-play"></use></svg>
      </button>
      <button class="mini-btn" id="miniNext" type="button" aria-label="Next track">
        <svg class="ic"><use href="#i-next"></use></svg>
      </button>
      <span class="mini-progress"><i id="miniFill"></i></span>
    </div>
  </div>

  <!-- Footer nav -->
  <nav class="bottom-nav" aria-label="Main navigation">
    <div class="bottom-nav-inner">
      <button class="nav-item active" data-view="home" type="button">
        <svg class="ic"><use href="#i-home"></use></svg><span>Home</span>
      </button>
      <button class="nav-item" data-view="search" type="button">
        <svg class="ic"><use href="#i-search"></use></svg><span>Search</span>
      </button>
      <button class="nav-item" data-view="library" type="button">
        <svg class="ic"><use href="#i-library"></use></svg><span>Your Library</span>
      </button>
      <button class="nav-item" data-view="profile" type="button">
        <svg class="ic"><use href="#i-user"></use></svg><span>Profile</span>
      </button>
    </div>
  </nav>

  <!-- Expanded player with lyrics -->
  <div class="sheet" id="sheet" hidden>
    <img class="sheet-bg" id="sheetBg" alt="">
    <div class="sheet-shade"></div>
    <div class="sheet-inner">
      <div class="sheet-top">
        <button class="icon-btn" id="sheetClose" type="button" aria-label="Close player">
          <svg class="ic"><use href="#i-down"></use></svg>
        </button>
        <span class="sheet-label">Now playing</span>
        <button class="icon-btn" id="likeBtn" type="button" aria-label="Like song">
          <svg class="ic"><use href="#i-heart"></use></svg>
        </button>
      </div>

      <div class="sheet-art">
        <img id="sheetArt" alt="">
      </div>

      <div class="sheet-meta">
        <div class="sheet-meta-text">
          <div class="sheet-title" id="sheetTitle">Nothing playing</div>
          <div class="sheet-artist" id="sheetArtist">Pick a track to start</div>
        </div>
      </div>

      <div class="sheet-progress">
        <div class="bar" id="sheetBar"><i id="sheetFill"></i></div>
        <div class="times">
          <span id="sheetCur">0:00</span>
          <span id="sheetDur">0:00</span>
        </div>
      </div>

      <div class="sheet-controls">
        <button class="sheet-btn" id="sheetPrev" type="button" aria-label="Previous track">
          <svg class="ic"><use href="#i-prev"></use></svg>
        </button>
        <button class="sheet-btn play" id="sheetPlay" type="button" aria-label="Play or pause">
          <svg class="ic"><use href="#i-play"></use></svg>
        </button>
        <button class="sheet-btn" id="sheetNext" type="button" aria-label="Next track">
          <svg class="ic"><use href="#i-next"></use></svg>
        </button>
      </div>

      <div class="sheet-volume">
        <svg class="ic" style="width:18px;height:18px"><use href="#i-volume"></use></svg>
        <input type="range" id="vol" min="0" max="100" value="85" aria-label="Volume">
      </div>

      <div class="lyrics-block">
        <div class="lyrics-head">
          <span class="lyrics-title">Lyrics</span>
          <span class="lyrics-state" id="lyricsState"></span>
        </div>
        <div class="lyrics-body" id="lyricsBody">Select a track to see lyrics.</div>
      </div>
    </div>
  </div>

  <div class="toast" id="toast" role="status" aria-live="polite"></div>
  <div id="ytplayer"></div>

<script>
(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /*  Constants & state                                                 */
  /* ------------------------------------------------------------------ */

  var REGION = 'IND';               // discovery region code
  var LYRICS_ATTEMPTS = 3;          // retries before giving up

  var LS_RECENT = 'musicoom.recent.v1';
  var LS_LIKED = 'musicoom.liked.v1';

  var state = {
    view: 'home',
    baseView: 'home',
    queue: [],
    queueIndex: -1,
    current: null,
    playing: false,
    pendingPlay: null,
    searchFilter: '',
    trending: [],
    lyrics: '',
    lyricsState: 'idle'            // idle | loading | ready | none
  };

  var yt = null;
  var ytReady = false;
  var progressTimer = null;
  var searchSeq = 0;
  var searchTimer = null;
  var toastTimer = null;
  var volume = 85;
  var relatedKey = '';
  var relatedPromise = null;

  var lyricsToken = 0;
  var lyricsCache = {};

  /* ------------------------------------------------------------------ */
  /*  Tiny helpers                                                      */
  /* ------------------------------------------------------------------ */

  function byId(id) { return document.getElementById(id); }

  function esc(value) {
    var node = document.createElement('span');
    node.textContent = value == null ? '' : String(value);
    return node.innerHTML;
  }

  function fmt(seconds) {
    var total = Math.max(0, Math.floor(Number(seconds) || 0));
    var m = Math.floor(total / 60);
    var s = total % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function sleep(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function toast(message) {
    var node = byId('toast');
    if (!node) return;
    node.textContent = message;
    node.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { node.classList.remove('show'); }, 2600);
  }

  function capitalize(text) {
    text = String(text || '');
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
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
      throw new Error(message || ('HTTP ' + response.status));
    }
    return data;
  }

  /* ------------------------------------------------------------------ */
  /*  Local storage                                                     */
  /* ------------------------------------------------------------------ */

  function readStore(key) {
    try {
      var raw = localStorage.getItem(key);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function writeStore(key, list) {
    try { localStorage.setItem(key, JSON.stringify(list.slice(0, 80))); } catch (e) {}
  }

  function slim(track) {
    return {
      videoId: track.videoId,
      title: track.title,
      artist: track.artist,
      thumbnail: track.thumbnail,
      duration: track.duration,
      browseId: track.browseId,
      resultType: track.resultType
    };
  }

  function addRecent(track) {
    if (!track || !track.videoId) return;
    var list = readStore(LS_RECENT).filter(function (item) {
      return item.videoId !== track.videoId;
    });
    list.unshift(slim(track));
    writeStore(LS_RECENT, list);
  }

  function isLiked(videoId) {
    if (!videoId) return false;
    return readStore(LS_LIKED).some(function (item) { return item.videoId === videoId; });
  }

  function toggleLike() {
    var track = state.current;
    if (!track) return;
    var list = readStore(LS_LIKED);
    var index = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].videoId === track.videoId) { index = i; break; }
    }
    if (index >= 0) {
      list.splice(index, 1);
      toast('Removed from Liked songs');
    } else {
      list.unshift(slim(track));
      toast('Added to Liked songs');
    }
    writeStore(LS_LIKED, list);
    syncLiked();
  }

  function syncLiked() {
    var button = byId('likeBtn');
    if (!button) return;
    var liked = state.current && isLiked(state.current.videoId);
    button.innerHTML = '<svg class="ic"><use href="#' +
      (liked ? 'i-heart-fill' : 'i-heart') + '"></use></svg>';
    button.classList.toggle('liked', !!liked);
  }

  /* ------------------------------------------------------------------ */
  /*  Artwork (high quality, no blurry thumbs)                          */
  /* ------------------------------------------------------------------ */

  function ytThumb(videoId, big) {
    return 'https://img.youtube.com/vi/' + encodeURIComponent(videoId) +
      '/' + (big ? 'maxresdefault' : 'mqdefault') + '.jpg';
  }

  function upscale(url, size) {
    if (!url || typeof url !== 'string') return '';
    if (url.indexOf('googleusercontent') === -1 &&
        url.indexOf('ggpht') === -1 &&
        url.indexOf('ytimg') === -1) {
      return url;
    }
    return url
      .replace(/=w\\d+-h\\d+/, '=w' + size + '-h' + size)
      .replace(/=s\\d+/, '=s' + size);
  }

  function artSrc(track, big) {
    if (!track) return '';
    var size = big ? 720 : 240;
    var url = track.thumbnail ? upscale(track.thumbnail, size) : '';
    if (!url && track.videoId) url = ytThumb(track.videoId, big);
    return url || '';
  }

  function setImage(img, track, big) {
    if (!img) return;
    var src = artSrc(track, big);
    img.style.visibility = 'visible';
    img.src = src;
    img.onerror = function () {
      var id = track && track.videoId;
      if (!id) { img.onerror = null; img.style.visibility = 'hidden'; return; }
      if (img.src.indexOf('maxresdefault') !== -1) {
        img.src = 'https://img.youtube.com/vi/' + encodeURIComponent(id) + '/hqdefault.jpg';
        return;
      }
      if (img.src.indexOf('hqdefault') !== -1) {
        img.src = 'https://img.youtube.com/vi/' + encodeURIComponent(id) + '/mqdefault.jpg';
        return;
      }
      img.onerror = null;
      img.style.visibility = 'hidden';
    };
  }

  /* ------------------------------------------------------------------ */
  /*  Response normalisation                                            */
  /* ------------------------------------------------------------------ */

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
      if (last && typeof last === 'object') return last.url || last.src || '';
      if (typeof last === 'string') return last;
      return '';
    }
    if (typeof thumbs === 'string') return thumbs;
    if (thumbs && typeof thumbs === 'object') return thumbs.url || thumbs.src || '';
    return item.thumbnailUrl || item.image || '';
  }

  function normalizeTrack(item) {
    var id = getVideoId(item);
    var title = (item && (item.title || item.name)) || 'Unknown track';
    var artist = getArtist(item);
    return {
      raw: item || {},
      videoId: id,
      title: String(title),
      artist: String(artist || 'Unknown artist'),
      thumbnail: getThumb(item),
      duration: (item && (item.duration || item.durationText || item.length)) || '',
      resultType: (item && (item.resultType || item.type || item.category)) || 'song',
      browseId: getBrowseId(item)
    };
  }

  function extractItems(data) {
    if (Array.isArray(data)) return data;
    if (!data || typeof data !== 'object') return [];

    var keys = ['results', 'tracks', 'songs', 'items', 'data', 'audios', 'videos'];
    for (var i = 0; i < keys.length; i++) {
      var value = data[keys[i]];
      if (Array.isArray(value)) return value;
      if (value && Array.isArray(value.results)) return value.results;
      if (value && Array.isArray(value.tracks)) return value.tracks;
      if (value && Array.isArray(value.items)) return value.items;
    }

    if (data.album && Array.isArray(data.album.tracks)) return data.album.tracks;
    if (data.artist && Array.isArray(data.artist.songs)) return data.artist.songs;
    if (data.playlist && Array.isArray(data.playlist.tracks)) return data.playlist.tracks;
    return [];
  }

  function isAlbum(track) {
    var type = String(track.resultType || '').toLowerCase();
    return type.indexOf('album') !== -1 || String(track.browseId || '').indexOf('MPRE') === 0;
  }

  /* ------------------------------------------------------------------ */
  /*  View routing (footer nav)                                         */
  /* ------------------------------------------------------------------ */

  var VIEWS = ['home', 'search', 'library', 'profile', 'detail'];

  function setActiveNav(view) {
    var nodes = document.querySelectorAll('[data-view]');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].classList.toggle('active', nodes[i].getAttribute('data-view') === view);
    }
  }

  function showView(name) {
    state.view = name;
    VIEWS.forEach(function (view) {
      var node = byId(view + 'View');
      if (node) node.hidden = view !== name;
    });
    if (name !== 'detail') setActiveNav(name);
    if (name === 'library') renderLibrary();
    if (name === 'profile') renderProfile();
    window.scrollTo(0, 0);
  }

  function goHome() { showView('home'); }

  function goSearch() {
    showView('search');
    setTimeout(function () {
      var input = byId('searchInput');
      if (input) input.focus();
    }, 140);
  }

  function openDetailBase() {
    if (state.view !== 'detail') state.baseView = state.view;
  }

  function goBack() {
    showView(state.baseView || 'home');
  }

  /* ------------------------------------------------------------------ */
  /*  Card / row builders                                               */
  /* ------------------------------------------------------------------ */

  function buildCard(track, options) {
    options = options || {};

    var card = document.createElement('button');
    card.type = 'button';
    card.className = 'card';

    var artBox = document.createElement('div');
    artBox.className = 'card-art' + (options.round ? ' round' : '');

    var img = document.createElement('img');
    img.loading = 'lazy';
    img.alt = '';
    setImage(img, track, false);
    artBox.appendChild(img);

    var title = document.createElement('div');
    title.className = 'card-title';
    title.textContent = track.title;

    var sub = document.createElement('div');
    sub.className = 'card-sub';
    sub.textContent = options.sub || track.artist || '';

    card.appendChild(artBox);
    card.appendChild(title);
    card.appendChild(sub);

    if (typeof options.onClick === 'function') {
      card.addEventListener('click', options.onClick);
    }
    return card;
  }

  function buildRow(track, index, onClick) {
    var row = document.createElement('button');
    row.type = 'button';
    row.className = 'row';
    row.setAttribute('data-id', track.videoId || '');

    var num = document.createElement('span');
    num.className = 'row-index';
    num.textContent = String(index + 1);

    var art = document.createElement('img');
    art.className = 'row-art';
    art.loading = 'lazy';
    art.alt = '';
    setImage(art, track, false);

    var info = document.createElement('div');
    info.className = 'row-info';

    var title = document.createElement('div');
    title.className = 'row-title';
    title.textContent = track.title;

    var sub = document.createElement('div');
    sub.className = 'row-sub';
    sub.textContent = track.artist;

    info.appendChild(title);
    info.appendChild(sub);

    var dur = document.createElement('span');
    dur.className = 'row-dur';
    dur.textContent = track.duration || '';

    row.appendChild(num);
    row.appendChild(art);
    row.appendChild(info);
    row.appendChild(dur);
    row.addEventListener('click', onClick);
    return row;
  }

  function renderRows(container, list) {
    container.innerHTML = '';
    if (!list.length) {
      container.innerHTML = '<div class="empty">Nothing here yet.</div>';
      return;
    }
    list.forEach(function (track, index) {
      container.appendChild(buildRow(track, index, function () {
        playList(list, index);
      }));
    });
    syncActiveRows();
  }

  function syncActiveRows() {
    var id = state.current ? state.current.videoId : '';
    var rows = document.querySelectorAll('.row[data-id]');
    for (var i = 0; i < rows.length; i++) {
      rows[i].classList.toggle('active', !!id && rows[i].getAttribute('data-id') === id);
    }
  }

  function makeShelf(title, list, emptyText) {
    var section = document.createElement('section');
    section.className = 'shelf';

    var head = document.createElement('div');
    head.className = 'shelf-head';
    var heading = document.createElement('h2');
    heading.className = 'shelf-title';
    heading.textContent = title;
    head.appendChild(heading);
    section.appendChild(head);

    var body = document.createElement('div');
    body.className = 'rows';
    if (!list.length) {
      body.innerHTML = '<div class="empty">' + esc(emptyText) + '</div>';
    } else {
      renderRows(body, list);
    }
    section.appendChild(body);
    return section;
  }

  /* ------------------------------------------------------------------ */
  /*  Home — single column, every section scrolls horizontally          */
  /* ------------------------------------------------------------------ */

  async function loadTrending() {
    var rail = byId('trendingRail');
    try {
      var data = await fetchJson('/api/trending?country=' + REGION);
      var list = extractItems(data).map(normalizeTrack).filter(function (t) {
        return !!t.videoId;
      });
      if (!list.length) throw new Error('empty');

      state.trending = list;

      rail.innerHTML = '';
      list.slice(0, 20).forEach(function (track, index) {
        rail.appendChild(buildCard(track, {
          sub: track.artist,
          onClick: function () { playList(state.trending, index); }
        }));
      });
    } catch (e) {
      rail.innerHTML = '<div class="empty" style="width:100%">Trending is unavailable right now.</div>';
    }
  }

  async function loadArtists() {
    var rail = byId('artistRail');
    try {
      var data = await fetchJson('/api/top/artists?country=' + REGION);
      var list = extractItems(data).map(normalizeTrack).filter(function (t) {
        return !!t.browseId || !!t.videoId;
      });
      if (!list.length) throw new Error('empty');

      rail.innerHTML = '';
      list.slice(0, 16).forEach(function (artist) {
        rail.appendChild(buildCard(artist, {
          round: true,
          sub: 'Artist',
          onClick: function () { openArtist(artist.browseId, artist); }
        }));
      });
    } catch (e) {
      rail.innerHTML = '<div class="empty" style="width:100%">Top artists are unavailable right now.</div>';
    }
  }

  async function loadAlbums() {
    var rail = byId('albumRail');
    var list = [];

    try {
      var chart = await fetchJson('/api/charts?country=' + REGION);
      list = extractItems(chart).map(normalizeTrack).filter(isAlbum);
    } catch (e) { list = []; }

    if (!list.length) {
      try {
        var search = await fetchJson('/api/search?q=' + encodeURIComponent('top albums') + '&filter=albums');
        list = extractItems(search).map(normalizeTrack).filter(isAlbum);
      } catch (e) { list = []; }
    }

    if (!list.length) {
      rail.innerHTML = '<div class="empty" style="width:100%">Albums are unavailable right now.</div>';
      return;
    }

    rail.innerHTML = '';
    list.slice(0, 16).forEach(function (album) {
      rail.appendChild(buildCard(album, {
        sub: album.artist || 'Album',
        onClick: function () { openAlbum(album.browseId, album); }
      }));
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Detail views (album / artist / playlist)                          */
  /* ------------------------------------------------------------------ */

  function renderDetail(opts) {
    var root = byId('detailView');
    root.innerHTML = '';

    var back = document.createElement('button');
    back.type = 'button';
    back.className = 'btn btn-ghost';
    back.style.marginBottom = '18px';
    back.innerHTML = '<svg class="ic"><use href="#i-back"></use></svg> Back';
    back.addEventListener('click', goBack);
    root.appendChild(back);

    var head = document.createElement('div');
    head.className = 'detail-head';

    var art = document.createElement('img');
    art.className = 'detail-art';
    art.alt = '';
    art.src = opts.art || '';
    art.onerror = function () { art.style.visibility = 'hidden'; };
    head.appendChild(art);

    var meta = document.createElement('div');
    meta.className = 'detail-meta';

    var kind = document.createElement('div');
    kind.className = 'eyebrow';
    kind.textContent = opts.kind || '';

    var title = document.createElement('h1');
    title.className = 'detail-title';
    title.textContent = opts.title || '';

    var sub = document.createElement('div');
    sub.className = 'detail-sub';
    sub.textContent = opts.sub || '';

    meta.appendChild(kind);
    meta.appendChild(title);
    meta.appendChild(sub);

    if (opts.tracks && opts.tracks.length) {
      var actions = document.createElement('div');
      actions.className = 'detail-actions';

      var playAll = document.createElement('button');
      playAll.type = 'button';
      playAll.className = 'btn';
      playAll.innerHTML = '<svg class="ic"><use href="#i-play"></use></svg> Play all';
      playAll.addEventListener('click', function () {
        playList(opts.tracks, 0);
      });

      actions.appendChild(playAll);
      meta.appendChild(actions);
    }

    head.appendChild(meta);
    root.appendChild(head);

    var body = document.createElement('div');
    body.className = 'rows';
    root.appendChild(body);

    if (opts.tracks === null) {
      body.innerHTML = '<div class="loading">Loading…</div>';
      return;
    }
    if (!opts.tracks.length) {
      body.innerHTML = '<div class="empty">No playable tracks in this collection.</div>';
      return;
    }
    renderRows(body, opts.tracks);
  }

  async function openAlbum(browseId, meta) {
    if (!browseId) { toast('This album cannot be opened.'); return; }
    openDetailBase();
    showView('detail');
    renderDetail({
      kind: 'Album',
      title: (meta && meta.title) || 'Album',
      sub: (meta && meta.artist) || '',
      art: meta ? artSrc(meta, true) : '',
      tracks: null
    });

    try {
      var data = await fetchJson('/api/albums/' + encodeURIComponent(browseId));
      var album = data.album || data;
      var tracks = extractItems(data).map(normalizeTrack).filter(function (t) {
        return !!t.videoId;
      });

      var artist = getArtist(album) || (meta && meta.artist) || '';

      renderDetail({
        kind: 'Album',
        title: album.title || album.name || (meta && meta.title) || 'Album',
        sub: artist + (tracks.length ? ' · ' + tracks.length + ' tracks' : ''),
        art: getThumb(album) || (meta ? artSrc(meta, true) : ''),
        tracks: tracks
      });
    } catch (e) {
      toast('Could not load this album.');
    }
  }

  async function openArtist(browseId, meta) {
    if (!browseId) {
      if (meta && meta.videoId) { playList([meta], 0); return; }
      toast('This artist cannot be opened.');
      return;
    }
    openDetailBase();
    showView('detail');
    renderDetail({
      kind: 'Artist',
      title: (meta && meta.title) || 'Artist',
      sub: '',
      art: meta ? artSrc(meta, true) : '',
      tracks: null
    });

    try {
      var data = await fetchJson('/api/artists/' + encodeURIComponent(browseId));
      var artist = data.artist || data;

      var raw = extractItems(data);
      if (Array.isArray(data.topSongs)) raw = raw.concat(data.topSongs);
      if (Array.isArray(data.songs)) raw = raw.concat(data.songs);

      var seen = {};
      var tracks = raw.map(normalizeTrack).filter(function (t) {
        if (!t.videoId || seen[t.videoId]) return false;
        seen[t.videoId] = true;
        return true;
      });

      renderDetail({
        kind: 'Artist',
        title: artist.title || artist.name || (meta && meta.title) || 'Artist',
        sub: tracks.length ? tracks.length + ' popular tracks' : '',
        art: getThumb(artist) || (meta ? artSrc(meta, true) : ''),
        tracks: tracks
      });
    } catch (e) {
      toast('Could not load this artist.');
    }
  }

  async function openPlaylist(playlistId, meta) {
    if (!playlistId) { toast('This playlist cannot be opened.'); return; }
    openDetailBase();
    showView('detail');
    renderDetail({
      kind: 'Playlist',
      title: (meta && meta.title) || 'Playlist',
      sub: '',
      art: meta ? artSrc(meta, true) : '',
      tracks: null
    });

    try {
      var data = await fetchJson('/api/playlists/' + encodeURIComponent(playlistId));
      var playlist = data.playlist || data;
      var tracks = extractItems(data).map(normalizeTrack).filter(function (t) {
        return !!t.videoId;
      });

      renderDetail({
        kind: 'Playlist',
        title: playlist.title || playlist.name || (meta && meta.title) || 'Playlist',
        sub: tracks.length ? tracks.length + ' tracks' : '',
        art: getThumb(playlist) || (meta ? artSrc(meta, true) : ''),
        tracks: tracks
      });
    } catch (e) {
      toast('Could not load this playlist.');
    }
  }

  function openCollection(track) {
    var type = String(track.resultType || '').toLowerCase();
    var browseId = track.browseId || '';

    if (!browseId) {
      if (track.videoId) { playList([track], 0); return; }
      toast('This result cannot be opened.');
      return;
    }

    if (type.indexOf('album') !== -1 || browseId.indexOf('MPRE') === 0) {
      openAlbum(browseId, track);
    } else if (type.indexOf('artist') !== -1 || browseId.indexOf('UC') === 0) {
      openArtist(browseId, track);
    } else if (type.indexOf('playlist') !== -1 || browseId.indexOf('VL') === 0 ||
               browseId.indexOf('RD') === 0) {
      var id = browseId.indexOf('VL') === 0 ? browseId.slice(2) : browseId;
      openPlaylist(id, track);
    } else if (track.videoId) {
      playList([track], 0);
    } else {
      toast('This result cannot be opened.');
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Search                                                            */
  /* ------------------------------------------------------------------ */

  function renderSearchResults(items) {
    var box = byId('searchResults');
    box.innerHTML = '';

    if (!items.length) {
      box.innerHTML = '<div class="empty">No results found.</div>';
      return;
    }

    var playable = items.filter(function (item) { return !!item.videoId; });

    items.forEach(function (item) {
      var row = document.createElement('button');
      row.type = 'button';
      row.className = 'row';

      var art = document.createElement('img');
      art.className = 'row-art';
      art.loading = 'lazy';
      art.alt = '';
      setImage(art, item, false);

      var info = document.createElement('div');
      info.className = 'row-info';

      var title = document.createElement('div');
      title.className = 'row-title';
      title.textContent = item.title;

      var sub = document.createElement('div');
      sub.className = 'row-sub';
      sub.textContent = item.videoId
        ? item.artist
        : (capitalize(item.resultType) || 'Collection');

      info.appendChild(title);
      info.appendChild(sub);

      var dur = document.createElement('span');
      dur.className = 'row-dur';
      dur.textContent = item.duration || '';

      row.appendChild(art);
      row.appendChild(info);
      row.appendChild(dur);

      row.addEventListener('click', function () {
        if (item.videoId) {
          var index = playable.indexOf(item);
          playList(playable, index < 0 ? 0 : index);
        } else {
          openCollection(item);
        }
      });

      box.appendChild(row);
    });
  }

  async function runSearch() {
    var query = byId('searchInput').value.trim();
    var box = byId('searchResults');
    var seq = ++searchSeq;

    if (!query) {
      box.innerHTML = '<div class="empty">Search for songs, artists or albums.</div>';
      return;
    }

    box.innerHTML = '<div class="loading">Searching…</div>';

    try {
      var url = '/api/search?q=' + encodeURIComponent(query);
      if (state.searchFilter) url += '&filter=' + encodeURIComponent(state.searchFilter);

      var data = await fetchJson(url);
      if (seq !== searchSeq) return;

      var items = extractItems(data).map(normalizeTrack);
      renderSearchResults(items);
    } catch (e) {
      if (seq === searchSeq) {
        box.innerHTML = '<div class="empty">Search failed: ' + esc(e.message) + '</div>';
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Library & profile                                                 */
  /* ------------------------------------------------------------------ */

  function renderLibrary() {
    var root = byId('libraryView');
    root.innerHTML = '';

    var heading = document.createElement('h1');
    heading.className = 'h1';
    heading.textContent = 'Your Library';
    root.appendChild(heading);

    var note = document.createElement('p');
    note.className = 'para';
    note.textContent = 'Everything you played and loved, saved on this device.';
    root.appendChild(note);

    var liked = readStore(LS_LIKED).map(normalizeTrack);
    var recent = readStore(LS_RECENT).map(normalizeTrack);

    root.appendChild(makeShelf(
      'Liked songs',
      liked,
      'Nothing liked yet. Tap the heart while a song plays.'
    ));

    root.appendChild(makeShelf(
      'Recently played',
      recent,
      'Nothing played yet. Start with Trending on Home.'
    ));
  }

  function renderProfile() {
    var recentCount = readStore(LS_RECENT).length;
    var likedCount = readStore(LS_LIKED).length;
    var a = byId('statRecent');
    var b = byId('statLiked');
    if (a) a.textContent = String(recentCount);
    if (b) b.textContent = String(likedCount);
  }

  /* ------------------------------------------------------------------ */
  /*  Lyrics (expanded player only)                                     */
  /* ------------------------------------------------------------------ */

  function extractLyrics(data) {
    if (!data) return '';

    var candidates = [
      data.lyrics, data.plainLyrics, data.syncedLyrics,
      data.text, data.lrc, data.body, data.content
    ];

    if (data.data && typeof data.data === 'object') {
      candidates = candidates.concat([
        data.data.lyrics, data.data.plainLyrics,
        data.data.syncedLyrics, data.data.text, data.data.body
      ]);
    }
    if (data.result && typeof data.result === 'object') {
      candidates = candidates.concat([
        data.result.lyrics, data.result.plainLyrics,
        data.result.syncedLyrics, data.result.text
      ]);
    }
    if (Array.isArray(data.lines)) candidates.push(data.lines);

    for (var i = 0; i < candidates.length; i++) {
      var value = candidates[i];
      if (typeof value === 'string' && value.trim()) return value;
      if (Array.isArray(value)) {
        var lines = value.map(function (line) {
          if (typeof line === 'string') return line;
          if (line && typeof line === 'object') {
            return line.text || line.line || line.words || line.lyrics || '';
          }
          return '';
        }).filter(function (line) {
          return !!String(line || '').trim();
        });
        if (lines.length) return lines.join('\n');
      }
    }
    return '';
  }

  function cleanLyrics(text) {
    return String(text)
      .replace(/\r/g, '')
      .split('\n')
      .map(function (line) {
        return line.replace(/^\[\d{1,2}:\d{2}(?:[.:]\d{1,3})?\]\s*/, '');
      })
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function renderLyrics() {
    var body = byId('lyricsBody');
    var label = byId('lyricsState');
    if (!body || !label) return;

    if (state.lyricsState === 'loading') {
      body.className = 'lyrics-body loading-lyrics';
      body.textContent = 'Looking for lyrics…';
      label.textContent = '';
      return;
    }

    if (state.lyricsState === 'ready' && state.lyrics) {
      body.className = 'lyrics-body';
      body.textContent = state.lyrics;
      label.textContent = 'From the lyrics endpoint';
      return;
    }

    if (state.lyricsState === 'none') {
      body.className = 'lyrics-body empty-lyrics';
      body.textContent = 'Lyrics aren’t available for this track. Tried ' +
        LYRICS_ATTEMPTS + ' times.';
      label.textContent = 'Unavailable';
      return;
    }

    body.className = 'lyrics-body';
    body.textContent = 'Select a track to see lyrics.';
    label.textContent = '';
  }

  async function ensureLyrics(track) {
    var token = ++lyricsToken;

    if (!track || !track.title) {
      state.lyrics = '';
      state.lyricsState = 'none';
      renderLyrics();
      return;
    }

    var key = track.videoId || (track.title + '|' + track.artist);

    if (Object.prototype.hasOwnProperty.call(lyricsCache, key)) {
      state.lyrics = lyricsCache[key];
      state.lyricsState = lyricsCache[key] ? 'ready' : 'none';
      renderLyrics();
      return;
    }

    state.lyrics = '';
    state.lyricsState = 'loading';
    renderLyrics();

    var found = '';

    for (var attempt = 1; attempt <= LYRICS_ATTEMPTS; attempt++) {
      if (token !== lyricsToken) return;

      try {
        var url = '/api/lyrics?title=' + encodeURIComponent(track.title) +
          '&artist=' + encodeURIComponent(track.artist);
        var data = await fetchJson(url);
        found = extractLyrics(data);
      } catch (e) {
        found = '';
      }

      if (found) break;

      if (attempt < LYRICS_ATTEMPTS) {
        await sleep(600 + attempt * 400);
        if (token !== lyricsToken) return;
      }
    }

    if (token !== lyricsToken) return;

    var cleaned = found ? cleanLyrics(found) : '';
    lyricsCache[key] = cleaned;

    state.lyrics = cleaned;
    state.lyricsState = cleaned ? 'ready' : 'none';
    renderLyrics();
  }

  /* ------------------------------------------------------------------ */
  /*  Playback core                                                     */
  /* ------------------------------------------------------------------ */

  function syncPlayButtons() {
    var icon = state.playing ? 'i-pause' : 'i-play';
    var markup = '<svg class="ic"><use href="#' + icon + '"></use></svg>';
    var mini = byId('miniPlay');
    var sheet = byId('sheetPlay');
    if (mini) mini.innerHTML = markup;
    if (sheet) sheet.innerHTML = markup;
  }

  function renderNowPlaying() {
    var track = state.current;
    if (!track) return;

    var miniTitle = byId('miniTitle');
    var miniArtist = byId('miniArtist');
    if (miniTitle) miniTitle.textContent = track.title;
    if (miniArtist) miniArtist.textContent = track.artist;
    setImage(byId('miniArt'), track, false);

    var sheetTitle = byId('sheetTitle');
    var sheetArtist = byId('sheetArtist');
    if (sheetTitle) sheetTitle.textContent = track.title;
    if (sheetArtist) sheetArtist.textContent = track.artist;
    setImage(byId('sheetArt'), track, true);
    setImage(byId('sheetBg'), track, true);

    syncLiked();
    syncActiveRows();
  }

  function showMini() {
    var mini = byId('mini');
    if (mini) mini.hidden = false;
  }

  function prefetchRelated(track) {
    if (!track || !track.videoId) return Promise.resolve([]);
    if (relatedKey === track.videoId && relatedPromise) return relatedPromise;

    relatedKey = track.videoId;
    relatedPromise = (async function () {
      var results = await Promise.all([
        fetchJson('/api/related/' + encodeURIComponent(track.videoId))
          .then(extractItems)
          .catch(function () { return []; }),
        fetchJson('/api/similar?title=' + encodeURIComponent(track.title) +
                 '&artist=' + encodeURIComponent(track.artist))
          .then(extractItems)
          .catch(function () { return []; })
      ]);

      var seen = {};
      seen[track.videoId] = true;
      var out = [];

      results.forEach(function (list) {
        list.forEach(function (item) {
          var candidate = normalizeTrack(item);
          if (!candidate.videoId || seen[candidate.videoId]) return;
          if (!candidate.title || candidate.title === 'Unknown track') return;
          seen[candidate.videoId] = true;
          out.push(candidate);
        });
      });

      return out;
    })();

    return relatedPromise;
  }

  function playCurrent() {
    var track = state.queue[state.queueIndex];
    if (!track || !track.videoId) {
      toast('This track cannot be played.');
      return;
    }

    state.current = track;
    state.playing = true;
    state.pendingPlay = null;
    relatedKey = '';
    relatedPromise = null;

    addRecent(track);
    renderNowPlaying();
    showMini();
    syncPlayButtons();

    // Lyrics only matter in the expanded player, but we start the lookup
    // right away so the sheet is ready the moment it is opened.
    ensureLyrics(track);

    if (!ytReady || !yt) {
      state.pendingPlay = track;
      return;
    }

    try {
      yt.loadVideoById(track.videoId);
    } catch (e) {
      toast('Playback could not start.');
      state.playing = false;
      syncPlayButtons();
      return;
    }

    prefetchRelated(track);
  }

  function playList(list, index) {
    var target = list[index];
    var playable = list.filter(function (item) { return item && item.videoId; });
    if (!playable.length) {
      toast('Nothing playable in this list.');
      return;
    }

    var position = playable.indexOf(target);
    if (position < 0) position = 0;

    state.queue = playable.slice();
    state.queueIndex = position;
    playCurrent();
  }

  function togglePlay() {
    if (!state.current) {
      toast('Pick a song first.');
      return;
    }
    if (!ytReady || !yt) {
      toast('The player is still loading.');
      return;
    }
    try {
      if (state.playing) {
        yt.pauseVideo();
      } else {
        yt.playVideo();
      }
    } catch (e) {
      toast('Playback control failed.');
    }
  }

  async function nextTrack() {
    if (!state.current) return;

    if (state.queueIndex + 1 < state.queue.length) {
      state.queueIndex += 1;
      playCurrent();
      return;
    }

    toast('Finding more music…');
    var more = await prefetchRelated(state.current);

    var seen = {};
    state.queue.forEach(function (item) { if (item.videoId) seen[item.videoId] = true; });

    var additions = more.filter(function (item) {
      return item.videoId && !seen[item.videoId];
    });

    if (additions.length) {
      state.queue = state.queue.concat(additions.slice(0, 20));
      state.queueIndex += 1;
      playCurrent();
    } else {
      state.playing = false;
      syncPlayButtons();
      stopProgress();
      toast('End of queue. Search for more music.');
    }
  }

  function prevTrack() {
    if (yt && ytReady) {
      try {
        if ((yt.getCurrentTime() || 0) > 3) {
          yt.seekTo(0, true);
          return;
        }
      } catch (e) {}
    }
    if (state.queueIndex > 0) {
      state.queueIndex -= 1;
      playCurrent();
      return;
    }
    try { if (yt && ytReady) yt.seekTo(0, true); } catch (e) {}
  }

  /* ------------------------------------------------------------------ */
  /*  Progress                                                          */
  /* ------------------------------------------------------------------ */

  function startProgress() {
    stopProgress();
    progressTimer = setInterval(tickProgress, 500);
    tickProgress();
  }

  function stopProgress() {
    if (progressTimer) {
      clearInterval(progressTimer);
      progressTimer = null;
    }
  }

  function tickProgress() {
    if (!yt || !ytReady) return;
    try {
      var current = yt.getCurrentTime() || 0;
      var duration = yt.getDuration() || 0;
      var percent = duration > 0 ? Math.min(100, (current / duration) * 100) : 0;

      var miniFill = byId('miniFill');
      var sheetFill = byId('sheetFill');
      if (miniFill) miniFill.style.width = percent + '%';
      if (sheetFill) sheetFill.style.width = percent + '%';

      var cur = byId('sheetCur');
      var dur = byId('sheetDur');
      if (cur) cur.textContent = fmt(current);
      if (dur) dur.textContent = fmt(duration);
    } catch (e) {}
  }

  function seekFromEvent(event) {
    var bar = byId('sheetBar');
    if (!bar || !yt || !ytReady) return;
    var rect = bar.getBoundingClientRect();
    if (!rect.width) return;
    var fraction = (event.clientX - rect.left) / rect.width;
    fraction = Math.max(0, Math.min(1, fraction));
    try {
      var duration = yt.getDuration() || 0;
      if (duration > 0) yt.seekTo(duration * fraction, true);
    } catch (e) {}
  }

  /* ------------------------------------------------------------------ */
  /*  Expanded player                                                   */
  /* ------------------------------------------------------------------ */

  function openSheet() {
    if (!state.current) return;
    var sheet = byId('sheet');
    if (!sheet) return;
    sheet.hidden = false;
    document.body.style.overflow = 'hidden';
    renderLyrics();
    tickProgress();
    if (state.lyricsState === 'idle') ensureLyrics(state.current);
  }

  function closeSheet() {
    var sheet = byId('sheet');
    if (!sheet) return;
    sheet.hidden = true;
    document.body.style.overflow = '';
  }

  /* ------------------------------------------------------------------ */
  /*  YouTube player                                                    */
  /* ------------------------------------------------------------------ */

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
          ytReady = true;
          try { yt.setVolume(volume); } catch (e) {}
          if (state.pendingPlay) {
            var pending = state.pendingPlay;
            state.pendingPlay = null;
            try { yt.loadVideoById(pending.videoId); } catch (e) {}
            prefetchRelated(pending);
          }
        },
        onStateChange: function (event) {
          if (!window.YT) return;
          var YTS = window.YT.PlayerState;

          if (event.data === YTS.PLAYING) {
            state.playing = true;
            syncPlayButtons();
            startProgress();
          } else if (event.data === YTS.PAUSED) {
            state.playing = false;
            syncPlayButtons();
            stopProgress();
            tickProgress();
          } else if (event.data === YTS.ENDED) {
            state.playing = false;
            stopProgress();
            nextTrack();
          } else if (event.data === YTS.BUFFERING) {
            startProgress();
          }
        },
        onError: async function (event) {
          var code = event && event.data;
          var track = state.current;
          state.playing = false;
          stopProgress();
          syncPlayButtons();

          if (!track) return;

          if (code === 101 || code === 150 || code === 100) {
            toast('This video cannot be embedded. Looking for an alternative…');
            try {
              var query = track.title + ' ' + track.artist + ' official audio';
              var data = await fetchJson('/api/yt_search?q=' + encodeURIComponent(query) + '&filter=videos');
              var items = extractItems(data);
              var fallback = null;
              for (var i = 0; i < items.length; i++) {
                var id = getVideoId(items[i]);
                if (id && id !== track.videoId) { fallback = id; break; }
              }
              if (fallback && yt && ytReady) {
                yt.loadVideoById(fallback);
                return;
              }
            } catch (e) {}
          }

          toast('Playback error. Try another track.');
        }
      }
    });
  };

  /* ------------------------------------------------------------------ */
  /*  Wiring                                                            */
  /* ------------------------------------------------------------------ */

  function wireNavigation() {
    var nodes = document.querySelectorAll('[data-view]');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].addEventListener('click', function () {
        var view = this.getAttribute('data-view');
        if (view === 'search') { goSearch(); return; }
        if (view === 'home') { goHome(); return; }
        showView(view);
      });
    }

    var topSearch = byId('topSearch');
    if (topSearch) topSearch.addEventListener('click', goSearch);

    var goHomeBtn = byId('goHomeBtn');
    if (goHomeBtn) goHomeBtn.addEventListener('click', goHome);

    var clearData = byId('clearData');
    if (clearData) {
      clearData.addEventListener('click', function () {
        writeStore(LS_RECENT, []);
        writeStore(LS_LIKED, []);
        renderProfile();
        syncLiked();
        toast('Local data cleared.');
      });
    }
  }

  function wireSearch() {
    var input = byId('searchInput');
    if (input) {
      input.addEventListener('input', function () {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(runSearch, 420);
      });
      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          clearTimeout(searchTimer);
          runSearch();
        }
      });
    }

    var chips = document.querySelectorAll('.chip');
    for (var i = 0; i < chips.length; i++) {
      chips[i].addEventListener('click', function () {
        for (var j = 0; j < chips.length; j++) chips[j].classList.remove('active');
        this.classList.add('active');
        state.searchFilter = this.getAttribute('data-filter') || '';
        runSearch();
      });
    }
  }

  function wirePlayer() {
    var miniOpen = byId('miniOpen');
    if (miniOpen) miniOpen.addEventListener('click', openSheet);

    var miniPlay = byId('miniPlay');
    if (miniPlay) miniPlay.addEventListener('click', function (event) {
      event.stopPropagation();
      togglePlay();
    });

    var miniNext = byId('miniNext');
    if (miniNext) miniNext.addEventListener('click', function (event) {
      event.stopPropagation();
      nextTrack();
    });

    var sheetClose = byId('sheetClose');
    if (sheetClose) sheetClose.addEventListener('click', closeSheet);

    var sheetPlay = byId('sheetPlay');
    if (sheetPlay) sheetPlay.addEventListener('click', togglePlay);

    var sheetNext = byId('sheetNext');
    if (sheetNext) sheetNext.addEventListener('click', nextTrack);

    var sheetPrev = byId('sheetPrev');
    if (sheetPrev) sheetPrev.addEventListener('click', prevTrack);

    var likeBtn = byId('likeBtn');
    if (likeBtn) likeBtn.addEventListener('click', toggleLike);

    var bar = byId('sheetBar');
    if (bar) bar.addEventListener('click', seekFromEvent);

    var vol = byId('vol');
    if (vol) {
      vol.addEventListener('input', function () {
        volume = Number(this.value);
        if (yt && ytReady) {
          try { yt.setVolume(volume); } catch (e) {}
        }
      });
    }

    var trendingAll = byId('trendingAll');
    if (trendingAll) {
      trendingAll.addEventListener('click', function () {
        if (!state.trending.length) { toast('Trending is still loading.'); return; }
        openDetailBase();
        showView('detail');
        renderDetail({
          kind: 'Trending · India',
          title: 'Trending in India',
          sub: state.trending.length + ' tracks',
          art: artSrc(state.trending[0], true),
          tracks: state.trending.slice()
        });
      });
    }
  }

  function boot() {
    wireNavigation();
    wireSearch();
    wirePlayer();

    loadTrending();
    loadArtists();
    loadAlbums();

    var script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = function () {
      toast('The YouTube player API could not load.');
    };
    document.head.appendChild(script);

    window.addEventListener('beforeunload', stopProgress);

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !byId('sheet').hidden) closeSheet();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
</script>
</body>
</html>`;
