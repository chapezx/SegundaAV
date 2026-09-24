// Dados de cada provedor e utilidades de resposta.

export const PROVIDERS = {
    google: {
        issuer: "https://accounts.google.com",
        discovery: "https://accounts.google.com/.well-known/openid-configuration",
        authorization: "https://accounts.google.com/o/oauth2/v2/auth",
        token: "https://oauth2.googleapis.com/token",
        scope: "openid email profile",
        usesNonce: true,
        clientIdVar: "GOOGLE_CLIENT_ID",
        clientSecretVar: "GOOGLE_CLIENT_SECRET"
    },
    github: {
        issuer: "https://github.com",
        authorization: "https://github.com/login/oauth/authorize",
        token: "https://github.com/login/oauth/access_token",
        api: "https://api.github.com",
        apiVersion: "2026-03-10",
        scope: null,
        usesNonce: false,
        clientIdVar: "GITHUB_CLIENT_ID",
        clientSecretVar: "GITHUB_CLIENT_SECRET"
    }
};

/** Resolve o provedor da rota dinamica. Qualquer outro valor devolve null. */
export function resolveProvider(name) {
    return Object.prototype.hasOwnProperty.call(PROVIDERS, name) ? PROVIDERS[name] : null;
}

export function baseUrl(env) {
    return (env.PUBLIC_BASE_URL || "").replace(/\/+$/, "");
}

export function redirectUri(env, providerName) {
    return `${baseUrl(env)}/oauth/callback/${providerName}`;
}

const NO_STORE = { "Cache-Control": "no-store" };

/** Erro publico sem detalhes internos. */
export function fail(status, message) {
    return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { "Content-Type": "application/json; charset=utf-8", ...NO_STORE }
    });
}

export function notFound() {
    return new Response("Not Found", { status: 404, headers: NO_STORE });
}

export function jsonResponse(body, extraHeaders = {}) {
    return new Response(JSON.stringify(body), {
        headers: { "Content-Type": "application/json; charset=utf-8", ...NO_STORE, ...extraHeaders }
    });
}

export function redirect(location, cookies = []) {
    const headers = new Headers({ Location: location, ...NO_STORE });
    for (const cookie of cookies) {
        headers.append("Set-Cookie", cookie);
    }
    return new Response(null, { status: 302, headers });
}
