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

// ===== LOADING SCREEN WITH BROKEN WALL BREAKTHROUGHS =====
(function() {
  const loadingScreen = document.getElementById('loadingScreen');
  const progressBar = document.querySelector('.loading-progress-bar');
  const statusText = document.querySelector('.loading-status');
  const brokenWallContainer = document.getElementById('brokenWallContainer');
  
  // Matrix Rain Effect
  const canvas = document.getElementById('matrixCanvas');
  const ctx = canvas.getContext('2d');
  
  let width = window.innerWidth;
  let height = window.innerHeight;
  let drops = [];
  let fontSize = 16;
  let columns;
  
  // Matrix characters
  const matrixChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#%&@!?<>{}[]()*+-=~`";
  
  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    
    columns = Math.floor(width / fontSize);
    drops = [];
    for (let i = 0; i < columns; i++) {
      drops.push(Math.random() * -height);
    }
  }
  
  function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);
    
    for (let i = 0; i < drops.length; i++) {
      const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;
      
      // Gradient green shades
      const greenShades = ['#00ff88', '#00cc66', '#33ff99', '#00ffaa', '#66ffcc'];
      ctx.fillStyle = greenShades[Math.floor(Math.random() * greenShades.length)];
      ctx.font = fontSize + 'px monospace';
      
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
  
  // ===== BROKEN WALL BREAKTHROUGHS =====
  function createBrokenWall() {
    const wall = document.createElement('div');
    wall.className = 'broken-wall';
    
    // Random position
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    
    // Random size (like broken wall pieces)
    const sizeW = Math.random() * 250 + 100;
    const sizeH = Math.random() * 150 + 80;
    
    wall.style.left = posX + '%';
    wall.style.top = posY + '%';
    wall.style.width = sizeW + 'px';
    wall.style.height = sizeH + 'px';
    
    // 30% chance to be a "cracked" red wall
    if (Math.random() > 0.7) {
      wall.classList.add('cracked');
    }
    
    brokenWallContainer.appendChild(wall);
    
    // Remove after animation
    setTimeout(() => {
      if (wall && wall.remove) wall.remove();
    }, 800);
  }
  
  // Create multiple breakthroughs at once (like a wall shattering)
  function createBreakthroughCluster() {
    const clusterSize = Math.floor(Math.random() * 5) + 2; // 2-6 breakthroughs
    for (let i = 0; i < clusterSize; i++) {
      setTimeout(() => {
        createBrokenWall();
      }, i * 50);
    }
  }
  
  // Random screen shake
  function screenShake() {
    if (Math.random() > 0.92) {
      loadingScreen.style.transform = `translate(${Math.random() * 6 - 3}px, ${Math.random() * 6 - 3}px)`;
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
    "Bypassing firewalls...",
    "Decrypting game database...",
    "Loading games library...",
    "Applying custom themes...",
    "Hacking mainframe...",
    "Checking for updates...",
    "Loading user preferences...",
    "Almost there...",
    "Starting fanter.OS..."
  ];
  
  let messageIndex = 0;
  
  // Create breakthroughs at intervals
  const breakthroughInterval = setInterval(() => {
    if (progress < 100) {
      createBreakthroughCluster();
      screenShake();
    }
  }, 800);
  
  // Extra random single breakthroughs
  const randomBreakthroughInterval = setInterval(() => {
    if (progress < 100 && Math.random() > 0.6) {
      createBrokenWall();
    }
  }, 300);
  
  const loadInterval = setInterval(() => {
    progress += Math.random() * 12 + 3;
    
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadInterval);
      clearInterval(matrixInterval);
      clearInterval(breakthroughInterval);
      clearInterval(randomBreakthroughInterval);
      
      statusText.textContent = "Complete! Starting fanter.OS...";
      progressBar.style.width = '100%';
      
      // Hide loading screen after delay
      setTimeout(() => {
        loadingScreen.classList.add('hide');
        
        // Remove loading screen from DOM after animation
        setTimeout(() => {
          if (loadingScreen && loadingScreen.remove) loadingScreen.remove();
        }, 800);
      }, 500);
    }
    
    progressBar.style.width = progress + '%';
    
    // Update status message
    const messageIndexCalc = Math.floor(progress / 10);
    if (messageIndexCalc > messageIndex && messageIndexCalc < statusMessages.length) {
      messageIndex = messageIndexCalc;
      statusText.textContent = statusMessages[messageIndex];
    }
    
  }, 250);
  
  // Extra glitch effects on the title
  const title = document.querySelector('.loading-title');
  if (title) {
    setInterval(() => {
      if (Math.random() > 0.92 && progress < 100) {
        const originalText = title.textContent;
        const glitchChars = "!@#$%^&*()_+{}[]|\\:;\"'<>,.?/";
        const glitched = originalText.split('').map(char => {
          if (Math.random() > 0.85) {
            return glitchChars[Math.floor(Math.random() * glitchChars.length)];
          }
          return char;
        }).join('');
        title.textContent = glitched;
        
        setTimeout(() => {
          title.textContent = originalText;
        }, 100);
      }
    }, 150);
  }
  
  // Block all interaction with the background
  loadingScreen.addEventListener('click', (e) => {
    e.stopPropagation();
    e.preventDefault();
  });
  
  loadingScreen.addEventListener('mousemove', (e) => {
    e.stopPropagation();
  });
  
  // Ensure canvas updates on resize
  window.addEventListener('resize', () => {
    resizeCanvas();
  });
  
  console.log('Loading screen initialized with matrix breakthroughs!');
})();
