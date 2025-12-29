
import { GoogleGenAI } from "@google/genai";

export const askGemini = async (prompt: string) => {
  try {
    // Inicialización usando exclusivamente API_KEY como requiere el entorno
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: `Eres un experto en radio mundial llamado "Orbit AI". 
        Tu misión es ayudar al usuario a encontrar emisoras. 
        Si el usuario pide un género o lugar, responde de forma breve y entusiasta.
        IMPORTANTE: Siempre termina tu respuesta con una sugerencia de búsqueda en formato: [SEARCH: "termino de busqueda"].
        Ejemplo: "¡Claro! En Cali la salsa es ley. [SEARCH: "Cali Salsa"]"`,
        temperature: 0.7,
      },
    });

    // En el SDK v1.x, response.text es un getter directo que extrae el string
    const text = response.text;
    
    if (!text) {
      return "Recibí una señal vacía del espacio. Intenta de nuevo.";
    }

    return text;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    // Error 404 en Vercel suele significar que la API Key no es válida o no se ha propagado
    return "Error de conexión con Orbit AI. Asegúrate de haber configurado la variable API_KEY en Vercel y reiniciado el despliegue.";
  }
};
