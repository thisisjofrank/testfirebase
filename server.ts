// Minimal Deno HTTP server with REST API and static file serving
// API: /api/dinosaurs (GET, POST), /api/dinosaurs/:id (DELETE)

import { contentType } from "@std/media-types/content-type";
import { fromFileUrl, dirname, join, extname } from "@std/path";

import { db, ensureAnonAuth } from "./firebase.ts";
import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    serverTimestamp,
} from "firebase/firestore";

const dinosCol = () => collection(db, "dinosaurs");

async function handleApi(req: Request): Promise<Response | undefined> {
    const url = new URL(req.url);
    const { pathname } = url;

    if (pathname === "/api/dinosaurs" && req.method === "GET") {
        const snap = await getDocs(dinosCol());
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        return json(items);
    }

    if (pathname === "/api/dinosaurs" && req.method === "POST") {
        const body = await req.json().catch(() => ({}));
        const { name, description } = body ?? {};
        if (!name) return json({ error: "name is required" }, 400);
        const ref = await addDoc(dinosCol(), {
            name,
            description: description ?? "",
            createdAt: serverTimestamp(),
        });
        return json({ id: ref.id }, 201);
    }

    const m = pathname.match(/^\/api\/dinosaurs\/([^/]+)$/);
    if (m && req.method === "DELETE") {
        const id = m[1];
        await deleteDoc(doc(db, "dinosaurs", id));
        return json({ ok: true });
    }

    return undefined;
}

function json(data: unknown, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { "content-type": "application/json; charset=utf-8" },
    });
}

async function serveStatic(req: Request): Promise<Response> {
    const url = new URL(req.url);
    let p = decodeURIComponent(url.pathname);
    if (p === "/") p = "/index.html";
    const baseDir = dirname(fromFileUrl(import.meta.url));
    const root = join(baseDir, "public");
    const filePath = join(root, p.replace(/^\//, ""));
    try {
        const file = await Deno.readFile(filePath);
        // Prefer std/media-types, but enforce sensible defaults for common web types
        let ct = contentType(filePath) ?? "";
        if (!ct) {
            const ext = extname(filePath).toLowerCase();
            if (ext === ".html" || ext === ".htm") ct = "text/html; charset=utf-8";
            else if (ext === ".js") ct = "text/javascript; charset=utf-8";
            else if (ext === ".css") ct = "text/css; charset=utf-8";
            else if (ext === ".json") ct = "application/json; charset=utf-8";
            else ct = "application/octet-stream";
        }
        return new Response(file, { headers: { "content-type": ct, "cache-control": "no-store" } });
    } catch (_e) {
        return new Response("Not found", { status: 404 });
    }
}

await ensureAnonAuth();
const port = Number(Deno.env.get("PORT") ?? 8000);
console.log(`Web server listening on http://localhost:${port}`);
Deno.serve({ port }, async (req: Request) => {
    const api = await handleApi(req);
    if (api) return api;
    return await serveStatic(req);
});
