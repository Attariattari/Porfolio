import mongoose from "mongoose";
import dns from "dns";

// Force DNS resolution to use Google's DNS servers to prevent querySrv ECONNREFUSED issues
if (dns && typeof dns.setServers === "function") {
  try {
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
  } catch (err) {
    console.warn("⚠️ [Mongoose/DNS] Failed to set Google DNS servers:", err.message);
  }
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function buildDirectMongoUri(uri) {
  if (!uri?.startsWith("mongodb+srv://")) return null;

  const parsed = new URL(uri);
  const srvRecords = await dns.promises.resolveSrv(`_mongodb._tcp.${parsed.hostname}`);
  const txtRecords = await dns.promises.resolveTxt(parsed.hostname).catch(() => []);
  const txtParams = new URLSearchParams(txtRecords.flat().join("&"));
  const params = new URLSearchParams(parsed.search);

  txtParams.forEach((value, key) => {
    if (!params.has(key)) params.set(key, value);
  });

  if (!params.has("tls")) params.set("tls", "true");

  const auth = parsed.username
    ? `${parsed.username}${parsed.password ? `:${parsed.password}` : ""}@`
    : "";
  const hosts = srvRecords
    .map((record) => `${record.name}:${record.port}`)
    .join(",");

  return `mongodb://${auth}${hosts}${parsed.pathname}?${params.toString()}`;
}

function isTransientDnsError(error) {
  const messages = [
    error?.message,
    error?.cause?.message,
    error?.reason?.message,
    ...Array.from(error?.reason?.servers?.values?.() || []).map(
      (server) => server?.error?.message,
    ),
  ]
    .filter(Boolean)
    .join(" ");

  return /querySrv|EAI_AGAIN|ENOTFOUND|ECONNREFUSED|ETIMEOUT|DNS/i.test(messages);
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectWithDnsFallback(opts) {
  const maxAttempts = 3;
  let directUri = null;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await mongoose.connect(directUri || MONGODB_URI, opts);
    } catch (error) {
      lastError = error;
      if (!isTransientDnsError(error)) throw error;

      await mongoose.disconnect().catch(() => undefined);

      if (!directUri && MONGODB_URI.startsWith("mongodb+srv://")) {
        try {
          directUri = await buildDirectMongoUri(MONGODB_URI);
          console.warn(
            "[Mongoose/DNS] SRV lookup failed. Retrying MongoDB with direct shard hosts.",
          );
        } catch (directUriError) {
          lastError = directUriError;
        }
      }

      if (attempt < maxAttempts) {
        const retryDelay = 350 * 2 ** (attempt - 1);
        console.warn(
          `[Mongoose/DNS] Temporary resolution failure. Retry ${attempt + 1}/${maxAttempts} in ${retryDelay}ms.`,
        );
        await wait(retryDelay);
      }
    }
  }

  throw lastError;
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      family: 4,
      serverSelectionTimeoutMS: 5000, // Fail fast if unreachable (e.g. whitelist issues)
    };

    cached.promise = connectWithDnsFallback(opts).then((mongoose) => {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "✅ [Muhyo Tech Security] Authority Database Synchronized (MongoDB Connected)",
        );
        if (process.env.MONGOOSE_DEBUG === "true") mongoose.set("debug", true);
        if (process.env.MONGOOSE_DEBUG === "true") console.log("🛠️ [Mongoose] Debug mode enabled");
      }
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;

