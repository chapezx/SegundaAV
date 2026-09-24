// Validacao do id_token do Google com Web Crypto, sem bibliotecas externas.

import { fromBase64Url, timingSafeEqual, now } from "./crypto.js";
import { PROVIDERS } from "./providers.js";

function decodeSegment(segment) {
    return JSON.parse(new TextDecoder().decode(fromBase64Url(segment)));
}

/** Busca o documento de descoberta e o JWKS do emissor esperado. */
async function fetchSigningKey(kid) {
    const discoveryResponse = await fetch(PROVIDERS.google.discovery);
    if (!discoveryResponse.ok) {
        throw new Error("discovery indisponivel");
    }
    const discovery = await discoveryResponse.json();
    if (discovery.issuer !== PROVIDERS.google.issuer) {
        throw new Error("emissor inesperado no documento de descoberta");
    }

    const jwksResponse = await fetch(discovery.jwks_uri);
    if (!jwksResponse.ok) {
        throw new Error("jwks indisponivel");
    }
    const jwks = await jwksResponse.json();
    const jwk = (jwks.keys || []).find((key) => key.kid === kid && key.kty === "RSA");
    if (!jwk) {
        throw new Error("chave nao encontrada");
    }

    return crypto.subtle.importKey(
        "jwk",
        jwk,
        { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
        false,
        ["verify"]
    );
}

/**
 * Verifica a assinatura e as reivindicacoes do id_token.
 * Devolve as reivindicacoes quando o token for aceito e lanca um erro quando nao for.
 */
export async function verifyGoogleIdToken(idToken, { clientId, nonce }) {
    const parts = String(idToken || "").split(".");
    if (parts.length !== 3) {
        throw new Error("formato de JWT invalido");
    }
    const [headerSegment, payloadSegment, signatureSegment] = parts;

    const header = decodeSegment(headerSegment);
    if (header.alg !== "RS256") {
        throw new Error("algoritmo nao permitido");
    }
    if (!header.kid) {
        throw new Error("kid ausente");
    }

    const key = await fetchSigningKey(header.kid);
    const signed = new TextEncoder().encode(`${headerSegment}.${payloadSegment}`);
    const valid = await crypto.subtle.verify(
        "RSASSA-PKCS1-v1_5",
        key,
        fromBase64Url(signatureSegment),
        signed
    );
    if (!valid) {
        throw new Error("assinatura invalida");
    }

    const claims = decodeSegment(payloadSegment);
    const issuers = [PROVIDERS.google.issuer, "accounts.google.com"];
    if (!issuers.includes(claims.iss)) {
        throw new Error("iss invalido");
    }

    const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (!audiences.includes(clientId)) {
        throw new Error("aud invalido");
    }

    const current = now();
    const skew = 60;
    if (typeof claims.exp !== "number" || claims.exp + skew <= current) {
        throw new Error("token expirado");
    }
    if (typeof claims.iat !== "number" || claims.iat - skew > current) {
        throw new Error("iat no futuro");
    }
    if (!nonce || !timingSafeEqual(String(claims.nonce || ""), String(nonce))) {
        throw new Error("nonce invalido");
    }
    if (!claims.sub) {
        throw new Error("sub ausente");
    }

    return claims;
}
