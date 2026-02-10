import { GoogleGenAI, Chat } from "@google/genai";
import { Player } from '../types';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

// Initialize the client
const ai = new GoogleGenAI({ apiKey });

// Helper to determine main hero from stats
const getMainHero = (p: Player): string => {
  if (!p.heroStats || Object.keys(p.heroStats).length === 0) return 'Sin Héroe';
  return Object.entries(p.heroStats).sort((a, b) => b[1] - a[1])[0][0];
};

export const createOracleChat = (players: Player[]): Chat => {
  const context = `
    Eres "El Oráculo de Rathe", un juez experto de nivel 3 y estratega maestro del juego de cartas Flesh and Blood (FaB).
    
    Tienes acceso al estado actual de la liga local:
    ${JSON.stringify(players.map(p => ({ name: p.name, hero: getMainHero(p), points: p.totalPoints })))}
    
    Tus funciones son:
    1. Responder dudas de reglas complejas de FaB con precisión.
    2. Dar consejos estratégicos sobre matchups de héroes.
    3. Comentar sobre el desempeño de la liga si te preguntan.
    
    Reglas de estilo:
    - Sé conciso pero útil.
    - Usa terminología correcta de Flesh and Blood (Pitch, Banished Zone, Combat Chain, etc.).
    - Mantén un tono místico pero amigable.
  `;

  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: context,
    },
  });
};

export const analyzeMeta = async (players: Player[]): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analiza brevemente la diversidad de héroes en esta liga y sugiere qué héroe podría tener ventaja contra los más populares. Jugadores: ${JSON.stringify(players.map(p => ({ hero: getMainHero(p) })))}`,
    });
    return response.text || "No se pudo analizar el meta.";
  } catch (error) {
    console.error("Error analyzing meta:", error);
    return "El Oráculo está meditando (Error de conexión).";
  }
};