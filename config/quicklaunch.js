// ===== QUICK LAUNCH BAR (Ctrl+K) =====

let quicklaunchActive = false;

function createQuickLaunch() {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'quicklaunch-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.85);
    backdrop-filter: blur(8px);
    z-index: 100000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease;
  `;
  
  // Create modal
  const modal = document.createElement('div');
  modal.style.cssText = `
    width: 90%;
    max-width: 600px;
    background: rgba(20,30,50,0.95);
    border: 2px solid rgba(45,90,227,0.5);
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    transform: translateY(-20px);
    transition: transform 0.2s ease;
  `;
  
  modal.innerHTML = `
    <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
      <span style="font-size: 24px;">🔍</span>
      <input type="text" id="quicklaunch-input" placeholder="search for a game..." style="
        flex: 1;
        background: rgba(0,0,0,0.3);
        border: 1px solid rgba(45,90,227,0.4);
        border-radius: 12px;
        padding: 14px 16px;
        color: white;
        font-size: 16px;
        outline: none;
      ">
      <span style="color: rgba(255,255,255,0.4); font-size: 12px;">ESC</span>
    </div>
    <div id="quicklaunch-results" style="max-height: 400px; overflow-y: auto;"></div>
    <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1); display: flex; gap: 20px; justify-content: center;">
      <span style="font-size: 11px; color: rgba(255,255,255,0.4);">↑↓ navigate</span>
      <span style="font-size: 11px; color: rgba(255,255,255,0.4);">↵ select</span>
      <span style="font-size: 11px; color: rgba(255,255,255,0.4);">esc close</span>
    </div>
  `;
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  
  const input = document.getElementById('quicklaunch-input');
  const resultsDiv = document.getElementById('quicklaunch-results');
  let currentGames = [];
  let selectedIndex = -1;
  
  function updateResults(searchTerm) {
    if (!searchTerm) {
      resultsDiv.innerHTML = '<div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.5);">type to search games...</div>';
      return;
    }
    
    const filtered = currentGames.filter(game => 
      game.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 10);
    
    if (filtered.length === 0) {
      resultsDiv.innerHTML = '<div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.5);">no games found 😔</div>';
      return;
    }
    
    resultsDiv.innerHTML = filtered.map((game, idx) => `
      <div class="quicklaunch-result ${idx === selectedIndex ? 'selected' : ''}" data-index="${idx}" style="
        padding: 12px 16px;
        margin: 4px 0;
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.1s ease;
        background: ${idx === selectedIndex ? 'rgba(45,90,227,0.3)' : 'transparent'};
        border-left: 3px solid ${idx === selectedIndex ? '#ffcc00' : 'transparent'};
      ">
        <div style="font-weight: bold;">${game.name}</div>
        <div style="font-size: 11px; color: rgba(255,255,255,0.5);">press enter to play</div>
      </div>
    `).join('');
    
    document.querySelectorAll('.quicklaunch-result').forEach(el => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.dataset.index);
        const game = filtered[idx];
        if (game) {
          if (typeof trackPlayedGame === 'function') trackPlayedGame(game.name);
          window.location.href = game.url.startsWith('http') ? game.url : `play.html?gameurl=${game.url}/`;
        }
      });
    });
  }
  
  function loadGames() {
    fetch('./config/games.json')
      .then(res => res.json())
      .then(data => {
        currentGames = data;
      })
      .catch(err => console.error('failed to load games:', err));
  }
  
  input.addEventListener('input', (e) => {
    selectedIndex = -1;
    updateResults(e.target.value);
  });
  
  input.addEventListener('keydown', (e) => {
    const results = document.querySelectorAll('.quicklaunch-result');
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
      updateResults(input.value);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, -1);
      updateResults(input.value);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        results[selectedIndex].click();
      } else if (input.value) {
        const filtered = currentGames.filter(game => 
          game.name.toLowerCase().includes(input.value.toLowerCase())
        );
        if (filtered[0]) {
          if (typeof trackPlayedGame === 'function') trackPlayedGame(filtered[0].name);
          window.location.href = filtered[0].url.startsWith('http') ? filtered[0].url : `play.html?gameurl=${filtered[0].url}/`;
        }
      }
    }
  });
  
  loadGames();
  return overlay;
}

function showQuickLaunch() {
  let overlay = document.getElementById('quicklaunch-overlay');
  if (!overlay) {
    overlay = createQuickLaunch();
  }
  overlay.style.visibility = 'visible';
  overlay.style.opacity = '1';
  const input = document.getElementById('quicklaunch-input');
  if (input) {
    input.value = '';
    input.focus();
  }
}

function hideQuickLaunch() {
  const overlay = document.getElementById('quicklaunch-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    overlay.style.visibility = 'hidden';
  }
}

// Keyboard shortut
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    showQuickLaunch();
  }
  if (e.key === 'Escape') {
    hideQuickLaunch();
  }
});

// Click outside to close
document.addEventListener('click', (e) => {
  const overlay = document.getElementById('quicklaunch-overlay');
  if (overlay && overlay.style.visibility === 'visible') {
    if (e.target === overlay) {
      hideQuickLaunch();
    }
  }
});

console.log('✅ Quick Launch Bar ready! Press Ctrl+K');
