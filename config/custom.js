// Initialize the homepage
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('title').textContent = 'fanter beta';
  document.getElementById('subtitle').textContent = 'v0.25, some settings complete, more games added, bugfixes and more coming soon! :3';
  
  // Load your games
  loadGames();
  
  // Setup search functionality
  setupSearch();
});

async function loadGames() {
  // You can replace this with your actual games data
  const games = [
    { name: 'Game 1', url: 'game1' },
    { name: 'Game 2', url: 'game2' },
    // Add more games here
  ];
  
  const container = document.getElementById('gamesContainer');
  games.forEach(game => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.innerHTML = `<h3>${game.name}</h3>`;
    card.onclick = () => {
      window.location.href = `/play.html?gameurl=${game.url}`;
    };
    container.appendChild(card);
  });
}

function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  const gameCards = document.querySelectorAll('.game-card');
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    gameCards.forEach(card => {
      const gameName = card.textContent.toLowerCase();
      card.style.display = gameName.includes(query) ? 'block' : 'none';
    });
  });
}

// ===== LOADING SCREEN WITH MATRIX RAIN =====
(function() {
  const loadingScreen = document.getElementById('loadingScreen');
  const progressBar = document.querySelector('.loading-progress-bar');
  const statusText = document.querySelector('.loading-status');
  
  // Matrix Rain Effect
  const canvas = document.getElementById('matrixCanvas');
  const ctx = canvas.getContext('2d');
  
  let width = window.innerWidth;
  let height = window.innerHeight;
  let columns = [];
  let drops = [];
  
  // Matrix characters (green code)
  const matrixChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#%&@!?<>{}[]()*+-=~`";
  
  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    
    // Initialize drops
    columns = Math.floor(width / 20);
    drops = [];
    for (let i = 0; i < columns; i++) {
      drops.push(Math.random() * -height);
    }
  }
  
  function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = '#00ff88';
    ctx.font = '16px monospace';
    
    for (let i = 0; i < drops.length; i++) {
      const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
      const x = i * 20;
      const y = drops[i] * 20;
      
      // Random green shades
      const greenShades = ['#00ff88', '#00cc66', '#33ff99', '#00ffaa'];
      ctx.fillStyle = greenShades[Math.floor(Math.random() * greenShades.length)];
      
      ctx.fillText(text, x, y);
      
      if (y > height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
  }
  
  resizeCanvas();
  let matrixInterval = setInterval(drawMatrix, 50);
  
  window.addEventListener('resize', resizeCanvas);
  
  // Random glitch blocks (broken monitor effect)
  function createGlitchBlock() {
    const block = document.createElement('div');
    block.className = 'glitch-block';
    block.style.left = Math.random() * 100 + '%';
    block.style.top = Math.random() * 100 + '%';
    block.style.width = Math.random() * 200 + 50 + 'px';
    block.style.height = Math.random() * 10 + 2 + 'px';
    block.style.background = `rgba(${Math.random() * 255}, ${Math.random() * 100}, ${Math.random() * 100}, 0.5)`;
    document.body.appendChild(block);
    
    setTimeout(() => block.remove(), 500);
  }
  
  // Random colored glitch blocks
  function createColorGlitch() {
    const glitch = document.createElement('div');
    glitch.style.cssText = `
      position: fixed;
      top: ${Math.random() * 100}%;
      left: ${Math.random() * 100}%;
      width: ${Math.random() * 300 + 50}px;
      height: ${Math.random() * 20 + 5}px;
      background: ${Math.random() > 0.5 ? 'rgba(255, 0, 0, 0.4)' : 'rgba(0, 255, 0, 0.4)'};
      pointer-events: none;
      z-index: 99999;
      animation: glitchFlash 0.2s ease-out forwards;
    `;
    document.body.appendChild(glitch);
    setTimeout(() => glitch.remove(), 200);
  }
  
  // Random screen shake
  function screenShake() {
    if (Math.random() > 0.95) {
      loadingScreen.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
      setTimeout(() => {
        loadingScreen.style.transform = 'translate(0, 0)';
      }, 100);
    }
  }
  
  // Simulate loading progress
  let progress = 0;
  const statusMessages = [
    "Initializing fanter.OS...",
    "Loading core modules...",
    "Connecting to database...",
    "Loading games library...",
    "Applying custom themes...",
    "Checking for updates...",
    "Loading user preferences...",
    "Almost there...",
    "Starting fanter.OS..."
  ];
  
  let messageIndex = 0;
  
  const loadInterval = setInterval(() => {
    progress += Math.random() * 15 + 5;
    
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadInterval);
      clearInterval(matrixInterval);
      
      statusText.textContent = "Complete! Starting fanter.OS...";
      progressBar.style.width = '100%';
      
      // Hide loading screen after delay
      setTimeout(() => {
        loadingScreen.classList.add('hide');
        
        // Remove loading screen from DOM after animation
        setTimeout(() => {
          loadingScreen.remove();
        }, 800);
      }, 500);
    }
    
    progressBar.style.width = progress + '%';
    
    // Update status message
    if (progress > (messageIndex + 1) * 11 && messageIndex < statusMessages.length - 1) {
      messageIndex++;
      statusText.textContent = statusMessages[messageIndex];
    }
    
    // Create random glitch effcts during loading
    if (Math.random() > 0.85) {
      createGlitchBlock();
    }
    
    if (Math.random() > 0.9) {
      createColorGlitch();
    }
    
    screenShake();
    
  }, 300);
  
  // extra glitch effects on the title
  const title = document.querySelector('.loading-title');
  if (title) {
    setInterval(() => {
      if (Math.random() > 0.92 && progress < 100) {
        const originalText = title.textContent;
        const glitchChars = "!@#$%^&*()_+{}[]|\\:;\"'<>,.?/";
        const glitched = originalText.split('').map(char => {
          if (Math.random() > 0.9) {
            return glitchChars[Math.floor(Math.random() * glitchChars.length)];
          }
          return char;
        }).join('');
        title.textContent = glitched;
        
        setTimeout(() => {
          title.textContent = originalText;
        }, 100);
      }
    }, 200);
  }
  
  // Prevent user from interacting with the page while loading
  loadingScreen.addEventListener('click', (e) => {
    e.stopPropagation();
  });
  
  // Ensure canvs updates on resize
  window.addEventListener('resize', () => {
    resizeCanvas();
  });
})();
