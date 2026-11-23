import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  DOCX_MIME,
  buildResumeDocx,
  docxFileName,
  toDocxBuffer,
} from "@/lib/docx-export";
import { getJob } from "@/lib/jobs-data";
import { buildResumeDoc } from "@/lib/resume";
import { getResume, loadResumeSource } from "@/lib/resume-data";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  if (!z.uuid().safeParse(id).success) {
    return new Response("Not found", { status: 404 });
  }

  const userId = session.user.id;
  const [job, saved, source] = await Promise.all([
    getJob(userId, id),
    getResume(userId, id),
    loadResumeSource(userId),
  ]);
  if (!job || !saved) return new Response("Not found", { status: 404 });

  const doc = buildResumeDoc(source, saved.tailored, {
    name: session.user.name,
    email: session.user.email,
  });
  const buffer = await toDocxBuffer(buildResumeDocx(doc));

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": DOCX_MIME,
      "Content-Disposition": `attachment; filename="${docxFileName(doc.name, "Resume")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}