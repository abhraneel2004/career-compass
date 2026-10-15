import { auth } from "./firebaseAdmin.js";

// Requires "Authorization: Bearer <Firebase ID token>" and puts the user's uid on req.uid
export async function requireUser(req, res, next) {
    if (!auth) {
        return res.status(503).json({ error: "Sign-in checks aren't configured on the server" });
    }

    const match = /^Bearer (.+)$/.exec(req.headers.authorization || "");
    if (!match) {
        return res.status(401).json({ error: "Sign in to continue" });
    }

    try {
        const decoded = await auth.verifyIdToken(match[1]);
        req.uid = decoded.uid;
        next();
    } catch {
        res.status(401).json({ error: "Your session has expired. Sign in again." });
    }
}
