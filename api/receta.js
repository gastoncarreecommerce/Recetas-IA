export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { input } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!input || !apiKey) {
    return res.status(400).json({ error: 'Falta input o API Key' });
  }

  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: `Generá una receta detallada para: ${input}. Indicá los ingredientes con cantidades y los pasos para prepararla.` }],
            role: 'user'
          }
        ]
      })
    });

    const data = await response.json();

    if (!data.candidates || !data.candidates.length) {
      return res.status(500).json({ error: 'No se generó contenido', detalle: data });
    }

    const texto = data.candidates[0].content.parts.map(function(p) {
      return p.text;
    }).join('\n');

    res.status(200).json({ receta: texto });
  } catch (error) {
    res.status(500).json({ error: 'Error al generar receta', detalle: error.toString() });
  }
}
