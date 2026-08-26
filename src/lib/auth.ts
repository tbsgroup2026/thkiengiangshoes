import { SignJWT, jwtVerify } from 'jose';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim() === '') {
    throw new Error('CRITICAL SECURITY CONFIGURATION ERROR: JWT_SECRET environment variable is missing or empty! Please configure JWT_SECRET via Cloudflare Worker Secrets.');
  }
  return new TextEncoder().encode(secret);
}

export interface JWTPayload {
  userId: number;
  empCode: string;
  name: string;
  roleId: number;
  roleCode: string;
  roleLevel: number;
  departmentId: number | null;
  departmentCode: string | null;
  [key: string]: unknown;
}

/**
 * Sign a JWT token containing user role & department scope
 */
export async function signToken(payload: JWTPayload): Promise<string> {
  const secretKey = getJwtSecret();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secretKey);
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secretKey = getJwtSecret();
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as JWTPayload;
  } catch (error) {
    return null;
  }
}

