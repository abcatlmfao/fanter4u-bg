// ===== MAIN.JS - FANTER v0.3 =====
window.gamesData = [];
window.gameEarnings = JSON.parse(localStorage.getItem('gameEarnings') || '{}');
window.gamePlayCounts = JSON.parse(localStorage.getItem('gamePlayCounts') || '{}');

// ===== BIN CONFIG =====
const GAMES_BIN_ID = "69e4616f856a6821894c5ef5", REVIEWS_BIN_ID = "69e4369d856a6821894bd849", RATINGS_BIN_ID = "69e045ec856a6821893bc134";
const BIN_API_KEY = "$2a$10$2cPmKAGNYxPTRLV03OfVruvfhNpW/VHtJSzR.AVNHumZ7etLdT33.";
var globalRatings = {}, globalReviews = {}, userVotes = JSON.parse(localStorage.getItem('userVotes') || '{}');

// ===== SYNC GAMES TO BIN =====
async function syncGamesToBin(data) {
  if (!data?.length) return;
  try {
    await fetch(`https://api.jsonbin.io/v3/b/${GAMES_BIN_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Master-Key': BIN_API_KEY }, body: JSON.stringify({ games: data.map(g => ({ name: g.name, desc: g.desc || getDefaultDescription(g.category), category: g.category, url: g.url })), lastUpdated: new Date().toISOString() }) });
    console.log('✅ Games synced');
  } catch (e) { console.error('Sync failed:', e); }
}

// ===== REVIEWS =====
async function loadGlobalReviews() { try { var r = await fetch(`https://api.jsonbin.io/v3/b/${REVIEWS_BIN_ID}/latest`, { headers: { 'X-Master-Key': BIN_API_KEY } }), d = await r.json(); if (d.record?.reviews) globalReviews = d.record.reviews; } catch (e) {} }
async function saveGlobalReviews() { try { await fetch(`https://api.jsonbin.io/v3/b/${REVIEWS_BIN_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Master-Key': BIN_API_KEY }, body: JSON.stringify({ reviews: globalReviews }) }); } catch (e) {} }
async function submitGameReview(game, user, text, rating) {
  if (!globalReviews[game]) globalReviews[game] = [];
  var rev = { username: user, text, rating, date: new Date().toLocaleDateString(), timestamp: Date.now() }, idx = globalReviews[game].findIndex(r => r.username === user);
  if (idx !== -1) globalReviews[game][idx] = rev; else globalReviews[game].push(rev);
  await saveGlobalReviews();
  var local = JSON.parse(localStorage.getItem('gameReviews_' + game) || '[]'), lIdx = local.findIndex(r => r.username === user);
  if (lIdx !== -1) local[lIdx] = rev; else local.push(rev);
  localStorage.setItem('gameReviews_' + game, JSON.stringify(local));
}
async function deleteGameReview(game, user) {
  if (!globalReviews[game]) return;
  globalReviews[game] = globalReviews[game].filter(r => r.username !== user); await saveGlobalReviews();
  var local = JSON.parse(localStorage.getItem('gameReviews_' + game) || '[]').filter(r => r.username !== user);
  localStorage.setItem('gameReviews_' + game, JSON.stringify(local));
}
function getGameReviews(game) {
  var revs = globalReviews[game] ? [...globalReviews[game]] : [], local = JSON.parse(localStorage.getItem('gameReviews_' + game) || '[]');
  local.forEach(r => { if (!revs.find(x => x.username === r.username && x.timestamp === r.timestamp)) revs.push(r); });
  return revs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}

// ===== RATINGS =====
async function loadGlobalRatings() { try { var r = await fetch(`https://api.jsonbin.io/v3/b/${RATINGS_BIN_ID}/latest`, { headers: { 'X-Master-Key': BIN_API_KEY } }), d = await r.json(); if (d.record?.ratings) globalRatings = d.record.ratings; if (window.updateStarDisplays) window.updateStarDisplays(); } catch (e) {} }
async function saveGlobalRatings() { try { await fetch(`https://api.jsonbin.io/v3/b/${RATINGS_BIN_ID}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Master-Key': BIN_API_KEY }, body: JSON.stringify({ ratings: globalRatings }) }); } catch (e) {} }
function submitRating(game, rating) {
  if (!globalRatings[game]) globalRatings[game] = { total: 0, count: 0, average: 0 };
  var user = getCurrentUser();
  if (user) { user.stats = user.stats || { ratingsGiven: 0 }; user.stats.ratingsGiven++; localStorage.setItem('fanter_currentUser', JSON.stringify(user)); }
  if (userVotes[game]) { globalRatings[game].total -= userVotes[game]; globalRatings[game].count--; }
  globalRatings[game].total += rating; globalRatings[game].count++; globalRatings[game].average = globalRatings[game].total / globalRatings[game].count;
  userVotes[game] = rating; localStorage.setItem('userVotes', JSON.stringify(userVotes));
  saveGlobalRatings(); showToast('You rated "' + game + '" ' + rating + '★!');
}

// ===== HELPERS =====
function getCategoryColor(c) { return { action: '#ff4444', puzzle: '#44ff44', racing: '#ff8844', sports: '#44ff88', adventure: '#44aaff', platformer: '#ff44ff', strategy: '#88ff44', horror: '#aa44ff', arcade: '#ff44aa', simulation: '#44ffcc', sandbox: '#ff8844', multiplayer: '#ffaa44' }[c] || '#aaaaaa'; }
function getCategoryIcon(c) { return { action: '⚔️', puzzle: '🧩', racing: '🏎️', sports: '⚽', adventure: '🗺️', platformer: '🏃', strategy: '♟️', horror: '👻', arcade: '🕹️', simulation: '🏭', sandbox: '🎨', multiplayer: '👥' }[c] || '🎮'; }
function getDefaultDescription(c) { return { action: 'fast-paced action', puzzle: 'challenge your brain', racing: 'high-speed racing', sports: 'competitive sports', adventure: 'epic adventure', platformer: 'jump and run', strategy: 'plan and outsmart', horror: 'survive the terror', arcade: 'classic arcade', simulation: 'build and manage', sandbox: 'create and explore' }[c] || 'fun game'; }
function escapeHtml(s) { return s?.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[m]) || ''; }
function showToast(m) { var t = document.querySelector('.rating-toast') || (t = document.createElement('div'), t.className = 'rating-toast', document.body.appendChild(t)); t.textContent = m; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2000); }
function getCurrentUser() { return JSON.parse(localStorage.getItem('fanter_currentUser') || 'null'); }
function updateHeaderCoins() { var u = getCurrentUser(), e = document.getElementById('headerCoinAmount'); if (e && u) e.textContent = Math.floor((u.coins || 0) * 100) / 100; }
function getActiveCoinMultiplier() { return { chinchilla: 1, dragon: 1.5, cat: 1.2, dog: 1.2, owl: 1.3, fox: 1.4 }[localStorage.getItem('equippedPet')] || 1; }

// ===== ACCOUNT =====
function updateUserInStorage(u) { localStorage.setItem('fanter_currentUser', JSON.stringify(u)); var users = JSON.parse(localStorage.getItem('fanter_users') || '[]'), i = users.findIndex(x => x.id === u.id); if (i !== -1) { users[i] = u; localStorage.setItem('fanter_users', JSON.stringify(users)); } }
function syncFavoriteToAccount(game, add) { var u = getCurrentUser(); if (!u) return; u.favorites = u.favorites || []; u.favorites = add ? [...new Set([...u.favorites, game])] : u.favorites.filter(f => f !== game); u.stats.favoritesCount = u.favorites.length; updateUserInStorage(u); localStorage.setItem('favourites', JSON.stringify(u.favorites)); }
function trackPlayedGame(game) { var u = getCurrentUser(), earned = 0.05 * getActiveCoinMultiplier(); window.gameEarnings[game] = (window.gameEarnings[game] || 0) + earned; window.gamePlayCounts[game] = (window.gamePlayCounts[game] || 0) + 1; localStorage.setItem('gameEarnings', JSON.stringify(window.gameEarnings)); localStorage.setItem('gamePlayCounts', JSON.stringify(window.gamePlayCounts)); if (u) { u.coins = (u.coins || 0) + earned; u.playedGames = [game, ...(u.playedGames || []).filter(g => g !== game)].slice(0, 50); u.stats.gamesPlayed = u.playedGames.length; updateUserInStorage(u); } updateHeaderCoins(); return earned; }

// ===== DOM READY =====
document.addEventListener('DOMContentLoaded', function() {
  var sitename = "fanter beta.", subtext = "v0.3, achievements added, shop, pets, and more! :3", serverUrl1 = "https://gms.parcoil.com";
  document.title = document.title + " | " + sitename;
  document.getElementById("title").innerHTML = sitename;
  document.getElementById("subtitle").innerHTML = subtext;

  function getFavourites() { return JSON.parse(localStorage.getItem("favourites") || "[]"); }

  window.toggleFavourite = function(game) {
    var favs = getFavourites(), isAdding = !favs.includes(game);
    favs = isAdding ? [...favs, game] : favs.filter(f => f !== game);
    localStorage.setItem("favourites", JSON.stringify(favs));
    var btn = document.querySelector('.game-fav-btn[data-game="' + game.replace(/['"]/g, '\\"') + '"]');
    if (btn) { btn.textContent = isAdding ? "★" : "☆"; btn.classList.toggle('active', isAdding); }
    syncFavoriteToAccount(game, isAdding);
    if (typeof checkAchievements === 'function') setTimeout(checkAchievements, 100);
  };

  window.displayFilteredGames = function(games) {
    var container = document.getElementById("gamesContainer");
    if (!container) return;
    container.innerHTML = "";
    if (!games?.length) { container.innerHTML = '<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.5);">no games found 😔</div>'; return; }
    var favs = getFavourites();
    games.forEach(g => {
      var earned = window.gameEarnings[g.name] || 0, plays = window.gamePlayCounts[g.name] || 0, isFav = favs.includes(g.name);
      var avg = (globalRatings[g.name] ? globalRatings[g.name].average.toFixed(1) : '0.0');
      var img = g.image?.startsWith('http') ? g.image : (g.image ? serverUrl1 + "/" + g.url + "/" + g.image : 'https://via.placeholder.com/200x113?text=No+Image');
      var color = getCategoryColor(g.category), icon = getCategoryIcon(g.category), short = g.name.length > 18 ? g.name.substring(0, 16) + '...' : g.name;
      var div = document.createElement("div"); div.className = "game"; div.setAttribute("data-game-name", g.name);
      div.innerHTML = `<div class="game-image-container"><img src="${img}" alt="${escapeHtml(g.name)}" loading="lazy"></div><div class="game-info"><div class="game-title-row"><span class="game-name" title="${escapeHtml(g.name)}">${escapeHtml(short)}</span><button class="game-fav-btn ${isFav ? 'active' : ''}" data-game="${escapeHtml(g.name)}">${isFav ? '★' : '☆'}</button></div><div class="game-category-tag" style="background:${color}20;color:${color}">${icon} ${g.category||'other'}</div><div class="game-stats-row"><span>🎮 ${plays}</span><span>🪙 ${Math.floor(earned*100)/100}</span><span>⏱️ ${g.loadTime||'1-3s'}</span></div><div class="game-rating-row"><div class="game-stars">${[1,2,3,4,5].map(s=>'<span class="game-star" data-value="'+s+'">★</span>').join('')}</div><span class="game-rating-text">${avg}</span></div><button class="game-play-btn" data-game="${escapeHtml(g.name)}" data-url="${escapeHtml(g.url)}">▶ play</button></div>`;
      container.appendChild(div);
    });
    attachGameCardEvents(); updateStarDisplays();
  };

  function updateStarDisplays() {
    document.querySelectorAll('.game').forEach(c => {
      var n = c.getAttribute('data-game-name'), r = userVotes[n] || 0;
      c.querySelectorAll('.game-star').forEach((s, i) => s.classList.toggle('active', i < r));
      var t = c.querySelector('.game-rating-text');
      if (t && globalRatings[n]) t.textContent = globalRatings[n].average.toFixed(1);
    });
  }
  window.updateStarDisplays = updateStarDisplays;

  function attachGameCardEvents() {
    document.querySelectorAll('.game-play-btn').forEach(b => b.onclick = e => { e.stopPropagation(); var n = b.dataset.game, u = b.dataset.url; if (n && u) { trackPlayedGame(n); if (typeof trackGamePlayCount === 'function') trackGamePlayCount(n); window.open('play.html?gameurl=' + encodeURIComponent(u) + '&game=' + encodeURIComponent(n), '_blank'); } });
    document.querySelectorAll('.game-fav-btn').forEach(b => b.onclick = e => { e.stopPropagation(); var n = b.dataset.game; if (n) { window.toggleFavourite(n); var f = JSON.parse(localStorage.getItem("favourites")||"[]").includes(n); b.textContent = f ? '★' : '☆'; b.classList.toggle('active', f); } });
    document.querySelectorAll('.game-star').forEach(s => s.onclick = e => { e.stopPropagation(); var c = s.closest('.game'), n = c.dataset.gameName, v = parseInt(s.dataset.value); if (n) { submitRating(n, v); c.querySelectorAll('.game-star').forEach((st, i) => st.classList.toggle('active', i < v)); var t = c.querySelector('.game-rating-text'); if (t && globalRatings[n]) t.innerHTML = globalRatings[n].average.toFixed(1); } });
    document.querySelectorAll('.game').forEach(c => c.onclick = e => { if (e.target.tagName === 'BUTTON' || e.target.classList.contains('game-star')) return; var n = c.dataset.gameName, g = window.gamesData?.find(g => g.name === n); if (g) { var img = c.querySelector('.game-image-container img'); showGameDetailsModal(g.name, g.url, img?.src||'', g.desc||getDefaultDescription(g.category), g.category, g.loadTime, g.developer, g.releaseDate); } });
  }

  function handleSearchInput() {
    var v = document.getElementById("searchInput")?.value.toLowerCase() || '', favOn = localStorage.getItem("favFilter") === "true", favs = getFavourites();
    var filtered = window.gamesData.filter(g => (favOn ? favs.includes(g.name) : true) && g.name.toLowerCase().includes(v));
    window.displayFilteredGames(filtered);
  }

  window.toggleFavFilter = function() { var c = localStorage.getItem("favFilter") === "true"; localStorage.setItem("favFilter", !c); handleSearchInput(); var b = document.getElementById("favToggleBtn"); if (b) b.textContent = !c ? "show: on ✅" : "show: off ❌"; };
  window.toggleFavSidebar = function() { var b = document.getElementById("favSidebarBtn"); if (!b) return; var o = localStorage.getItem("favFilter") === "true"; b.classList.toggle("active", !o); b.classList.toggle("visible", !o); b.textContent = !o ? "✕" : "★"; };

  fetch("./config/games.json").then(r => r.json()).then(d => {
    window.gamesData = d; handleSearchInput();
    console.log("✅ Loaded " + d.length + " games!");
    var last = localStorage.getItem('lastGamesBinSync'), today = new Date().toDateString();
    if (last !== today) { syncGamesToBin(d); localStorage.setItem('lastGamesBinSync', today); } else console.log('⏭️ Games already synced today');
    if (typeof updateGameOfDay === 'function') updateGameOfDay();
    if (typeof loadUserFavorites === 'function') loadUserFavorites();
  }).catch(e => console.error("Error fetching games:", e));

  document.getElementById("searchInput")?.addEventListener("input", handleSearchInput);
  setInterval(updateHeaderCoins, 1000); updateHeaderCoins();
});

function showGameDetailsModal(n, u, img, desc, cat, load, dev, rel) {
  var old = document.getElementById('gameModal'); if (old) old.remove();
  var plays = window.gamePlayCounts[n] || 0, earned = window.gameEarnings[n] || 0, isFav = JSON.parse(localStorage.getItem("favourites")||"[]").includes(n);
  var ur = (typeof userVotes !== 'undefined' && userVotes[n]) || 0, avg = '0.0', cnt = 0;
  if (globalRatings[n]) { avg = globalRatings[n].average.toFixed(1); cnt = globalRatings[n].count; }
  var hrs = Math.floor(plays * 0.5), color = getCategoryColor(cat), icon = getCategoryIcon(cat), revs = getGameReviews(n), user = getCurrentUser(), hasRev = revs.some(r => r.username === user?.username);
  var modal = document.createElement('div'); modal.id = 'gameModal'; modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);z-index:20000;display:flex;align-items:center;justify-content:center;';
  modal.innerHTML = '<div style="background:linear-gradient(135deg,#1a1a2e,#0f0f2a);border-radius:20px;max-width:900px;width:90%;max-height:85vh;overflow-y:auto;position:relative;"><button onclick="this.closest(\'#gameModal\').remove()" style="position:absolute;top:15px;right:15px;background:rgba(0,0,0,0.5);border:none;border-radius:50%;width:35px;height:35px;font-size:20px;cursor:pointer;color:white;z-index:10;">✕</button><div style="position:relative;height:200px;overflow:hidden;"><img src="' + img + '" alt="' + escapeHtml(n) + '" style="width:100%;height:100%;object-fit:cover;filter:brightness(0.7);"><div style="position:absolute;bottom:0;left:0;right:0;padding:20px;background:linear-gradient(transparent,rgba(0,0,0,0.9));"><div style="font-size:28px;font-weight:bold;color:white;font-family:Orbitron">' + escapeHtml(n) + '</div><div style="display:inline-block;font-size:12px;padding:4px 12px;border-radius:20px;margin-top:10px;background:' + color + '20;color:' + color + '">' + icon + ' ' + (cat||'other') + '</div></div></div><div style="display:flex;gap:5px;padding:15px 20px 0;border-bottom:1px solid rgba(255,255,255,0.1);"><button class="modal-tab active" data-tab="details" style="background:none;border:none;color:white;padding:10px 20px;cursor:pointer;font-size:14px;border-bottom:2px solid #ffcc00;">📋 details</button><button class="modal-tab" data-tab="reviews" style="background:none;border:none;color:rgba(255,255,255,0.5);padding:10px 20px;cursor:pointer;font-size:14px;border-bottom:2px solid transparent;">💬 reviews (' + revs.length + ')</button></div><div id="modalTab-details" class="modal-tab-content" style="display:block;"><div style="display:flex;flex-wrap:wrap;padding:20px;gap:20px;"><div style="width:200px;"><div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:15px;text-align:center;margin-bottom:15px;"><div style="font-size:11px;color:rgba(255,255,255,0.5);">TIME PLAYED</div><div style="font-size:28px;font-weight:bold;color:#00ff88;">' + hrs + 'h</div></div><div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:15px;"><div style="display:flex;justify-content:space-between;padding:8px 0;"><span>🎮 PLAYS</span><span style="color:#ffcc00;">' + plays + '</span></div><div style="display:flex;justify-content:space-between;padding:8px 0;"><span>🪙 EARNED</span><span style="color:#ffcc00;">' + Math.floor(earned*100)/100 + '</span></div><div style="display:flex;justify-content:space-between;padding:8px 0;"><span>⭐ RATING</span><span style="color:#ffcc00;">' + avg + '/5 (' + cnt + ')</span></div><div style="display:flex;justify-content:space-between;padding:8px 0;"><span>⏱️ LOAD</span><span style="color:#ffcc00;">' + (load||'1-3s') + '</span></div>' + (dev?'<div style="display:flex;justify-content:space-between;padding:8px 0;"><span>👨‍💻 DEV</span><span style="color:#ffcc00;">' + escapeHtml(dev) + '</span></div>':'') + '</div></div><div style="flex:1;"><div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:15px;margin-bottom:15px;"><p>' + escapeHtml(desc) + '</p></div><div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:15px;margin-bottom:15px;"><div style="display:flex;gap:5px;">' + [1,2,3,4,5].map(s=>'<span class="modal-star" data-value="' + s + '" style="font-size:24px;cursor:pointer;color:' + (ur>=s?'#ffcc00':'rgba(255,255,255,0.2)') + ';">★</span>').join('') + '</div><div style="font-size:11px;color:rgba(255,255,255,0.5);margin-top:5px;">your rating: ' + (ur>0?'★'.repeat(ur)+'☆'.repeat(5-ur):'not rated') + '</div></div><div style="display:flex;gap:15px;"><button id="modalPlayBtn" style="flex:1;background:linear-gradient(135deg,#2d5ae3,#1a3a8a);border:none;border-radius:30px;padding:12px;color:white;font-weight:bold;cursor:pointer;">🎮 PLAY NOW</button><button id="modalFavBtn" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);border-radius:30px;padding:12px 20px;color:white;cursor:pointer;">' + (isFav?'★ FAVORITED':'☆ FAVORITE') + '</button></div></div></div></div><div id="modalTab-reviews" class="modal-tab-content" style="display:none;padding:20px;">' + (user&&user.username!=='Guest'&&!hasRev?'<div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:15px;margin-bottom:20px;"><div style="color:white;margin-bottom:10px;">write a review</div><textarea id="reviewText" placeholder="share your thoughts..." style="width:100%;padding:12px;border-radius:10px;border:1px solid rgba(45,90,227,0.4);background:rgba(0,0,0,0.3);color:white;resize:vertical;min-height:80px;margin-bottom:10px;"></textarea><div style="display:flex;gap:10px;align-items:center;"><div id="reviewStars" style="display:flex;gap:5px;">' + [1,2,3,4,5].map(s=>'<span class="review-star" data-value="' + s + '" style="font-size:20px;cursor:pointer;color:rgba(255,255,255,0.2);">★</span>').join('') + '</div><button id="submitReviewBtn" style="background:linear-gradient(135deg,#2d5ae3,#1a3a8a);border:none;border-radius:20px;padding:8px 20px;color:white;margin-left:8px;cursor:pointer;">post</button></div></div>':(user&&user.username!=='Guest'?'<div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:20px;text-align:center;margin-bottom:20px;"><p style="color:rgba(255,255,255,0.5);">you\'ve already reviewed</p><button id="deleteReviewBtn" style="background:rgba(220,50,50,0.2);border:1px solid rgba(220,50,50,0.5);border-radius:20px;padding:8px 20px;color:#ff6666;margin-top:10px;cursor:pointer;">delete</button></div>':'<div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:20px;text-align:center;margin-bottom:20px;"><p style="color:rgba(255,255,255,0.5);">log in to review</p></div>') + '<div id="reviewsList">' + (revs.length?revs.map(r=>'<div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:15px;margin-bottom:10px;border-left:3px solid ' + (r.rating>=4?'#00ff88':r.rating>=2?'#ffcc00':'#ff4444') + ';"><div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><div style="width:30px;height:30px;background:linear-gradient(135deg,#2d5ae3,#ffcc00);border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:bold;">' + r.username[0].toUpperCase() + '</div><div><div style="font-weight:bold;color:white;">' + escapeHtml(r.username) + '</div><div style="font-size:10px;color:rgba(255,255,255,0.4);">' + r.date + '</div></div><div style="margin-left:auto;color:#ffcc00;">' + '★'.repeat(r.rating) + '☆'.repeat(5-r.rating) + '</div></div><div style="padding-left:40px;color:rgba(255,255,255,0.8);">' + escapeHtml(r.text) + '</div></div>').join(''):'<div style="text-align:center;padding:40px;color:rgba(255,255,255,0.5);"><div style="font-size:48px;">💬</div>no reviews yet</div>') + '</div></div></div>';
  document.body.appendChild(modal);
  
  modal.querySelectorAll('.modal-tab').forEach(t => t.onclick = () => { modal.querySelectorAll('.modal-tab').forEach(x => { x.style.color = 'rgba(255,255,255,0.5)'; x.style.borderBottom = '2px solid transparent'; }); t.style.color = 'white'; t.style.borderBottom = '2px solid #ffcc00'; modal.querySelectorAll('.modal-tab-content').forEach(c => c.style.display = 'none'); document.getElementById('modalTab-' + t.dataset.tab).style.display = 'block'; });
  
  var sel = 0; modal.querySelectorAll('.review-star').forEach(s => { s.onmouseenter = () => modal.querySelectorAll('.review-star').forEach((x, i) => x.style.color = i < parseInt(s.dataset.value) ? '#ffcc00' : 'rgba(255,255,255,0.2)'); s.onmouseleave = () => modal.querySelectorAll('.review-star').forEach((x, i) => x.style.color = i < sel ? '#ffcc00' : 'rgba(255,255,255,0.2)'); s.onclick = () => { sel = parseInt(s.dataset.value); modal.querySelectorAll('.review-star').forEach((x, i) => x.style.color = i < sel ? '#ffcc00' : 'rgba(255,255,255,0.2)'); }; });
  
  document.getElementById('submitReviewBtn')?.addEventListener('click', async () => { var t = document.getElementById('reviewText').value.trim(); if (!t) return alert('write something!'); if (!sel) return alert('pick a rating!'); await submitGameReview(n, user.username, t, sel); showGameDetailsModal(n, u, img, desc, cat, load, dev, rel); showToast('✅ Review posted!'); });
  document.getElementById('deleteReviewBtn')?.addEventListener('click', async () => { if (!confirm('delete?')) return; await deleteGameReview(n, user.username); showGameDetailsModal(n, u, img, desc, cat, load, dev, rel); showToast('🗑️ Deleted'); });
  document.getElementById('modalPlayBtn').onclick = () => { trackPlayedGame(n); window.open('play.html?gameurl=' + encodeURIComponent(u) + '&game=' + encodeURIComponent(n), '_blank'); modal.remove(); };
  document.getElementById('modalFavBtn').onclick = function() { window.toggleFavourite(n); this.textContent = JSON.parse(localStorage.getItem("favourites")||"[]").includes(n) ? '★ FAVORITED' : '☆ FAVORITE'; };
  document.querySelectorAll('.modal-star').forEach(s => s.onclick = function() { var v = parseInt(this.dataset.value); submitRating(n, v); document.querySelectorAll('.modal-star').forEach((x, i) => x.style.color = i < v ? '#ffcc00' : 'rgba(255,255,255,0.2)'); });
}

// ===== ACHIEVEMENT TRIGGERS (KEPT SHORT) =====
function trackGamePlayCount(g) { window.gamePlayCounts[g] = (window.gamePlayCounts[g]||0)+1; localStorage.setItem('gamePlayCounts', JSON.stringify(window.gamePlayCounts)); if(window.gamePlayCounts[g]>=50&&typeof checkAndUnlockAchievement==='function') checkAndUnlockAchievement(59); if(window.gamePlayCounts[g]>=100) checkAndUnlockAchievement(60); }
function trackThemeChange() { var c = parseInt(localStorage.getItem('themeChangeCount')||'0')+1; localStorage.setItem('themeChangeCount', c); if(c>=10&&typeof checkAndUnlockAchievement==='function') checkAndUnlockAchievement(56); }
var idleGranted = false;
function startIdleTracking() { if(idleGranted) return; var last = Date.now(); document.addEventListener('mousemove', ()=>last=Date.now()); document.addEventListener('keydown', ()=>last=Date.now()); setInterval(()=>{ if(!idleGranted && (Date.now()-last)/60000 >= 60) { if(typeof checkAndUnlockAchievement==='function') checkAndUnlockAchievement(55); idleGranted = true; } }, 60000); }
var FOOD = ['burger','pizza','taco','sushi','cake','cookie','food','chef','restaurant','cooking','baking','donut','ice cream','candy','chocolate'];
function isFoodGame(g) { return FOOD.some(f => g.toLowerCase().includes(f)); }
var SECRETS = [':)','creamypeanut','bloxy','abcatlmfao'];
function checkSecretNames(s) { if(SECRETS.every(n => s.toLowerCase().includes(n.toLowerCase()))) { if(typeof checkAndUnlockAchievement==='function') checkAndUnlockAchievement(53); } }
var pageStart = Date.now();
window.addEventListener('beforeunload', ()=>{ if((Date.now()-pageStart)/1000 <= 10) localStorage.setItem('pendingAltF4','true'); });
function checkAltF4() { if(localStorage.getItem('pendingAltF4')==='true') { localStorage.removeItem('pendingAltF4'); if(typeof checkAndUnlockAchievement==='function') checkAndUnlockAchievement(54); } }
function checkOGFanter() { var u = getCurrentUser(); if(u?.createdAt && new Date(u.createdAt) >= new Date('2025-04-01')) { if(typeof checkAndUnlockAchievement==='function') checkAndUnlockAchievement(58); } }
function checkLoyalCustomer() { if(!window.gamesData) return; if(Object.keys(userVotes).length >= window.gamesData.length) { if(typeof checkAndUnlockAchievement==='function') checkAndUnlockAchievement(62); } }
function checkTotalPlayTime() { var s = localStorage.getItem('sessionStart'); if(s) { var p = parseInt(localStorage.getItem('totalPausedTime')||'0'); if((Date.now()-parseInt(s)-p)/3600000 >= 50) { if(typeof checkAndUnlockAchievement==='function') checkAndUnlockAchievement(61); } } }
function initAchievementTriggers() { checkAltF4(); checkOGFanter(); checkTotalPlayTime(); startIdleTracking(); setInterval(checkTotalPlayTime,60000); setInterval(checkLoyalCustomer,30000); }
function checkAndUnlockAchievement(id) { var u = getCurrentUser(); if(!u) return; var a = JSON.parse(localStorage.getItem('fanter_achievements')||'{}'); if(a[id]) return; a[id]=true; localStorage.setItem('fanter_achievements',JSON.stringify(a)); var r = id<=10?3:id<=20?5:id<=30?10:id<=40?17.5:id<=50?25:50; u.coins = (u.coins||0)+r; u.achievements = a; updateUserInStorage(u); var names={53:"The Chosen One",54:"Alt+F4",55:"Mentally Insane",56:"Indecisive",57:"Big Back",58:"OG Fanter",59:"Addicted",60:"Committed",61:"Top 1 Unemployed",62:"Loyal Customer",63:"System Failure"}, icons={53:"👑",54:"💀",55:"🤪",56:"🎨",57:"🍔",58:"🦖",59:"🎮",60:"💪",61:"🛋️",62:"⭐",63:"💻"}; showAchievementToast(names[id]||"Achievement!", icons[id]||"🏆", r); updateHeaderCoins(); }
function showAchievementToast(n, i, c) { var t = document.querySelector('.achievement-toast') || (t = document.createElement('div'), t.className = 'achievement-toast', document.body.appendChild(t)); t.innerHTML = `<span class="achievement-icon">${i}</span><div class="achievement-content"><div class="achievement-title">ACHIEVEMENT!</div><div class="achievement-name">${n}</div><div class="achievement-reward">+${c} 🪙</div></div>`; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),4000); }
function triggerPageCrash() { if(typeof checkAndUnlockAchievement==='function') checkAndUnlockAchievement(63); var o = document.createElement('div'); o.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#000088;z-index:999999;display:flex;align-items:center;justify-content:center;color:white;font-family:monospace;'; o.innerHTML = '<div style="background:white;color:black;padding:20px;border:2px solid silver;"><h1>:(</h1><p>Fanter ran into a problem.</p><p>Restarting in <span id="cc">5</span>s...</p></div>'; document.body.appendChild(o); var s=5, cc=document.getElementById('cc'), i=setInterval(()=>{ s--; cc.textContent=s; if(s<=0){ clearInterval(i); window.location.reload(); } },1000); }

initAchievementTriggers();
loadGlobalRatings(); loadGlobalReviews();
window.crashFanter = () => triggerPageCrash();
console.log('💀 Type "crashFanter()" for a surprise...');
