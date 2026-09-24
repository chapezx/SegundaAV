// Revoga a sessao local. Nao encerra a sessao no Google nem no GitHub.

import { sha256 } from "../_shared/crypto.js";
import { readCookie, SESSION_COOKIE, clearSessionCookie } from "../_shared/cookies.js";
import { baseUrl, fail } from "../_shared/providers.js";

export async function onRequest(context) {
    if (context.request.method !== "POST") {
        return fail(405, "metodo nao permitido");
    }

    const expected = baseUrl(context.env);
    const origin = context.request.headers.get("Origin");
    if (!expected || origin !== expected) {
        return fail(403, "origem invalida");
    }

    const raw = readCookie(context.request, SESSION_COOKIE);
    if (raw) {
        const idHash = await sha256(raw);
        await context.env.DB.prepare("DELETE FROM sessions WHERE id_hash = ?1").bind(idHash).run();
    }

    const headers = new Headers({ Location: `${expected}/`, "Cache-Control": "no-store" });
    headers.append("Set-Cookie", clearSessionCookie());
    return new Response(null, { status: 303, headers });
}
