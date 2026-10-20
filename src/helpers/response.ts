
/**
 * HTTP response helpers and CORS configuration
 */

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
  "X-Content-Type-Options": "nosniff",
};

export function json(
  data: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {},
): Response {
  const headers = new Headers(corsHeaders);

  headers.set("Content-Type", "application/json; charset=utf-8");

  for (const [key, value] of Object.entries(extraHeaders)) {
    headers.set(key, value);
  }

  return new Response(JSON.stringify(data), {
    status,
    headers,
  });
}

export function error(
  message: string,
  status = 400,
): Response {
  return json(
    {
      error: message,
    },
    status,
  );
}
