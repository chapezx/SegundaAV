// Valores aleatorios e resumos com Web Crypto (sem dependencias externas).

/** Codifica bytes em Base64URL sem preenchimento. */
export function toBase64Url(bytes) {
    let binary = "";
    const view = new Uint8Array(bytes);
    for (let i = 0; i < view.length; i += 1) {
        binary += String.fromCharCode(view[i]);
    }
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Decodifica Base64URL em bytes. */
export function fromBase64Url(value) {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

/** 32 bytes aleatorios em Base64URL: 43 caracteres. */
export function randomToken() {
    return toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
}

/** Resumo SHA-256 em Base64URL. Usado para cookies, state e PKCE. */
export async function sha256(value) {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
    return toBase64Url(digest);
}

/** Comparacao de tempo constante entre dois textos. */
export function timingSafeEqual(a, b) {
    if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) {
        return false;
    }
    let diff = 0;
    for (let i = 0; i < a.length; i += 1) {
        diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
}

/** Segundos desde a epoca. */
export function now() {
    return Math.floor(Date.now() / 1000);
}
