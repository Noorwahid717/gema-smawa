"use server";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import path from "path";
import fs from "fs/promises";
import type { PromptSchema, PromptSection } from "@/types/prompt";

export const runtime = "nodejs";

const SCHEMA_FILE_MAP: Record<string, string> = {
  webPortfolioSma: path.join(process.cwd(), "src/data/prompts/webPortfolioSma.json")
};

const SCHEMA_ALIASES: Record<string, keyof typeof SCHEMA_FILE_MAP> = {
  "webPortfolioSma": "webPortfolioSma",
  "web-portfolio-sma": "webPortfolioSma",
  "web_portfolio_sma": "webPortfolioSma"
};

function resolveSchemaId(schemaParam: string): keyof typeof SCHEMA_FILE_MAP | null {
  return SCHEMA_ALIASES[schemaParam as keyof typeof SCHEMA_ALIASES] ?? null;
}

function isStringArray(value: unknown, allowEmpty = false): value is string[] {
  if (!Array.isArray(value)) return false;
  if (!allowEmpty && value.length === 0) return false;
  return value.every((item) => typeof item === "string" && item.trim().length > 0);
}

function isStringRecord(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== "object") return false;
  return Object.values(value as Record<string, unknown>).every(
    (item) => typeof item === "string" && item.trim().length > 0
  );
}

function validateSection(section: unknown, index: number): string | null {
  if (!section || typeof section !== "object") {
    return `Section ke-${index + 1} harus berupa object`;
  }

  const payload = section as PromptSection;

  if (typeof payload.title !== "string" || payload.title.trim().length === 0) {
    return `Section ke-${index + 1} membutuhkan title`;
  }

  if (!payload.meta || typeof payload.meta !== "object") {
    return `Section ${payload.title} membutuhkan meta`;
  }

  const {
    id,
    titleShort,
    level,
    durasiMenit,
    prasyarat,
    tujuanPembelajaran,
    tag,
    assets,
    versi,
    terakhirDiperbarui
  } = payload.meta;

  if (typeof id !== "string" || id.trim().length === 0) return `Meta id pada ${payload.title} wajib diisi`;
  if (typeof titleShort !== "string" || titleShort.trim().length === 0) return `Meta titleShort pada ${payload.title} wajib diisi`;
  if (typeof level !== "string" || level.trim().length === 0) return `Meta level pada ${payload.title} wajib diisi`;
  if (typeof durasiMenit !== "number" || Number.isNaN(durasiMenit) || durasiMenit <= 0) return `Durasi menit pada ${payload.title} harus berupa angka positif`;
  if (!isStringArray(prasyarat)) return `Prasyarat pada ${payload.title} minimal satu item`;
  if (!isStringArray(tujuanPembelajaran)) return `Tujuan pembelajaran pada ${payload.title} minimal satu item`;
  if (!isStringArray(tag)) return `Tag pada ${payload.title} minimal satu item`;
  if (!assets || typeof assets !== "object") return `Assets pada ${payload.title} wajib diisi`;
  if (typeof assets.starterZip !== "string" || assets.starterZip.trim().length === 0) return `starterZip pada ${payload.title} wajib diisi`;
  if (typeof assets.gambarContoh !== "string" || assets.gambarContoh.trim().length === 0) return `gambarContoh pada ${payload.title} wajib diisi`;
  if (typeof versi !== "string" || versi.trim().length === 0) return `versi pada ${payload.title} wajib diisi`;
  if (typeof terakhirDiperbarui !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(terakhirDiperbarui)) {
    return `terakhirDiperbarui pada ${payload.title} wajib menggunakan format YYYY-MM-DD`;
  }

  if (!payload.role || typeof payload.role !== "object") return `Role pada ${payload.title} wajib diisi`;
  if (typeof payload.role.deskripsi !== "string" || payload.role.deskripsi.trim().length === 0) return `Role deskripsi pada ${payload.title} wajib diisi`;
  if (typeof payload.role.fokus !== "string" || payload.role.fokus.trim().length === 0) return `Role fokus pada ${payload.title} wajib diisi`;

  if (!payload.task || typeof payload.task !== "object") return `Task pada ${payload.title} wajib diisi`;
  if (!isStringArray(payload.task.tujuan)) return `Task tujuan pada ${payload.title} minimal satu item`;
  if (typeof payload.task.instruksi !== "string" || payload.task.instruksi.trim().length === 0) return `Task instruksi pada ${payload.title} wajib diisi`;

  if (!payload.context || typeof payload.context !== "object" || !isStringArray(payload.context.situasi)) {
    return `Context situasi pada ${payload.title} minimal satu item`;
  }

  if (!payload.reasoning || typeof payload.reasoning !== "object") return `Reasoning pada ${payload.title} wajib diisi`;
  if (typeof payload.reasoning.prinsip !== "string" || payload.reasoning.prinsip.trim().length === 0) return `Reasoning prinsip pada ${payload.title} wajib diisi`;
  if (!isStringRecord(payload.reasoning.strukturDasar) || Object.keys(payload.reasoning.strukturDasar).length === 0) {
    return `Reasoning strukturDasar pada ${payload.title} minimal satu pasangan kunci`;
  }
  if (!isStringArray(payload.reasoning.strategi)) return `Reasoning strategi pada ${payload.title} minimal satu item`;

  if (!payload.output || typeof payload.output !== "object") return `Output pada ${payload.title} wajib diisi`;
  if (!isStringArray(payload.output.bentuk)) return `Output bentuk pada ${payload.title} minimal satu item`;
  if (typeof payload.output.tugasSiswa !== "string" || payload.output.tugasSiswa.trim().length === 0) return `Output tugasSiswa pada ${payload.title} wajib diisi`;

  if (!payload.stop || typeof payload.stop !== "object" || !isStringArray(payload.stop.kriteria)) {
    return `Stop condition pada ${payload.title} minimal satu item`;
  }

  if (!payload.tips || typeof payload.tips !== "object") return `Tips pada ${payload.title} wajib diisi`;
  if (!isStringArray(payload.tips.aksesibilitas)) return `Tips aksesibilitas pada ${payload.title} minimal satu item`;
  if (!isStringArray(payload.tips.kesalahanUmum)) return `Tips kesalahanUmum pada ${payload.title} minimal satu item`;
  if (!isStringArray(payload.tips.tantangan)) return `Tips tantangan pada ${payload.title} minimal satu item`;

  return null;
}

function validatePromptSchema(data: unknown): { valid: true; value: PromptSchema } | { valid: false; message: string } {
  if (!data || typeof data !== "object") {
    return { valid: false, message: "Payload harus berupa object" };
  }

  const payload = data as PromptSchema;

  if (typeof payload.schemaId !== "string" || payload.schemaId.trim().length === 0) {
    return { valid: false, message: "schemaId wajib diisi" };
  }

  if (!Array.isArray(payload.sections) || payload.sections.length === 0) {
    return { valid: false, message: "sections minimal berisi satu bagian" };
  }

  for (let i = 0; i < payload.sections.length; i += 1) {
    const section = payload.sections[i];
    const error = validateSection(section, i);
    if (error) {
      return { valid: false, message: error };
    }
  }

  return { valid: true, value: payload };
}

async function readPromptSchema(schemaId: keyof typeof SCHEMA_FILE_MAP): Promise<PromptSchema | null> {
  try {
    const filePath = SCHEMA_FILE_MAP[schemaId];
    const file = await fs.readFile(filePath, "utf-8");
    return JSON.parse(file) as PromptSchema;
  } catch (error) {
    console.error("Failed to read prompt schema", error);
    return null;
  }
}

async function writePromptSchema(schemaId: keyof typeof SCHEMA_FILE_MAP, data: PromptSchema) {
  const filePath = SCHEMA_FILE_MAP[schemaId];
  const json = `${JSON.stringify(data, null, 2)}\n`;
  await fs.writeFile(filePath, json, "utf-8");
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { schemaId: string } }
) {
  const resolvedSchemaId = resolveSchemaId(params.schemaId);
  if (!resolvedSchemaId) {
    return NextResponse.json({ error: "Schema prompt tidak ditemukan" }, { status: 404 });
  }

  const schema = await readPromptSchema(resolvedSchemaId);
  if (!schema) {
    return NextResponse.json({ error: "Gagal membaca berkas prompt" }, { status: 500 });
  }

  return NextResponse.json({ data: schema });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { schemaId: string } }
) {
  const resolvedSchemaId = resolveSchemaId(params.schemaId);
  if (!resolvedSchemaId) {
    return NextResponse.json({ error: "Schema prompt tidak ditemukan" }, { status: 404 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload tidak valid" }, { status: 400 });
  }

  const validation = validatePromptSchema(payload);
  if (!validation.valid) {
    return NextResponse.json({ error: validation.message }, { status: 400 });
  }

  const schema: PromptSchema = {
    ...validation.value,
    schemaId: resolvedSchemaId
  };

  try {
    await writePromptSchema(resolvedSchemaId, schema);
  } catch (error) {
    console.error("Failed to write prompt schema", error);
    return NextResponse.json({ error: "Gagal menyimpan berkas prompt" }, { status: 500 });
  }

  return NextResponse.json({ message: "Prompt berhasil diperbarui", data: schema });
}
