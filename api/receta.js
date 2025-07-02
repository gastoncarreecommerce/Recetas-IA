// Middleware para habilitar CORS
const allowCors = (handler) => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); // Ajustalo si querés restringirlo
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  return handler(req, res);
};

// Función principal del endpoint
const handler = async (req, res) => {
  const { input } = req.body;
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!input || !apiKey) {
    return res.status(400).json({ error: 'Falta input o API Key' });
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openrouter/cypher-alpha:free",
        messages: [
          {
            role: "user",
            content: `Generá una receta para "${input}" y devolvé solo un JSON válido con esta estructura:

{
  "ingredientes": ["...", "..."],
  "preparacion": ["...", "..."]
}

Sin explicaciones ni texto adicional. Solo JSON plano.`
          }
        ]
      })
    });

    const data = await response.json();
    const completion = data.choices?.[0]?.message?.content;

    if (!completion) {
      return res.status(500).json({
        error: "No se generó contenido",
        detalle: data
      });
    }

    // Eliminar ```json ... ``` si lo incluye
    let raw = completion.trim();
    if (raw.startsWith("```json")) {
      raw = raw.replace(/^```json/, "").replace(/```$/, "").trim();
    }

    let receta;

    try {
      receta = JSON.parse(raw);
    } catch (e) {
      return res.status(500).json({
        error: "La IA no devolvió JSON válido",
        raw
      });
    }

    return res.status(200).json({ receta });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error al generar receta", detalle: error.message });
  }
};

export default allowCors(handler);
