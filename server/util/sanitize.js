export function sanitizeHTML(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/"/g, "&#039;");
}

export function sanitizeEmail(email) {
    return email.replace(/[^a-åA-Å0-9@_.-]/g, "");
}