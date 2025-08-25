// js/main.js - Controlador de tema, switch y efectos
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const checkbox = document.querySelector(".theme-switch__checkbox");
  let charts = []; // Almacenará todas las instancias de Chart

  if (!body) return;

  // === Cargar tema guardado ===
  const isDark = localStorage.getItem("darkMode") === "true";
  body.classList.toggle("dark-mode", isDark);
  body.classList.toggle("light-mode", !isDark);
  if (checkbox) checkbox.checked = isDark;

  // === Aplicar tema y efectos ===
  function setTheme(isDarkMode) {
    body.classList.toggle("dark-mode", isDarkMode);
    body.classList.toggle("light-mode", !isDarkMode);
    localStorage.setItem("darkMode", isDarkMode);
    updateVisualEffects(isDarkMode);
    
    // Actualizar los gráficos si estamos en la página de análisis
    if (window.location.pathname.includes('analisis.html')) {
      setTimeout(() => {
        charts.forEach(chart => {
          if (chart && typeof chart.update === 'function') {
            chart.update();
          }
        });
      }, 100); // Pequeño retraso para asegurar que el tema ya se aplicó
    }
  }

  function updateVisualEffects(isDarkMode) {
    document.querySelector('.particles')?.remove();
    document.querySelector('.rain')?.remove();

    if (isDarkMode) {
      createRain();
    } else {
      createParticles();
    }
  }

  function createParticles() {
    const particles = document.createElement('div');
    particles.className = 'particles';
    for (let i = 0; i < 50; i++) {
      const dot = document.createElement('div');
      dot.className = 'particle';
      dot.style.left = Math.random() * 100 + 'vw';
      dot.style.top = Math.random() * 100 + 'vh';
      dot.style.opacity = Math.random() * 0.6 + 0.3;
      dot.style.animationDuration = (Math.random() * 10 + 5) + 's';
      dot.style.setProperty('--delay', Math.random());
      particles.appendChild(dot);
    }
    document.body.appendChild(particles);
  }

  function createRain() {
    const rain = document.createElement('div');
    rain.className = 'rain';
    for (let i = 0; i < 40; i++) {
      const drop = document.createElement('div');
      drop.className = 'raindrop';
      drop.style.left = Math.random() * 100 + 'vw';
      drop.style.animationDuration = (Math.random() * 2 + 1) + 's';
      drop.style.opacity = Math.random() * 0.6 + 0.4;
      drop.style.animationDelay = (Math.random() * 3) + 's';
      drop.style.setProperty('--delay', Math.random());
      rain.appendChild(drop);
    }
    document.body.appendChild(rain);
  }

  // === Switch de Galahad ===
  if (checkbox) {
    checkbox.addEventListener("change", (e) => {
      setTheme(e.target.checked);
    });
  }

  // === Inicializar efectos ===
  setTheme(isDark);
  
  // Si estamos en la página de análisis, guarda las instancias de Chart
  if (window.location.pathname.includes('analisis.html')) {
    window.saveChartInstances = (chart) => {
      charts.push(chart);
    };
  }
});
