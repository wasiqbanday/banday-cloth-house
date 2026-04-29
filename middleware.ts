import { NextRequest, NextResponse } from "next/server";

function base64UrlToBytes(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array) {
  if (a.length !== b.length) return false;

  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a[index] ^ b[index];
  }

  return diff === 0;
}

async function verifyAdminToken(token: string) {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) return false;

  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [header, payload, signature] = parts;

  try {
    const headerJson = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(header))
    ) as { alg?: string };

    if (headerJson.alg !== "HS256") return false;

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(jwtSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signedData = new TextEncoder().encode(`${header}.${payload}`);
    const expectedSignature = new Uint8Array(
      await crypto.subtle.sign("HMAC", key, signedData)
    );

    if (!timingSafeEqual(expectedSignature, base64UrlToBytes(signature))) {
      return false;
    }

    const payloadJson = JSON.parse(
      new TextDecoder().decode(base64UrlToBytes(payload))
    ) as { exp?: number; role?: string };

    const now = Math.floor(Date.now() / 1000);
    return payloadJson.role === "admin" && Boolean(payloadJson.exp) && payloadJson.exp! > now;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname !== "/admin") {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin_session")?.value;
  const isAuthorized = token ? await verifyAdminToken(token) : false;

  if (isAuthorized) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.searchParams.set("next", pathname);

  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete("admin_session");

  return response;
}

export const config = {
  matcher: ["/admin"],
};
