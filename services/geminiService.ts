
import { GoogleGenAI, Chat } from "@google/genai";
import { SynopsisMode } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to handle API calls with automatic fallback
const generateWithFallback = async (
  modelId: string, 
  primaryFn: (model: string) => Promise<any>
) => {
  try {
    return await primaryFn(modelId);
  } catch (error: any) {
    console.warn(`Primary model ${modelId} failed:`, error.message);
    
    // If the error is likely permission/access related or model not found
    // And we aren't already using the most stable model (2.5 Flash)
    if (modelId !== 'gemini-2.5-flash') {
      console.log("Attempting fallback to gemini-2.5-flash...");
      try {
        return await primaryFn('gemini-2.5-flash');
      } catch (fallbackError) {
        // If fallback also fails, throw the original error to preserve context
        console.error("Fallback failed:", fallbackError);
        throw error; 
      }
    }
    throw error;
  }
};

export const generateSynopsis = async (
  scriptText: string,
  wordCount: number,
  mode: SynopsisMode,
  title: string | undefined,
  favorites: string[] = [],
  modelId: string = 'gemini-2.5-flash'
): Promise<string> => {
  const ai = getAI();
  
  let systemInstruction = "You are a professional content editor assistant.";
  
  // AI Learning: Injecting context from favorites
  if (favorites.length > 0) {
    systemInstruction += `\n\nThe user has previously liked the following synopsis styles. Learn from the tone, structure, and vocabulary of these examples to generate the new synopsis:\n\n---\n${favorites.join('\n---\n')}\n---`;
  }

  let prompt = `Generate a synopsis for the following script.
  Target Word Count: approximately ${wordCount} words.
  ${title ? `Title: ${title}` : ''}
  `;

  switch (mode) {
    case SynopsisMode.DESCRIPTIVE:
      prompt += " Style: Descriptive. Explain the script in detail so the user clearly understands the content.";
      break;
    case SynopsisMode.SUSPENSE:
      prompt += " Style: Suspense. Tell the story but end with a hook. Do NOT reveal the main resolution or ending. Keep the reader guessing.";
      break;
    case SynopsisMode.ENGAGING:
      prompt += " Style: Engaging. Focus on the most exciting parts to hook the reader. Do not reveal every detail, just the highlights.";
      break;
    case SynopsisMode.DEFAULT:
    default:
      prompt += " Style: Standard summary.";
      break;
  }

  prompt += `\n\nSCRIPT:\n${scriptText}`;

  const executeGeneration = async (targetModel: string) => {
    const response = await ai.models.generateContent({
      model: targetModel,
      contents: prompt,
      config: {
        systemInstruction,
      }
    });
    return response.text || "Failed to generate synopsis.";
  };

  try {
    return await generateWithFallback(modelId, executeGeneration);
  } catch (error) {
    console.error("Gemini Synopsis Error:", error);
    throw error;
  }
};

export const generateHashtags = async (
  scriptText: string,
  contentDescription: string,
  amount: number,
  favorites: string[] = [],
  modelId: string = 'gemini-2.5-flash'
): Promise<string> => {
  const ai = getAI();

  // AI Learning: Injecting context from favorites
  let learningContext = "";
  if (favorites.length > 0) {
    learningContext = `\n\nUser Preferences (Learn from these previously successful hashtag sets):
    The user responded positively to these sets. Note the mix of broad and niche tags:\n${favorites.join('\n')}`;
  }

  const prompt = `Analyze the following content and generate exactly ${amount} optimized hashtags for social media (YouTube/Instagram/TikTok) visibility.
  
  User Description: ${contentDescription}
  
  ${learningContext}

  Script Content (for context):
  ${scriptText.substring(0, 2000)}... (truncated for brevity)

  Task:
  1. Identify trending keywords related to this topic using search grounding (if available).
  2. Create a list of ${amount} hashtags.
  3. Return ONLY the hashtags separated by spaces.
  `;

  try {
    // Primary attempt: Use selected model WITH tools (Search Grounding)
    try {
      const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });
      return response.text || "Failed to generate hashtags.";
    } catch (toolError: any) {
      // If error is permission denied (common with Search tool), try without tools
      console.warn("Search grounding failed or permission denied. Retrying without search tools.");
      
      // Fallback 1: Same model, NO tools
      try {
        const responseNoTools = await ai.models.generateContent({
            model: modelId,
            contents: prompt,
            // No tools config
        });
        return responseNoTools.text || "Failed to generate hashtags.";
      } catch (modelError) {
          // Fallback 2: If the model itself failed (e.g. 3.0 Pro access denied), try 2.5 Flash
          if (modelId !== 'gemini-2.5-flash') {
              console.warn("Model failed. Retrying with gemini-2.5-flash.");
              const responseFlash = await ai.models.generateContent({
                  model: 'gemini-2.5-flash',
                  contents: prompt,
              });
              return responseFlash.text || "Failed to generate hashtags (fallback).";
          }
          throw modelError;
      }
    }
  } catch (error) {
    console.error("Gemini Hashtag Error:", error);
    throw error;
  }
};

export const createChatSession = () => {
  const ai = getAI();
  return ai.chats.create({
    model: 'gemini-3-pro-preview', // Default chat to the smartest model
    config: {
      systemInstruction: "You are the 'Content Buddy' AI assistant. Your goal is to help content creators with their workflow, offer creative advice, and help them use the app features (Synopsis Generator, Hashtag Optimizer, Studio). Be friendly, concise, and helpful.",
    }
  });
};
