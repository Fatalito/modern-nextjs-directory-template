import { NextResponse } from "next/server";
import { db } from "@/shared/api";

export const dynamic = "force-dynamic";

const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local";
const headers = { "X-Commit-Sha": sha };

export async function GET() {
  try {
    await db.$client.execute("SELECT 1");
    return NextResponse.json({ status: "ok", db: "ok" }, { headers });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        db: "error",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 503, headers },
    );
  }
}
