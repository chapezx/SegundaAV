// Processa a URL de retorno, confirma a identidade e cria a sessao opaca.

import { randomToken, sha256, timingSafeEqual, now } from "../../_shared/crypto.js";
import {
    readCookie,
    TX_COOKIE,
    clearTransactionCookie,
    setSessionCookie
} from "../../_shared/cookies.js";
import {
    resolveProvider,
    redirectUri,
    baseUrl,
    notFound,
    fail,
    redirect
} from "../../_shared/providers.js";
import { verifyGoogleIdToken } from "../../_shared/oidc.js";

const SESSION_TTL = 28800; // oito horas

/** Troca o codigo de autorizacao. O corpo e a resposta nao sao registrados. */
async function exchangeCode(provider, { code, codeVerifier, clientId, clientSecret, redirect_uri }) {
    const body = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        code_verifier: codeVerifier,
        redirect_uri,
        grant_type: "authorization_code"
    });

    const response = await fetch(provider.token, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json"
        },
        body
    });
    if (!response.ok) {
        throw new Error("troca de codigo recusada");
    }
    const payload = await response.json();
    if (payload.error) {
        throw new Error("troca de codigo recusada");
    }
    return payload;
}

/** Consulta o perfil autenticado e revoga a autorizacao concedida a OAuth App. */
async function resolveGithubIdentity(provider, tokens, clientId, clientSecret) {
    if (!tokens.access_token || String(tokens.token_type || "").toLowerCase() !== "bearer") {
        throw new Error("resposta de troca incompativel");
    }

    const userResponse = await fetch(`${provider.api}/user`, {
        headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": provider.apiVersion,
            "User-Agent": "oauth-pages-lab"
        }
    });
    if (userResponse.status !== 200) {
        throw new Error("perfil indisponivel");
    }
    const user = await userResponse.json();
    if (!Number.isInteger(user.id)) {
        throw new Error("identificador invalido");
    }

    // A autorizacao e removida antes da criacao da sessao local.
    const revocation = await fetch(`${provider.api}/applications/${clientId}/grant`, {
        method: "DELETE",
        headers: {
            Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
            Accept: "application/vnd.github+json",
            "Content-Type": "application/json",
            "X-GitHub-Api-Version": provider.apiVersion,
            "User-Agent": "oauth-pages-lab"
        },
        body: JSON.stringify({ access_token: tokens.access_token })
    });
    if (revocation.status !== 204) {
        throw new Error("revogacao recusada");
    }

    return {
        issuer: provider.issuer,
        subject: String(user.id),
        email: user.email ?? null,
        displayName: user.name || user.login
    };
}

export async function onRequestGet(context) {
    const name = context.params.provider;
    const provider = resolveProvider(name);
    if (!provider) {
        return notFound();
    }

    const url = new URL(context.request.url);
    if (url.searchParams.get("error")) {
        return fail(400, "autorizacao recusada");
    }
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (!code || !state) {
        return fail(400, "resposta incompleta");
    }

    const transactionId = readCookie(context.request, TX_COOKIE);
    if (!transactionId) {
        return fail(400, "transacao ausente");
    }

    const idHash = await sha256(transactionId);
    const transaction = await context.env.DB.prepare(
        `SELECT provider, state_hash, nonce, code_verifier
           FROM oauth_transactions
          WHERE id_hash = ?1 AND expires_at > ?2`
    )
        .bind(idHash, now())
        .first();

    if (!transaction || transaction.provider !== name) {
        return fail(400, "transacao invalida");
    }

    const stateHash = await sha256(state);
    if (!timingSafeEqual(stateHash, transaction.state_hash)) {
        return fail(400, "state invalido");
    }

    // A transacao e de uso unico: some antes da troca do codigo.
    await context.env.DB.prepare("DELETE FROM oauth_transactions WHERE id_hash = ?1")
        .bind(idHash)
        .run();

    const clientId = context.env[provider.clientIdVar];
    const clientSecret = context.env[provider.clientSecretVar];
    if (!clientId || !clientSecret) {
        return fail(500, "configuracao incompleta");
    }

    let identity;
    try {
        const tokens = await exchangeCode(provider, {
            code,
            codeVerifier: transaction.code_verifier,
            clientId,
            clientSecret,
            redirect_uri: redirectUri(context.env, name)
        });

        if (name === "google") {
            const claims = await verifyGoogleIdToken(tokens.id_token, {
                clientId,
                nonce: transaction.nonce
            });
            identity = {
                issuer: provider.issuer,
                subject: String(claims.sub),
                email: claims.email ?? null,
                displayName: claims.name || claims.email || String(claims.sub)
            };
        } else {
            identity = await resolveGithubIdentity(provider, tokens, clientId, clientSecret);
        }
    } catch (error) {
        // A mensagem interna nao chega ao navegador.
        return fail(400, "identidade nao confirmada");
    }

    const sessionId = randomToken();
    const current = now();
    await context.env.DB.prepare(
        `INSERT INTO sessions
             (id_hash, issuer, subject, email, display_name, expires_at, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`
    )
        .bind(
            await sha256(sessionId),
            identity.issuer,
            identity.subject,
            identity.email,
            identity.displayName,
            current + SESSION_TTL,
            current
        )
        .run();

    return redirect(`${baseUrl(context.env)}/`, [
        clearTransactionCookie(),
        setSessionCookie(sessionId)
    ]);
}
