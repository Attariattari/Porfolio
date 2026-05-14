import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function callGeminiWithRetry(fn, retries = 3, delay = 5000) {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if ((error.message?.includes("429") || error.status === 429) && i < retries - 1) {
        console.warn(`[Gemini] 429 detected, retrying in ${delay}ms... (Attempt ${i + 1}/${retries})`);
        await sleep(delay);
        delay *= 2; // Exponential backoff
        continue;
      }
      throw error;
    }
  }
  throw lastError || new Error("Failed after multiple retries");
}


/**
 * Generates a response from Gemini AI with optimized settings for natural writing.
 * Includes automatic model fallback for quota management.
 */
export async function generateGeminiResponse(input, config = {}) {
  const { 
    temperature = 0.7, 
    topP = 0.9, 
    topK = 40, 
    maxOutputTokens = 4096,
    responseMimeType = "text/plain",
    systemInstruction = "" 
  } = config;

  // List of models to try in order of preference
  const modelsToTry = [
    "gemini-flash-latest",
    "gemini-2.0-flash",
    "gemini-pro-latest"
  ];

  let lastError;

  for (const modelName of modelsToTry) {
    try {
      return await callGeminiWithRetry(async () => {
        const modelConfig = { 
          model: modelName,
          generationConfig: {
            temperature,
            topP,
            topK,
            maxOutputTokens,
            responseMimeType
          }
        };

        if (systemInstruction) {
          modelConfig.systemInstruction = { text: systemInstruction };
        }

        const model = genAI.getGenerativeModel(modelConfig);
        const result = await model.generateContent(input);
        const response = await result.response;
        const text = response.text();

        if (process.env.NODE_ENV !== "production") {
          console.log(`--- Gemini Request [Model: ${modelName}] ---`);
          console.log("Config:", JSON.stringify({ temperature, topP, topK, maxOutputTokens, responseMimeType }));
          if (systemInstruction) console.log("System Instruction Snippet:", systemInstruction.substring(0, 100) + "...");
          console.log("Input Snippet:", typeof input === 'string' ? input.substring(0, 100) + "..." : "Object input");
          console.log("--- Gemini Response ---");
          console.log("Text length:", text.length);
        }

        return text;
      }, 2, 2000); // Fewer retries per model to move to fallback faster
    } catch (error) {
      lastError = error;
      const isQuotaError = error.message?.includes("429") || error.status === 429;
      
      if (isQuotaError) {
        console.warn(`[Gemini] Quota exceeded for ${modelName}. Attempting fallback to next model...`);
        continue; // Try the next model in the list
      }
      
      throw error; // If it's not a quota error, rethrow immediately
    }
  }

  throw lastError || new Error("All Gemini models failed or reached quota limits.");
}

/**
 * Validates content using Gemini multimodal capabilities
 */
export async function reviewContentWithGemini(prompt, imageUrl) {
  return await callGeminiWithRetry(async () => {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // Fetch image and convert to base64 for Gemini
    const imageResp = await fetch(imageUrl);
    const buffer = await imageResp.arrayBuffer();
    
    const parts = [
      { text: prompt },
      {
        inlineData: {
          data: Buffer.from(buffer).toString("base64"),
          mimeType: "image/jpeg"
        }
      }
    ];

    const result = await model.generateContent(parts);
    return result.response.text();
  });
}



