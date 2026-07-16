import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function createTimeoutError(timeoutMs) {
    const error = new Error(`Gemini request timed out after ${timeoutMs}ms.`);
    error.code = "AI_TIMEOUT";
    return error;
}

function isTimeoutError(error) {
    return (
        error?.code === "AI_TIMEOUT" ||
        error?.name === "AbortError" ||
        /timed?\s*out|timeout|aborted/i.test(error?.message || "")
    );
}

function isModelFallbackError(error) {
    return (
        error.status === 404 ||
        error.status === 429 ||
        error.status >= 500 ||
        isTimeoutError(error) ||
        (error.message &&
            (error.message.includes("404") ||
                error.message.includes("429") ||
                error.message.includes("503") ||
                error.message.includes("not found") ||
                error.message.includes("no longer available") ||
                error.message.includes("overloading") ||
                error.message.includes("temporary")))
    );
}

async function callGeminiWithRetry(
    fn,
    retries = 3,
    delay = 5000,
    deadline = Number.POSITIVE_INFINITY,
) {
    let lastError;
    for (let i = 0; i < retries; i++) {
        const remainingMs = deadline - Date.now();
        if (remainingMs <= 0) throw createTimeoutError(0);

        try {
            return await fn(remainingMs);
        } catch (error) {
            lastError = error;
            const isRetriableError =
                error.status === 429 ||
                error.status >= 500 ||
                (error.message &&
                    (error.message.includes("429") ||
                        error.message.includes("503") ||
                        error.message.includes("overloading") ||
                        error.message.includes("temporary")));

            if (isRetriableError && i < retries - 1) {
                const retryDelay = Math.min(
                    delay,
                    Math.max(0, deadline - Date.now()),
                );
                if (retryDelay <= 0) break;
                console.warn(
                    `[Gemini] Retriable error detected (${error.status || "unknown code"}), retrying in ${retryDelay}ms... (Attempt ${i + 1}/${retries})`,
                );
                await sleep(retryDelay);
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
            systemInstruction = "",
            thinkingBudget,
            timeoutMs = Number(process.env.GEMINI_REQUEST_TIMEOUT_MS || 30000),
    } = config;

    const safeTimeoutMs = Math.max(1000, Number(timeoutMs) || 30000);
    const deadline = Date.now() + safeTimeoutMs;

    // Prioritize models from the environment configuration
    const modelsToTry = [
        process.env.GEMINI_PRIMARY_MODEL,
        process.env.GEMINI_FALLBACK_MODEL,
        "gemini-3.5-flash",
        "gemini-3.1-flash-lite-preview",
        "gemini-2.5-flash",
    ].filter((modelName, index, models) => modelName && models.indexOf(modelName) === index);

    let lastError;

    for (const modelName of modelsToTry) {
        try {
            return await callGeminiWithRetry(
                async(remainingMs) => {
                    const generationConfig = {
                        temperature,
                        topP,
                        topK,
                        maxOutputTokens,
                        responseMimeType,
                    };

                    if (
                        Number.isFinite(thinkingBudget) &&
                        modelName.includes("2.5")
                    ) {
                        generationConfig.thinkingConfig = { thinkingBudget };
                    }

                    const modelConfig = {
                        model: modelName,
                        generationConfig,
                    };

                    if (systemInstruction) {
                        modelConfig.systemInstruction = { text: systemInstruction };
                    }

                    const model = genAI.getGenerativeModel(modelConfig);
                    const result = await model.generateContent(input, {
                        timeout: Math.max(1000, Math.floor(remainingMs)),
                    });
                    const response = await result.response;
                    const text = response.text();

                    if (process.env.NODE_ENV !== "production") {
                        console.log(`--- Gemini Request [Model: ${modelName}] ---`);
                        console.log(
                            "Config:",
                            JSON.stringify({
                                temperature,
                                topP,
                                topK,
                                maxOutputTokens,
                                responseMimeType,
                            }),
                        );
                        if (systemInstruction)
                            console.log(
                                "System Instruction Snippet:",
                                systemInstruction.substring(0, 100) + "...",
                            );
                        console.log(
                            "Input Snippet:",
                            typeof input === "string" ?
                            input.substring(0, 100) + "..." :
                            "Object input",
                        );
                        console.log("--- Gemini Response ---");
                        console.log("Text length:", text.length);
                    }

                    return text;
                },
                2,
                2000,
                deadline,
            ); // Fewer retries per model to move to fallback faster
        } catch (error) {
            lastError = error;

            if (isModelFallbackError(error)) {
                console.warn(
                    `[Gemini] Model ${modelName} failed (${error.status || "unknown code"}). Attempting fallback to next model...`,
                );
                continue; // Try the next model in the list
            }

            throw error; // If it's not a quota/server error, rethrow immediately
        }
    }

    throw (
        lastError || new Error("All Gemini models failed or reached quota limits.")
    );
}

/**
 * Validates content using Gemini multimodal capabilities
 */
export async function reviewContentWithGemini(prompt, imageUrl) {
    return await callGeminiWithRetry(async() => {
        const modelName = process.env.GEMINI_PRIMARY_MODEL || "gemini-3.5-flash";
        const model = genAI.getGenerativeModel({ model: modelName });

        // Fetch image and convert to base64 for Gemini
        const imageResp = await fetch(imageUrl);
        const buffer = await imageResp.arrayBuffer();

        const parts = [
            { text: prompt },
            {
                inlineData: {
                    data: Buffer.from(buffer).toString("base64"),
                    mimeType: "image/jpeg",
                },
            },
        ];

        const result = await model.generateContent(parts);
        return result.response.text();
    });
}
