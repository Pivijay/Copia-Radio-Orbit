import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

// Inicializamos el cliente fuera del handler para aprovechar el "warm start" de las funciones serverless.
// Se utiliza process.env.API_KEY, la variable de entorno pre-configurada para este entorno.
const ai = new GoogleGenAI({ 
  apiKey: process.env.API_KEY || '' 
});

/**
 * Endpoint de API para procesar solicitudes de chat mediante Gemini Pro.
 * Este archivo se ejecuta exclusivamente en el servidor de Vercel.
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 1. Solo permitir peticiones POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Método ${req.method} no permitido. Use POST.` });
  }

  try {
    // 2. Extraer y validar el prompt del cuerpo de la petición
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ 
        error: 'El campo "prompt" es obligatorio y debe ser una cadena de texto.' 
      });
    }

    // 3. Generar contenido utilizando el modelo Gemini 3 Pro Preview
    // Según las guías, para "gemini-pro" utilizamos 'gemini-3-pro-preview'
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });

    // 4. Obtener el texto generado (accediendo directamente a la propiedad .text)
    const generatedText = response.text;

    if (!generatedText) {
      throw new Error('La IA no devolvió contenido de texto en la respuesta.');
    }

    // 5. Retornar la respuesta exitosa al frontend
    return res.status(200).json({ text: generatedText });

  } catch (error: any) {
    // 6. Manejo de errores detallado y seguro
    console.error('Error en /api/chat:', error);

    // Intentamos extraer el código de estado de la respuesta de Google GenAI
    const statusCode = error.status || 500;
    const message = error.message || 'Ocurrió un error interno al comunicarse con Gemini.';

    return res.status(statusCode).json({ error: message });
  }
}
