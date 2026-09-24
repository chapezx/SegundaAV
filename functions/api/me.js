// Resolve a sessao local e devolve o perfil minimo.

import { sha256, now } from "../_shared/crypto.js";
import { readCookie, SESSION_COOKIE } from "../_shared/cookies.js";
import { fail, jsonResponse } from "../_shared/providers.js";

export async function onRequestGet(context) {
    const raw = readCookie(context.request, SESSION_COOKIE);
    if (!raw) {
        return fail(401, "sem sessao");
    }

    const idHash = await sha256(raw);
    const session = await context.env.DB.prepare(
        `SELECT issuer, subject, email, display_name, expires_at
           FROM sessions
          WHERE id_hash = ?1 AND expires_at > ?2`
    )
        .bind(idHash, now())
        .first();

    if (!session) {
        return fail(401, "sessao invalida");
    }

    return jsonResponse({
        issuer: session.issuer,
        subject: session.subject,
        email: session.email,
        displayName: session.display_name
    });
}
