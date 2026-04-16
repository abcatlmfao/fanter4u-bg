// ===== DEBUGGED CATEGORIES - SORTING FIXED =====

let currentCategory = 'all';
let currentSort = 'default';
let categoryOpen = false;
let originalGamesArray = [];

// Category data
const CATEGORIES = {
  'all': { icon: '🎮', name: 'All Games', color: '#ffffff' },
  'action': { icon: '⚔️', name: 'Action', color: '#ff4444' },
  'puzzle': { icon: '🧩', name: 'Puzzle', color: '#44ff44' },
  'racing': { icon: '🏎️', name: 'Racing', color: '#ff8844' },
  'sports': { icon: '⚽', name: 'Sports', color: '#44ff88' },
  'adventure': { icon: '🗺️', name: 'Adventure', color: '#44aaff' },
  'platformer': { icon: '🏃', name: 'Platformer', color: '#ff44ff' },
  'strategy': { icon: '♟️', name: 'Strategy', color: '#88ff44' },
  'multiplayer': { icon: '👥', name: 'Multiplayer', color: '#ffaa44' },
  'arcade': { icon: '🕹️', name: 'Arcade', color: '#ff44aa' },
  'horror': { icon: '👻', name: 'Horror', color: '#aa44ff' },
  'simulation': { icon: '🏭', name: 'Simulation', color: '#44ffcc' },
  'sandbox': { icon: '🎨', name: 'Sandbox', color: '#ff8844' },
  'other': { icon: '🎮', name: 'Other', color: '#aaaaaa' }
};

// Store original order
function storeOriginalOrder() {
  const container = document.getElementById('gamesContainer');
  if (container && originalGamesArray.length === 0 && container.children.length > 0) {
    originalGamesArray = Array.from(container.children);
    console.log('📦 Stored original order:', originalGamesArray.length, 'games');
  }
}

// Reset to original order
function resetToOriginalOrder() {
  const container = document.getElementById('gamesContainer');
  if (container && originalGamesArray.length > 0) {
    originalGamesArray.forEach(game => container.appendChild(game));
    console.log('🔄 Reset to original order');
  }
}

// Add category tags to game cards
function addCategoryTags() {
  const games = document.querySelectorAll('.game');
  console.log('🏷️ Adding tags to', games.length, 'games');
  
  games.forEach(game => {
    if (game.getAttribute('data-tagged')) return;
    
    const gameName = game.querySelector('p')?.textContent;
    if (gameName && window.gamesData) {
      const gameData = window.gamesData.find(g => g.name === gameName);
      const category = gameData?.category || 'other';
      const catInfo = CATEGORIES[category] || CATEGORIES.other;
      
      console.log(`  🎮 ${gameName} → ${catInfo.name}`);
      
      const tag = document.createElement('div');
      tag.className = 'game-category';
      tag.style.cssText = `
        display: inline-block;
        font-size: 10px;
        padding: 3px 10px;
        border-radius: 20px;
        background: ${catInfo.color}20;
        color: ${catInfo.color};
        margin-top: 6px;
        font-family: monospace;
      `;
      tag.innerHTML = `${catInfo.icon} ${catInfo.name}`;
      
      const pTag = game.querySelector('p');
      if (pTag) {
        pTag.insertAdjacentElement('afterend', tag);
      } else {
        game.appendChild(tag);
      }
      
      game.setAttribute('data-category', category);
      game.setAttribute('data-tagged', 'true');
    }
  });
}

// Filter games by category
function filterGamesByCategory() {
  const container = document.getElementById('gamesContainer');
  if (!container) return;
  
  const games = Array.from(container.children);
  let visibleCount = 0;
  
  games.forEach(game => {
    const gameCategory = game.getAttribute('data-category');
    if (currentCategory === 'all' || gameCategory === currentCategory) {
      game.style.display = '';
      visibleCount++;
    } else {
      game.style.display = 'none';
    }
  });
  
  console.log(`🔍 Filtered to ${visibleCount} games (category: ${currentCategory})`);
  return visibleCount;
}

// Sort visible games
function sortVisibleGames() {
  const container = document.getElementById('gamesContainer');
  if (!container) return;
  
  const games = Array.from(container.children);
  const visibleGames = games.filter(game => game.style.display !== 'none');
  const hiddenGames = games.filter(game => game.style.display === 'none');
  
  if (currentSort === 'default') {
    // Restore original order for visible games
    const originalVisible = originalGamesArray.filter(game => 
      visibleGames.includes(game)
    );
    originalVisible.forEach(game => container.appendChild(game));
    hiddenGames.forEach(game => container.appendChild(game));
    console.log('📋 Applied default sort');
    return;
  }
  
  // Sort visible games
  visibleGames.sort((a, b) => {
    const aName = a.querySelector('p')?.textContent || '';
    const bName = b.querySelector('p')?.textContent || '';
    
    if (currentSort === 'name-asc') {
      return aName.localeCompare(bName);
    }
    if (currentSort === 'name-desc') {
      return bName.localeCompare(aName);
    }
    
    const aRatingEl = a.querySelector('.rating-average');
    const bRatingEl = b.querySelector('.rating-average');
    const aRating = aRatingEl ? parseFloat(aRatingEl.textContent?.match(/★ ([\d.]+)/)?.[1] || 0) : 0;
    const bRating = bRatingEl ? parseFloat(bRatingEl.textContent?.match(/★ ([\d.]+)/)?.[1] || 0) : 0;
    
    if (currentSort === 'rating-desc') {
      return bRating - aRating;
    }
    if (currentSort === 'rating-asc') {
      return aRating - bRating;
    }
    return 0;
  });
  
  // Reorder DOM
  visibleGames.forEach(game => container.appendChild(game));
  hiddenGames.forEach(game => container.appendChild(game));
  
  console.log(`📊 Applied sort: ${currentSort}`);
}

// Update everything
function updateGames() {
  storeOriginalOrder();
  filterGamesByCategory();
  sortVisibleGames();
  updateCountDisplay();
}

function updateCountDisplay() {
  const container = document.getElementById('gamesContainer');
  if (!container) return;
  
  const games = Array.from(container.children);
  const visibleCount = games.filter(game => game.style.display !== 'none').length;
  const totalGames = games.length;
  const categoryName = currentCategory === 'all' ? 'All Games' : (CATEGORIES[currentCategory]?.name || currentCategory);
  
  let countEl = document.getElementById('games-count');
  if (!countEl) {
    countEl = document.createElement('div');
    countEl.id = 'games-count';
    countEl.style.cssText = 'text-align:center;font-size:12px;color:rgba(255,255,255,0.5);margin:10px auto;font-family:monospace;';
    container.parentNode.insertBefore(countEl, container.nextSibling);
  }
  countEl.textContent = `${categoryName}: ${visibleCount} of ${totalGames} games`;
}

// Create the category bar
function createCategoryBar() {
  if (document.getElementById('category-bar')) return;
  
  const searchContainer = document.querySelector('.center');
  if (!searchContainer) {
    console.log('⏳ Waiting for .center element...');
    return;
  }
  
  console.log('🎨 Creating category bar...');
  
  const bar = document.createElement('div');
  bar.id = 'category-bar';
  bar.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    justify-content: center;
    align-items: center;
    margin: 20px auto;
    padding: 0 20px;
    position: relative;
  `;
  
  // Category button
  const catBtn = document.createElement('button');
  catBtn.id = 'main-category-btn';
  catBtn.style.cssText = `
    background: linear-gradient(135deg, rgba(45,90,227,0.2), rgba(45,90,227,0.05));
    border: 1px solid rgba(45,90,227,0.6);
    border-radius: 40px;
    padding: 10px 24px;
    color: white;
    font-size: 15px;
    font-family: 'Ubuntu', sans-serif;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 10px;
    backdrop-filter: blur(5px);
  `;
  catBtn.innerHTML = `
    <span style="font-size: 18px;">🐈</span>
    <span style="font-weight: 500;">egories</span>
    <span id="category-arrow-icon" style="font-size: 12px; transition: transform 0.3s ease;">▼</span>
  `;
  
  // Dropdown menu
  const dropdown = document.createElement('div');
  dropdown.id = 'category-dropdown-menu';
  dropdown.style.cssText = `
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-10px);
    background: rgba(10, 15, 30, 0.98);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(45, 90, 227, 0.4);
    border-radius: 16px;
    margin-top: 8px;
    min-width: 200px;
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    transition: all 0.35s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    z-index: 1000;
    box-shadow: 0 15px 35px rgba(0,0,0,0.3);
    pointer-events: none;
  `;
  
  // Add category options
  const categories = ['all', 'action', 'puzzle', 'racing', 'sports', 'adventure', 'platformer', 'strategy', 'multiplayer', 'arcade', 'horror', 'simulation', 'sandbox'];
  
  categories.forEach(cat => {
    const info = CATEGORIES[cat];
    const option = document.createElement('div');
    option.className = 'dropdown-cat-option';
    option.style.cssText = `
      padding: 12px 20px;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 12px;
      color: rgba(255,255,255,0.8);
      font-size: 14px;
      font-family: 'Ubuntu', sans-serif;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    `;
    option.innerHTML = `<span style="font-size: 16px;">${info.icon}</span> <span>${info.name}</span>`;
    
    option.onmouseenter = () => {
      option.style.background = `${info.color}20`;
      option.style.color = info.color;
    };
    option.onmouseleave = () => {
      option.style.background = 'transparent';
      option.style.color = 'rgba(255,255,255,0.8)';
    };
    option.onclick = () => {
      currentCategory = cat;
      catBtn.style.borderColor = info.color;
      setTimeout(() => {
        catBtn.style.borderColor = 'rgba(45,90,227,0.6)';
      }, 300);
      updateGames();
      closeDropdown();
    };
    
    dropdown.appendChild(option);
  });
  
  // Sort buttons
  const sortContainer = document.createElement('div');
  sortContainer.style.cssText = `
    display: flex;
    gap: 5px;
    background: rgba(20, 30, 50, 0.9);
    border: 1px solid rgba(45, 90, 227, 0.4);
    border-radius: 40px;
    padding: 5px;
    backdrop-filter: blur(5px);
  `;
  
  const sorts = [
    { value: 'default', label: 'Default', icon: '🔄' },
    { value: 'name-asc', label: 'A-Z', icon: '📝' },
    { value: 'name-desc', label: 'Z-A', icon: '📝' },
    { value: 'rating-desc', label: '⭐ High', icon: '⭐' },
    { value: 'rating-asc', label: '⭐ Low', icon: '⭐' }
  ];
  
  sorts.forEach(s => {
    const btn = document.createElement('button');
    btn.textContent = `${s.icon} ${s.label}`;
    btn.style.cssText = `
      background: ${currentSort === s.value ? 'rgba(45,90,227,0.5)' : 'transparent'};
      border: none;
      border-radius: 30px;
      padding: 8px 14px;
      color: white;
      font-size: 12px;
      font-family: 'Ubuntu', sans-serif;
      cursor: pointer;
      transition: all 0.15s ease;
    `;
    btn.onmouseenter = () => {
      btn.style.background = 'rgba(45,90,227,0.3)';
    };
    btn.onmouseleave = () => {
      btn.style.background = currentSort === s.value ? 'rgba(45,90,227,0.5)' : 'transparent';
    };
    btn.onclick = () => {
      currentSort = s.value;
      updateGames();
      // Update button styles
      document.querySelectorAll('.sort-custom-btn').forEach(b => {
        b.style.background = 'transparent';
      });
      btn.style.background = 'rgba(45,90,227,0.5)';
    };
    btn.classList.add('sort-custom-btn');
    sortContainer.appendChild(btn);
  });
  
  bar.appendChild(catBtn);
  bar.appendChild(sortContainer);
  bar.appendChild(dropdown);
  
  searchContainer.parentNode.insertBefore(bar, searchContainer.nextSibling);
  
  // Dropdown functions
  function openDropdown() {
    dropdown.style.maxHeight = '400px';
    dropdown.style.opacity = '1';
    dropdown.style.transform = 'translateX(-50%) translateY(0)';
    dropdown.style.pointerEvents = 'all';
    const arrow = document.getElementById('category-arrow-icon');
    if (arrow) arrow.style.transform = 'rotate(180deg)';
    categoryOpen = true;
  }
  
  function closeDropdown() {
    dropdown.style.maxHeight = '0';
    dropdown.style.opacity = '0';
    dropdown.style.transform = 'translateX(-50%) translateY(-10px)';
    dropdown.style.pointerEvents = 'none';
    const arrow = document.getElementById('category-arrow-icon');
    if (arrow) arrow.style.transform = 'rotate(0deg)';
    categoryOpen = false;
  }
  
  catBtn.onclick = (e) => {
    e.stopPropagation();
    if (categoryOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };
  
  document.addEventListener('click', (e) => {
    if (!bar.contains(e.target) && categoryOpen) {
      closeDropdown();
    }
  });
}

// Initialize
function init() {
  console.log('🚀 Initializing categories system...');
  storeOriginalOrder();
  createCategoryBar();
  addCategoryTags();
  updateGames();
}

// Wait for DOM and gamesData
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(init, 500);
  });
} else {
  setTimeout(init, 500);
}

// Watch for gamesData to load
let attempts = 0;
const waitForGames = setInterval(() => {
  attempts++;
  if (window.gamesData && window.gamesData.length > 0) {
    clearInterval(waitForGames);
    console.log('✅ gamesData loaded:', window.gamesData.length, 'games');
    addCategoryTags();
    updateGames();
  }
  if (attempts > 50) {
    clearInterval(waitForGames);
    console.log('⚠️ Timeout waiting for gamesData');
  }
}, 200);

console.log('✅ Categories script loaded - check console for debug info');
