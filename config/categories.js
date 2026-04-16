// ===== GAME CATEGORIES / TAGS =====

const GAME_CATEGORIES = {
  'action': ['shooter', 'fighting', 'beat', 'combat', 'battle', 'war', 'gun', 'shoot'],
  'puzzle': ['puzzle', 'match', 'brain', 'logic', 'memory', 'sudoku', 'tetris', 'blocks'],
  'racing': ['race', 'racing', 'drive', 'car', 'bike', 'motor', 'speed', 'drift'],
  'sports': ['sport', 'football', 'soccer', 'basketball', 'baseball', 'tennis', 'golf'],
  'adventure': ['adventure', 'quest', 'explore', 'journey', 'rpg', 'story'],
  'platformer': ['platform', 'jump', 'run', 'runner', 'mario', 'sonic'],
  'strategy': ['strategy', 'tower', 'defense', 'chess', 'simulation', 'sim'],
  'multiplayer': ['multiplayer', 'online', 'co-op', 'versus', 'pvp'],
  'arcade': ['arcade', 'classic', 'retro', 'pixel', 'space', 'invader'],
  'horror': ['horror', 'scary', 'creepy', 'haunted', 'ghost', 'zombie']
};

function detectGameCategory(gameName) {
  const lowerName = gameName.toLowerCase();
  for (const [category, keywords] of Object.entries(GAME_CATEGORIES)) {
    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        return category;
      }
    }
  }
  return 'other';
}

function getCategoryIcon(category) {
  const icons = {
    'action': '⚔️',
    'puzzle': '🧩',
    'racing': '🏎️',
    'sports': '⚽',
    'adventure': '🗺️',
    'platformer': '🏃',
    'strategy': '♟️',
    'multiplayer': '👥',
    'arcade': '🕹️',
    'horror': '👻',
    'other': '🎮'
  };
  return icons[category] || '🎮';
}

function getCategoryColor(category) {
  const colors = {
    'action': '#ff4444',
    'puzzle': '#44ff44',
    'racing': '#ff8844',
    'sports': '#44ff88',
    'adventure': '#44aaff',
    'platformer': '#ff44ff',
    'strategy': '#88ff44',
    'multiplayer': '#ffaa44',
    'arcade': '#ff44aa',
    'horror': '#aa44ff',
    'other': '#aaaaaa'
  };
  return colors[category] || '#aaaaaa';
}

// Add category tag to game cards
function addCategoryTags() {
  document.querySelectorAll('.game').forEach(gameCard => {
    if (gameCard.hasAttribute('data-category-added')) return;
    
    const gameName = gameCard.querySelector('p')?.textContent;
    if (gameName) {
      const category = detectGameCategory(gameName);
      const categoryTag = document.createElement('div');
      categoryTag.className = 'game-category';
      categoryTag.style.cssText = `
        display: inline-block;
        font-size: 10px;
        padding: 2px 8px;
        border-radius: 20px;
        background: ${getCategoryColor(category)}20;
        color: ${getCategoryColor(category)};
        margin-top: 5px;
        font-family: monospace;
      `;
      categoryTag.innerHTML = `${getCategoryIcon(category)} ${category}`;
      gameCard.appendChild(categoryTag);
      gameCard.setAttribute('data-category', category);
      gameCard.setAttribute('data-category-added', 'true');
    }
  });
}

// Filter games by category
function filterByCategory(category) {
  const games = document.querySelectorAll('.game');
  if (category === 'all') {
    games.forEach(game => game.style.display = '');
    return;
  }
  
  games.forEach(game => {
    const gameCategory = game.getAttribute('data-category');
    if (gameCategory === category) {
      game.style.display = '';
    } else {
      game.style.display = 'none';
    }
  });
}

// Add category filer bar to homepage
function addCategoryFilterBar() {
  const searchContainer = document.querySelector('.center');
  if (!searchContainer || document.getElementById('category-filter-bar')) return;
  
  const filterBar = document.createElement('div');
  filterBar.id = 'category-filter-bar';
  filterBar.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
    margin: 15px auto;
    max-width: 800px;
  `;
  
  const categories = ['all', 'action', 'puzzle', 'racing', 'sports', 'adventure', 'platformer', 'strategy', 'multiplayer', 'arcade', 'horror'];
  
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'category-btn';
    btn.setAttribute('data-category', cat);
    btn.style.cssText = `
      background: rgba(20,30,50,0.8);
      border: 1px solid rgba(45,90,227,0.4);
      border-radius: 30px;
      padding: 6px 14px;
      color: white;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    `;
    btn.innerHTML = cat === 'all' ? '🎮 all' : `${getCategoryIcon(cat)} ${cat}`;
    btn.onmouseenter = () => {
      btn.style.borderColor = getCategoryColor(cat);
      btn.style.transform = 'translateY(-2px)';
    };
    btn.onmouseleave = () => {
      btn.style.borderColor = 'rgba(45,90,227,0.4)';
      btn.style.transform = 'translateY(0)';
    };
    btn.onclick = () => {
      document.querySelectorAll('.category-btn').forEach(b => {
        b.style.background = 'rgba(20,30,50,0.8)';
        b.style.color = 'white';
      });
      btn.style.background = `linear-gradient(135deg, ${getCategoryColor(cat)}40, ${getCategoryColor(cat)}20)`;
      btn.style.color = getCategoryColor(cat);
      filterByCategory(cat);
    };
    filterBar.appendChild(btn);
  });
  
  searchContainer.parentNode.insertBefore(filterBar, searchContainer.nextSibling);
}

// Run when games load
if (typeof MutationObserver !== 'undefined') {
  const observer = new MutationObserver(() => {
    addCategoryTags();
    if (!document.getElementById('category-filter-bar')) {
      addCategoryFilterBar();
    }
  });
  observer.observe(document.getElementById('gamesContainer'), { childList: true, subtree: true });
}

console.log('✅ Game Categories ready!');
