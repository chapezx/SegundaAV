// Inicia o login: cria a transacao, grava os resumos no D1 e redireciona ao provedor.

import { randomToken, sha256, now } from "../../_shared/crypto.js";
import { setTransactionCookie } from "../../_shared/cookies.js";
import { resolveProvider, redirectUri, notFound, fail, redirect } from "../../_shared/providers.js";

const TRANSACTION_TTL = 600;

export async function onRequestGet(context) {
    const name = context.params.provider;
    const provider = resolveProvider(name);
    if (!provider) {
        return notFound();
    }

    const clientId = context.env[provider.clientIdVar];
    if (!clientId) {
        return fail(500, "configuracao incompleta");
    }

    // 32 bytes aleatorios para cada valor: 43 caracteres em Base64URL.
    const transactionId = randomToken();
    const state = randomToken();
    const codeVerifier = randomToken();
    const nonce = provider.usesNonce ? randomToken() : null;

    const codeChallenge = await sha256(codeVerifier);

    await context.env.DB.prepare(
        `INSERT INTO oauth_transactions
             (id_hash, provider, state_hash, nonce, code_verifier, expires_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)`
    )
        .bind(
            await sha256(transactionId),
            name,
            await sha256(state),
            nonce,
            codeVerifier,
            now() + TRANSACTION_TTL
        )
        .run();

    const authorization = new URL(provider.authorization);
    authorization.searchParams.set("client_id", clientId);
    authorization.searchParams.set("redirect_uri", redirectUri(context.env, name));
    authorization.searchParams.set("response_type", "code");
    authorization.searchParams.set("state", state);
    authorization.searchParams.set("code_challenge", codeChallenge);
    authorization.searchParams.set("code_challenge_method", "S256");
    if (provider.scope) {
        authorization.searchParams.set("scope", provider.scope);
    }
    if (nonce) {
        authorization.searchParams.set("nonce", nonce);
    }

    return redirect(authorization.toString(), [setTransactionCookie(transactionId)]);
}
