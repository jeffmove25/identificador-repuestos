// === VARIABLES ===
const fileInput = document.getElementById('fileInput');
const searchBtn = document.getElementById('searchBtn');
const preview = document.getElementById('preview');
const results = document.getElementById('results');

// ⚠️ Coloca tu clave de Bing Visual Search aquí (desde Azure Portal)
const BING_API_KEY = "TU_API_KEY_AQUI";

// === EVENTO PRINCIPAL ===
searchBtn.addEventListener('click', async () => {
  const file = fileInput.files[0];
  if (!file) {
    alert("Selecciona una imagen primero");
    return;
  }

  // Mostrar vista previa
  const reader = new FileReader();
  reader.onload = e => {
    preview.innerHTML = `<img src="${e.target.result}" alt="Vista previa">`;
  };
  reader.readAsDataURL(file);

  // Preparar datos
  const formData = new FormData();
  formData.append("image", file);

  results.innerHTML = "<p>🔎 Buscando coincidencias...</p>";

  // Llamada a la API de Bing Visual Search
  try {
    const response = await fetch("https://api.bing.microsoft.com/v7.0/images/visualsearch", {
      method: "POST",
      headers: { "Ocp-Apim-Subscription-Key": BING_API_KEY },
      body: formData
    });

    const data = await response.json();
    showResults(data);
  } catch (error) {
    console.error("Error:", error);
    results.innerHTML = "<p>❌ Error al buscar la imagen. Revisa tu conexión o tu clave API.</p>";
  }
});

// === FUNCIÓN PARA MOSTRAR RESULTADOS ===
function showResults(data) {
  results.innerHTML = "";
  if (!data.tags || data.tags.length === 0) {
    results.innerHTML = "<p>No se encontraron resultados similares.</p>";
    return;
  }

  const items = data.tags[0].actions?.[0]?.data?.value || [];
  if (items.length === 0) {
    results.innerHTML = "<p>No se encontraron coincidencias visuales.</p>";
    return;
  }

  items.slice(0, 8).forEach(item => {
    const div = document.createElement('div');
    div.className = "result-item";
    div.innerHTML = `
      <img src="${item.thumbnailUrl}" alt="Resultado">
      <p>${item.name || "Repuesto similar"}</p>
      <a href="${item.hostPageUrl}" target="_blank">Ver fuente</a>
    `;
    results.appendChild(div);
  });
}

