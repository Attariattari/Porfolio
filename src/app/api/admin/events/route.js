/**
 * Legacy admin SSE endpoint.
 *
 * Admin screens now use short polling because an in-memory EventEmitter cannot
 * deliver events reliably across Vercel Function instances. HTTP 204 also tells
 * native EventSource clients to stop reconnecting, which prevents 504 loops for
 * users who still have an older production bundle open in a browser tab.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  return new Response(null, {
    status: 204,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
