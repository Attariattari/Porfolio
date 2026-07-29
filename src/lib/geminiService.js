import { GoogleGenerativeAI } from "@google/generative-ai";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const keyCooldowns = new Map();
let preferredKeyIndex = 0;

function getGeminiApiKeys() {
    const configured = [
        process.env.GEMINI_API_KEY_1,
        process.env.GEMINI_API_KEY_2,
        process.env.GEMINI_API_KEY_3,
        process.env.GEMINI_API_KEY_4,
        process.env.GEMINI_API_KEY_5,
        process.env.GEMINI_API_KEY_6,
        process.env.GEMINI_API_KEY,
    ]
        .map((key) => String(key || "").trim())
        .filter(Boolean);
    return [...new Set(configured)].map((key, index) => ({ key, index, label: `Key ${index + 1}` }));
}

function getOrderedApiKeys() {
    const keys = getGeminiApiKeys();
    if (!keys.length) throw new Error("No Gemini API key is configured on the server.");
    const start = Math.min(preferredKeyIndex, keys.length - 1);
    const rotated = [...keys.slice(start), ...keys.slice(0, start)];
    const now = Date.now();
    const available = rotated.filter(({ key }) => (keyCooldowns.get(key) || 0) <= now);
    return available.length ? available : rotated.sort((a, b) => (keyCooldowns.get(a.key) || 0) - (keyCooldowns.get(b.key) || 0));
}

function isKeyRotationError(error) {
    const message = String(error?.message || "").toLowerCase();
    return [400, 401, 403, 429].includes(error?.status) || /api key|quota|rate limit|resource exhausted|permission denied|unauthenticated/.test(message);
}

function coolDownKey(key, error) {
    const message = String(error?.message || "").toLowerCase();
    const longCooldown = error?.status === 429 || /quota|rate limit|resource exhausted/.test(message);
    const authCooldown = [400, 401, 403].includes(error?.status) || /api key|permission denied|unauthenticated/.test(message);
    const cooldownMs = authCooldown ? 60 * 60 * 1000 : longCooldown ? 15 * 60 * 1000 : 30 * 1000;
    keyCooldowns.set(key, Date.now() + cooldownMs);
}

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
    timeoutMs = Number.POSITIVE_INFINITY,
) {
    let lastError;
    for (let i = 0; i < retries; i++) {
        const remainingMs = deadline - Date.now();
        if (remainingMs <= 0) throw createTimeoutError(timeoutMs);

        try {
            return await fn(remainingMs);
        } catch (error) {
            lastError = error;
            const isRetriableError =
                error.status >= 500 ||
                (error.message &&
                    (error.message.includes("503") ||
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
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite",
    ].filter((modelName, index, models) => modelName && models.indexOf(modelName) === index);

    let lastError;
    const apiKeys = getOrderedApiKeys();

    for (const apiKey of apiKeys) {
        const client = new GoogleGenerativeAI(apiKey.key);
        let rotateKey = false;

        for (const modelName of modelsToTry) {
            try {
                const text = await callGeminiWithRetry(
                    async(remainingMs) => {
                        const generationConfig = { temperature, topP, topK, maxOutputTokens, responseMimeType };
                        if (Number.isFinite(thinkingBudget) && modelName.includes("2.5")) {
                            generationConfig.thinkingConfig = { thinkingBudget };
                        }
                        const modelConfig = { model: modelName, generationConfig };
                        if (systemInstruction) modelConfig.systemInstruction = { text: systemInstruction };
                        const model = client.getGenerativeModel(modelConfig);
                        const result = await model.generateContent(input, { timeout: Math.max(1000, Math.floor(remainingMs)) });
                        const response = await result.response;
                        return response.text();
                    },
                    2,
                    2000,
                    deadline,
                    safeTimeoutMs,
                );

                keyCooldowns.delete(apiKey.key);
                preferredKeyIndex = apiKey.index;
                if (process.env.NODE_ENV !== "production") {
                    console.log(`[Gemini] Request succeeded with ${apiKey.label} using ${modelName}. Response length: ${text.length}`);
                }
                return text;
            } catch (error) {
                lastError = error;
                if (Date.now() >= deadline) throw createTimeoutError(safeTimeoutMs);

                if (isKeyRotationError(error)) {
                    coolDownKey(apiKey.key, error);
                    console.warn(`[Gemini] ${apiKey.label} is unavailable (${error.status || "quota/auth error"}). Rotating to the next configured API key...`);
                    rotateKey = true;
                    break;
                }

                if (isModelFallbackError(error)) {
                    console.warn(`[Gemini] Model ${modelName} failed on ${apiKey.label} (${error.status || "unknown code"}). Trying the next model...`);
                    continue;
                }

                throw error;
            }
        }

        if (!rotateKey && lastError) {
            coolDownKey(apiKey.key, lastError);
            console.warn(`[Gemini] All configured models failed on ${apiKey.label}. Rotating to the next API key...`);
        }
    }

    const error = new Error(`All ${apiKeys.length} configured Gemini API keys are currently unavailable. Existing data was preserved; retry after quota recovery or add another account key.`);
    error.cause = lastError;
    throw error;
}

/**
 * Validates content using Gemini multimodal capabilities
 */
export async function reviewContentWithGemini(prompt, imageUrl) {
    const modelName = process.env.GEMINI_PRIMARY_MODEL || "gemini-2.5-flash";
    const imageResp = await fetch(imageUrl);
    if (!imageResp.ok) throw new Error(`Unable to load image for Gemini review (${imageResp.status}).`);
    const buffer = await imageResp.arrayBuffer();
    const parts = [{ text: prompt }, { inlineData: { data: Buffer.from(buffer).toString("base64"), mimeType: imageResp.headers.get("content-type") || "image/jpeg" } }];
    let lastError;

    for (const apiKey of getOrderedApiKeys()) {
        try {
            const client = new GoogleGenerativeAI(apiKey.key);
            const model = client.getGenerativeModel({ model: modelName });
            const result = await callGeminiWithRetry(() => model.generateContent(parts), 2, 2000);
            keyCooldowns.delete(apiKey.key);
            preferredKeyIndex = apiKey.index;
            return result.response.text();
        } catch (error) {
            lastError = error;
            if (!isKeyRotationError(error) && !isModelFallbackError(error)) throw error;
            coolDownKey(apiKey.key, error);
            console.warn(`[Gemini] Multimodal review failed on ${apiKey.label}; rotating API key...`);
        }
    }

    throw lastError || new Error("All configured Gemini API keys failed during image review.");
}
