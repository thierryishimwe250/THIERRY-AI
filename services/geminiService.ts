
import { GoogleGenAI, LiveServerMessage, Modality, Type, GenerateContentResponse } from "@google/genai";

export class GeminiService {
  private static instance: GoogleGenAI | null = null;

  static getClient(): GoogleGenAI {
    if (!this.instance) {
      this.instance = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    }
    return this.instance;
  }

  static async generateChatResponse(prompt: string, history: any[] = []) {
    const ai = this.getClient();
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: "Your name is THIERRY AI. You were created and worked on by THIERRY ISHIMWE, a talented student who studies in LEVEL 4 SOD (Software Development). When asked who created you or what your name is, always mention THIERRY ISHIMWE and LEVEL 4 SOD. Be helpful, professional, and efficient."
      }
    });
    
    return await chat.sendMessageStream({ message: prompt });
  }

  static async generateImage(prompt: string) {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  }

  static async searchGrounding(prompt: string) {
    const ai = this.getClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    return {
      text: response.text,
      grounding: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  }
}

// Audio Utilities
export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encodeBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
