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

async function connectWithDnsFallback(opts) {
  try {
    return await mongoose.connect(MONGODB_URI, opts);
  } catch (error) {
    if (!String(error.message || "").includes("querySrv")) throw error;

    console.warn(
      "[Mongoose/DNS] SRV lookup failed. Retrying MongoDB with direct shard hosts.",
    );
    const directUri = await buildDirectMongoUri(MONGODB_URI);
    if (!directUri) throw error;

    return mongoose.connect(directUri, opts);
  }
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
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

