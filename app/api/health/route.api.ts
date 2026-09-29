import { NextResponse, type NextRequest } from "next/server";
import { isAdmin } from "@/lib/server/http";
import { storageWritable } from "@/lib/server/store";

/** Verificação de saúde para monitoramento (uptime). Detalhes de configuração só para o admin. */
export async function GET(request: NextRequest) {
  const storage = await storageWritable();
  const details = isAdmin(request)
    ? {
        notifications: {
          webhook: !!process.env.LND_WEBHOOK_URL,
          email: !!(process.env.RESEND_API_KEY && process.env.LND_NOTIFY_EMAIL_TO),
        },
      }
    : {};
  return NextResponse.json(
    { status: storage ? "ok" : "degraded", time: new Date().toISOString(), storage, ...details },
    { status: storage ? 200 : 503, headers: { "cache-control": "no-store" } },
  );
}
