// Contratos dos cookies do laboratorio.

export const TX_COOKIE = "__Host-oauth-tx";
export const SESSION_COOKIE = "__Host-session";

/** Le um cookie do cabecalho Cookie da requisicao. */
export function readCookie(request, name) {
    const header = request.headers.get("Cookie");
    if (!header) {
        return null;
    }
    for (const part of header.split(";")) {
        const separator = part.indexOf("=");
        if (separator === -1) {
            continue;
        }
        if (part.slice(0, separator).trim() === name) {
            return part.slice(separator + 1).trim();
        }
    }
    return null;
}

/** Cookie temporario da transacao: dez minutos, SameSite=Lax. */
export function setTransactionCookie(value) {
    return `${TX_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`;
}

export function clearTransactionCookie() {
    return `${TX_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

/** Cookie de sessao: oito horas, SameSite=Strict, sem Domain. */
export function setSessionCookie(value) {
    return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`;
}

export function clearSessionCookie() {
    return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}
