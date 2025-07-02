export default async function handler(req, res) {
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
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: `Generá una receta detallada para: ${input}.
Indicá los ingredientes con cantidades claras y los pasos numerados para prepararla.`
          }
        ],
        max_tokens: 512,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices.length) {
      return res.status(500).json({ error: 'No se generó contenido', detalle: data });
    }

    const texto = data.choices[0].message.content;
    res.status(200).json({ receta: texto });
  } catch (error) {
    res.status(500).json({ error: 'Error al generar receta', detalle: error.toString() });
  }
}
