/**
 * Lightweight Firebase Auth token verification for API routes.
 * Verifies the token by calling Firebase Auth's tokeninfo endpoint.
 * This avoids needing the heavy firebase-admin SDK.
 */

export interface VerifiedUser {
  uid: string;
  email?: string;
}

export async function verifyAuthToken(
  request: Request
): Promise<VerifiedUser | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const idToken = authHeader.slice(7);
  if (!idToken) return null;

  try {
    // Verify token with Firebase Auth REST API
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) return null;

    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const user = data.users?.[0];

    if (!user?.localId) return null;

    return {
      uid: user.localId,
      email: user.email,
    };
  } catch {
    return null;
  }
}
