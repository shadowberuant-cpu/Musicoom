
/**
 * Verome API - Entry Point
 * Music API for YouTube Music, Lyrics & Streaming
 *
 * Run:    deno task start
 * Dev:    deno task dev
 * Deploy: Render Docker Web Service
 */

import { YTMusic } from "./src/services/ytmusic.ts";
import { YouTubeSearch } from "./src/services/youtube-search.ts";

import { json, corsHeaders } from "./src/helpers/response.ts";
import { html as uiHtml } from "./ui.ts";

// Routes
import {
  handleSearch,
  handleSearchSuggestions,
  handleYTSearch,
} from "./src/routes/search.ts";

import { handleContentRoutes } from "./src/routes/content.ts";
import { handleDiscoverRoutes } from "./src/routes/discover.ts";

import {
  handleStream,
  handleProxy,
  handleMusicFind,
} from "./src/routes/stream.ts";

import { handleInfoRoutes } from "./src/routes/info.ts";
import { handleFeedRoutes } from "./src/routes/feed.ts";

// ─── Configuration ──────────────────────────────────────────

const VERSION = "2.0.0";

const PORT = Number(Deno.env.get("PORT") ?? "8000");

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("Invalid PORT environment variable");
}

// ─── Service Instances ──────────────────────────────────────

const ytmusic = new YTMusic();
const youtubeSearch = new YouTubeSearch();

// ─── Shared Response Helpers ────────────────────────────────

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);

  for (const [key, value] of Object.entries(corsHeaders)) {
    if (!headers.has(key)) {
      headers.set(key, value);
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function methodNotAllowed(allowed: string[]): Response {
  return withCors(
    json(
      {
        error: "Method not allowed",
        allowed,
      },
      405,
    ),
  );
}

// ─── Request Handler ────────────────────────────────────────

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const { pathname, searchParams } = url;

  try {
    // CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // Health check
    if (pathname === "/health") {
      if (req.method !== "GET" && req.method !== "HEAD") {
        return methodNotAllowed(["GET", "HEAD"]);
      }

      return withCors(
        json({
          status: "ok",
          version: VERSION,
        }),
      );
    }

    // Root UI
    if (pathname === "/") {
      if (req.method !== "GET" && req.method !== "HEAD") {
        return methodNotAllowed(["GET", "HEAD"]);
      }

      return withCors(
        new Response(req.method === "HEAD" ? null : uiHtml, {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
          },
        }),
      );
    }

    // Logo
    if (
      pathname === "/assets/logo.png" ||
      pathname === "/assets/Logo.png"
    ) {
      if (req.method !== "GET" && req.method !== "HEAD") {
        return methodNotAllowed(["GET", "HEAD"]);
      }

      try {
        const logoUrl = new URL("./assets/Logo.png", import.meta.url);
        const logo = await Deno.readFile(logoUrl);

        return withCors(
          new Response(req.method === "HEAD" ? null : logo, {
            headers: {
              "Content-Type": "image/png",
              "Cache-Control": "public, max-age=86400",
              "X-Content-Type-Options": "nosniff",
            },
          }),
        );
      } catch (err) {
        console.error("Unable to load logo:", err);

        return withCors(
          json(
            {
              error: "Logo not found",
            },
            404,
          ),
        );
      }
    }

    // Favicon
    if (pathname === "/favicon.ico") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // ─── Search ─────────────────────────────────────────────

    if (pathname === "/api/search") {
      if (req.method !== "GET") {
        return methodNotAllowed(["GET"]);
      }

      return withCors(
        await handleSearch(
          req,
          searchParams,
          ytmusic,
          youtubeSearch,
        ),
      );
    }

    if (pathname === "/api/search/suggestions") {
      if (req.method !== "GET") {
        return methodNotAllowed(["GET"]);
      }

      return withCors(
        await handleSearchSuggestions(
          searchParams,
          ytmusic,
          youtubeSearch,
        ),
      );
    }

    if (pathname === "/api/yt_search") {
      if (req.method !== "GET") {
        return methodNotAllowed(["GET"]);
      }

      return withCors(
        await handleYTSearch(searchParams, youtubeSearch),
      );
    }

    // ─── Content ────────────────────────────────────────────

    const contentResponse = await handleContentRoutes(
      pathname,
      searchParams,
      ytmusic,
    );

    if (contentResponse) {
      return withCors(contentResponse);
    }

    // ─── Discovery ──────────────────────────────────────────

    const discoverResponse = await handleDiscoverRoutes(
      pathname,
      searchParams,
      ytmusic,
      youtubeSearch,
    );

    if (discoverResponse) {
      return withCors(discoverResponse);
    }

    // ─── Streaming ──────────────────────────────────────────

    if (pathname === "/api/music/find") {
      if (req.method !== "GET") {
        return methodNotAllowed(["GET"]);
      }

      return withCors(
        await handleMusicFind(searchParams, ytmusic),
      );
    }

    if (pathname === "/api/stream") {
      if (req.method !== "GET") {
        return methodNotAllowed(["GET"]);
      }

      return withCors(await handleStream(searchParams));
    }

    if (pathname === "/api/proxy") {
      if (req.method !== "GET" && req.method !== "HEAD") {
        return methodNotAllowed(["GET", "HEAD"]);
      }

      return withCors(await handleProxy(searchParams, req));
    }

    // ─── Information ────────────────────────────────────────

    const infoResponse = await handleInfoRoutes(
      pathname,
      searchParams,
    );

    if (infoResponse) {
      return withCors(infoResponse);
    }

    // ─── Feed ───────────────────────────────────────────────

    const feedResponse = await handleFeedRoutes(
      pathname,
      searchParams,
    );

    if (feedResponse) {
      return withCors(feedResponse);
    }

    // ─── 404 ────────────────────────────────────────────────

    return withCors(
      json(
        {
          error: "Route not found",
          path: pathname,
        },
        404,
      ),
    );
  } catch (err) {
    console.error(
      `[${req.method} ${pathname}] Request failed:`,
      err,
    );

    return withCors(
      json(
        {
          error: "Internal server error",
        },
        500,
      ),
    );
  }
}

// ─── Start Server ───────────────────────────────────────────

console.log(`Verome API v${VERSION} starting on port ${PORT}`);

Deno.serve(
  {
    port: PORT,
    hostname: "0.0.0.0",
    onListen({ hostname, port }) {
      console.log(
        `Verome API v${VERSION} listening on ${hostname}:${port}`,
      );
    },
  },
  handler,
);
