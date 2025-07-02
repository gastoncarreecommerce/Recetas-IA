import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const input = req.body.input;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!input || !apiKey) {
    return res.status(400).json({ error: 'Falta input o API key' });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "models/text-bison-001" });

    const result = await model.generateContent([
      `Generá una receta detallada para: ${input}.
Indicá los ingredientes con cantidades y los pasos para prepararla.`
    ]);

    const text = result.response.text();
    res.status(200).json({ receta: text });
  } catch (error) {
    res.status(500).json({ error: 'Error al generar receta', detalle: error.toString() });
  }
}
