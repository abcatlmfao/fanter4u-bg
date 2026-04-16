// ===== SIMPLE CATEGORIES WITH SMOOTH DROPDOWN =====

let currentCategory = 'all';
let currentSort = 'name-asc';
let categoryOpen = false;

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

// Add category tags to game cards
function addCategoryTags() {
  const games = document.querySelectorAll('.game');
  games.forEach(game => {
    if (game.getAttribute('data-tagged')) return;
    const name = game.querySelector('p')?.textContent;
    if (name && window.gamesData) {
      const gameData = window.gamesData.find(g => g.name === name);
      const cat = gameData?.category || 'other';
      const catInfo = CATEGORIES[cat] || CATEGORIES.other;
      const tag = document.createElement('div');
      tag.className = 'game-category';
      tag.style.cssText = `
        display: inline-block;
        font-size: 10px;
        padding: 2px 8px;
        border-radius: 20px;
        background: ${catInfo.color}20;
        color: ${catInfo.color};
        margin-top: 5px;
        font-family: monospace;
      `;
      tag.innerHTML = `${catInfo.icon} ${catInfo.name}`;
      game.appendChild(tag);
      game.setAttribute('data-category', cat);
      game.setAttribute('data-tagged', 'true');
    }
  });
}

// Filter games
function filterGames() {
  const container = document.getElementById('gamesContainer');
  if (!container) return;
  
  const games = Array.from(container.children);
  let visible = 0;
  
  games.forEach(game => {
    const cat = game.getAttribute('data-category');
    if (currentCategory === 'all' || cat === currentCategory) {
      game.style.display = '';
      visible++;
    } else {
      game.style.display = 'none';
    }
  });
  
  // Sort if needed
  if (currentSort !== 'default') {
    const visibleGames = games.filter(g => g.style.display !== 'none');
    const hiddenGames = games.filter(g => g.style.display === 'none');
    
    visibleGames.sort((a, b) => {
      const aName = a.querySelector('p')?.textContent || '';
      const bName = b.querySelector('p')?.textContent || '';
      if (currentSort === 'name-asc') return aName.localeCompare(bName);
      if (currentSort === 'name-desc') return bName.localeCompare(aName);
      
      const aRating = parseFloat(a.querySelector('.rating-average')?.textContent?.match(/★ ([\d.]+)/)?.[1] || 0);
      const bRating = parseFloat(b.querySelector('.rating-average')?.textContent?.match(/★ ([\d.]+)/)?.[1] || 0);
      return currentSort === 'rating-desc' ? bRating - aRating : aRating - bRating;
    });
    
    visibleGames.forEach(game => container.appendChild(game));
    hiddenGames.forEach(game => container.appendChild(game));
  }
  
  // Update count
  let countEl = document.getElementById('games-count');
  if (!countEl) {
    countEl = document.createElement('div');
    countEl.id = 'games-count';
    countEl.style.cssText = 'text-align:center;font-size:12px;color:rgba(255,255,255,0.5);margin:10px auto;font-family:monospace;';
    container.parentNode.insertBefore(countEl, container.nextSibling);
  }
  const totalGames = document.querySelectorAll('.game').length;
  countEl.textContent = `${visible} of ${totalGames} games`;
}

// Create the category bar (THIS IS WHERE THE BUTTON IS MADE)
function createCategoryBar() {
  // First, check if it already exists
  if (document.getElementById('category-bar')) return;
  
  // Find the search container
  const searchContainer = document.querySelector('.center');
  if (!searchContainer) {
    console.log('Could not find .center element');
    return;
  }
  
  // Create the bar
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
  
  // === THE CATEGORY BUTTON ===
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
  
  // === DROPDOWN MENU ===
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
  
  // Add categories to dropdown
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
      filterGames();
      closeDropdown();
    };
    
    dropdown.appendChild(option);
  });
  
  // === SORT BUTTONS ===
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
      filterGames();
      sorts.forEach(ss => {
        const btns = document.querySelectorAll('.sort-custom-btn');
        btns.forEach(b => {
          b.style.background = 'transparent';
        });
      });
      btn.style.background = 'rgba(45,90,227,0.5)';
    };
    btn.classList.add('sort-custom-btn');
    sortContainer.appendChild(btn);
  });
  
  bar.appendChild(catBtn);
  bar.appendChild(sortContainer);
  bar.appendChild(dropdown);
  
  // Insert after search container
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
  console.log('Initializing categories...');
  createCategoryBar();
  addCategoryTags();
  filterGames();
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(init, 500);
  });
} else {
  setTimeout(init, 500);
}

// Also wait for gamesData
let attempts = 0;
const waitForGames = setInterval(() => {
  attempts++;
  if (window.gamesData && window.gamesData.length > 0) {
    clearInterval(waitForGames);
    addCategoryTags();
    filterGames();
  }
  if (attempts > 50) clearInterval(waitForGames);
}, 200);

console.log('✅ Categories script loaded - button will appear below search bar');
