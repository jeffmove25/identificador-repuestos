const fileInput = document.getElementById('fileInput');
const searchBtn = document.getElementById('searchBtn');
const preview = document.getElementById('preview');
const results = document.getElementById('results');

// Tu clave de Google Cloud Vision
const GOOGLE_API_KEY = "AIzaSyCGwDLbJ5jwpqlWza3A7j7_cFCAUuw3TcA";

searchBtn.addEventListener('click', async () => {
  const file = fileInput.files[0];
  if (!file) {
    alert("Selecciona una imagen primero");
    return;
  }

  // Mostrar vista previa
  const reader = new FileReader();
  reader.onload = async e => {
    preview.innerHTML = `<img src="${e.target.result}" alt="Vista previa">`;

    const base64Image = e.target.result.replace(/^data:image\/[a-z]+;base64,/, "");
    results.innerHTML = "<p>🔎 Analizando imagen con Google Vision...</p>";

    try {
      const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64Image },
              features: [
                { type: "LABEL_DETECTION", maxResults: 5 },
                { type: "TEXT_DETECTION" }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      showResults(data);
    } catch (error) {
      console.error(error);
      results.innerHTML = "<p>❌ Error al conectar con la API de Google.</p>";
    }
  };

  reader.readAsDataURL(file);
});

function showResults(data) {
  results.innerHTML = "";
  const response = data.responses[0];
  
  if (!response) {
    results.innerHTML = "<p>No se pudo analizar la imagen.</p>";
    return;
  }

  // Mostrar etiquetas (tipos de objeto)
  if (response.labelAnnotations) {
    results.innerHTML += "<h3>🔧 Posibles tipos de repuesto:</h3>";
    const labels = response.labelAnnotations.map(l => `<li>${l.description} (${Math.round(l.score * 100)}%)</li>`).join("");
    results.innerHTML += `<ul>${labels}</ul>`;
  }

  // Mostrar texto detectado
  if (response.textAnnotations && response.textAnnotations.length > 0) {
    results.innerHTML += "<h3>🔠 Texto encontrado:</h3>";
    results.innerHTML += `<p>${response.textAnnotations[0].description}</p>`;
  }
}
