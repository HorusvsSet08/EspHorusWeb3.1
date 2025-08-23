// analisis.js - Carga datos de Google Sheets y crea gráficas
document.addEventListener("DOMContentLoaded", () => {
  console.log("📊 analisis.js: Cargando datos desde Google Sheets...");

  // 🔗 Reemplaza con tu enlace CSV publicado
  const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/pub?gid=0&single=true&output=csv";

  // Verificar que los scripts estén cargados
  if (typeof Papa === 'undefined') {
    console.error("❌ ERROR: PapaParse.js no se ha cargado.");
    return;
  }

  if (typeof Chart === 'undefined') {
    console.error("❌ ERROR: chart.js no se ha cargado.");
    return;
  }

  // Referencias a los canvas
  const tempCtx = document.getElementById('tempChart')?.getContext('2d');
  const humCtx = document.getElementById('humChart')?.getContext('2d');
  const pressCtx = document.getElementById('pressChart')?.getContext('2d');
  const pm25Ctx = document.getElementById('pm25Chart')?.getContext('2d');
  const pm10Ctx = document.getElementById('pm10Chart')?.getContext('2d');
  const windCtx = document.getElementById('windChart')?.getContext('2d');
  const rainCtx = document.getElementById('rainChart')?.getContext('2d');
  const gasCtx = document.getElementById('gasChart')?.getContext('2d');

  // === Cargar CSV con PapaParse ===
  Papa.parse(sheetURL, {
    download: true,
    header: false,
    skipEmptyLines: true,
    complete: function(results) {
      try {
        // Primer fila: fecha, temperatura, humedad, presion, altitud, pm25, pm10, windDirection, windSpeed, gas, lluvia
        const headers = ["fecha", "temperatura", "humedad", "presion", "altitud", "pm25", "pm10", "windDirection", "windSpeed", "gas", "lluvia"];
        const data = results.data
          .map(row => {
            if (row.length < 11) return null;
            return {
              fecha: row[0].trim(),
              temperatura: parseFloat(row[1]),
              humedad: parseFloat(row[2]),
              presion: parseFloat(row[3]),
              altitud: parseFloat(row[4]),
              pm25: parseFloat(row[5]),
              pm10: parseFloat(row[6]),
              windDirection: row[7].trim(),
              windSpeed: parseFloat(row[8]),
              gas: parseFloat(row[9]),
              lluvia: parseFloat(row[10])
            };
          })
          .filter(row => row && !isNaN(row.temperatura));

        if (data.length === 0) {
          console.warn("⚠️ No se encontraron datos válidos.");
          return;
        }

        // Ordenar por fecha/hora
        data.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        // Filtrar última semana
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const lastWeekData = data.filter(row => new Date(row.fecha) >= oneWeekAgo);

        if (lastWeekData.length === 0) {
          console.warn("⚠️ No hay datos de la última semana.");
          return;
        }

        // Generar gráficas
        if (tempCtx) createChart(tempCtx, "Temperatura (°C)", lastWeekData, 'temperatura', '#FF6384');
        if (humCtx) createChart(humCtx, "Humedad (%)", lastWeekData, 'humedad', '#36A2EB');
        if (pressCtx) createChart(pressCtx, "Presión (hPa)", lastWeekData, 'presion', '#FFCE56');
        if (pm25Ctx) createChart(pm25Ctx, "PM2.5 (µg/m³)", lastWeekData, 'pm25', '#4BC0C0');
        if (pm10Ctx) createChart(pm10Ctx, "PM10 (µg/m³)", lastWeekData, 'pm10', '#9966FF');
        if (windCtx) createChart(windCtx, "Velocidad del Viento (km/h)", lastWeekData, 'windSpeed', '#C9CBCF');
        if (rainCtx) createChart(rainCtx, "Precipitación (mm)", lastWeekData, 'lluvia', '#46BFBD');
        if (gasCtx) createChart(gasCtx, "Resistencia de Gas (kΩ)", lastWeekData, 'gas', '#FDB45C');

      } catch (error) {
        console.error("❌ Error procesando datos:", error);
      }
    },
    error: function(error) {
      console.error("❌ Error al cargar CSV:", error);
    }
  });

  // === Función para crear gráfica ===
  function createChart(ctx, label, data, field, color) {
    new Chart(ctx, {
      type: 'line',
       {
        labels: data.map(row => new Date(row.fecha).toLocaleDateString()),
        datasets: [{
          label: label,
          data: data.map(row => row[field] || null),
          borderColor: color,
          backgroundColor: color + '40',
          borderWidth: 2,
          pointRadius: 2,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: { title: { display: true, text: 'Fecha' } },
          y: { beginAtZero: false, title: { display: true, text: label } }
        }
      }
    });
  }

  // === Sincronizar tema (claro/oscuro) ===
  const body = document.body;
  const checkbox = document.querySelector(".theme-switch__checkbox");
  const isDark = localStorage.getItem("darkMode") === "true";

  body.classList.toggle("dark-mode", isDark);
  body.classList.toggle("light-mode", !isDark);
  if (checkbox) checkbox.checked = isDark;

  if (checkbox) {
    checkbox.addEventListener("change", (e) => {
      body.classList.toggle("dark-mode", e.target.checked);
      body.classList.toggle("light-mode", !e.target.checked);
      localStorage.setItem("darkMode", e.target.checked);
    });
  }
});
