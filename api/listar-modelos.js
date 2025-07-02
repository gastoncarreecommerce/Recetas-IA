import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const result = await genAI.listModels();

    res.status(200).json(result.models);
  } catch (error) {
    res.status(500).json({ error: 'Error al listar modelos', detalle: error.toString() });
  }
}
