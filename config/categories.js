// ===== GAME CATEGORIES / TAGS WITH SMOOTH DROPDOWN =====

let currentCategory = 'all';
let currentSort = 'default';
let originalGamesOrder = [];
let categoryDropdownOpen = false;

// Category icons and colors
const CATEGORY_INFO = {
  'all': { icon: '🎮', color: '#ffffff', name: 'All Games' },
  'action': { icon: '⚔️', color: '#ff4444', name: 'Action' },
  'puzzle': { icon: '🧩', color: '#44ff44', name: 'Puzzle' },
  'racing': { icon: '🏎️', color: '#ff8844', name: 'Racing' },
  'sports': { icon: '⚽', color: '#44ff88', name: 'Sports' },
  'adventure': { icon: '🗺️', color: '#44aaff', name: 'Adventure' },
  'platformer': { icon: '🏃', color: '#ff44ff', name: 'Platformer' },
  'strategy': { icon: '♟️', color: '#88ff44', name: 'Strategy' },
  'multiplayer': { icon: '👥', color: '#ffaa44', name: 'Multiplayer' },
  'arcade': { icon: '🕹️', color: '#ff44aa', name: 'Arcade' },
  'horror': { icon: '👻', color: '#aa44ff', name: 'Horror' },
  'simulation': { icon: '🏭', color: '#44ffcc', name: 'Simulation' },
  'sandbox': { icon: '🎨', color: '#ff8844', name: 'Sandbox' },
  'survival': { icon: '🏕️', color: '#44aa88', name: 'Survival' },
  'art': { icon: '🎨', color: '#ff66cc', name: 'Art' },
  'other': { icon: '🎮', color: '#aaaaaa', name: 'Other' }
};

// Store original game order
function storeOriginalOrder() {
  const container = document.getElementById('gamesContainer');
  if (container && originalGamesOrder.length === 0) {
    originalGamesOrder = Array.from(container.children);
  }
}

// Reset to original order
function resetToOriginalOrder() {
  const container = document.getElementById('gamesContainer');
  if (container && originalGamesOrder.length > 0) {
    originalGamesOrder.forEach(game => container.appendChild(game));
  }
}

// Add category tag to game cards
function addCategoryTags() {
  document.querySelectorAll('.game').forEach(gameCard => {
    if (gameCard.hasAttribute('data-category-added')) return;
    
    const gameName = gameCard.querySelector('p')?.textContent;
    if (gameName && typeof gamesData !== 'undefined') {
      const gameData = gamesData.find(g => g.name === gameName);
      const category = gameData?.category || 'other';
      const catInfo = CATEGORY_INFO[category] || CATEGORY_INFO.other;
      
      const categoryTag = document.createElement('div');
      categoryTag.className = 'game-category';
      categoryTag.style.cssText = `
        display: inline-block;
        font-size: 10px;
        padding: 2px 8px;
        border-radius: 20px;
        background: ${catInfo.color}20;
        color: ${catInfo.color};
        margin-top: 5px;
        font-family: monospace;
      `;
      categoryTag.innerHTML = `${catInfo.icon} ${catInfo.name}`;
      gameCard.appendChild(categoryTag);
      gameCard.setAttribute('data-category', category);
      gameCard.setAttribute('data-category-added', 'true');
    }
  });
}

// Filter games by category
function filterByCategory(category) {
  const games = document.querySelectorAll('.game');
  let visibleCount = 0;
  
  games.forEach(game => {
    const gameCategory = game.getAttribute('data-category');
    if (category === 'all' || gameCategory === category) {
      game.style.display = '';
      visibleCount++;
    } else {
      game.style.display = 'none';
    }
  });
  
  updateCategoryCount(visibleCount);
  return visibleCount;
}

// Sort games
function sortGames(sortType) {
  const container = document.getElementById('gamesContainer');
  const visibleGames = Array.from(container.children).filter(game => game.style.display !== 'none');
  const hiddenGames = Array.from(container.children).filter(game => game.style.display === 'none');
  
  if (sortType === 'default') {
    const originalVisibleOrder = originalGamesOrder.filter(game => game.style.display !== 'none');
    originalVisibleOrder.forEach(game => container.appendChild(game));
    hiddenGames.forEach(game => container.appendChild(game));
    return;
  }
  
  const sortedVisible = [...visibleGames].sort((a, b) => {
    const aName = a.querySelector('p')?.textContent || '';
    const bName = b.querySelector('p')?.textContent || '';
    
    switch(sortType) {
      case 'name-asc':
        return aName.localeCompare(bName);
      case 'name-desc':
        return bName.localeCompare(aName);
      case 'rating-desc': {
        const aRatingEl = a.querySelector('.rating-average');
        const bRatingEl = b.querySelector('.rating-average');
        const aRating = aRatingEl ? parseFloat(aRatingEl.textContent?.match(/★ ([\d.]+)/)?.[1] || 0) : 0;
        const bRating = bRatingEl ? parseFloat(bRatingEl.textContent?.match(/★ ([\d.]+)/)?.[1] || 0) : 0;
        return bRating - aRating;
      }
      case 'rating-asc': {
        const aRatingEl = a.querySelector('.rating-average');
        const bRatingEl = b.querySelector('.rating-average');
        const aRating = aRatingEl ? parseFloat(aRatingEl.textContent?.match(/★ ([\d.]+)/)?.[1] || 0) : 0;
        const bRating = bRatingEl ? parseFloat(bRatingEl.textContent?.match(/★ ([\d.]+)/)?.[1] || 0) : 0;
        return aRating - bRating;
      }
      default:
        return 0;
    }
  });
  
  sortedVisible.forEach(game => container.appendChild(game));
  hiddenGames.forEach(game => container.appendChild(game));
}

// Combined filter and sort
function filterAndSort() {
  storeOriginalOrder();
  filterByCategory(currentCategory);
  sortGames(currentSort);
}

function updateCategoryCount(visibleCount) {
  let countDisplay = document.getElementById('category-count');
  if (!countDisplay) {
    const filterBar = document.getElementById('category-filter-bar');
    if (filterBar) {
      countDisplay = document.createElement('div');
      countDisplay.id = 'category-count';
      countDisplay.style.cssText = `
        text-align: center;
        font-size: 12px;
        color: rgba(255,255,255,0.5);
        margin-top: 10px;
        font-family: monospace;
      `;
      filterBar.parentNode.insertBefore(countDisplay, filterBar.nextSibling);
    }
  }
  if (countDisplay) {
    const totalGames = document.querySelectorAll('.game').length;
    const categoryName = currentCategory === 'all' ? 'All Games' : (CATEGORY_INFO[currentCategory]?.name || currentCategory);
    countDisplay.textContent = `${categoryName}: ${visibleCount} of ${totalGames} games`;
  }
}

// Create smooth dropdown category menu
function createCategoryDropdown() {
  const dropdown = document.createElement('div');
  dropdown.id = 'category-dropdown';
  dropdown.style.cssText = `
    position: relative;
    display: inline-block;
  `;
  
  // Dropdown button
  const dropdownBtn = document.createElement('button');
  dropdownBtn.id = 'category-dropdown-btn';
  dropdownBtn.style.cssText = `
    background: rgba(20,30,50,0.8);
    border: 1px solid rgba(45,90,227,0.4);
    border-radius: 30px;
    padding: 8px 20px;
    color: white;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 10px;
  `;
  dropdownBtn.innerHTML = `🎮 <span id="selected-category-name">All Games</span> <span style="font-size: 12px;">▼</span>`;
  
  // Dropdown menu
  const dropdownMenu = document.createElement('div');
  dropdownMenu.id = 'category-dropdown-menu';
  dropdownMenu.style.cssText = `
    position: absolute;
    top: 100%;
    left: 0;
    background: rgba(15,20,40,0.98);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(45,90,227,0.4);
    border-radius: 16px;
    margin-top: 8px;
    min-width: 180px;
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    z-index: 1000;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  `;
  
  // Get unique categories from games
  let categories = ['all'];
  if (typeof gamesData !== 'undefined' && gamesData.length) {
    const cats = new Set();
    gamesData.forEach(game => {
      if (game.category) cats.add(game.category);
    });
    categories = ['all', ...Array.from(cats).sort()];
  } else {
    categories = ['all', 'action', 'puzzle', 'racing', 'sports', 'adventure', 'platformer', 'strategy', 'multiplayer', 'arcade', 'horror', 'simulation', 'sandbox'];
  }
  
  categories.forEach(cat => {
    const catInfo = CATEGORY_INFO[cat] || CATEGORY_INFO.other;
    const item = document.createElement('div');
    item.className = 'category-dropdown-item';
    item.setAttribute('data-category', cat);
    item.style.cssText = `
      padding: 10px 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 10px;
      color: ${cat === currentCategory ? catInfo.color : 'rgba(255,255,255,0.7)'};
      background: ${cat === currentCategory ? `${catInfo.color}10` : 'transparent'};
    `;
    item.innerHTML = `${catInfo.icon} ${catInfo.name}`;
    
    item.onmouseenter = () => {
      item.style.background = `${catInfo.color}20`;
      item.style.color = catInfo.color;
    };
    item.onmouseleave = () => {
      item.style.background = cat === currentCategory ? `${catInfo.color}10` : 'transparent';
      item.style.color = cat === currentCategory ? catInfo.color : 'rgba(255,255,255,0.7)';
    };
    item.onclick = () => {
      currentCategory = cat;
      const selectedName = document.getElementById('selected-category-name');
      if (selectedName) selectedName.textContent = catInfo.name;
      filterAndSort();
      closeCategoryDropdown();
      
      // Update button style
      dropdownBtn.style.borderColor = catInfo.color;
      setTimeout(() => {
        dropdownBtn.style.borderColor = 'rgba(45,90,227,0.4)';
      }, 500);
    };
    
    dropdownMenu.appendChild(item);
  });
  
  dropdown.appendChild(dropdownBtn);
  dropdown.appendChild(dropdownMenu);
  
  // Toggle dropdown
  dropdownBtn.onclick = (e) => {
    e.stopPropagation();
    if (categoryDropdownOpen) {
      closeCategoryDropdown();
    } else {
      openCategoryDropdown();
    }
  };
  
  function openCategoryDropdown() {
    dropdownMenu.style.maxHeight = '400px';
    dropdownMenu.style.opacity = '1';
    categoryDropdownOpen = true;
  }
  
  function closeCategoryDropdown() {
    dropdownMenu.style.maxHeight = '0';
    dropdownMenu.style.opacity = '0';
    categoryDropdownOpen = false;
  }
  
  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && categoryDropdownOpen) {
      closeCategoryDropdown();
    }
  });
  
  return dropdown;
}

// Create sort dropdown
function createSortDropdown() {
  const container = document.createElement('div');
  container.style.cssText = `
    position: relative;
    display: inline-block;
  `;
  
  const sortBtn = document.createElement('button');
  sortBtn.id = 'sort-dropdown-btn';
  sortBtn.style.cssText = `
    background: rgba(20,30,50,0.8);
    border: 1px solid rgba(45,90,227,0.4);
    border-radius: 30px;
    padding: 8px 20px;
    color: white;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 10px;
  `;
  sortBtn.innerHTML = `📊 <span id="selected-sort-name">Default</span> <span style="font-size: 12px;">▼</span>`;
  
  const sortMenu = document.createElement('div');
  sortMenu.style.cssText = `
    position: absolute;
    top: 100%;
    right: 0;
    background: rgba(15,20,40,0.98);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(45,90,227,0.4);
    border-radius: 16px;
    margin-top: 8px;
    min-width: 160px;
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    z-index: 1000;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  `;
  
  const sortOptions = [
    { value: 'default', label: 'Default', icon: '🔄' },
    { value: 'name-asc', label: 'Name A-Z', icon: '📝' },
    { value: 'name-desc', label: 'Name Z-A', icon: '📝' },
    { value: 'rating-desc', label: 'Highest Rated', icon: '⭐' },
    { value: 'rating-asc', label: 'Lowest Rated', icon: '⭐' }
  ];
  
  sortOptions.forEach(opt => {
    const item = document.createElement('div');
    item.style.cssText = `
      padding: 10px 16px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 10px;
      color: ${currentSort === opt.value ? '#ffcc00' : 'rgba(255,255,255,0.7)'};
      background: ${currentSort === opt.value ? 'rgba(255,204,0,0.1)' : 'transparent'};
    `;
    item.innerHTML = `${opt.icon} ${opt.label}`;
    
    item.onmouseenter = () => {
      item.style.background = 'rgba(45,90,227,0.2)';
      item.style.color = '#ffcc00';
    };
    item.onmouseleave = () => {
      item.style.background = currentSort === opt.value ? 'rgba(255,204,0,0.1)' : 'transparent';
      item.style.color = currentSort === opt.value ? '#ffcc00' : 'rgba(255,255,255,0.7)';
    };
    item.onclick = () => {
      currentSort = opt.value;
      document.getElementById('selected-sort-name').textContent = opt.label;
      filterAndSort();
      sortMenu.style.maxHeight = '0';
      sortMenu.style.opacity = '0';
      categoryDropdownOpen = false;
      
      sortBtn.style.borderColor = '#ffcc00';
      setTimeout(() => {
        sortBtn.style.borderColor = 'rgba(45,90,227,0.4)';
      }, 500);
    };
    
    sortMenu.appendChild(item);
  });
  
  container.appendChild(sortBtn);
  container.appendChild(sortMenu);
  
  let sortDropdownOpen = false;
  
  sortBtn.onclick = (e) => {
    e.stopPropagation();
    if (sortDropdownOpen) {
      sortMenu.style.maxHeight = '0';
      sortMenu.style.opacity = '0';
      sortDropdownOpen = false;
    } else {
      sortMenu.style.maxHeight = '400px';
      sortMenu.style.opacity = '1';
      sortDropdownOpen = true;
    }
  };
  
  document.addEventListener('click', (e) => {
    if (!container.contains(e.target) && sortDropdownOpen) {
      sortMenu.style.maxHeight = '0';
      sortMenu.style.opacity = '0';
      sortDropdownOpen = false;
    }
  });
  
  return container;
}

// Add filter bar with dropdowns
function addCategoryFilterBar() {
  const searchContainer = document.querySelector('.center');
  if (!searchContainer || document.getElementById('category-filter-bar')) return;
  
  const filterBar = document.createElement('div');
  filterBar.id = 'category-filter-bar';
  filterBar.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
    justify-content: center;
    align-items: center;
    margin: 15px auto;
    max-width: 900px;
  `;
  
  const categoryDropdown = createCategoryDropdown();
  const sortDropdown = createSortDropdown();
  
  filterBar.appendChild(categoryDropdown);
  filterBar.appendChild(sortDropdown);
  
  searchContainer.parentNode.insertBefore(filterBar, searchContainer.nextSibling);
}

// Initialize everything
function initCategories() {
  storeOriginalOrder();
  if (!document.getElementById('category-filter-bar')) {
    addCategoryFilterBar();
  }
  addCategoryTags();
  filterAndSort();
}

// Run when games load
if (typeof gamesData !== 'undefined') {
  setTimeout(initCategories, 500);
}

// Watch for games container changes
if (typeof MutationObserver !== 'undefined') {
  const observer = new MutationObserver(() => {
    addCategoryTags();
    if (!document.getElementById('category-filter-bar')) {
      addCategoryFilterBar();
    }
    storeOriginalOrder();
    filterAndSort();
  });
  const gamesContainer = document.getElementById('gamesContainer');
  if (gamesContainer) {
    observer.observe(gamesContainer, { childList: true, subtree: true });
  }
}

console.log('✅ Category dropdown ready! Click the category button to see all options');
