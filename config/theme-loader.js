// Theme loader - runs on every page
(function() {
  const settings = JSON.parse(localStorage.getItem("themeSettings") || "{}");
  
  function applyThemeToPage() {
    if (!settings || Object.keys(settings).length === 0) return;
    
    // Remove existing theme classes
    document.body.classList.remove(
      'theme-bg-chill', 'theme-bg-parallax', 'theme-bg-solid', 'theme-bg-aurora', 'theme-bg-void',
      'theme-dark', 'theme-light', 'theme-rainbow', 'theme-neon'
    );
    
    // Apply background type
    if (settings.bg) {
      document.body.classList.add(`theme-bg-${settings.bg}`);
      
      // Handle solid color
      if (settings.bg === 'solid' && settings.solidColor) {
        document.body.style.setProperty('--solid-bg-color', settings.solidColor);
      }
    }
    
    // Apply theme preset (overrides some styles)
    if (settings.theme && settings.theme !== 'chill') {
      document.body.classList.add(`theme-${settings.theme}`);
    }
    
    // Apply text styles
    if (settings.fontColor) {
      document.documentElement.style.setProperty('--text-color', settings.fontColor);
    }
    
    if (settings.fontSize) {
      document.body.style.fontSize = settings.fontSize + 'px';
    }
    
    if (settings.font) {
      // Map font names to proper CSS fonts
      const fontMap = {
        'ubuntu': 'Ubuntu, sans-serif',
        'orbitron': 'Orbitron, monospace',
        'rajdhani': 'Rajdhani, sans-serif',
        'exo2': "'Exo 2', sans-serif",
        'spacegrotesk': "'Space Grotesk', sans-serif"
      };
      document.body.style.fontFamily = fontMap[settings.font] || settings.font;
    }
  }
  
  applyThemeToPage();
})();
