// js/main.js - Corregido y funcional
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const checkbox = document.querySelector(".theme-switch__checkbox");

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

  setTheme(isDark);

  // === Conexión MQTT (solo en mqtt.html) ===
  if (window.location.pathname.includes("mqtt.html")) {
    if (typeof mqtt === 'undefined') {
      console.error("❌ ERROR: mqtt.js no se ha cargado.");
      return;
    }

    const connectionStatus = document.querySelector('.connection-status-small');
    const statusText = connectionStatus?.querySelector('.status-text');
    const lastUpdate = connectionStatus?.querySelector('.last-update');
    let lastDataTime = null;

    const updateLastUpdate = () => {
      if (!lastDataTime) {
        lastUpdate.textContent = 'última: nunca';
        return;
      }
      const diff = Math.floor((Date.now() - lastDataTime) / 1000);
      lastUpdate.textContent = `última: hace ${diff}s`;
    };
    setInterval(updateLastUpdate, 1000);

    const broker = "wss://broker.hivemq.com:8884/mqtt";
    const client = mqtt.connect(broker, {
      clientId: "webClient_" + Math.random().toString(16).substr(2, 8),
      protocolVersion: 4,
      clean: true,
      connectTimeout: 10000,
      reconnectPeriod: 3000
    });

    const topics = {
      temp: "horus/vvb/temperatura",
      hum: "horus/vvb/humedad",
      press: "horus/vvb/presion",
      alt: "horus/vvb/altitud",
      pm25: "horus/vvb/pm25",
      pm10: "horus/vvb/pm10",
      windSpeed: "horus/vvb/wind_speed",
      windDir: "horus/vvb/wind_direction",
      gas: "horus/vvb/gas",
      lluvia: "horus/vvb/lluvia"
    };

    const elements = {};
    Object.keys(topics).forEach(key => {
      const id = key === 'windSpeed' ? 'wind' : key;
      const el = document.getElementById(id);
      if (el) elements[key] = el;
    });

    client.on("connect", () => {
      console.log("✅ Conectado a broker.hivemq.com:8884");
      statusText.textContent = "Conectado";
      connectionStatus.classList.add('connected');
      Object.values(topics).forEach(topic => client.subscribe(topic));
    });

    client.on("message", (topic, payload) => {
      const value = payload.toString().trim();
      if (!value) return;

      const key = Object.keys(topics).find(k => topics[k] === topic);
      const el = elements[key];
      if (!el) return;

      if (key === "temp") el.textContent = `${value} °C`;
      else if (key === "press") el.textContent = `${value} hPa`;
      else if (key === "windSpeed") el.textContent = `${value} km/h`;
      else if (key === "windDir") el.textContent = `${value} °`;
      else if (key === "gas") el.textContent = `${value} kΩ`;
      else if (key === "lluvia") el.textContent = `${value} mm`;
      else el.textContent = value;

      lastDataTime = Date.now();
    });
  }

  // === Gráficos semanales (analisis.html) ===
  if (window.location.pathname.includes("analisis.html")) {
    if (typeof Papa === 'undefined') {
      console.error("❌ ERROR: PapaParse.js no se cargó.");
      return;
    }
    if (typeof Chart === 'undefined') {
      console.error("❌ ERROR: chart.js no se cargó.");
      return;
    }

    const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRWCl1SexRqaXBFHYwWMLz2NjeZ0JlHmSRa2Ia_XUz974vGK8a74QgBqfhZRGxKkEzDGn1JdD1sDLpq/pub?gid=0&single=true&output=csv";

    Papa.parse(sheetURL, {
      download: true,
      header: false,
      skipEmptyLines: true,
      complete: function(results) {
        try {
          const data = results.data.slice(1).map(row => ({
            fecha: row[0]?.split(' ')[0] || '',
            temp: parseFloat(row[2]),
            hum: parseFloat(row[3]),
            pres: parseFloat(row[4]),
            pm25: parseFloat(row[6]),
            pm10: parseFloat(row[7]),
            wind: parseFloat(row[8]),
            gas: parseFloat(row[10]),
            lluvia: parseFloat(row[11])
          })).filter(row => row.fecha && !isNaN(row.temp));

          if (data.length === 0) return;

          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          const lastWeekData = data.filter(row => new Date(row.fecha) >= oneWeekAgo);

          if (lastWeekData.length === 0) return;

          createChart('tempChart', 'Temperatura (°C)', lastWeekData, 'temp', '#FF6384');
          createChart('humChart', 'Humedad (%)', lastWeekData, 'hum', '#36A2EB');
          createChart('pressChart', 'Presión (hPa)', lastWeekData, 'pres', '#FFCE56');
          createChart('pm25Chart', 'PM2.5 (µg/m³)', lastWeekData, 'pm25', '#4BC0C0');
          createChart('windChart', 'Viento (km/h)', lastWeekData, 'wind', '#C9CBCF');
          createChart('rainChart', 'Lluvia (mm)', lastWeekData, 'lluvia', '#46BFBD');
          createChart('gasChart', 'Resistencia de Gas (kΩ)', lastWeekData, 'gas', '#FDB45C');

        } catch (error) {
          console.error("❌ Error procesando datos:", error);
        }
      },
      error: function(error) {
        console.error("❌ Error al cargar CSV:", error);
      }
    });

    function createChart(canvasId, label, data, field, color) {
      const ctx = document.getElementById(canvasId).getContext('2d');
      new Chart(ctx, {
        type: 'line',
         {  // ← CORRECTO: ahora tiene ''
          labels: data.map(d => d.fecha),
          datasets: [{
            label: label,
             data.map(d => d[field] || null),  // ← CORRECTO: ahora tiene ''
            borderColor: color,
            backgroundColor: color + '40',
            borderWidth: 3,
            tension: 0.3,
            pointRadius: 3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { title: { display: true, text: 'Fecha' } },
            y: { beginAtZero: false, title: { display: true, text: label } }
          }
        }
      });
    }
  }
});
