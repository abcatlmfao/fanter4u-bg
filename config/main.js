// ===== MAIN.JS - COMPLETE REWRITE =====

// Wait for DOM to be fully loaded before running
document.addEventListener('DOMContentLoaded', function() {
  var sitename = "fanter beta.";
  var subtext = "v0.326, added achivements, fixed most bugs i found & added more settings; more coming soon! :3";

  var serverUrl1 = "https://gms.parcoil.com";
  var currentPageTitle = document.title;
  document.title = `${currentPageTitle} | ${sitename}`;
  let gamesData = [];

  function getFavourites() {
    return JSON.parse(localStorage.getItem("favourites") || "[]");
  }

  window.toggleFavourite = function(gameName) {
    let favs = getFavourites();
    let isAdding = false;
    
    if (favs.includes(gameName)) {
      favs = favs.filter(f => f !== gameName);
      isAdding = false;
    } else {
      favs.push(gameName);
      isAdding = true;
    }
    localStorage.setItem("favourites", JSON.stringify(favs));
    
    // Sync to account if logged in
    if (typeof syncFavoriteToAccount === 'function') {
      syncFavoriteToAccount(gameName, isAdding);
    }
    
    // Check achievements after favoriting
    if (typeof checkAchievements === 'function') {
      setTimeout(() => checkAchievements(), 100);
    }
    
    // Update the favorite button if it exists
    const favBtn = document.querySelector(`.fav-btn[data-game="${gameName.replace(/['"]/g, '\\"')}"]`);
    if (favBtn) {
      favBtn.textContent = isAdding ? "★" : "☆";
    }
  };

  function displayFilteredGames(filteredGames) {
    const gamesContainer = document.getElementById("gamesContainer");
    if (!gamesContainer) return;
    gamesContainer.innerHTML = "";
    filteredGames.forEach((game) => {
      const gameDiv = document.createElement("div");
      gameDiv.classList.add("game");
      
      const gameImage = document.createElement("img");
      let imageSrc;
      if (game.image.startsWith('http')) {
        imageSrc = game.image;
      } else {
        imageSrc = `${serverUrl1}/${game.url}/${game.image}`;
      }
      gameImage.src = imageSrc;
      gameImage.alt = game.name;
      
      // GAME CLICK HANDLER - Track played game
      gameImage.onclick = () => {
        // Track that this game was played (if logged in)
        if (typeof trackPlayedGame === 'function') {
          trackPlayedGame(game.name);
        }
        
        if (game.url.startsWith('http')) {
          window.location.href = game.url;
        } else {
          window.location.href = `play.html?gameurl=${game.url}/`;
        }
      };
      
      const gameName = document.createElement("p");
      gameName.textContent = game.name;
      
      // FAVORITE BUTTON
      const favBtn = document.createElement("button");
      favBtn.classList.add("fav-btn");
      favBtn.setAttribute("data-game", game.name);
      favBtn.textContent = getFavourites().includes(game.name) ? "★" : "☆";
      favBtn.title = "favourite";
      favBtn.onclick = (e) => {
        e.stopPropagation();
        window.toggleFavourite(game.name);
        favBtn.textContent = getFavourites().includes(game.name) ? "★" : "☆";
      };
      
      gameDiv.appendChild(gameImage);
      gameDiv.appendChild(gameName);
      gameDiv.appendChild(favBtn);
      
      // Add ratings if available
      if (typeof createRatingHTML === 'function') {
        const userVotesGlobal = JSON.parse(localStorage.getItem('userVotes') || '{}');
        gameDiv.insertAdjacentHTML('beforeend', createRatingHTML(game.name, userVotesGlobal[game.name] || 0));
      }
      
      gamesContainer.appendChild(gameDiv);
    });
    
    // Attach rating listeners if available
    if (typeof attachRatingListeners === 'function') {
      attachRatingListeners();
    }
  }

  function handleSearchInput() {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return;
    const searchInputValue = searchInput.value.toLowerCase();
    let filteredGames;
    const favFilterOn = localStorage.getItem("favFilter") === "true";
    if (favFilterOn) {
      const favs = getFavourites();
      filteredGames = gamesData.filter((game) =>
        favs.includes(game.name) && game.name.toLowerCase().includes(searchInputValue)
      );
    } else {
      filteredGames = gamesData.filter((game) =>
        game.name.toLowerCase().includes(searchInputValue)
      );
    }
    displayFilteredGames(filteredGames);
  }

  window.toggleFavFilter = function() {
    const current = localStorage.getItem("favFilter") === "true";
    localStorage.setItem("favFilter", (!current).toString());
    handleSearchInput();
    const favToggleBtn = document.getElementById("favToggleBtn");
    if (favToggleBtn) {
      const on = localStorage.getItem("favFilter") === "true";
      favToggleBtn.textContent = on ? "show: on ✅" : "show: off ❌";
    }
  };

  window.toggleFavSidebar = function() {
    const btn = document.getElementById("favSidebarBtn");
    if (!btn) return;
    const favFilterOn = localStorage.getItem("favFilter") === "true";
    btn.classList.toggle("active", !favFilterOn);
    btn.classList.toggle("visible", !favFilterOn);
    btn.textContent = !favFilterOn ? "✕" : "★";

    if (!favFilterOn) {
      const favs = getFavourites();
      const allCards = Array.from(document.querySelectorAll(".game"));
      const searchBar = document.getElementById("searchInput");
      if (!searchBar) return;
      const searchRect = searchBar.getBoundingClientRect();
      const searchCenterX = searchRect.left + searchRect.width / 2;
      const searchCenterY = searchRect.top + searchRect.height / 2;

      const nonFavedCards = allCards.filter(card =>
        !favs.includes(card.querySelector("p").textContent)
      );

      nonFavedCards.sort((a, b) => {
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        const da = Math.hypot((ra.left + ra.width / 2) - searchCenterX, (ra.top + ra.height / 2) - searchCenterY);
        const db = Math.hypot((rb.left + rb.width / 2) - searchCenterX, (rb.top + rb.height / 2) - searchCenterY);
        return da - db;
      });

      let delay = 0;

      nonFavedCards.forEach((card) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenterX = cardRect.left + cardRect.width / 2;
        const cardCenterY = cardRect.top + cardRect.height / 2;

        const clone = card.cloneNode(true);
        clone.style.cssText = `
          position: fixed;
          left: ${cardRect.left}px;
          top: ${cardRect.top}px;
          width: ${cardRect.width}px;
          height: ${cardRect.height}px;
          margin: 0;
          padding: 0;
          z-index: 9999;
          pointer-events: none;
          transform-origin: center center;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(45, 90, 227, 0.4);
        `;
        document.body.appendChild(clone);
        card.style.visibility = "hidden";

        const tx = searchCenterX - cardCenterX;
        const ty = searchCenterY - cardCenterY;

        setTimeout(() => {
          clone.style.transition = `transform 0.42s cubic-bezier(0.55, 0, 0.85, 0.6), opacity 0.18s ease 0.26s, border-radius 0.42s ease`;
          clone.style.transform = `translate(${tx}px, ${ty}px) scale(0.05)`;
          clone.style.opacity = "0";
          clone.style.borderRadius = "50%";
          setTimeout(() => clone.remove(), 500);
        }, delay);

        delay += 30;
      });

      setTimeout(() => {
        searchBar.style.transition = "box-shadow 0.15s ease, border-color 0.15s ease";
        searchBar.style.boxShadow = "0 0 40px rgba(45, 90, 227, 0.9), 0 0 80px rgba(45, 90, 227, 0.4)";
        searchBar.style.borderColor = "rgba(45, 90, 227, 1)";
        setTimeout(() => {
          searchBar.style.boxShadow = "";
          searchBar.style.borderColor = "";
        }, 300);
      }, delay + 100);

      setTimeout(() => {
        localStorage.setItem("favFilter", "true");
        handleSearchInput();
      }, delay + 280);

    } else {
      localStorage.setItem("favFilter", "false");
      handleSearchInput();
    }
  };

  // Load games
  fetch("./config/games.json")
    .then((response) => response.json())
    .then((data) => {
      gamesData = data;
      handleSearchInput();
      const btn = document.getElementById("favSidebarBtn");
      if (btn && localStorage.getItem("favFilter") === "true") {
        btn.classList.add("active");
        btn.classList.add("visible");
        btn.textContent = "✕";
      }
      console.log(`✅ Loaded ${gamesData.length} games successfully!`);
      
      // Load user favorites after games are loaded
      if (typeof loadUserFavorites === 'function') {
        loadUserFavorites();
      }
    })
    .catch((error) => console.error("Error fetching games:", error));

  // Set up event listeners
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", handleSearchInput);
  }
  
  const titleEl = document.getElementById("title");
  if (titleEl) titleEl.innerHTML = sitename;
  
  const subtitleEl = document.getElementById("subtitle");
  if (subtitleEl) subtitleEl.innerHTML = subtext;
});


// ===== GAME RATINGS SYSTEM (Global) =====
const RATINGS_BIN_ID = "69e045ec856a6821893bc134";
const RATINGS_API_KEY = "$2a$10$2cPmKAGNYxPTRLV03OfVruvfhNpW/VHtJSzR.AVNHumZ7etLdT33.";

let globalRatings = {};
let userVotes = JSON.parse(localStorage.getItem('userVotes') || '{}');

// Load ratings from JSONBin
async function loadGlobalRatings() {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${RATINGS_BIN_ID}/latest`, {
      headers: { 'X-Master-Key': RATINGS_API_KEY }
    });
    const data = await response.json();
    if (data.record && data.record.ratings) {
      globalRatings = data.record.ratings;
    }
    console.log('✅ Global ratings loaded:', Object.keys(globalRatings).length, 'games rated');
  } catch (error) {
    console.error('Failed to load ratings:', error);
  }
  refreshAllRatings();
}

// Save ratings to JSONBin
async function saveGlobalRatings() {
  try {
    const response = await fetch(`https://api.jsonbin.io/v3/b/${RATINGS_BIN_ID}`, {
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

// Submit a rating for a game
function submitRating(gameName, rating) {
  if (!globalRatings[gameName]) {
    globalRatings[gameName] = { total: 0, count: 0, average: 0 };
  }
  
  // Track user rating count
  const currentUser = JSON.parse(localStorage.getItem('fanter_currentUser') || 'null');
  if (currentUser) {
    currentUser.stats = currentUser.stats || { ratingsGiven: 0, favoritesCount: 0, gamesPlayed: 0 };
    currentUser.stats.ratingsGiven = (currentUser.stats.ratingsGiven || 0) + 1;
    localStorage.setItem('fanter_currentUser', JSON.stringify(currentUser));
    
    let users = JSON.parse(localStorage.getItem('fanter_users') || '[]');
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex].stats = currentUser.stats;
      localStorage.setItem('fanter_users', JSON.stringify(users));
    }
  }
  
  // Check if user already voted
  if (userVotes[gameName]) {
    const oldRating = userVotes[gameName];
    globalRatings[gameName].total -= oldRating;
    globalRatings[gameName].count -= 1;
  }
  
  // Add new vote
  globalRatings[gameName].total += rating;
  globalRatings[gameName].count += 1;
  globalRatings[gameName].average = globalRatings[gameName].total / globalRatings[gameName].count;
  
  userVotes[gameName] = rating;
  localStorage.setItem('userVotes', JSON.stringify(userVotes));
  
  saveGlobalRatings();
  showRatingToast(`You rated "${gameName}" ${rating}★!`);
  updateStarDisplay(gameName, rating);
  
  // Check achievements after rating
  if (typeof checkAchievements === 'function') {
    setTimeout(() => checkAchievements(), 100);
  }
}

// Update star display for a specific game
function updateStarDisplay(gameName, userRating) {
  const ratingContainer = document.querySelector(`.game-rating[data-game="${CSS.escape(gameName)}"]`);
  if (!ratingContainer) return;
  
  const stars = ratingContainer.querySelectorAll('.star');
  stars.forEach((star, index) => {
    if (index < userRating) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
  
  const avgDisplay = ratingContainer.querySelector('.rating-average');
  const gameRating = globalRatings[gameName];
  if (avgDisplay && gameRating) {
    avgDisplay.innerHTML = `<span class="star-small">★</span> ${gameRating.average.toFixed(1)} (${gameRating.count})`;
  }
}

// Refresh all ratings on the page
function refreshAllRatings() {
  document.querySelectorAll('.game-rating').forEach(container => {
    const gameName = container.getAttribute('data-game');
    const gameRating = globalRatings[gameName];
    const userRating = userVotes[gameName] || 0;
    
    const stars = container.querySelectorAll('.star');
    stars.forEach((star, index) => {
      if (index < userRating) {
        star.classList.add('active');
      } else {
        star.classList.remove('active');
      }
    });
    
    const avgDisplay = container.querySelector('.rating-average');
    if (avgDisplay && gameRating) {
      avgDisplay.innerHTML = `<span class="star-small">★</span> ${gameRating.average.toFixed(1)} (${gameRating.count})`;
    } else if (avgDisplay) {
      avgDisplay.innerHTML = `<span class="star-small">★</span> 0.0 (0)`;
    }
  });
}

// Show toast notification
function showRatingToast(message) {
  let toast = document.querySelector('.rating-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'rating-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2000);
}

// Create rating stars HTML for a game card
function createRatingHTML(gameName, currentRating = 0) {
  const gameRating = globalRatings[gameName];
  const avgRating = gameRating ? gameRating.average.toFixed(1) : '0.0';
  const ratingCount = gameRating ? gameRating.count : 0;
  
  return `
    <div class="game-rating" data-game="${gameName.replace(/['"]/g, '&quot;')}">
      <div class="stars" data-game="${gameName.replace(/['"]/g, '&quot;')}">
        ${[1, 2, 3, 4, 5].map(starNum => `
          <span class="star ${currentRating >= starNum ? 'active' : ''}" data-value="${starNum}">★</span>
        `).join('')}
      </div>
      <div class="rating-average">
        <span class="star-small">★</span> ${avgRating} (${ratingCount})
      </div>
    </div>
  `;
}

// Attach rating event listeners
function attachRatingListeners() {
  document.querySelectorAll('.stars').forEach(starsContainer => {
    const gameName = starsContainer.getAttribute('data-game');
    
    starsContainer.querySelectorAll('.star').forEach(star => {
      star.removeEventListener('click', star.clickHandler);
      star.removeEventListener('mouseenter', star.mouseEnterHandler);
      star.removeEventListener('mouseleave', star.mouseLeaveHandler);
      
      const ratingValue = parseInt(star.getAttribute('data-value'));
      
      star.clickHandler = () => submitRating(gameName, ratingValue);
      star.mouseEnterHandler = () => {
        starsContainer.querySelectorAll('.star').forEach((s, idx) => {
          if (idx < ratingValue) {
            s.classList.add('hover');
          }
        });
      };
      star.mouseLeaveHandler = () => {
        starsContainer.querySelectorAll('.star').forEach(s => {
          s.classList.remove('hover');
        });
      };
      
      star.addEventListener('click', star.clickHandler);
      star.addEventListener('mouseenter', star.mouseEnterHandler);
      star.addEventListener('mouseleave', star.mouseLeaveHandler);
    });
  });
}

// Load ratings when page loads
loadGlobalRatings();


// ===== ACCOUNT SYSTEM HELPER FUNCTIONS =====

function updateAccountButtonDisplay() {
  const currentUser = JSON.parse(localStorage.getItem('fanter_currentUser') || 'null');
  const accountNameSpan = document.getElementById('accountName');
  if (accountNameSpan) {
    accountNameSpan.textContent = currentUser ? (currentUser.displayName || currentUser.username) : 'Guest';
  }
}

// Update account button when page loads
document.addEventListener('DOMContentLoaded', function() {
  updateAccountButtonDisplay();
});

window.addEventListener('storage', function(e) {
  if (e.key === 'fanter_currentUser') {
    updateAccountButtonDisplay();
  }
});


// ===== ACCOUNT SYNC FUNCTIONS =====

function getCurrentUser() {
  return JSON.parse(localStorage.getItem('fanter_currentUser') || 'null');
}

function updateUserInStorage(updatedUser) {
  localStorage.setItem('fanter_currentUser', JSON.stringify(updatedUser));
  
  let users = JSON.parse(localStorage.getItem('fanter_users') || '[]');
  const index = users.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = updatedUser;
    localStorage.setItem('fanter_users', JSON.stringify(users));
  }
}

function syncFavoritesFromAccount() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  const accountFavorites = currentUser.favorites || [];
  let localFavorites = JSON.parse(localStorage.getItem("favourites") || "[]");
  const mergedFavorites = [...new Set([...accountFavorites, ...localFavorites])];
  
  localStorage.setItem("favourites", JSON.stringify(mergedFavorites));
  
  currentUser.favorites = mergedFavorites;
  currentUser.stats.favoritesCount = mergedFavorites.length;
  updateUserInStorage(currentUser);
  
  console.log(`✅ Synced ${mergedFavorites.length} favorites from account`);
}

function syncFavoriteToAccount(gameName, isAdding) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  let favorites = currentUser.favorites || [];
  
  if (isAdding) {
    if (!favorites.includes(gameName)) {
      favorites.push(gameName);
    }
  } else {
    favorites = favorites.filter(f => f !== gameName);
  }
  
  currentUser.favorites = favorites;
  currentUser.stats.favoritesCount = favorites.length;
  updateUserInStorage(currentUser);
  
  localStorage.setItem("favourites", JSON.stringify(favorites));
  
  console.log(`✅ ${isAdding ? 'Added' : 'Removed'} ${gameName} from account favorites`);
}

function trackPlayedGame(gameName) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  let playedGames = currentUser.playedGames || [];
  
  if (!playedGames.includes(gameName)) {
    playedGames.unshift(gameName);
  } else {
    const index = playedGames.indexOf(gameName);
    playedGames.splice(index, 1);
    playedGames.unshift(gameName);
  }
  
  if (playedGames.length > 50) playedGames.pop();
  
  currentUser.playedGames = playedGames;
  currentUser.stats.gamesPlayed = playedGames.length;
  updateUserInStorage(currentUser);
  
  console.log(`✅ Tracked played game: ${gameName}`);
  
  // Check achievements after playing
  if (typeof checkAchievements === 'function') {
    setTimeout(() => checkAchievements(), 100);
  }
}

function loadUserFavorites() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  const favorites = currentUser.favorites || [];
  localStorage.setItem("favourites", JSON.stringify(favorites));
  
  if (typeof handleSearchInput === 'function') {
    handleSearchInput();
  }
  
  console.log(`✅ Loaded ${favorites.length} favorites from account`);
}

// ===== ACHIEVEMENTS SYSTEM =====

// List of all achievements
const ACHIEVEMENTS = [
  { id: 1, name: "First Steps", desc: "Create an account", requirement: "register", icon: "🌟", requiredValue: 1 },
  { id: 2, name: "First Rating", desc: "Rate your first game", requirement: "ratingsGiven", requiredValue: 1, icon: "⭐" },
  { id: 3, name: "Favorited", desc: "Favorite your first game", requirement: "favoritesCount", requiredValue: 1, icon: "💖" },
  { id: 4, name: "Game On", desc: "Play your first game", requirement: "gamesPlayed", requiredValue: 1, icon: "🎮" },
  { id: 5, name: "Getting Started", desc: "Rate 10 games", requirement: "ratingsGiven", requiredValue: 10, icon: "🔟" },
  { id: 6, name: "Collector", desc: "Favorite 10 games", requirement: "favoritesCount", requiredValue: 10, icon: "💎" },
  { id: 7, name: "Marathon", desc: "Play 20 games", requirement: "gamesPlayed", requiredValue: 20, icon: "🏃‍♂️" },
  { id: 8, name: "Rater", desc: "Rate 25 games", requirement: "ratingsGiven", requiredValue: 25, icon: "⭐⭐⭐" },
  { id: 9, name: "Super Fan", desc: "Favorite 25 games", requirement: "favoritesCount", requiredValue: 25, icon: "👑" },
  { id: 10, name: "Completionist", desc: "Earn all other achievements", requirement: "totalAchievements", requiredValue: 9, icon: "🎯" }
];

// Get user achievements from localStorage
function getUserAchievements() {
  return JSON.parse(localStorage.getItem('fanter_achievements') || '{}');
}

// Save user achievements
function saveUserAchievements(achievements) {
  localStorage.setItem('fanter_achievements', JSON.stringify(achievements));
  
  // Also save to user account if logged in
  const currentUser = getCurrentUser();
  if (currentUser) {
    currentUser.achievements = achievements;
    updateUserInStorage(currentUser);
  }
}

// Check and unlock achievements
function checkAchievements() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  let achievements = getUserAchievements();
  let unlockedAny = false;
  
  // Get user stats
  const stats = currentUser.stats || { ratingsGiven: 0, favoritesCount: 0, gamesPlayed: 0 };
  const totalUnlocked = Object.keys(achievements).filter(id => achievements[id] === true).length;
  
  ACHIEVEMENTS.forEach(ach => {
    // Skip if already unlocked
    if (achievements[ach.id]) return;
    
    let isUnlocked = false;
    let currentValue = 0;
    
    switch (ach.requirement) {
      case "register":
        isUnlocked = true;
        break;
      case "ratingsGiven":
        currentValue = stats.ratingsGiven || 0;
        isUnlocked = currentValue >= ach.requiredValue;
        break;
      case "favoritesCount":
        currentValue = stats.favoritesCount || 0;
        isUnlocked = currentValue >= ach.requiredValue;
        break;
      case "gamesPlayed":
        currentValue = stats.gamesPlayed || 0;
        isUnlocked = currentValue >= ach.requiredValue;
        break;
      case "totalAchievements":
        isUnlocked = totalUnlocked >= ach.requiredValue;
        break;
    }
    
    if (isUnlocked) {
      achievements[ach.id] = true;
      unlockedAny = true;
      showAchievementToast(ach);
      console.log(`🏆 Achievement Unlocked: ${ach.name}`);
    }
  });
  
  // Also check Completionist after other unlocks
  const newTotal = Object.keys(achievements).filter(id => achievements[id] === true).length;
  if (!achievements[10] && newTotal >= 9) {
    achievements[10] = true;
    unlockedAny = true;
    const completionist = ACHIEVEMENTS.find(a => a.id === 10);
    showAchievementToast(completionist);
    console.log(`🏆 Achievement Unlocked: Completionist!`);
  }
  
  if (unlockedAny) {
    saveUserAchievements(achievements);
    
    // Update stats in user account
    currentUser.achievements = achievements;
    updateUserInStorage(currentUser);
  }
  
  return achievements;
}

// Show achievement toast notification
function showAchievementToast(achievement) {
  let toast = document.querySelector('.achievement-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'achievement-toast';
    document.body.appendChild(toast);
  }
  
  toast.innerHTML = `
    <span class="achievement-icon">${achievement.icon}</span>
    <div class="achievement-content">
      <div class="achievement-title">ACHIEVEMENT UNLOCKED!</div>
      <div class="achievement-name">${achievement.name}</div>
      <div class="achievement-desc">${achievement.desc}</div>
    </div>
  `;
  
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

// Get achievement progress for a user
function getAchievementProgress(achievement, userStats) {
  let current = 0;
  let required = achievement.requiredValue;
  
  switch (achievement.requirement) {
    case "register":
      return { current: 1, required: 1, percent: 100 };
    case "ratingsGiven":
      current = userStats?.ratingsGiven || 0;
      break;
    case "favoritesCount":
      current = userStats?.favoritesCount || 0;
      break;
    case "gamesPlayed":
      current = userStats?.gamesPlayed || 0;
      break;
    case "totalAchievements":
      const achievements = getUserAchievements();
      const unlocked = Object.keys(achievements).filter(id => achievements[id] === true).length;
      current = unlocked;
      break;
  }
  
  const percent = Math.min(100, Math.floor((current / required) * 100));
  return { current, required, percent };
}

// Render achievements HTML for profile page
function renderAchievementsHTML(achievements, userStats) {
  let html = '<div class="achievement-grid">';
  
  ACHIEVEMENTS.forEach(ach => {
    const isUnlocked = achievements[ach.id] === true;
    const progress = getAchievementProgress(ach, userStats);
    
    html += `
      <div class="achievement-badge ${isUnlocked ? 'unlocked' : 'locked'}">
        <div class="badge-icon">${ach.icon}</div>
        <div class="badge-info">
          <div class="badge-name">${ach.name}</div>
          <div class="badge-desc">${ach.desc}</div>
          ${!isUnlocked ? `
            <div class="badge-progress">${progress.current}/${progress.required}</div>
            <div class="achievement-progress-bar">
              <div class="achievement-progress-fill" style="width: ${progress.percent}%;"></div>
            </div>
          ` : '<div class="badge-progress" style="color:#ffcc00">✓ Unlocked!</div>'}
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  return html;
}
