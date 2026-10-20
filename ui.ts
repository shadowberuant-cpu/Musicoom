/**
 * Verome Music Player UI
 * Custom responsive player powered by the existing Verome API routes.
 * This file is intentionally self-contained: main.ts already serves `html` at `/`.
 *
 * Queue has been removed entirely. Autoplay is an endless related-video chain:
 *   A -> fetch related(A) -> A ends -> B -> fetch related(B) -> B ends -> C -> ...
 * Related fetches are prefetched in the background while the current track plays.
 */
export const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="theme-color" content="#050a14">
<title>Verome — Music for your mood</title>
<link rel="icon" href="/logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{color-scheme:dark;--bg:#050a14;--panel:#0c1424;--panel2:#131e33;--line:#1e2d4a;--text:#eef4fb;--muted:#7b8ca3;--accent:#22d3ee;--accent2:#a5f3fc;--danger:#ff8d8d;--radius:18px}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(ellipse at 50% -20%,#0e3a4d 0,transparent 50%),var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;min-height:100vh;overflow-x:hidden}button,input,select{font:inherit}button{cursor:pointer}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--accent);outline-offset:3px}.app{display:block;min-height:100vh;max-width:1600px;margin:auto}.sidebar{display:none}.brand{display:flex;align-items:center;justify-content:flex-start;padding:0 10px;min-height:110px}.brand-logo{height:102px;width:auto;max-width:100%;object-fit:contain;display:block}.side-label{font-size:10px;letter-spacing:1.8px;color:#5c7093;font-weight:700;padding:0 12px;margin-bottom:9px}.nav{display:grid;gap:5px}.nav button{display:flex;align-items:center;gap:13px;border:0;border-radius:12px;background:transparent;color:var(--muted);padding:12px;font-weight:600;text-align:left;transition:.18s}.nav button:hover,.nav button.active{background:#0d2a3d;color:var(--accent)}.nav .ico{width:20px;text-align:center;font-size:17px}.sidebar-note{margin-top:auto;border:1px solid var(--line);background:linear-gradient(145deg,#0d1f2e,#0b1524);border-radius:16px;padding:15px;color:var(--muted);font-size:12px;line-height:1.6}.sidebar-note strong{display:block;color:var(--text);font-size:13px;margin-bottom:5px}.main{width:75%;padding:24px 28px 112px;min-width:0}.topbar{display:flex;align-items:center;gap:14px;margin-bottom:30px}.mobile-brand{display:none;height:78px;width:auto;object-fit:contain;margin-right:2px}.search-wrap{display:flex;align-items:center;gap:10px;max-width:620px;width:100%;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:0 14px}.search-wrap span{color:var(--muted)}.search-wrap input{width:100%;min-width:0;padding:14px 0;background:transparent;border:0;outline:none;color:var(--text)}.search-wrap input:focus-visible{outline:none}.search-wrap button{border:0;background:var(--accent);color:#041219;font-weight:700;padding:9px 14px;border-radius:10px}.search-wrap button:hover{background:var(--accent2)}.top-actions{margin-left:auto;display:flex;gap:9px}.icon-btn{border:1px solid var(--line);background:var(--panel);color:var(--text);width:42px;height:42px;border-radius:13px;transition:.15s}.icon-btn:hover{background:#0d2a3d;border-color:#1f4a5a;color:var(--accent)}.page{display:none}.page.active{display:block;animation:appear .2s ease}@keyframes appear{from{opacity:.4;transform:translateY(4px)}to{opacity:1;transform:none}}.eyebrow{color:var(--accent);font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;margin-bottom:9px}.heading-row{display:flex;justify-content:space-between;align-items:end;gap:16px;margin-bottom:20px}.heading-row h1,.hero h1{font:700 clamp(27px,4vw,42px)/1.1 'Space Grotesk',sans-serif;letter-spacing:-1.7px;margin:0}.heading-row p{color:var(--muted);margin:9px 0 0;font-size:14px}.hero{position:relative;overflow:hidden;border:1px solid #1e3a4d;border-radius:24px;padding:34px;background:linear-gradient(110deg,#0f2c3d,#0c1a2e 60%,#0e1e33);margin-bottom:30px;min-height:205px}.hero:after{content:'♫';position:absolute;right:7%;top:-52px;font:220px 'Space Grotesk',sans-serif;color:#22d3ee12;transform:rotate(12deg)}.hero h1{max-width:540px;font-size:clamp(31px,4vw,48px)}.hero p{max-width:430px;color:#a5b8cc;line-height:1.6;margin:13px 0 20px}.primary,.secondary{border:0;border-radius:11px;padding:11px 16px;font-weight:700;transition:.15s}.primary{background:var(--accent);color:#041219}.primary:hover{background:var(--accent2)}.secondary{background:var(--panel2);border:1px solid var(--line);color:var(--text)}.secondary:hover{background:#16233c;border-color:#26456a}.section{margin:30px 0}.section-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}.section-head h2{font:600 20px 'Space Grotesk',sans-serif;margin:0}.subtle{color:var(--muted);font-size:12px}.chips{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px}.chip{border:1px solid var(--line);border-radius:999px;background:var(--panel);padding:8px 13px;color:var(--muted);font-size:12px;transition:.15s}.chip.active,.chip:hover{background:#0d2a3d;border-color:#1f4a5a;color:var(--accent)}.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:17px}.card{min-width:0;padding:10px;border-radius:16px;background:transparent;transition:.2s;cursor:pointer;border:1px solid transparent}.card:hover{background:var(--panel);border-color:var(--line);transform:translateY(-2px)}.cover{width:100%;aspect-ratio:1;object-fit:cover;border-radius:12px;background:var(--panel2);display:block;margin-bottom:11px}.card-title{font-size:13px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.card-sub{font-size:11px;color:var(--muted);margin-top:5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.results{display:grid;gap:6px}.track{display:grid;grid-template-columns:42px minmax(0,1fr) auto auto;align-items:center;gap:13px;padding:9px 12px;border:1px solid transparent;border-radius:13px;cursor:pointer;transition:.15s}.track:hover,.track.current{background:var(--panel);border-color:var(--line)}.track img{width:42px;height:42px;object-fit:cover;border-radius:9px;background:var(--panel2)}.track-info{min-width:0}.track-name{font-weight:600;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.track-artist{color:var(--muted);font-size:11px;margin-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.track-duration{font-size:11px;color:var(--muted)}.track-actions{display:flex;gap:5px}.mini-btn{width:30px;height:30px;border:0;border-radius:9px;background:transparent;color:var(--muted)}.mini-btn:hover{background:var(--panel2);color:var(--accent)}.empty{border:1px dashed var(--line);border-radius:16px;padding:36px 18px;text-align:center;color:var(--muted);line-height:1.6}.status{font-size:12px;color:var(--muted);margin:12px 0}.panel{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:18px}.panel h3{font:600 16px 'Space Grotesk',sans-serif;margin:0 0 14px}.lyric-search{display:flex;gap:8px;margin-bottom:18px;flex-wrap:wrap}.lyric-search input{min-width:0;flex:1;background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:11px 12px;color:var(--text)}.lyric-search input:focus{outline:none;border-color:var(--accent)}.lyrics{white-space:pre-wrap;line-height:1.9;color:#d8e4f0;font-size:14px;min-height:180px}.lyrics .active-line{color:var(--accent);font-weight:700}.player{position:fixed;top:0;right:0;bottom:0;width:25%;z-index:12;background:linear-gradient(180deg,#0a1526fa,#060d18fa);backdrop-filter:blur(20px);border-left:1px solid #1a2a45;padding:26px 22px 92px;display:flex;flex-direction:column;justify-content:center;gap:22px;align-items:stretch;overflow:auto}.player-open-btn{display:none;place-items:center;border:1px solid var(--line);background:var(--panel2);color:var(--muted);width:30px;height:30px;border-radius:10px;flex-shrink:0}.player-open-btn:hover{color:var(--accent)}.player-art{width:100%;max-width:280px;aspect-ratio:1;object-fit:cover;border-radius:18px;background:var(--panel2);align-self:center;box-shadow:0 18px 50px #0006}.player .now-playing{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px}.player .now-playing #playerCover{display:none}.player .np-title{font-size:16px}.player .np-artist{font-size:13px}.player-controls{width:100%}.player .control-row{justify-content:center;gap:clamp(8px,1.2vw,18px)}.player .progress-row{font-size:11px}.player-right{display:flex;justify-content:center;align-items:center;gap:12px}.player .volume,.player .volume-icon{display:none}.player-close{display:none}.player-backdrop{display:none}.footer-nav{position:fixed;left:0;bottom:0;width:75%;height:70px;z-index:11;display:flex;align-items:center;justify-content:space-around;gap:6px;padding:7px 18px;background:#0a1526f7;backdrop-filter:blur(18px);border-top:1px solid var(--line)}.footer-nav button{min-width:0;flex:1;display:flex;align-items:center;justify-content:center;gap:9px;padding:10px 12px;border:0;border-radius:13px;background:transparent;color:var(--muted);font-size:12px;font-weight:700;transition:.18s}.footer-nav button svg{width:20px;height:20px;flex-shrink:0;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}.footer-nav button:hover,.footer-nav button.active{background:#0d2a3d;color:var(--accent)}.profile-placeholder{max-width:620px}.profile-placeholder p{color:var(--muted);line-height:1.7}.now-playing{display:flex;align-items:center;gap:12px;min-width:0}.now-playing img{width:52px;height:52px;object-fit:cover;border-radius:10px;background:var(--panel2)}.np-text{min-width:0}.np-title{font-weight:700;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.np-artist{font-size:11px;color:var(--muted);margin-top:5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.player-controls{display:grid;gap:7px;justify-items:center}.control-row{display:flex;align-items:center;gap:15px}.control{border:0;background:transparent;color:var(--muted);font-size:16px;padding:5px;border-radius:9px;transition:.15s;display:grid;place-items:center}.control:hover{color:var(--accent);background:#0d2338}.icon-control{display:grid;place-items:center}.ctrl-icon{width:18px;height:18px;display:block;margin:auto;filter:invert(1);pointer-events:none;user-select:none}.play-btn{width:40px;height:40px;border-radius:50%;border:0;background:var(--accent);display:grid;place-items:center;padding:0;transition:.15s}.play-btn:hover{background:var(--accent2);transform:scale(1.05)}.play-icon{width:16px;height:16px;display:block;margin:auto;filter:brightness(0);pointer-events:none;user-select:none}.progress-row{display:flex;align-items:center;gap:9px;width:100%;font-size:10px;color:var(--muted)}.progress{height:5px;background:#1a2a45;border-radius:99px;flex:1;cursor:pointer;overflow:hidden}.progress-fill{height:100%;width:0;background:var(--accent);border-radius:99px;transition:width .15s linear}.player-right{display:flex;justify-content:flex-end;align-items:center;gap:12px}.volume{width:90px;accent-color:var(--accent)}.volume-icon{width:18px;height:18px;filter:invert(1);flex-shrink:0}#ytplayer{position:fixed;width:1px;height:1px;left:-10000px;top:-10000px;opacity:0;pointer-events:none}.toast{position:fixed;left:50%;bottom:110px;transform:translateX(-50%);background:#0d2a3d;border:1px solid #1f4a5a;color:var(--accent);padding:10px 15px;border-radius:11px;font-size:12px;z-index:30;display:none;max-width:90vw;box-shadow:0 8px 30px #0008}.footer-note{color:#5c7093;font-size:11px;margin-top:30px;line-height:1.6}
@media(max-width:850px){.main{padding:20px 18px 112px}.player{padding:22px 14px 88px;gap:18px}.player .control-row{gap:6px}.footer-nav{padding:7px 8px}.footer-nav button{gap:6px;padding:10px 6px;font-size:11px}.player .np-title{font-size:14px}.player .np-artist{font-size:12px}}
@media(max-width:560px){.app{display:block;padding-bottom:0}.main{width:100%;padding:15px 14px 150px}.topbar{margin-bottom:22px;align-items:center}.mobile-brand{display:block;height:56px;width:auto}.search-wrap{padding:0 10px;gap:7px}.search-wrap input{padding:12px 0;font-size:13px}.search-wrap button{padding:8px 10px;font-size:12px}.top-actions{display:none}.hero{padding:23px 20px;min-height:0}.hero:after{right:-20px;top:-35px;font-size:150px}.hero h1{font-size:32px}.hero p{font-size:13px;max-width:270px}.cards{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.card{padding:7px}.track{grid-template-columns:38px minmax(0,1fr) auto;gap:10px;padding:8px 5px}.track img{width:38px;height:38px}.track-duration{display:none}.track-actions .fav-btn{display:none}.heading-row{align-items:start;flex-direction:column}.heading-row h1{font-size:30px}.footer-nav{left:0;right:0;bottom:0;width:100%;height:62px;padding:4px 7px;gap:2px}.footer-nav button{display:grid;justify-items:center;align-content:center;gap:2px;padding:3px 2px;font-size:9px}.footer-nav button svg{width:20px;height:20px}.player{top:auto;left:0;right:0;bottom:62px;width:100%;height:68px;min-height:68px;padding:9px 12px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:8px;border-left:0;border-top:1px solid #1a2a45;overflow:visible;justify-content:initial}.player .player-art{display:none}.player .now-playing{display:flex;align-items:center;gap:9px;min-width:0}.player .now-playing #playerCover{display:block;width:42px;height:42px}.player .np-title{font-size:11px}.player .np-artist{font-size:10px}.player .player-open-btn{display:grid}.player-controls{display:flex;justify-content:flex-end;width:auto}.player .control-row{gap:7px}.player .control{font-size:14px;padding:4px}.player .play-btn{width:34px;height:34px}.player .play-icon{width:14px;height:14px}.player .progress-row{position:absolute;top:-4px;left:0;right:0;gap:0}.player .progress-row span{display:none}.player .progress{height:3px;border-radius:0}.player-right{display:none}.player-close{display:none}.player.expanded{top:0;left:0;right:0;bottom:62px;width:100%;height:auto;min-height:0;padding:24px 24px 28px;display:flex;flex-direction:column;justify-content:center;gap:22px;overflow:auto;border-left:0;border-top:0;z-index:25}.player.expanded .player-open-btn{display:none}.player.expanded .player-art{display:block;width:min(72vw,330px);max-width:330px}.player.expanded .now-playing{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px}.player.expanded .now-playing #playerCover{display:none}.player.expanded .np-title{font-size:17px}.player.expanded .np-artist{font-size:13px}.player.expanded .player-controls{display:grid;justify-items:center;width:100%}.player.expanded .control-row{gap:clamp(12px,5vw,24px)}.player.expanded .play-btn{width:48px;height:48px}.player.expanded .play-icon{width:18px;height:18px}.player.expanded .progress-row{position:static;gap:9px;font-size:11px}.player.expanded .progress-row span{display:block}.player.expanded .progress{height:5px;border-radius:99px}.player.expanded .player-right{display:flex}.player.expanded .volume,.player.expanded .volume-icon{display:none}.player.expanded .player-close{display:grid;position:absolute;top:15px;right:15px;width:38px;height:38px;border:1px solid var(--line);border-radius:50%;background:var(--panel);color:var(--text);place-items:center;font-size:20px}.player-backdrop.show{display:block;position:fixed;inset:0;z-index:24;background:#020610a8;backdrop-filter:blur(5px)}.toast{bottom:145px}.section{margin:24px 0}}</style>
</head>
<body>
<div class="app">
<main class="main">
  <header class="topbar"><img class="mobile-brand" src="/logo.png" alt="Verome"><div class="search-wrap"><span>⌕</span><input id="globalQuery" placeholder="Search songs, artists, albums…" autocomplete="off" aria-label="Search music"><button id="globalSearchBtn">Search</button></div><div class="top-actions"><button class="icon-btn" id="refreshBtn" title="Refresh discovery" aria-label="Refresh discovery">↻</button></div></header>
  <section id="home" class="page active">
    <div class="hero"><div class="eyebrow">YOUR SOUND, YOUR WORLD</div><h1>A little more music.<br>A little more you.</h1><p>Discover tracks, save the ones you love, and let the next song find you.</p><button class="primary" data-go="discover">Explore music&nbsp; ↗</button></div>
    <div class="section"><div class="section-head"><h2>Made for your mood</h2><button class="secondary" data-go="discover">See all</button></div><div id="homeMood" class="chips"><button class="chip active" data-mood="trending">Trending now</button><button class="chip" data-mood="charts">Top charts</button><button class="chip" data-mood="radio">Radio &amp; similar</button></div><div id="homeTracks" class="cards"><div class="empty">Loading your music discovery…</div></div></div>
    <div class="section"><div class="section-head"><h2>Recently played</h2><button class="secondary" data-go="library">Open library</button></div><div id="homeSaved" class="results"><div class="empty">Tracks you play will show up here.</div></div></div>
  </section>
  <section id="searchPage" class="page"><div class="heading-row"><div><div class="eyebrow">FIND YOUR FREQUENCY</div><h1>Search music</h1><p>Search songs and artists from the Verome music catalog.</p></div></div><div class="chips" id="searchFilters"><button class="chip active" data-filter="songs">Songs</button><button class="chip" data-filter="albums">Albums</button><button class="chip" data-filter="artists">Artists</button><button class="chip" data-filter="playlists">Playlists</button><button class="chip" data-filter="videos">Videos</button></div><div id="searchStatus" class="status">Type a song or artist above to get started.</div><div id="searchResults" class="results"></div></section>
  <section id="discover" class="page"><div class="heading-row"><div><div class="eyebrow">FRESH FINDS</div><h1>Discover</h1><p>Explore popular music and new directions.</p></div><select id="countrySelect" class="secondary" aria-label="Chart country"><option value="IN">India</option><option value="US">United States</option><option value="GB">United Kingdom</option><option value="JP">Japan</option><option value="KR">South Korea</option><option value="BR">Brazil</option></select></div><div class="chips" id="discoverFilters"><button class="chip active" data-discover="trending">Trending</button><button class="chip" data-discover="charts">Charts</button><button class="chip" data-discover="toptracks">Top tracks</button><button class="chip" data-discover="topartists">Top artists</button></div><div id="discoverStatus" class="status">Loading discovery…</div><div id="discoverResults" class="cards"></div></section>
  <section id="library" class="page"><div class="heading-row"><div><div class="eyebrow">YOUR COLLECTION</div><h1>Your library</h1><p>Favourites saved in this browser on this device.</p></div><button id="clearLibrary" class="secondary">Clear favourites</button></div><div class="chips"><button class="chip active" data-library="favorites">Favourites</button></div><div id="libraryResults" class="results"><div class="empty">No favourites saved yet. Search for a song and tap ♡ to save it.</div></div></section>
  <section id="lyricsPage" class="page"><div class="heading-row"><div><div class="eyebrow">SING ALONG</div><h1>Lyrics</h1><p>Find lyrics for the song you're listening to.</p></div><button class="secondary" id="loadCurrentLyrics">Current song</button></div><div class="panel"><div class="lyric-search"><input id="lyricTitle" placeholder="Song title" aria-label="Song title"><input id="lyricArtist" placeholder="Artist" aria-label="Artist"><button class="primary" id="lyricsBtn">Find</button></div><div id="lyricsStatus" class="status">Choose a song or enter its title and artist.</div><div id="lyricsText" class="lyrics"></div></div><p class="footer-note">Lyrics availability depends on the lyrics provider. Verome displays results returned by its existing /api/lyrics endpoint.</p></section>
  <section id="profilePage" class="page"><div class="heading-row"><div><div class="eyebrow">YOUR SPACE</div><h1>Profile</h1><p>Your Verome account and settings will live here.</p></div></div><div class="panel profile-placeholder"><h3>Profile is coming later</h3><p>Account sign-in and synced preferences will be added with Firebase. Your favourites currently stay saved in this browser.</p></div></section>
</main>
</div>
<nav class="footer-nav" aria-label="Main navigation">
<button class="active" data-page="home" aria-label="Home"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></svg><span>Home</span></button>
<button data-page="searchPage" aria-label="Search"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/></svg><span>Search</span></button>
<button data-page="library" aria-label="Library"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg><span>Library</span></button>
<button data-page="profilePage" aria-label="Profile"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg><span>Profile</span></button>
</nav>
<div id="playerBackdrop" class="player-backdrop"></div>
<div class="player" id="musicPlayer"><button class="player-close" id="closePlayer" aria-label="Close player">×</button><img class="player-art" id="playerArt" src="/assets/logo.png" alt="Album artwork"><div class="now-playing"><img id="playerCover" src="/assets/logo.png" alt="Album artwork"><div class="np-text"><div id="playerTitle" class="np-title">Choose a track</div><div id="playerArtist" class="np-artist">Your music starts here</div></div><button id="playerFav" class="mini-btn" title="Save favourite" aria-label="Save favourite">♡</button><button id="openPlayer" class="player-open-btn" title="Open player" aria-label="Open full player">⌃</button></div><div class="player-controls"><div class="control-row"><button id="shuffleBtn" class="control" title="Shuffle off" aria-label="Toggle shuffle" aria-pressed="false">⤨</button><button id="prevBtn" class="control icon-control" title="Previous" aria-label="Previous track"><svg class="ctrl-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 5 9 12l10 7zM5 5v14" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></button><button id="playBtn" class="play-btn" title="Play or pause" aria-label="Play or pause"><img id="playIcon" class="play-icon" src="https://www.svgrepo.com/show/529141/play.svg" alt=""></button><button id="nextBtn" class="control icon-control" title="Next" aria-label="Next track"><svg class="ctrl-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 5 10 7-10 7zM19 5v14" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></button><button id="repeatBtn" class="control" title="Repeat current track" aria-label="Repeat current track" aria-pressed="false">↻</button></div><div class="progress-row"><span id="currentTime">0:00</span><div id="progress" class="progress" role="slider" aria-label="Seek song" tabindex="0"><div id="progressFill" class="progress-fill"></div></div><span id="duration">0:00</span></div></div><div class="player-right"><button id="lyricsQuick" class="control" title="Lyrics" aria-label="Show lyrics">≋ Lyrics</button></div></div>
<div id="ytplayer"></div><div id="toast" class="toast" role="status"></div>
<script>
(function(){
'use strict';
var $=function(id){return document.getElementById(id)};
var ICONS={play:'https://www.svgrepo.com/show/529141/play.svg',pause:'https://www.svgrepo.com/show/529129/pause.svg'};

/* ------------------------------------------------------------------
 * STATE
 * Queue removed. Playback is driven by:
 *   state.current         - currently playing track
 *   state.history         - bounded stack for Previous
 *   state.pendingRelated  - single prefetched next track
 *   state.relatedToken    - monotonically increasing; bumping it
 *                           invalidates any in-flight prefetch
 * ------------------------------------------------------------------ */
var state={
  results:[], filter:'songs',
  current:null,
  history:[],
  pendingRelated:null,
  relatedToken:0,
  relatedCache:{}, relatedInflight:{},
  recentIds:[], recentTracks:[],
  failedIds:{},
  playing:false, ready:false, yt:null,
  progressTimer:null,
  repeat:false, shuffle:false,
  library:loadLibrary(),
  searchToken:0, toastTimer:null,
  consecutiveErrors:0
};
var nextBusy=false;

function loadLibrary(){try{return JSON.parse(localStorage.getItem('verome:favorites')||'[]')}catch(_){return []}}
function saveLibrary(){try{localStorage.setItem('verome:favorites',JSON.stringify(state.library))}catch(_){} renderLibrary();renderHomeSaved()}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function artistOf(s){if(!s)return '';if(Array.isArray(s.artists))return s.artists.map(function(a){return typeof a==='string'?a:(a.name||'')}).filter(Boolean).join(', ');return s.artist||s.subtitle||s.author||''}
function titleOf(s){
  if(!s)return 'Unknown track';
  var t=s.title||s.name||s.trackName||s.videoTitle;
  if(t&&typeof t==='object'){
    if(t.text)return t.text;
    if(Array.isArray(t.runs))return t.runs.map(function(r){return r.text||''}).join('');
    if(t.simpleText)return t.simpleText;
  }
  return typeof t==='string'&&t.trim()?t:'Unknown track'
}

/**
 * Robust video ID resolver. Handles:
 *  - flat fields (videoId, video_id, videoID)
 *  - nested YouTube shapes (watchEndpoint, navigationEndpoint.watchEndpoint)
 *  - playlistItemData
 *  - plain string id (never object id which may be a browse id)
 */
function idOf(s){
  if(!s||typeof s!=='object')return '';
  var candidates=[
    s.videoId, s.video_id, s.videoID,
    s.id&&typeof s.id==='object'&&s.id.videoId,
    s.watchEndpoint&&s.watchEndpoint.videoId,
    s.navigationEndpoint&&s.navigationEndpoint.watchEndpoint&&s.navigationEndpoint.watchEndpoint.videoId,
    s.navigationEndpoint&&s.navigationEndpoint.watchEndpoint&&s.navigationEndpoint.watchEndpoint.videoId,
    s.endpoint&&s.endpoint.watchEndpoint&&s.endpoint.watchEndpoint.videoId,
    s.playlistItemData&&s.playlistItemData.videoId,
    s.videoRenderer&&s.videoRenderer.videoId,
    s.playlistVideoRenderer&&s.playlistVideoRenderer.videoId,
    s.compactVideoRenderer&&s.compactVideoRenderer.videoId,
    s.musicResponsiveListItemRenderer&&s.musicResponsiveListItemRenderer.playlistItemData&&s.musicResponsiveListItemRenderer.playlistItemData.videoId,
    typeof s.id==='string'?s.id:'',
    s.fallbackVideoId
  ];
  return candidates.find(function(v){return typeof v==='string'&&v.trim()})||'';
}

function thumbOf(s){return s&&(s.thumbnails&&s.thumbnails.length&&s.thumbnails[s.thumbnails.length-1].url||s.thumbnail||s.thumbnailUrl)||(idOf(s)?'https://img.youtube.com/vi/'+encodeURIComponent(idOf(s))+'/hqdefault.jpg':'/assets/logo.png')}
function normalize(s){return {title:titleOf(s),name:titleOf(s),artists:s.artists||[{name:artistOf(s)}],artist:artistOf(s),videoId:idOf(s),duration:s.duration||'',thumbnails:s.thumbnails||[{url:thumbOf(s)}],thumbnail:thumbOf(s),browseId:s.browseId||'',resultType:s.resultType||s.type||'song',fallbackVideoId:s.fallbackVideoId||''}}
function showToast(message){var t=$('toast');t.textContent=message;t.style.display='block';clearTimeout(state.toastTimer);state.toastTimer=setTimeout(function(){t.style.display='none'},2300)}
async function api(url){var res=await fetch(url,{headers:{'Accept':'application/json'}});var data=await res.json().catch(function(){return {error:'Invalid response'}});if(!res.ok||data.error)throw new Error(data.error||('Request failed ('+res.status+')'));return data}

function showPage(id){document.querySelectorAll('.page').forEach(function(p){p.classList.toggle('active',p.id===id)});document.querySelectorAll('[data-page]').forEach(function(b){b.classList.toggle('active',b.dataset.page===id)});if(id==='library')renderLibrary();if(id==='lyricsPage')syncLyricsForm();if(id==='discover'&&!$('discoverResults').children.length)loadDiscover('trending')}
document.querySelectorAll('[data-page]').forEach(function(b){b.addEventListener('click',function(){showPage(b.dataset.page)})});document.querySelectorAll('[data-go]').forEach(function(b){b.addEventListener('click',function(){showPage(b.dataset.go)})});

/* ------------------------------------------------------------------
 * FAVOURITES
 * ------------------------------------------------------------------ */
function isFavorite(s){var id=idOf(s);return state.library.some(function(x){return (id&&idOf(x)===id)||(!id&&titleOf(x)===titleOf(s)&&artistOf(x)===artistOf(s))})}
function toggleFavorite(s){if(!s)return;var id=idOf(s),found=state.library.findIndex(function(x){return (id&&idOf(x)===id)||(!id&&titleOf(x)===titleOf(s)&&artistOf(x)===artistOf(s))});if(found>=0){state.library.splice(found,1);showToast('Removed from favourites')}else{state.library.unshift(normalize(s));showToast('Saved to favourites')}saveLibrary();updatePlayerFavorite()}

/* ------------------------------------------------------------------
 * RENDER HELPERS
 * ------------------------------------------------------------------ */
function trackRow(s,index){
  var active=state.current&&idOf(state.current)===idOf(s)&&idOf(s);
  var fav=isFavorite(s);
  return '<div class="track '+(active?'current':'')+'" data-track-index="'+index+'"><img src="'+esc(thumbOf(s))+'" alt="" loading="lazy"><div class="track-info"><div class="track-name">'+esc(titleOf(s))+'</div><div class="track-artist">'+esc(artistOf(s))+'</div></div><span class="track-duration">'+esc(s.duration||'')+'</span><div class="track-actions"><button class="mini-btn fav-btn" data-fav="'+index+'" title="'+(fav?'Remove favourite':'Save favourite')+'" aria-label="'+(fav?'Remove favourite':'Save favourite')+'">'+(fav?'♥':'♡')+'</button></div></div>'
}
function renderRows(container,items){
  if(!items||!items.length){container.innerHTML='<div class="empty">No tracks to show yet. Try searching for a song or artist.</div>';return}
  container.innerHTML=items.map(function(s,i){return trackRow(s,i)}).join('');
  container.querySelectorAll('[data-track-index]').forEach(function(el){
    el.addEventListener('click',function(e){
      if(e.target.closest('[data-fav]'))return;
      var i=Number(el.dataset.trackIndex);
      playTrack(items[i]);
    })
  });
  container.querySelectorAll('[data-fav]').forEach(function(b){
    b.addEventListener('click',function(e){
      e.stopPropagation();
      toggleFavorite(items[Number(b.dataset.fav)])
    })
  })
}
function card(s){var item=normalize(s);return '<div class="card" data-card-id="'+esc(item.videoId)+'"><img class="cover" src="'+esc(thumbOf(item))+'" alt="" loading="lazy"><div class="card-title">'+esc(titleOf(item))+'</div><div class="card-sub">'+esc(artistOf(item)||item.resultType||'Explore music')+'</div></div>'}
function bindCards(container,items){container.querySelectorAll('.card').forEach(function(el,i){el.addEventListener('click',function(){if(items[i])playTrack(items[i])})})}

/* ------------------------------------------------------------------
 * SEARCH
 * ------------------------------------------------------------------ */
async function search(){
  var q=$('globalQuery').value.trim();
  if(!q){showToast('Type a song or artist first');return}
  showPage('searchPage');
  var token=++state.searchToken;
  $('searchStatus').textContent='Searching…';
  $('searchResults').innerHTML='';
  try{
    var data=await api('/api/search?q='+encodeURIComponent(q)+'&filter='+encodeURIComponent(state.filter));
    if(token!==state.searchToken)return;
    state.results=(data.results||[]).map(normalize);
    $('searchStatus').textContent=state.results.length+' result(s) for "'+q+'"';
    renderSearchResults()
  }catch(e){
    $('searchStatus').textContent='Search failed: '+e.message;
    $('searchResults').innerHTML='<div class="empty">Could not load results. Check that the Verome server is running, then try again.</div>'
  }
}
function renderSearchResults(){
  var el=$('searchResults'),items=state.results;
  if(!items.length){el.innerHTML='<div class="empty">No results found. Try another search.</div>';return}
  el.innerHTML=items.map(function(s,i){return trackRow(s,i)}).join('');
  el.querySelectorAll('[data-track-index]').forEach(function(row){
    row.addEventListener('click',function(e){
      if(e.target.closest('[data-fav]'))return;
      var i=Number(row.dataset.trackIndex),s=items[i];
      if(s.videoId)playTrack(s);
      else if(s.browseId){showToast('Open this item through a song/video search for playback')}
      else showToast('This result does not have a playable video ID')
    })
  });
  el.querySelectorAll('[data-fav]').forEach(function(b){
    b.addEventListener('click',function(e){
      e.stopPropagation();
      toggleFavorite(items[Number(b.dataset.fav)])
    })
  })
}
$('globalSearchBtn').addEventListener('click',search);
$('globalQuery').addEventListener('keydown',function(e){if(e.key==='Enter')search()});
document.querySelectorAll('[data-filter]').forEach(function(b){
  b.addEventListener('click',function(){
    state.filter=b.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(function(x){x.classList.toggle('active',x===b)});
    if($('globalQuery').value.trim())search()
  })
});

/* ------------------------------------------------------------------
 * DISCOVERY / HOME
 * ------------------------------------------------------------------ */
function pickArray(data,keys){if(Array.isArray(data))return data;for(var i=0;i<keys.length;i++){if(Array.isArray(data&&data[keys[i]]))return data[keys[i]]}return []}

async function loadDiscover(kind){
  document.querySelectorAll('[data-discover]').forEach(function(b){b.classList.toggle('active',b.dataset.discover===kind)});
  $('discoverStatus').textContent='Loading '+kind+'…';
  $('discoverResults').innerHTML='';
  var country=$('countrySelect').value;
  var url=kind==='charts'?'/api/charts?country='+encodeURIComponent(country):kind==='toptracks'?'/api/top/tracks?country='+encodeURIComponent(country)+'&limit=24':kind==='topartists'?'/api/top/artists?country='+encodeURIComponent(country)+'&limit=24':'/api/trending?country='+encodeURIComponent(country==='IN'?'India':country==='US'?'United States':country==='GB'?'United Kingdom':country);
  try{
    var data=await api(url);
    var raw;
    if(kind==='charts'&&Array.isArray(data)){
      raw=data.reduce(function(all,section){return all.concat(Array.isArray(section.items)?section.items:[])},[])
    }else{
      var keys=kind==='topartists'?['artists','results','items']:kind==='toptracks'?['tracks','results','items','songs']:['tracks','songs','results','items','videos'];
      raw=pickArray(data,keys)
    }
    var items=raw.map(function(x){return normalize(x)}).filter(function(x){return x.title!=='Unknown track'});
    if(!items.length){
      $('discoverStatus').textContent='No results returned for this section.';
      $('discoverResults').innerHTML='<div class="empty">Try another discovery category or country.</div>';
      return
    }
    $('discoverStatus').textContent=items.length+' picks · '+kind;
    $('discoverResults').innerHTML=items.map(card).join('');
    bindCards($('discoverResults'),items)
  }catch(e){
    $('discoverStatus').textContent='Discovery could not load: '+e.message;
    $('discoverResults').innerHTML='<div class="empty">The discovery endpoint did not return data. You can still search and play tracks.</div>'
  }
}
document.querySelectorAll('[data-discover]').forEach(function(b){b.addEventListener('click',function(){loadDiscover(b.dataset.discover)})});
$('countrySelect').addEventListener('change',function(){var active=document.querySelector('[data-discover].active');loadDiscover(active?active.dataset.discover:'trending')});

async function loadHome(kind){
  document.querySelectorAll('[data-mood]').forEach(function(b){b.classList.toggle('active',b.dataset.mood===kind)});
  var target=$('homeTracks');
  target.innerHTML='<div class="empty">Finding tracks…</div>';
  var url=kind==='charts'?'/api/charts?country=IN':'/api/trending?country=India';
  if(kind==='radio'){
    var current=state.current;
    if(!current||!current.videoId){target.innerHTML='<div class="empty">Play a track first, then choose Radio to build a mix around it.</div>';return}
    url='/api/radio?videoId='+encodeURIComponent(current.videoId)
  }
  try{
    var data=await api(url);
    var raw;
    if(kind==='charts'&&Array.isArray(data)){
      raw=data.reduce(function(all,section){return all.concat(Array.isArray(section.items)?section.items:[])},[])
    }else{
      raw=pickArray(data,['tracks','songs','results','items','videos'])
    }
    var items=raw.map(normalize).filter(function(x){return x.title!=='Unknown track'}).slice(0,8);
    if(!items.length)throw new Error('No tracks returned');
    target.innerHTML=items.map(card).join('');
    bindCards(target,items)
  }catch(e){
    target.innerHTML='<div class="empty">Discovery is unavailable right now. Use Search to find music.</div>'
  }
}
document.querySelectorAll('[data-mood]').forEach(function(b){b.addEventListener('click',function(){loadHome(b.dataset.mood)})});
$('refreshBtn').addEventListener('click',function(){loadHome('trending');loadDiscover('trending')});

/* ------------------------------------------------------------------
 * LIBRARY
 * ------------------------------------------------------------------ */
function renderLibrary(){renderRows($('libraryResults'),state.library)}
function renderHomeSaved(){var el=$('homeSaved');if(!state.recentTracks.length){el.innerHTML='<div class="empty">Tracks you play will show up here.</div>';return}renderRows(el,state.recentTracks.slice(0,5))}
$('clearLibrary').addEventListener('click',function(){
  if(!state.library.length)return;
  if(confirm('Remove all favourites saved in this browser?')){
    state.library=[];saveLibrary();showToast('Favourites cleared')
  }
});

/* ------------------------------------------------------------------
 * RELATED AUTOPLAY CHAIN
 *
 * Endpoint order:
 *   1. /api/related/:videoId  (primary related-songs endpoint)
 *   2. /api/radio?videoId=    (radio mix fallback)
 *   3. /api/watch_playlist   (legacy radio fallback)
 *   4. /api/search?q=...     (last-resort playable-song fallback)
 *
 * Responses may expose tracks as data, tracks, results, songs, or nested
 * arrays; extractTracks() handles those common shapes.
 * ------------------------------------------------------------------ */
function trimRelatedCache(){
  var keys=Object.keys(state.relatedCache);
  if(keys.length<=30)return;
  keys.sort(function(a,b){return (state.relatedCache[a].ts||0)-(state.relatedCache[b].ts||0)});
  while(keys.length>30){delete state.relatedCache[keys.shift()]}
}

/**
 * Recursively locate a track array inside an unknown API response shape.
 * Returns the first array found for a recognised key at any depth up to 5.
 */
function extractTracks(data, depth){
  depth=depth||0;
  if(depth>5||!data)return [];
  if(Array.isArray(data))return data;
  if(typeof data!=='object')return [];
  var keys=['tracks','songs','results','items','videos','related','contents','entries','playlist','data','continuationContents','musicShelfRenderer','sectionListRenderer','itemSectionRenderer'];
  for(var i=0;i<keys.length;i++){
    var value=data[keys[i]];
    if(Array.isArray(value))return value;
    if(value&&typeof value==='object'){
      var nested=extractTracks(value,depth+1);
      if(nested.length)return nested;
    }
  }
  // Some API responses wrap the result in renderer objects without a standard key.
  var values=Object.keys(data).map(function(k){return data[k]});
  for(var j=0;j<values.length;j++){
    var child=values[j];
    if(child&&typeof child==='object'){
      var found=extractTracks(child,depth+1);
      if(found.length)return found;
    }
  }
  return [];
}

async function fetchRelated(id){
  if(!id)return [];
  var cached=state.relatedCache[id];
  if(cached&&cached.items&&cached.items.length)return cached.items;
  if(state.relatedInflight[id])return state.relatedInflight[id];

  var request=(async function(){
    var current=state.current&&state.current.videoId===id?state.current:null;
    var title=current?titleOf(current):'';
    var artist=current?artistOf(current):'';
    var urls=[
      '/api/related/'+encodeURIComponent(id),
      '/api/radio?videoId='+encodeURIComponent(id),
      '/api/watch_playlist?videoId='+encodeURIComponent(id)+'&radio=true&limit=50'
    ];
    if(title){
      var query=(title+(artist?' '+artist:'')).trim();
      urls.push('/api/search?q='+encodeURIComponent(query)+'&filter=songs');
    }

    for(var i=0;i<urls.length;i++){
      try{
        var data=await api(urls[i]);
        var raw=extractTracks(data);
        var seen={},items=[];
        if(!raw.length)console.warn('Related endpoint returned no track array:',urls[i],data);
        raw.forEach(function(track){
          if(!track||typeof track!=='object')return;
          var videoId=idOf(track);
          if(!videoId||videoId===id||seen[videoId])return;
          var item=normalize(track);
          item.videoId=videoId;
          if(titleOf(item)==='Unknown track')return;
          // Keep fallbackVideoId available for APIs that expose it separately.
          if(!item.videoId&&track.fallbackVideoId)item.videoId=track.fallbackVideoId;
          seen[videoId]=true;
          items.push(item);
        });
        if(items.length){
          state.relatedCache[id]={items:items,ts:Date.now()};
          trimRelatedCache();
          return items;
        }
      }catch(err){
        console.warn('Related request failed:',urls[i],err);
      }
    }
    console.warn('No playable related tracks for video:',id);
    return [];
  })();

  state.relatedInflight[id]=request;
  try{
    return await request;
  }finally{
    delete state.relatedInflight[id];
  }
}
function markRecent(id,track){
  if(!id)return;
  var idx=state.recentIds.indexOf(id);
  if(idx>=0)state.recentIds.splice(idx,1);
  state.recentIds.unshift(id);
  if(state.recentIds.length>10)state.recentIds.length=10;
  if(track){state.recentTracks=state.recentTracks.filter(function(x){return idOf(x)!==id});state.recentTracks.unshift(normalize(track));if(state.recentTracks.length>10)state.recentTracks.length=10;renderHomeSaved()}
}
function pickFirstValid(items,excludeId){
  for(var i=0;i<items.length;i++){
    var it=items[i];var vid=idOf(it);
    if(!vid)continue;
    if(vid===excludeId)continue;
    if(state.failedIds[vid])continue;
    if(state.recentIds.indexOf(vid)>=0)continue;
    return it;
  }
  // Relaxed fallback: never stall on a tiny related list.
  for(var j=0;j<items.length;j++){
    var it2=items[j];var vid2=idOf(it2);
    if(!vid2)continue;
    if(vid2===excludeId)continue;
    if(state.failedIds[vid2])continue;
    return it2;
  }
  return null;
}
function prefetchRelated(id){
  var myToken=++state.relatedToken;
  state.pendingRelated=null;
  if(!id)return;
  fetchRelated(id).then(function(items){
    if(myToken!==state.relatedToken)return;
    var pick=pickFirstValid(items,id);
    if(myToken!==state.relatedToken)return;
    state.pendingRelated=pick;
  }).catch(function(){});
}

/* ------------------------------------------------------------------
 * PLAYBACK
 * ------------------------------------------------------------------ */
function setPlayIcon(on){var icon=$('playIcon');if(icon)icon.src=on?ICONS.pause:ICONS.play;state.playing=on}
function updatePlayerFavorite(){
  var cur=state.current;
  var fav=cur&&isFavorite(cur);
  $('playerFav').textContent=fav?'♥':'♡';
  $('playerFav').style.color=fav?'var(--accent)':'var(--muted)'
}
function syncLyricsForm(){if(!state.current)return;$('lyricTitle').value=titleOf(state.current);$('lyricArtist').value=artistOf(state.current)}

function pushHistory(track){
  if(!track)return;
  var last=state.history[state.history.length-1];
  if(last&&idOf(last)===idOf(track))return;
  state.history.push(track);
  if(state.history.length>50)state.history.shift();
}

/**
 * Manual selection from search / discover / library.
 * Resolves a videoId if needed, records history, then delegates to startPlayback.
 */
async function playTrack(s){
  var item=normalize(s);
  if(!item.videoId){
    try{
      var data=await api('/api/yt_search?q='+encodeURIComponent(titleOf(item)+' '+artistOf(item)+' official')+'&filter=videos');
      var list=pickArray(data,['results','items']);
      var video=list.find(function(x){return x.id||x.videoId});
      var id=video&&(video.id||video.videoId);
      if(!id){showToast('Could not find a playable video for this track');return}
      item.videoId=id;
    }catch(e){
      showToast('Could not find a playable video');return
    }
  }
  if(state.current&&idOf(state.current)!==idOf(item))pushHistory(state.current);
  startPlayback(item);
}

/**
 * Low-level: begin playback of a track that already has a videoId.
 * Fires the background prefetch for the related chain.
 */
function startPlayback(item){
  if(!item||!item.videoId){showToast('No playable video ID');return}
  state.current=item;
  markRecent(item.videoId,item);
  $('playerTitle').textContent=titleOf(item);
  $('playerArtist').textContent=artistOf(item)||'Verome';
  $('playerCover').src=thumbOf(item);
  $('playerArt').src=thumbOf(item);
  updatePlayerFavorite();
  syncLyricsForm();
  prefetchRelated(item.videoId);
  if(!state.yt||!state.ready)return;
  state.yt.loadVideoById(item.videoId);
  state.playing=true;
  setPlayIcon(true);
}

function next(){
  if(nextBusy)return;
  nextBusy=true;
  try{
    if(!state.current)return;
    if(state.repeat){
      if(state.yt&&state.ready){try{state.yt.seekTo(0,true);state.yt.playVideo()}catch(_){}}
      return
    }
    if(state.shuffle){
      var pool=(state.results||[]).concat(state.library||[]).filter(function(x){return idOf(x)&&idOf(x)!==idOf(state.current)});
      if(pool.length){startPlayback(pool[Math.floor(Math.random()*pool.length)]);return}
    }
    if(state.pendingRelated){
      var t=state.pendingRelated;
      state.pendingRelated=null;
      startPlayback(t);
      return
    }
    fetchAndPlayNext();
  }finally{
    nextBusy=false
  }
}

async function fetchAndPlayNext(){
  var cur=state.current;
  if(!cur)return;
  var myToken=++state.relatedToken;
  var items=await fetchRelated(cur.videoId);
  if(myToken!==state.relatedToken)return;
  var pick=pickFirstValid(items,cur.videoId);
  if(pick){
    state.consecutiveErrors=0;
    startPlayback(pick);
    return
  }
  state.consecutiveErrors=(state.consecutiveErrors||0)+1;
  if(state.consecutiveErrors>4){
    showToast('Playback stopped — no related tracks available');
    state.playing=false;
    setPlayIcon(false);
    if(state.yt&&state.ready){try{state.yt.stopVideo()}catch(_){}}
  }else{
    showToast('No related tracks found');
  }
}

function previous(){
  if(state.yt&&state.ready&&state.yt.getCurrentTime&&state.yt.getCurrentTime()>3){
    state.yt.seekTo(0,true);
    return
  }
  if(state.history.length){
    var prev=state.history.pop();
    if(!prev.videoId)return;
    startPlayback(prev);
    return
  }
  if(state.current&&state.yt&&state.ready){
    state.yt.seekTo(0,true)
  }
}

/* ------------------------------------------------------------------
 * PLAYER WIRING
 * ------------------------------------------------------------------ */
$('playBtn').addEventListener('click',function(){
  if(!state.yt||!state.ready){
    showToast('Player is starting — try again in a moment');
    return
  }
  if(state.playing)state.yt.pauseVideo();
  else if(state.current)state.yt.playVideo();
  else showToast('Search for a track to start listening')
});
$('nextBtn').addEventListener('click',function(){next()});
$('prevBtn').addEventListener('click',previous);
$('repeatBtn').addEventListener('click',function(){
  state.repeat=!state.repeat;
  $('repeatBtn').style.color=state.repeat?'var(--accent)':'var(--muted)';
  $('repeatBtn').setAttribute('aria-pressed',String(state.repeat));
  showToast(state.repeat?'Repeat current track on':'Repeat off')
});
$('shuffleBtn').addEventListener('click',function(){state.shuffle=!state.shuffle;this.style.color=state.shuffle?'var(--accent)':'var(--muted)';this.setAttribute('aria-pressed',String(state.shuffle));this.title=state.shuffle?'Shuffle on':'Shuffle off';showToast(state.shuffle?'Shuffle on':'Shuffle off')});
function setPlayerExpanded(open){$('musicPlayer').classList.toggle('expanded',open);$('playerBackdrop').classList.toggle('show',open);$('openPlayer').setAttribute('aria-expanded',String(open));}
$('openPlayer').addEventListener('click',function(){setPlayerExpanded(true)});
$('playerCover').addEventListener('click',function(){if(window.matchMedia('(max-width: 560px)').matches)setPlayerExpanded(true)});
$('playerTitle').addEventListener('click',function(){if(window.matchMedia('(max-width: 560px)').matches)setPlayerExpanded(true)});
$('closePlayer').addEventListener('click',function(){setPlayerExpanded(false)});
$('playerBackdrop').addEventListener('click',function(){setPlayerExpanded(false)});
document.addEventListener('keydown',function(e){if(e.key==='Escape')setPlayerExpanded(false)});
$('playerFav').addEventListener('click',function(){
  if(state.current)toggleFavorite(state.current);
  else showToast('Play a track first')
});

function fmt(n){n=Math.max(0,Math.floor(n||0));return Math.floor(n/60)+':'+String(n%60).padStart(2,'0')}
function updateProgress(){
  if(!state.yt||!state.ready)return;
  try{
    var cur=state.yt.getCurrentTime()||0,dur=state.yt.getDuration()||0;
    $('currentTime').textContent=fmt(cur);
    $('duration').textContent=fmt(dur);
    $('progressFill').style.width=dur?Math.min(100,cur/dur*100)+'%':'0%'
  }catch(_){}
}
$('progress').addEventListener('click',function(e){
  if(!state.yt||!state.ready)return;
  var r=this.getBoundingClientRect(),pct=Math.max(0,Math.min(1,(e.clientX-r.left)/r.width));
  state.yt.seekTo(pct*(state.yt.getDuration()||0),true)
});
$('progress').addEventListener('keydown',function(e){
  if((e.key==='ArrowRight'||e.key==='ArrowLeft')&&state.yt&&state.ready){
    e.preventDefault();
    var c=state.yt.getCurrentTime()||0;
    state.yt.seekTo(c+(e.key==='ArrowRight'?5:-5),true)
  }
});


/* ------------------------------------------------------------------
 * YOUTUBE IFRAME
 * ------------------------------------------------------------------ */
window.onYouTubeIframeAPIReady=function(){
  state.yt=new YT.Player('ytplayer',{
    height:'1',width:'1',host:'https://www.youtube-nocookie.com',
    playerVars:{autoplay:0,controls:0,disablekb:1,fs:0,modestbranding:1,rel:0},
    events:{
      onReady:function(){
        state.ready=true;
        state.yt.setVolume(75);
        if(state.current&&state.current.videoId){
          state.yt.loadVideoById(state.current.videoId);
          state.playing=true;
          setPlayIcon(true);
          prefetchRelated(state.current.videoId)
        }
      },
      onStateChange:function(e){
        if(e.data===1){
          state.consecutiveErrors=0;
          setPlayIcon(true);
          if(state.progressTimer)clearInterval(state.progressTimer);
          state.progressTimer=setInterval(updateProgress,500)
        }else if(e.data===2){
          setPlayIcon(false);
          if(state.progressTimer)clearInterval(state.progressTimer)
        }else if(e.data===0){
          setPlayIcon(false);
          if(state.progressTimer)clearInterval(state.progressTimer);
          updateProgress();
          next()
        }
      },
      onError:function(){
        var cur=state.current;
        var cid=cur?idOf(cur):'';
        if(cid)state.failedIds[cid]=true;
        state.consecutiveErrors=(state.consecutiveErrors||0)+1;
        if(state.consecutiveErrors>4){
          showToast('Playback keeps failing — stopped');
          setPlayIcon(false);
          return
        }
        showToast('This video cannot play here. Trying the next track…');
        var erroredId=cid;
        setTimeout(function(){
          if(idOf(state.current||{})!==erroredId)return;
          next()
        },700)
      }
    }
  })
};
var ytTag=document.createElement('script');
ytTag.src='https://www.youtube.com/iframe_api';
document.head.appendChild(ytTag);

/* ------------------------------------------------------------------
 * LYRICS
 * ------------------------------------------------------------------ */
async function loadLyricsForCurrent(){
  if(!state.current){showToast('Play a track first');return}
  syncLyricsForm();
  await loadLyrics()
}
async function loadLyrics(){
  var title=$('lyricTitle').value.trim(),artist=$('lyricArtist').value.trim();
  if(!title||!artist){$('lyricsStatus').textContent='Enter both a song title and artist.';return}
  showPage('lyricsPage');
  $('lyricsStatus').textContent='Searching lyrics…';
  $('lyricsText').textContent='';
  try{
    var data=await api('/api/lyrics?title='+encodeURIComponent(title)+'&artist='+encodeURIComponent(artist));
    if(!data.success){throw new Error(data.error||'Lyrics not found')}
    var text=data.plainLyrics||data.syncedLyrics||'';
    if(!text)throw new Error('No lyrics were returned for this track');
    $('lyricsStatus').textContent=(data.trackName||title)+' — '+(data.artistName||artist)+(data.syncedLyrics?' · synced lyrics available':'');
    $('lyricsText').textContent=text.replace(/\\r/g,'')
  }catch(e){
    $('lyricsStatus').textContent=e.message;
    $('lyricsText').textContent='Lyrics could not be found. Try checking the song title and artist spelling.'
  }
}
$('lyricsBtn').addEventListener('click',loadLyrics);
$('lyricTitle').addEventListener('keydown',function(e){if(e.key==='Enter')loadLyrics()});
$('lyricArtist').addEventListener('keydown',function(e){if(e.key==='Enter')loadLyrics()});
$('loadCurrentLyrics').addEventListener('click',loadLyricsForCurrent);
$('lyricsQuick').addEventListener('click',function(){showPage('lyricsPage');loadLyricsForCurrent()});

/* ------------------------------------------------------------------
 * BOOT
 * ------------------------------------------------------------------ */
renderLibrary();
renderHomeSaved();
updatePlayerFavorite();
loadHome('trending');
})();
</script>
</body>
</html>`;
