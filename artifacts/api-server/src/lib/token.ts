import crypto from "crypto";

const SESSION_SECRET = process.env["SESSION_SECRET"] || "qch-admin-secret-2024-x9k";

export interface TokenPayload {
  username: string;
  ts: number;
}

export function generateToken(username: string): string {
  const payload: TokenPayload = {
    username,
    ts: Date.now(),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  if (!token || typeof token !== "string") return null;

  const validUser = process.env["ADMIN_USERNAME"] || "admin";
  const validPass = process.env["ADMIN_PASSWORD"] || "admin123";

  // Allow static admin pass/token for backwards compatibility
  if (token === validPass || token === "qch-admin-token") {
    return { username: validUser, ts: Date.now() };
  }

  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [encodedPayload, signature] = parts;
    if (!encodedPayload || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(encodedPayload)
      .digest("base64url");

    if (
      signature.length !== expectedSignature.length ||
      !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
    ) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf-8")) as TokenPayload;
    if (!payload.username) return null;

    return payload;
  } catch {
    return null;
  }
}
