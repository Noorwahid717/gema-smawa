"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  AlertTriangle,
  ClipboardCopy,
  Layers,
  Pencil,
  Plus,
  RefreshCcw,
  Save,
  Sparkles,
  Trash2,
  X
} from "lucide-react";
import type { PromptSchema, PromptSection } from "@/types/prompt";

const SCHEMA_ID = "webPortfolioSma";

const todayIso = () => new Date().toISOString().slice(0, 10);

const cleanString = (value: string, label: string) => {
  const trimmed = value?.trim?.() ?? "";
  if (!trimmed) {
    throw new Error(`${label} wajib diisi`);
  }
  return trimmed;
};

const cleanArray = (items: string[], label: string) => {
  if (!Array.isArray(items)) {
    throw new Error(`${label} harus berupa array`);
  }
  const cleaned = items.map((item) => item.trim()).filter(Boolean);
  if (cleaned.length === 0) {
    throw new Error(`${label} minimal satu item`);
  }
  return cleaned;
};

const cleanRecord = (record: Record<string, string>, label: string) => {
  const cleanedEntries = Object.entries(record ?? {}).map(([key, value]) => [key.trim(), value.trim()]);
  const filtered = cleanedEntries.filter(([key, value]) => key.length > 0 && value.length > 0);
  if (filtered.length === 0) {
    throw new Error(`${label} minimal satu item`);
  }
  return Object.fromEntries(filtered);
};

const sanitizeSection = (section: PromptSection, schemaId: string): PromptSection => {
  const metaIdRaw = section.meta?.id ?? "";
  const safeId = metaIdRaw.trim().length > 0 ? metaIdRaw.trim() : `${schemaId}-${Date.now()}`;

  const durasi = Number(section.meta?.durasiMenit ?? 0);
  if (Number.isNaN(durasi) || durasi <= 0) {
    throw new Error("Durasi menit harus berupa angka positif");
  }

  return {
    ...section,
    title: cleanString(section.title, "Judul bagian"),
    meta: {
      ...section.meta,
      id: safeId,
      titleShort: cleanString(section.meta?.titleShort ?? "", "Judul singkat"),
      level: cleanString(section.meta?.level ?? "", "Level"),
      durasiMenit: durasi,
      prasyarat: cleanArray(section.meta?.prasyarat ?? [], "Prasyarat"),
      tujuanPembelajaran: cleanArray(section.meta?.tujuanPembelajaran ?? [], "Tujuan pembelajaran"),
      tag: cleanArray(section.meta?.tag ?? [], "Tag"),
      assets: {
        starterZip: cleanString(section.meta?.assets?.starterZip ?? "", "Starter ZIP"),
        gambarContoh: cleanString(section.meta?.assets?.gambarContoh ?? "", "Gambar contoh")
      },
      versi: cleanString(section.meta?.versi ?? "", "Versi"),
      terakhirDiperbarui: todayIso()
    },
    role: {
      deskripsi: cleanString(section.role?.deskripsi ?? "", "Role deskripsi"),
      fokus: cleanString(section.role?.fokus ?? "", "Role fokus")
    },
    task: {
      tujuan: cleanArray(section.task?.tujuan ?? [], "Task tujuan"),
      instruksi: cleanString(section.task?.instruksi ?? "", "Task instruksi")
    },
    context: {
      situasi: cleanArray(section.context?.situasi ?? [], "Context situasi")
    },
    reasoning: {
      prinsip: cleanString(section.reasoning?.prinsip ?? "", "Reasoning prinsip"),
      strukturDasar: cleanRecord(section.reasoning?.strukturDasar ?? {}, "Reasoning struktur dasar"),
      strategi: cleanArray(section.reasoning?.strategi ?? [], "Reasoning strategi")
    },
    output: {
      bentuk: cleanArray(section.output?.bentuk ?? [], "Output bentuk"),
      tugasSiswa: cleanString(section.output?.tugasSiswa ?? "", "Output tugas siswa")
    },
    stop: {
      kriteria: cleanArray(section.stop?.kriteria ?? [], "Stop condition")
    },
    tips: {
      aksesibilitas: cleanArray(section.tips?.aksesibilitas ?? [], "Tips aksesibilitas"),
      kesalahanUmum: cleanArray(section.tips?.kesalahanUmum ?? [], "Tips kesalahan umum"),
      tantangan: cleanArray(section.tips?.tantangan ?? [], "Tips tantangan")
    }
  };
};

const createNewSection = (schemaId: string): PromptSection => ({
  title: "Bagian Baru • Sesuaikan Judul",
  meta: {
    id: `${schemaId}-${Date.now()}`,
    titleShort: "Judul Singkat",
    level: "Menengah",
    durasiMenit: 30,
    prasyarat: ["Tuliskan prasyarat pembelajaran di sini"],
    tujuanPembelajaran: ["Tuliskan tujuan utama pembelajaran"],
    tag: ["tag-pembelajaran"],
    assets: {
      starterZip: "/assets/prompts/path-ke-starter.zip",
      gambarContoh: "/assets/prompts/path-ke-gambar.png"
    },
    versi: "1.0.0",
    terakhirDiperbarui: todayIso()
  },
  role: {
    deskripsi: "Deskripsikan peran siswa pada bagian ini.",
    fokus: "Tuliskan fokus utama aktivitas."
  },
  task: {
    tujuan: ["Tuliskan tujuan tugas nomor 1"],
    instruksi: "Instruksi lengkap tugas dituliskan di sini."
  },
  context: {
    situasi: ["Tuliskan situasi utama yang relevan untuk siswa."]
  },
  reasoning: {
    prinsip: "Jelaskan prinsip inti yang ingin dicapai.",
    strukturDasar: {
      observasi: "Langkah observasi awal.",
      analisis: "Langkah analisis utama.",
      keputusan: "Langkah keputusan akhir."
    },
    strategi: ["Tambahkan strategi utama yang perlu dilakukan."]
  },
  output: {
    bentuk: ["Tuliskan bentuk output yang diharapkan."],
    tugasSiswa: "Rincikan tugas siswa secara singkat."
  },
  stop: {
    kriteria: ["Tuliskan kriteria stop condition."]
  },
  tips: {
    aksesibilitas: ["Tips aksesibilitas pertama"],
    kesalahanUmum: ["Kesalahan umum yang harus dihindari"],
    tantangan: ["Tantangan lanjutan yang bisa dicoba"]
  }
});

export default function AdminPromptPage() {
  const [promptData, setPromptData] = useState<PromptSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorIndex, setEditorIndex] = useState<number | null>(null);
  const [editorValue, setEditorValue] = useState("");
  const [editorError, setEditorError] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const fetchPrompt = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/prompts/${SCHEMA_ID}`);
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error ?? "Gagal memuat data prompt");
      }
      setPromptData(body.data as PromptSchema);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Gagal memuat data prompt");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrompt();
  }, [fetchPrompt]);

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => setSuccess(null), 3200);
    return () => window.clearTimeout(timer);
  }, [success]);

  const sections = useMemo(() => promptData?.sections ?? [], [promptData]);

  const totalDuration = useMemo(
    () => sections.reduce((total, section) => total + (section.meta?.durasiMenit ?? 0), 0),
    [sections]
  );

  const latestUpdate = useMemo(() => {
    const dates = sections
      .map((section) => section.meta?.terakhirDiperbarui)
      .filter((value): value is string => Boolean(value));
    if (dates.length === 0) return "-";
    return dates.sort().at(-1);
  }, [sections]);

  const uniqueTags = useMemo(() => {
    const tagSet = new Set<string>();
    sections.forEach((section) => {
      section.meta?.tag?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [sections]);

  const closeEditor = () => {
    setEditorOpen(false);
    setEditorIndex(null);
    setEditorValue("");
    setEditorError(null);
    setIsCreatingNew(false);
  };

  const persistSchema = async (nextSections: PromptSection[], message: string) => {
    if (!promptData) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload: PromptSchema = { ...promptData, schemaId: SCHEMA_ID, sections: nextSections };
      const res = await fetch(`/api/prompts/${SCHEMA_ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body?.error ?? "Gagal menyimpan prompt");
      }
      setPromptData(body.data as PromptSchema);
      setSuccess(message);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Gagal menyimpan prompt");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSection = async () => {
    if (editorIndex === null) return;
    try {
      const parsed = JSON.parse(editorValue) as PromptSection;
      const sanitized = sanitizeSection(parsed, SCHEMA_ID);
      const nextSections = [...sections];
      if (isCreatingNew) {
        nextSections.push(sanitized);
      } else if (editorIndex >= 0 && editorIndex < nextSections.length) {
        nextSections[editorIndex] = sanitized;
      } else {
        throw new Error("Index section tidak valid");
      }
      await persistSchema(nextSections, "Prompt berhasil disimpan");
      closeEditor();
    } catch (err) {
      console.error(err);
      setEditorError(err instanceof Error ? err.message : "JSON tidak valid");
    }
  };

  const handleEditSection = (index: number) => {
    const section = sections[index];
    setEditorIndex(index);
    setEditorValue(JSON.stringify(section, null, 2));
    setEditorError(null);
    setEditorOpen(true);
    setIsCreatingNew(false);
  };

  const handleAddSection = () => {
    const next = createNewSection(SCHEMA_ID);
    setEditorIndex(sections.length);
    setEditorValue(JSON.stringify(next, null, 2));
    setEditorError(null);
    setEditorOpen(true);
    setIsCreatingNew(true);
  };

  const handleDuplicateSection = async (index: number) => {
    const base = sections[index];
    if (!base) return;
    const duplicated: PromptSection = {
      ...base,
      title: `${base.title} (Salinan)`,
      meta: {
        ...base.meta,
        id: `${base.meta.id}-copy-${Date.now()}`,
        titleShort: `${base.meta.titleShort} Copy`.slice(0, 60),
        terakhirDiperbarui: todayIso()
      }
    };
    const nextSections = [
      ...sections.slice(0, index + 1),
      duplicated,
      ...sections.slice(index + 1)
    ];
    await persistSchema(nextSections, "Bagian berhasil diduplikasi");
  };

  const handleDeleteSection = async (index: number) => {
    if (!promptData) return;
    if (sections.length <= 1) {
      setError("Schema harus memiliki minimal satu bagian prompt.");
      return;
    }
    const section = sections[index];
    if (!section) return;
    const confirmed = window.confirm(`Hapus "${section.title}" dari schema?`);
    if (!confirmed) return;
    const nextSections = sections.filter((_, idx) => idx !== index);
    await persistSchema(nextSections, "Bagian berhasil dihapus");
  };

  const handleRefresh = () => {
    fetchPrompt();
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50 pb-12">
        <div className="bg-white shadow-sm border-b border-slate-200">
          <div className="container mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Manajemen Prompt Interaktif</h1>
                <p className="text-sm text-slate-500">
                  Sinkronkan konten prompt yang tampil pada halaman siswa &mdash; edit struktur JSON atau tambahkan bagian baru.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleRefresh}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                disabled={loading}
              >
                <RefreshCcw className="h-4 w-4" />
                Muat Ulang
              </button>
              <button
                onClick={handleAddSection}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Section Baru
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          {error && (
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              <Save className="h-4 w-4" />
              <span>{success}</span>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">Jumlah Bagian</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{sections.length}</p>
              <p className="text-xs text-slate-500 mt-1">Setiap bagian menampilkan anatomi prompt lengkap.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">Total Durasi</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{totalDuration} menit</p>
              <p className="text-xs text-slate-500 mt-1">Akumulasi estimasi pengerjaan seluruh bagian.</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-500">Terakhir Diperbarui</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{latestUpdate ?? "-"}</p>
              <p className="text-xs text-slate-500 mt-1">Tanggal pembaruan terbaru di antara semua section.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-md">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <p className="text-sm font-semibold text-slate-700">Schema: {promptData?.schemaId ?? SCHEMA_ID}</p>
                <p className="text-xs text-slate-500">
                  Tag unik: {uniqueTags.length > 0 ? uniqueTags.join(", ") : "-"}
                </p>
              </div>
              {saving && (
                <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Menyimpan...
                </span>
              )}
            </div>

            {loading && sections.length === 0 ? (
              <div className="px-6 py-10 text-center text-slate-500">
                Memuat data prompt...
              </div>
            ) : (
              <div className="divide-y divide-slate-200">
                {sections.map((section, index) => (
                  <div key={section.meta.id} className="px-6 py-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                            {section.meta.titleShort}
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                            {section.meta.level}
                          </span>
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                            {section.meta.durasiMenit} menit
                          </span>
                        </div>
                        <h2 className="mt-3 text-xl font-semibold text-slate-900">{section.title}</h2>
                        <p className="mt-2 text-sm text-slate-600 max-w-3xl">
                          {section.role?.deskripsi}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                          <span>ID: {section.meta.id}</span>
                          <span>Versi: {section.meta.versi}</span>
                          <span>Update: {section.meta.terakhirDiperbarui}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleEditSection(index)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit JSON
                        </button>
                        <button
                          onClick={() => handleDuplicateSection(index)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                        >
                          <ClipboardCopy className="h-4 w-4" />
                          Duplikat
                        </button>
                        <button
                          onClick={() => handleDeleteSection(index)}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                          disabled={sections.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                          Hapus
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-4 lg:grid-cols-3">
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <Layers className="h-4 w-4 text-blue-500" />
                          Tujuan Tugas
                        </p>
                        <ul className="mt-2 space-y-1 text-xs text-slate-600">
                          {section.task?.tujuan.map((item) => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <Layers className="h-4 w-4 text-emerald-500" />
                          Stop Condition
                        </p>
                        <ul className="mt-2 space-y-1 text-xs text-slate-600">
                          {section.stop?.kriteria.map((item) => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <Layers className="h-4 w-4 text-purple-500" />
                          Output
                        </p>
                        <ul className="mt-2 space-y-1 text-xs text-slate-600">
                          {section.output?.bentuk.map((item) => (
                            <li key={item}>• {item}</li>
                          ))}
                        </ul>
                        <p className="mt-2 text-xs text-slate-500">
                          Tugas siswa: {section.output?.tugasSiswa}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {editorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
            <div className="relative w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <button
                onClick={closeEditor}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
                aria-label="Tutup editor"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-slate-900">
                  {isCreatingNew ? "Tambahkan Section Prompt" : "Sunting Section Prompt"}
                </h2>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Sunting struktur JSON sesuai skema. Pastikan setiap array memiliki minimal satu item dan tanggal menggunakan format ISO (YYYY-MM-DD).
              </p>

              <textarea
                className="mt-4 h-96 w-full rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-200"
                value={editorValue}
                onChange={(event) => {
                  setEditorValue(event.target.value);
                  setEditorError(null);
                }}
              />

              {editorError && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{editorError}</span>
                </div>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={closeEditor}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveSection}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  disabled={saving}
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
