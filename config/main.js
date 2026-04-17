// ===== MAIN.JS - COMPLETE REWRITE =====

// Make gamesData global
window.gamesData = [];
window.gameEarnings = JSON.parse(localStorage.getItem('gameEarnings') || '{}');
window.gamePlayCounts = JSON.parse(localStorage.getItem('gamePlayCounts') || '{}');

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  var sitename = "fanter beta.";
  var subtext = "v0.3, achievements added, shop, pets, and more! :3";

  var serverUrl1 = "https://gms.parcoil.com";
  var currentPageTitle = document.title;
  document.title = currentPageTitle + " | " + sitename;

  function getFavourites() {
    return JSON.parse(localStorage.getItem("favourites") || "[]");
  }

  window.toggleFavourite = function(gameName) {
    var favs = getFavourites();
    var isAdding = false;
    
    if (favs.indexOf(gameName) !== -1) {
      favs = favs.filter(function(f) { return f !== gameName; });
      isAdding = false;
    } else {
      favs.push(gameName);
      isAdding = true;
    }
    localStorage.setItem("favourites", JSON.stringify(favs));
    
    var favBtn = document.querySelector('.fav-btn[data-game="' + gameName.replace(/['"]/g, '\\"') + '"], .game-fav-btn[data-game="' + gameName.replace(/['"]/g, '\\"') + '"]');
    if (favBtn) {
      favBtn.textContent = isAdding ? "★" : "☆";
      favBtn.classList.toggle('active', isAdding);
    }
    
    if (typeof syncFavoriteToAccount === 'function') {
      syncFavoriteToAccount(gameName, isAdding);
    }
  };

  // Steam-like game card display
  window.displayFilteredGames = function(filteredGames) {
    var gamesContainer = document.getElementById("gamesContainer");
    if (!gamesContainer) return;
    gamesContainer.innerHTML = "";
    
    // Get coin multiplier from equipped pet
    var coinMultiplier = getActiveCoinMultiplier();
    
    for (var i = 0; i < filteredGames.length; i++) {
      var game = filteredGames[i];
      var gameDiv = document.createElement("div");
      gameDiv.classList.add("game");
      
      // Get game earnings
      var earnedCoins = window.gameEarnings[game.name] || 0;
      var playCount = window.gamePlayCounts[game.name] || 0;
      
      // Estimate load time based on game type
      var loadTime = game.url.startsWith('http') ? '2-4 seconds' : '1-2 seconds';
      
      // Release date (default to today if not set)
      var releaseDate = game.releaseDate || new Date().toLocaleDateString();
      
      // Game description (your typing style)
      var gameDescription = game.description || getGameDescription(game.name, game.category);
      
      gameDiv.innerHTML = `
        <div class="game-image-container">
          <img src="${getGameImage(game)}" alt="${escapeHtml(game.name)}" loading="lazy">
        </div>
        <div class="game-info">
          <div class="game-name">${escapeHtml(game.name)}</div>
          <div class="game-details">${escapeHtml(gameDescription)}</div>
          <div class="game-stats">
            <span>⭐ ${getGameRating(game.name)}</span>
            <span>🎮 ${playCount} plays</span>
          </div>
          <div class="game-category" style="background: ${getCategoryColor(game.category)}20; color: ${getCategoryColor(game.category)}">
            ${getCategoryIcon(game.category)} ${game.category || 'other'}
          </div>
          <div class="game-release">📅 added: ${releaseDate}</div>
          <div class="game-earnings">🪙 earned: ${Math.floor(earnedCoins * 100) / 100} coins</div>
          <div class="game-load-time">⏱️ est. load time: ${loadTime}</div>
          <div class="game-actions">
            <button class="game-play-btn">🎮 play now</button>
            <button class="game-fav-btn ${getFavourites().indexOf(game.name) !== -1 ? 'active' : ''}" data-game="${escapeHtml(game.name)}">${getFavourites().indexOf(game.name) !== -1 ? '★' : '☆'}</button>
          </div>
          <div class="game-rating" data-game="${escapeHtml(game.name)}">
            <div class="stars">
              ${[1,2,3,4,5].map(s => `<span class="star" data-value="${s}">★</span>`).join('')}
            </div>
            <div class="rating-average">⭐ ${getGameRating(game.name)}</div>
          </div>
        </div>
      `;
      
      gamesContainer.appendChild(gameDiv);
    }
    
    attachGameEvents();
    if (typeof attachRatingListeners === 'function') attachRatingListeners();
    
    console.log("✅ Displayed " + filteredGames.length + " games");
  };
  
  function getGameImage(game) {
    if (game.image && game.image.indexOf('http') === 0) return game.image;
    if (game.image) return serverUrl1 + "/" + game.url + "/" + game.image;
    return 'https://via.placeholder.com/200x200?text=No+Image';
  }
  
  function getGameDescription(name, category) {
    const descriptions = {
      'action': 'fast-paced, intense gameplay that\'ll keep you on the edge of your seat',
      'puzzle': 'challenge your brain with tricky puzzles and mind-bending mechanics',
      'racing': 'burn rubber and race to the finish line in high-speed competition',
      'sports': 'compete in your favorite sports from basketball to soccer',
      'adventure': 'embark on an epic journey through mysterious lands',
      'platformer': 'jump, run, and dodge through challenging levels',
      'strategy': 'plan your moves and outsmart your opponents',
      'horror': 'survive the terror and uncover dark secrets',
      'arcade': 'classic arcade action that never gets old',
      'simulation': 'build, manage, and create your own world',
      'sandbox': 'no rules, no limits - just pure creativity'
    };
    return descriptions[category] || `a fun ${category || 'arcade'} game that'll keep you entertained for hours`;
  }
  
  function getGameRating(gameName) {
    if (typeof globalRatings !== 'undefined' && globalRatings[gameName]) {
      return globalRatings[gameName].average.toFixed(1);
    }
    return '0.0';
  }
  
  function getCategoryIcon(category) {
    const icons = {
      'action': '⚔️', 'puzzle': '🧩', 'racing': '🏎️', 'sports': '⚽',
      'adventure': '🗺️', 'platformer': '🏃', 'strategy': '♟️',
      'horror': '👻', 'arcade': '🕹️', 'simulation': '🏭', 'sandbox': '🎨'
    };
    return icons[category] || '🎮';
  }
  
  function getCategoryColor(category) {
    const colors = {
      'action': '#ff4444', 'puzzle': '#44ff44', 'racing': '#ff8844',
      'sports': '#44ff88', 'adventure': '#44aaff', 'platformer': '#ff44ff',
      'strategy': '#88ff44', 'horror': '#aa44ff', 'arcade': '#ff44aa',
      'simulation': '#44ffcc', 'sandbox': '#ff8844'
    };
    return colors[category] || '#aaaaaa';
  }
  
  function attachGameEvents() {
    document.querySelectorAll('.game-play-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        var gameDiv = btn.closest('.game');
        var gameName = gameDiv.querySelector('.game-name')?.textContent;
        if (gameName && window.gamesData) {
          var game = window.gamesData.find(g => g.name === gameName);
          if (game) {
            trackGamePlay(game.name);
            var playUrl = 'play.html?gameurl=' + encodeURIComponent(game.url) + '&game=' + encodeURIComponent(game.name);
            window.open(playUrl, '_blank');
          }
        }
      };
    });
    
    document.querySelectorAll('.game-fav-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        var gameName = btn.getAttribute('data-game');
        if (gameName) {
          window.toggleFavourite(gameName);
          var isFav = getFavourites().indexOf(gameName) !== -1;
          btn.textContent = isFav ? '★' : '☆';
          btn.classList.toggle('active', isFav);
        }
      };
    });
    
    document.querySelectorAll('.star').forEach(star => {
      star.onclick = (e) => {
        e.stopPropagation();
        var ratingDiv = star.closest('.game-rating');
        var gameName = ratingDiv.getAttribute('data-game');
        var value = parseInt(star.getAttribute('data-value'));
        if (gameName && typeof submitRating === 'function') {
          submitRating(gameName, value);
          updateStarDisplayLocal(ratingDiv, value);
        }
      };
    });
  }
  
  function updateStarDisplayLocal(ratingDiv, userRating) {
    var stars = ratingDiv.querySelectorAll('.star');
    for (var i = 0; i < stars.length; i++) {
      if (i < userRating) stars[i].classList.add('active');
      else stars[i].classList.remove('active');
    }
  }

  function handleSearchInput() {
    var searchInput = document.getElementById("searchInput");
    if (!searchInput) return;
    var searchInputValue = searchInput.value.toLowerCase();
    
    if (typeof checkSecretNames === 'function') {
      checkSecretNames(searchInputValue);
    }
    
    var filteredGames;
    var favFilterOn = localStorage.getItem("favFilter") === "true";
    if (favFilterOn) {
      var favs = getFavourites();
      filteredGames = window.gamesData.filter(function(game) {
        return favs.indexOf(game.name) !== -1 && game.name.toLowerCase().indexOf(searchInputValue) !== -1;
      });
    } else {
      filteredGames = window.gamesData.filter(function(game) {
        return game.name.toLowerCase().indexOf(searchInputValue) !== -1;
      });
    }
    window.displayFilteredGames(filteredGames);
  }

  window.toggleFavFilter = function() {
    var current = localStorage.getItem("favFilter") === "true";
    localStorage.setItem("favFilter", (!current).toString());
    handleSearchInput();
    var favToggleBtn = document.getElementById("favToggleBtn");
    if (favToggleBtn) {
      var on = localStorage.getItem("favFilter") === "true";
      favToggleBtn.textContent = on ? "show: on ✅" : "show: off ❌";
    }
  };

  window.toggleFavSidebar = function() {
    var btn = document.getElementById("favSidebarBtn");
    if (!btn) return;
    var favFilterOn = localStorage.getItem("favFilter") === "true";
    btn.classList.toggle("active", !favFilterOn);
    btn.classList.toggle("visible", !favFilterOn);
    btn.textContent = !favFilterOn ? "✕" : "★";
  };

  // Load games
  fetch("./config/games.json")
    .then(function(response) { return response.json(); })
    .then(function(data) {
      window.gamesData = data;
      handleSearchInput();
      console.log("✅ Loaded " + window.gamesData.length + " games successfully!");
      if (typeof updateGameOfDay === 'function') updateGameOfDay();
    })
    .catch(function(error) { console.error("Error fetching games:", error); });

  var searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", handleSearchInput);
  }
  
  var titleEl = document.getElementById("title");
  if (titleEl) titleEl.innerHTML = sitename;
  
  var subtitleEl = document.getElementById("subtitle");
  if (subtitleEl) subtitleEl.innerHTML = subtext;
});

// ===== GAME RATINGS SYSTEM =====
const RATINGS_BIN_ID = "69e045ec856a6821893bc134";
const RATINGS_API_KEY = "$2a$10$2cPmKAGNYxPTRLV03OfVruvfhNpW/VHtJSzR.AVNHumZ7etLdT33.";

var globalRatings = {};
var userVotes = JSON.parse(localStorage.getItem('userVotes') || '{}');

async function loadGlobalRatings() {
  try {
    var response = await fetch('https://api.jsonbin.io/v3/b/' + RATINGS_BIN_ID + '/latest', {
      headers: { 'X-Master-Key': RATINGS_API_KEY }
    });
    var data = await response.json();
    if (data.record && data.record.ratings) {
      globalRatings = data.record.ratings;
    }
    console.log('✅ Global ratings loaded:', Object.keys(globalRatings).length, 'games rated');
  } catch (error) {
    console.error('Failed to load ratings:', error);
  }
  refreshAllRatings();
}

async function saveGlobalRatings() {
  try {
    var response = await fetch('https://api.jsonbin.io/v3/b/' + RATINGS_BIN_ID, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': RATINGS_API_KEY
      },
      body: JSON.stringify({ ratings: globalRatings })
    });
    console.log('✅ Ratings saved to cloud');
  } catch (error) {
    console.error('Failed to save ratings:', error);
  }
}

function submitRating(gameName, rating) {
  if (!globalRatings[gameName]) {
    globalRatings[gameName] = { total: 0, count: 0, average: 0 };
  }
  
  var currentUser = JSON.parse(localStorage.getItem('fanter_currentUser') || 'null');
  if (currentUser) {
    currentUser.stats = currentUser.stats || { ratingsGiven: 0, favoritesCount: 0, gamesPlayed: 0 };
    currentUser.stats.ratingsGiven = (currentUser.stats.ratingsGiven || 0) + 1;
    localStorage.setItem('fanter_currentUser', JSON.stringify(currentUser));
    
    var users = JSON.parse(localStorage.getItem('fanter_users') || '[]');
    var userIndex = -1;
    for (var i = 0; i < users.length; i++) {
      if (users[i].id === currentUser.id) {
        userIndex = i;
        break;
      }
    }
    if (userIndex !== -1) {
      users[userIndex].stats = currentUser.stats;
      localStorage.setItem('fanter_users', JSON.stringify(users));
    }
  }
  
  if (userVotes[gameName]) {
    var oldRating = userVotes[gameName];
    globalRatings[gameName].total -= oldRating;
    globalRatings[gameName].count -= 1;
  }
  
  globalRatings[gameName].total += rating;
  globalRatings[gameName].count += 1;
  globalRatings[gameName].average = globalRatings[gameName].total / globalRatings[gameName].count;
  
  userVotes[gameName] = rating;
  localStorage.setItem('userVotes', JSON.stringify(userVotes));
  
  saveGlobalRatings();
  showRatingToast('You rated "' + gameName + '" ' + rating + '★!');
  updateStarDisplay(gameName, rating);
}

function updateStarDisplay(gameName, userRating) {
  var ratingContainer = document.querySelector('.game-rating[data-game="' + CSS.escape(gameName) + '"]');
  if (!ratingContainer) return;
  
  var stars = ratingContainer.querySelectorAll('.star');
  for (var i = 0; i < stars.length; i++) {
    if (i < userRating) stars[i].classList.add('active');
    else stars[i].classList.remove('active');
  }
  
  var avgDisplay = ratingContainer.querySelector('.rating-average');
  var gameRating = globalRatings[gameName];
  if (avgDisplay && gameRating) {
    avgDisplay.innerHTML = '<span class="star-small">★</span> ' + gameRating.average.toFixed(1);
  }
}

function refreshAllRatings() {
  var containers = document.querySelectorAll('.game-rating');
  for (var i = 0; i < containers.length; i++) {
    var container = containers[i];
    var gameName = container.getAttribute('data-game');
    var gameRating = globalRatings[gameName];
    var userRating = userVotes[gameName] || 0;
    
    var stars = container.querySelectorAll('.star');
    for (var s = 0; s < stars.length; s++) {
      if (s < userRating) stars[s].classList.add('active');
      else stars[s].classList.remove('active');
    }
    
    var avgDisplay = container.querySelector('.rating-average');
    if (avgDisplay && gameRating) {
      avgDisplay.innerHTML = '<span class="star-small">★</span> ' + gameRating.average.toFixed(1);
    }
  }
}

function showRatingToast(message) {
  var toast = document.querySelector('.rating-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'rating-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(function() {
    toast.classList.remove('show');
  }, 2000);
}

function attachRatingListeners() {
  var ratingContainers = document.querySelectorAll('.game-rating');
  for (var i = 0; i < ratingContainers.length; i++) {
    var container = ratingContainers[i];
    var gameName = container.getAttribute('data-game');
    var stars = container.querySelectorAll('.star');
    
    for (var s = 0; s < stars.length; s++) {
      var star = stars[s];
      var ratingValue = parseInt(star.getAttribute('data-value'));
      
      star.removeEventListener('click', star.clickHandler);
      star.clickHandler = function(name, value) {
        return function() { submitRating(name, value); };
      }(gameName, ratingValue);
      star.addEventListener('click', star.clickHandler);
    }
  }
}

loadGlobalRatings();

// ===== ACCOUNT SYSTEM HELPER FUNCTIONS =====
function updateAccountButtonDisplay() {
  var currentUser = JSON.parse(localStorage.getItem('fanter_currentUser') || 'null');
  var accountNameSpan = document.getElementById('accountName');
  if (accountNameSpan) {
    accountNameSpan.textContent = currentUser ? (currentUser.displayName || currentUser.username) : 'Guest';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  updateAccountButtonDisplay();
});

window.addEventListener('storage', function(e) {
  if (e.key === 'fanter_currentUser') {
    updateAccountButtonDisplay();
  }
});

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('fanter_currentUser') || 'null');
}

function updateUserInStorage(updatedUser) {
  localStorage.setItem('fanter_currentUser', JSON.stringify(updatedUser));
  
  var users = JSON.parse(localStorage.getItem('fanter_users') || '[]');
  var index = -1;
  for (var i = 0; i < users.length; i++) {
    if (users[i].id === updatedUser.id) {
      index = i;
      break;
    }
  }
  if (index !== -1) {
    users[index] = updatedUser;
    localStorage.setItem('fanter_users', JSON.stringify(users));
  }
}

function syncFavoriteToAccount(gameName, isAdding) {
  var currentUser = getCurrentUser();
  if (!currentUser) return;
  
  var favorites = currentUser.favorites || [];
  
  if (isAdding) {
    if (favorites.indexOf(gameName) === -1) {
      favorites.push(gameName);
    }
  } else {
    favorites = favorites.filter(function(f) { return f !== gameName; });
  }
  
  currentUser.favorites = favorites;
  currentUser.stats.favoritesCount = favorites.length;
  updateUserInStorage(currentUser);
  
  localStorage.setItem("favourites", JSON.stringify(favorites));
}

// ===== GAME TRACKING WITH COIN MULTIPLIER =====
function getActiveCoinMultiplier() {
  var equippedPet = localStorage.getItem('equippedPet');
  var petMultipliers = {
    'chinchilla': 1.0,
    'dragon': 1.5,
    'cat': 1.2,
    'dog': 1.2,
    'owl': 1.3,
    'fox': 1.4
  };
  return petMultipliers[equippedPet] || 1.0;
}

function trackPlayedGame(gameName) {
  var currentUser = getCurrentUser();
  
  // Track play count
  window.gamePlayCounts[gameName] = (window.gamePlayCounts[gameName] || 0) + 1;
  localStorage.setItem('gamePlayCounts', JSON.stringify(window.gamePlayCounts));
  
  // Track earnings with multiplier
  var multiplier = getActiveCoinMultiplier();
  var baseEarnings = 0.05;
  var earned = baseEarnings * multiplier;
  
  window.gameEarnings[gameName] = (window.gameEarnings[gameName] || 0) + earned;
  localStorage.setItem('gameEarnings', JSON.stringify(window.gameEarnings));
  
  if (currentUser) {
    currentUser.coins = (currentUser.coins || 0) + earned;
    
    var playedGames = currentUser.playedGames || [];
    if (playedGames.indexOf(gameName) === -1) {
      playedGames.unshift(gameName);
    } else {
      var index = playedGames.indexOf(gameName);
      playedGames.splice(index, 1);
      playedGames.unshift(gameName);
    }
    if (playedGames.length > 50) playedGames.pop();
    
    currentUser.playedGames = playedGames;
    currentUser.stats.gamesPlayed = playedGames.length;
    updateUserInStorage(currentUser);
  }
  
  // Update UI
  updateHeaderCoins();
  
  console.log(`🎮 Played: ${gameName} | +${earned.toFixed(2)}🪙 (${multiplier}x multiplier)`);
  return earned;
}

function trackGamePlayCount(gameName) {
  window.gamePlayCounts[gameName] = (window.gamePlayCounts[gameName] || 0) + 1;
  localStorage.setItem('gamePlayCounts', JSON.stringify(window.gamePlayCounts));
  
  if (window.gamePlayCounts[gameName] >= 50) {
    if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(59);
  }
  if (window.gamePlayCounts[gameName] >= 100) {
    if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(60);
  }
}

function loadUserFavorites() {
  var currentUser = getCurrentUser();
  if (!currentUser) return;
  
  var favorites = currentUser.favorites || [];
  localStorage.setItem("favourites", JSON.stringify(favorites));
  
  if (typeof handleSearchInput === 'function') {
    handleSearchInput();
  }
}

// ===== ACHIEVEMENT TRIGGERS =====
function trackThemeChange() {
  var themeChangeCount = parseInt(localStorage.getItem('themeChangeCount') || '0');
  themeChangeCount++;
  localStorage.setItem('themeChangeCount', themeChangeCount);
  if (themeChangeCount >= 10) {
    if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(56);
  }
}

var idleAchievementGranted = false;

function startIdleTracking() {
  if (idleAchievementGranted) return;
  
  var lastActivity = Date.now();
  
  function resetIdleTimer() {
    lastActivity = Date.now();
  }
  
  function checkIdle() {
    if (!idleAchievementGranted) {
      var idleTime = (Date.now() - lastActivity) / 1000 / 60;
      if (idleTime >= 60) {
        if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(55);
        idleAchievementGranted = true;
      }
    }
  }
  
  document.addEventListener('mousemove', resetIdleTimer);
  document.addEventListener('keydown', resetIdleTimer);
  document.addEventListener('click', resetIdleTimer);
  setInterval(checkIdle, 60000);
}

var FOOD_GAMES = ['burger', 'pizza', 'taco', 'sushi', 'cake', 'cookie', 'food', 'chef', 'restaurant', 'cooking', 'baking', 'donut', 'ice cream', 'candy', 'chocolate'];

function isFoodGame(gameName) {
  var lowerName = gameName.toLowerCase();
  for (var i = 0; i < FOOD_GAMES.length; i++) {
    if (lowerName.indexOf(FOOD_GAMES[i]) !== -1) return true;
  }
  return false;
}

var SECRET_NAMES = [':)', 'creamypeanut', 'bloxy', 'abcatlmfao'];

function checkSecretNames(searchTerm) {
  var searchLower = searchTerm.toLowerCase();
  var foundCount = 0;
  for (var i = 0; i < SECRET_NAMES.length; i++) {
    if (searchLower.indexOf(SECRET_NAMES[i].toLowerCase()) !== -1) {
      foundCount++;
    }
  }
  if (foundCount >= SECRET_NAMES.length) {
    if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(53);
  }
}

var pageLoadTime = Date.now();
window.addEventListener('beforeunload', function() {
  var timeOnPage = (Date.now() - pageLoadTime) / 1000;
  if (timeOnPage <= 10) {
    localStorage.setItem('pendingAltF4', 'true');
  }
});

function checkAltF4() {
  if (localStorage.getItem('pendingAltF4') === 'true') {
    localStorage.removeItem('pendingAltF4');
    if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(54);
  }
}

function checkOGFanter() {
  var currentUser = getCurrentUser();
  if (currentUser && currentUser.createdAt) {
    var joinDate = new Date(currentUser.createdAt);
    var cutoffDate = new Date('2025-04-01');
    if (joinDate >= cutoffDate) {
      if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(58);
    }
  }
}

function checkLoyalCustomer() {
  if (!window.gamesData) return;
  var ratedGames = 0;
  for (var key in userVotes) {
    ratedGames++;
  }
  if (ratedGames >= window.gamesData.length) {
    if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(62);
  }
}

function checkTotalPlayTime() {
  var sessionStart = localStorage.getItem('sessionStart');
  if (sessionStart) {
    var totalPausedTime = parseInt(localStorage.getItem('totalPausedTime') || '0');
    var activeTime = (Date.now() - parseInt(sessionStart) - totalPausedTime) / 1000 / 60 / 60;
    if (activeTime >= 50) {
      if (typeof checkAndUnlockAchievement === 'function') checkAndUnlockAchievement(61);
    }
  }
}

// ===== ACHIEVEMENT UNLOCK WITH COIN REWARDS =====
function checkAndUnlockAchievement(achievementId) {
  var currentUser = getCurrentUser();
  if (!currentUser) return;
  
  var achievements = JSON.parse(localStorage.getItem('fanter_achievements') || '{}');
  if (achievements[achievementId]) return;
  
  achievements[achievementId] = true;
  localStorage.setItem('fanter_achievements', JSON.stringify(achievements));
  
  var coinReward = 0;
  if (achievementId <= 10) coinReward = 3;
  else if (achievementId <= 20) coinReward = 5;
  else if (achievementId <= 30) coinReward = 10;
  else if (achievementId <= 40) coinReward = 17.5;
  else if (achievementId <= 50) coinReward = 25;
  else coinReward = 50;
  
  if (coinReward > 0) {
    currentUser.coins = (currentUser.coins || 0) + coinReward;
    updateUserInStorage(currentUser);
  }
  
  currentUser.achievements = achievements;
  updateUserInStorage(currentUser);
  
  var achievementNames = {
    53: "The Chosen One", 54: "Alt+F4", 55: "Mentally Insane", 56: "Indecisive",
    57: "Big Back", 58: "OG Fanter", 59: "Addicted", 60: "Committed",
    61: "Top 1 Unemployed", 62: "Loyal Customer", 63: "System Failure"
  };
  
  var achievementIcons = {
    53: "👑", 54: "💀", 55: "🤪", 56: "🎨", 57: "🍔", 58: "🦖",
    59: "🎮", 60: "💪", 61: "🛋️", 62: "⭐", 63: "💻"
  };
  
  showAchievementToastNotification(achievementNames[achievementId] || "Achievement Unlocked!", achievementIcons[achievementId] || "🏆", coinReward);
  console.log('🏆 Achievement Unlocked: ' + (achievementNames[achievementId] || "Unknown") + ' +' + coinReward + '🪙');
  
  if (typeof updateHeaderCoins === 'function') updateHeaderCoins();
}

function showAchievementToastNotification(name, icon, coins) {
  var toast = document.querySelector('.achievement-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'achievement-toast';
    document.body.appendChild(toast);
  }
  
  toast.innerHTML = '<span class="achievement-icon">' + icon + '</span><div class="achievement-content"><div class="achievement-title">ACHIEVEMENT UNLOCKED!</div><div class="achievement-name">' + name + '</div><div class="achievement-reward">+' + coins + ' 🪙</div></div>';
  
  toast.classList.add('show');
  setTimeout(function() {
    toast.classList.remove('show');
  }, 4000);
}

function triggerPageCrash() {
  if (typeof checkAndUnlockAchievement === 'function') {
    checkAndUnlockAchievement(63);
  }
  
  var crashOverlay = document.createElement('div');
  crashOverlay.id = 'crash-overlay';
  crashOverlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#000088;z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:"Courier New",monospace;color:white;text-align:center;animation:fadeIn 0.3s ease;';
  
  crashOverlay.innerHTML = '<div style="background:white;color:black;padding:20px;border:2px solid silver;max-width:500px;margin:20px;"><pre style="font-size:20px;margin:0;">😵</pre><h1 style="font-size:24px;margin:10px 0;">:(</h1><p style="font-size:16px;">Your Fanter ran into a problem and needs to restart.</p><p style="font-size:14px;margin-top:20px;">*** STOP: 0x000000F4</p><div style="margin-top:30px;"><div style="display:inline-block;width:20px;height:20px;background:white;margin:0 5px;animation:blink 1s step-end infinite;"></div><span>Restarting in <span id="crash-countdown">5</span> seconds...</span></div></div>';
  
  document.body.appendChild(crashOverlay);
  
  if (!document.querySelector('#crash-styles')) {
    var style = document.createElement('style');
    style.id = 'crash-styles';
    style.textContent = '@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }';
    document.head.appendChild(style);
  }
  
  var seconds = 5;
  var countdownEl = document.getElementById('crash-countdown');
  var interval = setInterval(function() {
    seconds--;
    if (countdownEl) countdownEl.textContent = seconds;
    if (seconds <= 0) {
      clearInterval(interval);
      window.location.reload();
    }
  }, 1000);
}

function initAchievementTriggers() {
  checkAltF4();
  checkOGFanter();
  checkTotalPlayTime();
  startIdleTracking();
  setInterval(checkTotalPlayTime, 60000);
  setInterval(checkLoyalCustomer, 30000);
}

initAchievementTriggers();

window.crashFanter = function() {
  triggerPageCrash();
};

function updateHeaderCoins() {
  var currentUser = getCurrentUser();
  var coinEl = document.getElementById('headerCoinAmount');
  if (coinEl && currentUser) {
    coinEl.textContent = Math.floor((currentUser.coins || 0) * 100) / 100;
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

console.log('💀 Type "crashFanter()" for a surprise...');
