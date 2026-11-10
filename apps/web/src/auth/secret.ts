/**
 * AUTH_SECRET is mandatory — never fall back to a value baked into source.
 * Generate with: openssl rand -base64 32
 */
export function requireAuthSecret(): string {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) {
    throw new Error(
      "AUTH_SECRET is required. Set it in the environment (e.g. openssl rand -base64 32). There is no default secret.",
    );
  }
  return secret;
}
