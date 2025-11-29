import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";

// Gemini AI integration - using blueprint:javascript_gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const advisorRequestSchema = z.object({
  role: z.enum(["accountant", "lawyer", "consultant"]),
  question: z.string().min(1).max(1000),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // AI Professional Advisor endpoint
  app.post("/api/ai-advisor", async (req, res) => {
    try {
      const { role, question } = advisorRequestSchema.parse(req.body);

      // Define role-specific system prompts
      const rolePrompts = {
        accountant: `You are an expert accountant and tax advisor specializing in Greek law and business practices. 
Your responses should reference specific Greek tax codes (e.g., Ν. 4172/2013 for income tax), 
regulations, and accounting standards. Provide clear, practical advice based on current Greek legislation.
Keep responses concise (2-3 sentences) and professional.`,
        
        lawyer: `You are an expert lawyer specializing in Greek civil, commercial, and administrative law.
Your responses should reference specific articles from the Greek Civil Code (Αστικός Κώδικας) and other relevant legislation.
Provide clear legal guidance based on Greek law. Keep responses concise (2-3 sentences) and professional.`,
        
        consultant: `You are an expert business consultant with deep knowledge of the Greek business environment.
Provide strategic advice on business operations, market expansion, and organizational efficiency.
Reference proven methodologies and frameworks. Keep responses concise (2-3 sentences) and professional.`
      };

      const systemPrompt = rolePrompts[role];

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: systemPrompt,
        },
        contents: question,
      });

      const answer = response.text || "Unable to generate response. Please try again.";

      res.json({ 
        success: true,
        answer,
        role 
      });

    } catch (error) {
      console.error("AI Advisor error:", error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          error: "Invalid request format" 
        });
        return;
      }

      res.status(500).json({ 
        success: false, 
        error: "Failed to process your request. Please try again." 
      });
    }
  });

  return httpServer;
}
