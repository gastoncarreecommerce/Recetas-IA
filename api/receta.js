// Middleware para habilitar CORS
function permitirCORS(handler) {
  return async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // Cambiar por 'https://www.carrefour.com.ar' si querés restringir
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    return handler(req, res);
  };
}

// Función principal
export default permitirCORS(async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { input } = req.body;
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!input || !apiKey) {
    return res.status(400).json({ error: 'Falta input o API Key' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openrouter/cypher-alpha:free',
        messages: [
          {
            role: 'system',
            content: 'Sos un chef experto. Siempre devolveme una receta en formato JSON con dos claves: "ingredientes" como lista, y "preparacion" como lista.',
          },
          {
            role: 'user',
            content: input,
          },
        ],
      }),
    });

    const data = await response.json();

    const contenido = data?.choices?.[0]?.message?.content;

    try {
      const json = JSON.parse(contenido);
      return res.status(200).json({ receta: json });
    } catch (err) {
      return res.status(400).json({
        error: 'La IA no devolvió JSON válido',
        raw: contenido,
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: 'No se generó contenido',
      detalle: error,
    });
  }
});
