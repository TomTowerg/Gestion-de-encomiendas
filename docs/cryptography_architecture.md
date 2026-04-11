# Cryptographic Architecture — Loombox

## Overview

This document identifies and explains all cryptographic elements used in the Loombox system, fulfilling the academic requirement of **"Identificar elementos criptográficos"** from the TICS420 course.

---

## 1. Session Tokens — JSON Web Tokens (JWT)

**Where:** NextAuth.js session management (`src/app/api/auth/[...nextauth]/route.ts`)

**Algorithm used:** `HS256` — HMAC with SHA-256

| Property | Value |
|---|---|
| Standard | RFC 7519 (JSON Web Token) |
| Algorithm | HMAC-SHA256 (`HS256`) |
| Secret | `NEXTAUTH_SECRET` env variable (min. 32 bytes) |
| Token parts | `Header.Payload.Signature` (Base64url encoded) |
| Expiry | Session-based (default 30 days) |

**How it works:**
1. When a user logs in (via Google SSO or OTP), NextAuth generates a JWT.
2. The token's **Header** and **Payload** are Base64url-encoded (not encrypted, but signed).
3. The **Signature** = `HMAC-SHA256(base64url(header) + "." + base64url(payload), NEXTAUTH_SECRET)`.
4. On every request, the proxy middleware (`src/proxy.ts`) calls `getToken()` which verifies the HMAC signature — if tampered, verification fails and access is denied.

```
JWT = Base64url(Header) + "." + Base64url(Payload) + "." + HMAC-SHA256(Header+Payload, secret)
```

---

## 2. OTP / Magic Link — Verification Tokens

**Where:** NextAuth Email Provider, stored in `VerificationToken` table in PostgreSQL/Supabase

**Algorithm used:** `SHA-256` hashing via `crypto.createHash()`

| Property | Value |
|---|---|
| Standard | NIST SP 800-107 (SHA-2 family) |
| Algorithm | SHA-256 (256-bit output) |
| Token generation | Cryptographically random (Node.js `crypto.randomBytes(32)`) |
| Storage | Hash of token stored in DB, never the raw token |
| Expiry | 24 hours |

**How it works:**
1. User requests sign-in via email.
2. Server generates a cryptographically random 32-byte token using `crypto.randomBytes(32)`.
3. The **SHA-256 hash** of the token is stored in `VerificationToken` table (never the raw token).
4. The **raw token** is sent to the user's email as a URL parameter.
5. When the user clicks the link, the server hashes the received token and compares it with the stored hash (`hash_received == hash_stored`).
6. If they match, the user is authenticated and the token is deleted (one-time use).

```
stored_hash = SHA-256(random_token)  ← stored in DB
email_link  = /api/auth/callback/email?token=<raw_token>
verification: SHA-256(received_token) === stored_hash → ✅ authenticated
```

---

## 3. Google OAuth 2.0 / SSO

**Where:** NextAuth Google Provider, `Account` table in DB

**Cryptographic components used by Google:**

| Component | Detail |
|---|---|
| Protocol | OAuth 2.0 (RFC 6749) + OpenID Connect (OIDC) |
| Transport | TLS 1.3 (HTTPS) — AES-256-GCM |
| `id_token` | JWT signed with Google's RSA-256 private key |
| PKCE | `code_challenge` = SHA-256 of `code_verifier` |
| `state` param | CSRF protection — random nonce |

**How it works:**
1. User clicks "Login with Google".
2. App redirects to Google with a `code_challenge` (SHA-256 of a random `code_verifier`).
3. Google authenticates the user and returns an authorization `code`.
4. App exchanges `code` + `code_verifier` → Google verifies `SHA-256(code_verifier) == code_challenge` (PKCE).
5. Google returns an `id_token` (JWT signed with RS256) and `access_token`.
6. NextAuth verifies the `id_token` using Google's public RSA key (fetched from `https://accounts.google.com/.well-known/openid-configuration`).

---

## 4. HTTPS / TLS in Production

**Where:** Vercel (production deployment)

| Property | Value |
|---|---|
| Protocol | TLS 1.3 |
| Key exchange | ECDHE (Elliptic Curve Diffie-Hellman Ephemeral) |
| Cipher | AES-256-GCM (symmetric encryption in transit) |
| Certificate | X.509 managed by Vercel (Let's Encrypt CA) |

All traffic between clients and the Loombox server is encrypted in transit using TLS 1.3. This ensures that JWT tokens, OTP magic links, and OAuth codes cannot be intercepted in plaintext.

---

## 5. Summary Table

| Element | Algorithm | Purpose |
|---|---|---|
| Session cookies | HMAC-SHA256 (JWT HS256) | Session integrity & authenticity |
| OTP / Magic Link token | SHA-256 (stored hash) | One-time authentication |
| Google SSO id_token | RS256 (RSA + SHA-256) | Identity verification |
| OAuth PKCE | SHA-256 | Prevent authorization code interception |
| Data in transit | AES-256-GCM (TLS 1.3) | Confidentiality & integrity |
| DB password hashing | Managed by Supabase (bcrypt/pgcrypto) | Credential storage |

---

*Document prepared for TICS420 course — Programación Profesional, UAI.*
