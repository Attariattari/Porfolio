export function getAuthSecretValue() {
  const value = process.env.AUTH_SECRET;
  if (!value) {
    throw new Error("AUTH_SECRET must be configured");
  }
  return value;
}

export function getAuthSecretKey() {
  return new TextEncoder().encode(getAuthSecretValue());
}
