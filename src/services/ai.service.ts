
import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';

@Injectable({ providedIn: 'root' })
export class AiService {
  private ai: GoogleGenAI;
  private apiKey = process.env['API_KEY'] || '';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
  }

  async checkContentSafety(text: string): Promise<boolean> {
    if (!this.apiKey) return true; // Fail open if no key for demo
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Task: Analyze the following message for hate speech, explicit sexual harassment, or severe toxicity.
        Message: "${text}"
        Output ONLY "SAFE" or "UNSAFE".`,
      });
      const res = response.text?.trim().toUpperCase();
      return res === 'SAFE';
    } catch (e) {
      console.error('AI Moderation Error', e);
      return true; // Default to safe on error
    }
  }

  async getCompatibilityAnalysis(userA: any, userB: any): Promise<{ score: number, analysis: string, iceBreaker: string }> {
    if (!this.apiKey) return { score: 85, analysis: "AI Offline: Sembra un'ottima coppia!", iceBreaker: "Ciao, come va?" };

    const prompt = `
      Analyze the compatibility between these two dating profiles.
      User A (Me): Age ${userA.age}, Interests: ${userA.interests.join(', ')}, Bio: "${userA.bio}".
      User B (Match): Age ${userB.age}, Interests: ${userB.interests.join(', ')}, Bio: "${userB.bio}".

      Provide a JSON response with:
      - score: number (0-100)
      - analysis: string (max 20 words, witty and insightful in Italian)
      - iceBreaker: string (a funny or engaging opening line in Italian)
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      
      const json = JSON.parse(response.text || '{}');
      return {
        score: json.score || 75,
        analysis: json.analysis || "Una combinazione interessante!",
        iceBreaker: json.iceBreaker || "Ciao!"
      };
    } catch (e) {
      return { score: 70, analysis: "Compatibilità misteriosa...", iceBreaker: "Piacere di conoscerti!" };
    }
  }

  async verifyIdentity(imageData: string): Promise<boolean> {
     if (!this.apiKey) return true;
     try {
       // Simple check: Is there a face?
       const response = await this.ai.models.generateContent({
         model: 'gemini-2.5-flash',
         contents: {
           parts: [
             { inlineData: { mimeType: 'image/jpeg', data: imageData.split(',')[1] } },
             { text: 'Is there a clearly visible real human face in this photo? Answer YES or NO.' }
           ]
         }
       });
       return response.text?.trim().toUpperCase().includes('YES') || false;
     } catch(e) {
       console.error(e);
       return true; // Simulation fallback
     }
  }
}
