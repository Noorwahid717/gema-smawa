"use client";

import { type ReactNode, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { MotionProps } from "framer-motion";
import { Disclosure } from "@headlessui/react";
import {
  BookOpenCheck,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  ClipboardCopy,
  Clock,
  Download,
  GraduationCap,
  Lightbulb,
  Sparkles,
  Target,
  Users
} from "lucide-react";
import fallbackPromptData from "@/data/prompts/webPortfolioSma.json";
import type { PromptSchema, PromptSection } from "@/types/prompt";

const SCHEMA_ID = "webPortfolioSma";
const FALLBACK_SCHEMA = fallbackPromptData as PromptSchema;
type TabMode = "ringkas" | "lengkap" | "guru";

interface ChecklistState {
  [sectionId: string]: boolean[];
}

const tabs: { id: TabMode; label: string; description: string }[] = [
  { id: "ringkas", label: "Ringkas", description: "Ikhtisar cepat untuk memulai sesi belajar" },
  { id: "lengkap", label: "Lengkap", description: "Detail utuh anatomi prompt per bagian" },
  { id: "guru", label: "Guru", description: "Catatan pendamping dan strategi fasilitasi" }
];

const fadeMotion: MotionProps = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.24, ease: "easeInOut" } }
};

export default function PromptWorkspace() {
  const [schema, setSchema] = useState<PromptSchema>(FALLBACK_SCHEMA);
  const sections = useMemo<PromptSection[]>(() => schema.sections, [schema]);
  const [activeTab, setActiveTab] = useState<TabMode>("ringkas");
  const [checklists, setChecklists] = useState<ChecklistState>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchSchema = async () => {
      try {
        const res = await fetch(`/api/prompts/${SCHEMA_ID}`, { signal: controller.signal });
        if (!res.ok) {
          const message = await res.text();
          throw new Error(message || "Gagal memuat prompt");
        }
        const body = (await res.json()) as { data?: PromptSchema };
        if (body?.data && mounted) {
          setSchema(body.data);
          setError(null);
        }
      } catch (err) {
        if (!mounted) return;
        console.error("Failed to fetch prompt schema", err);
        setError("Gagal memuat data terbaru. Menampilkan versi terakhir.");
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSchema();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedState: ChecklistState = {};
    sections.forEach((section) => {
      const key = `prompt-progress-${section.meta.id}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            storedState[section.meta.id] = parsed.map(Boolean);
            return;
          }
        } catch {
          /* noop */
        }
      }
      storedState[section.meta.id] = section.stop.kriteria.map(() => false);
    });
    setChecklists(storedState);
  }, [sections]);

  useEffect(() => {
    if (!copiedId) return;
    const timeout = window.setTimeout(() => setCopiedId(null), 2400);
    return () => window.clearTimeout(timeout);
  }, [copiedId]);

  const toggleChecklistItem = (sectionId: string, index: number) => {
    const targetSection = sections.find((item) => item.meta.id === sectionId);
    const length = targetSection?.stop.kriteria.length ?? 0;
    setChecklists((prev) => {
      const current = prev[sectionId] ?? Array.from({ length }, () => false);
      const normalized =
        current.length === length
          ? current
          : Array.from({ length }, (_, idx) => current[idx] ?? false);
      const updated = normalized.map((value, idx) => (idx === index ? !value : value));
      const next = { ...prev, [sectionId]: updated };
      if (typeof window !== "undefined") {
        localStorage.setItem(`prompt-progress-${sectionId}`, JSON.stringify(updated));
      }
      return next;
    });
  };

  const handleCopyPrompt = async (section: PromptSection) => {
    const textSnippet = [
      `Judul: ${section.title}`,
      `Role: ${section.role.deskripsi} Fokus: ${section.role.fokus}`,
      `Task: ${section.task.tujuan.join("; ")}. Instruksi: ${section.task.instruksi}`,
      `Context: ${section.context.situasi.join("; ")}`,
      `Reasoning: ${section.reasoning.prinsip}`,
      `Output: ${section.output.bentuk.join("; ")} | Tugas: ${section.output.tugasSiswa}`,
      `Stop Condition: ${section.stop.kriteria.join("; ")}`,
      `Tips: Aksesibilitas(${section.tips.aksesibilitas.join("; ")}); Kesalahan(${section.tips.kesalahanUmum.join("; ")}); Tantangan(${section.tips.tantangan.join("; ")})`
    ].join("\n");

    try {
      await navigator.clipboard.writeText(textSnippet);
      setCopiedId(section.meta.id);
    } catch (error) {
      console.error("Failed to copy prompt", error);
    }
  };

  const renderRingkas = (section: PromptSection) => (
    <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr] font-sans">
      <div className="space-y-6">
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-5">
          <div className="flex items-center gap-3 text-blue-700">
            <Lightbulb className="h-6 w-6" />
            <h3 className="text-lg font-semibold">{section.role.deskripsi}</h3>
          </div>
          <p className="mt-3 text-sm text-blue-900">{section.role.fokus}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <Target className="h-5 w-5" />
            <h4 className="text-base font-semibold">Target Utama</h4>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {section.task.tujuan.map((goal) => (
              <li key={goal} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                <span>{goal}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{section.task.instruksi}</p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-slate-700">
            <Clock className="h-5 w-5" />
            <h4 className="text-base font-semibold">Info Singkat</h4>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li><strong>Level:</strong> {section.meta.level}</li>
            <li><strong>Durasi:</strong> {section.meta.durasiMenit} menit</li>
            <li><strong>Tag:</strong> {section.meta.tag.join(", ")}</li>
            <li><strong>Tujuan:</strong> {section.meta.tujuanPembelajaran[0]}</li>
          </ul>
        </div>

        <ChecklistPanel section={section} checks={checklists[section.meta.id] ?? []} onToggle={toggleChecklistItem} />
      </div>
    </div>
  );

  const renderLengkap = (section: PromptSection) => (
    <div className="space-y-6 font-sans">
      <MetaOverview section={section} />

      <div className="grid gap-6 lg:grid-cols-2">
        <CardBlock
          title="Context"
          icon={<Users className="h-5 w-5 text-sky-500" />}
          items={section.context.situasi}
        />
        <CardBlock
          title="Reasoning"
          icon={<Sparkles className="h-5 w-5 text-amber-500" />}
          content={
            <div className="space-y-3 text-sm text-slate-600">
              <p>{section.reasoning.prinsip}</p>
              <div className="grid gap-2 rounded-lg bg-slate-50 p-3">
                {Object.entries(section.reasoning.strukturDasar).map(([key, value]) => (
                  <div key={key}>
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{key}</span>
                    <p>{value}</p>
                  </div>
                ))}
              </div>
              <ul className="space-y-2">
                {section.reasoning.strategi.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.7fr,1.3fr]">
        <CardBlock
          title="Output & Deliverable"
          icon={<ClipboardCheck className="h-5 w-5 text-indigo-500" />}
          content={
            <div className="space-y-3 text-sm text-slate-600">
              <ul className="space-y-2">
                {section.output.bentuk.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-indigo-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="rounded-lg bg-indigo-50 p-3 text-indigo-700">{section.output.tugasSiswa}</p>
            </div>
          }
        />
        <CardBlock
          title="Tips Pembelajaran"
          icon={<BookOpenCheck className="h-5 w-5 text-rose-500" />}
          content={
            <div className="grid gap-4 md:grid-cols-3">
              <TipsColumn title="Aksesibilitas" items={section.tips.aksesibilitas} accent="text-emerald-500" />
              <TipsColumn title="Kesalahan Umum" items={section.tips.kesalahanUmum} accent="text-amber-500" />
              <TipsColumn title="Tantangan" items={section.tips.tantangan} accent="text-purple-500" />
            </div>
          }
        />
      </div>

      <ChecklistPanel section={section} checks={checklists[section.meta.id] ?? []} onToggle={toggleChecklistItem} />
    </div>
  );

  const renderGuru = (section: PromptSection) => (
    <div className="space-y-6 font-sans">
      <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-slate-700">
              <GraduationCap className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Catatan Fasilitator</h3>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Gunakan bagian ini untuk memandu diskusi, membagi kelompok, dan menyiapkan asesmen formatif.
            </p>
          </div>
          <div className="rounded-full bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-blue-600">
            {section.meta.titleShort}
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h4 className="text-sm font-semibold text-slate-700">Penekanan Kompetensi</h4>
            <p className="mt-2 text-sm text-slate-600">{section.meta.tujuanPembelajaran.join(" & ")}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h4 className="text-sm font-semibold text-slate-700">Prasyarat</h4>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              {section.meta.prasyarat.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-blue-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CardBlock
          title="Strategi Pengelompokan"
          icon={<Users className="h-5 w-5 text-blue-500" />}
          content={
            <ul className="space-y-2 text-sm text-slate-600">
              {section.reasoning.strategi.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-blue-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          }
        />
        <CardBlock
          title="Monitoring"
          icon={<Target className="h-5 w-5 text-emerald-500" />}
          content={
            <div className="space-y-3 text-sm text-slate-600">
              <p>Gunakan rubrik mini:</p>
              <ul className="space-y-2">
                {section.stop.kriteria.map((criteria) => (
                  <li key={criteria} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                    <span>{criteria}</span>
                  </li>
                ))}
              </ul>
              <p className="rounded-lg bg-emerald-50 p-3 text-emerald-700">
                Lakukan refleksi cepat 2 menit di akhir sesi untuk meninjau insight utama.
              </p>
            </div>
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,0.8fr]">
        <CardBlock
          title="Bahan Pendukung"
          icon={<Download className="h-5 w-5 text-indigo-500" />}
          content={
            <div className="space-y-3 text-sm text-slate-600">
              <p>Unduh starter kit dan contoh visual sebagai referensi kelas.</p>
              <ul className="space-y-2">
                <li className="flex items-center justify-between gap-3 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-indigo-700">Starter Zip</p>
                    <p className="text-xs text-indigo-600">{section.meta.assets.starterZip}</p>
                  </div>
                  <a
                    href={section.meta.assets.starterZip}
                    download
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  >
                    <Download className="h-4 w-4" />
                    Unduh
                  </a>
                </li>
                <li className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Gambar Contoh</p>
                    <p className="text-xs text-slate-500">{section.meta.assets.gambarContoh}</p>
                  </div>
                </li>
              </ul>
            </div>
          }
        />
        <CardBlock
          title="Glosarium & Insight"
          icon={<Sparkles className="h-5 w-5 text-amber-500" />}
          content={
            <div className="space-y-3 text-sm text-slate-600">
              <p>{section.reasoning.prinsip}</p>
              <p className="rounded-lg bg-amber-50 p-3 text-amber-700">
                Ajak siswa membandingkan hasil akhir dengan persona awal untuk menilai konsistensi narasi.
              </p>
              <TipsColumn title="Kesalahan umum" items={section.tips.kesalahanUmum} accent="text-amber-500" />
            </div>
          }
        />
      </div>
    </div>
  );

  return (
    <section className="rounded-2xl border border-blue-100 bg-white/80 p-6 shadow-lg backdrop-blur">
      <header className="flex flex-col gap-6 border-b border-blue-100 pb-6 text-slate-700">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-blue-700">Prompt Interaktif: Web Portfolio SMA</h2>
          <p className="text-sm text-slate-500">
            Jelajahi anatomi prompt berbasis Role, Task, Context, Reasoning, Output, dan Stop Condition. Sesuaikan
            tampilan sesuai kebutuhan belajarmu.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`interactive-button rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
              aria-pressed={activeTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <p className="text-xs font-medium uppercase tracking-wide text-blue-500">
          Mode aktif: {tabs.find((tab) => tab.id === activeTab)?.description}
        </p>
        {(isLoading || error) && (
          <p
            className={`text-xs font-medium ${
              error ? "text-red-600" : "text-slate-400"
            }`}
          >
            {error ?? "Memuat data prompt terbaru..."}
          </p>
        )}
      </header>

      <div className="mt-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {sections.map((section, idx) => (
            <motion.div key={section.meta.id} {...fadeMotion}>
              <Disclosure defaultOpen={idx === 0}>
                {({ open }) => (
                  <div className="rounded-2xl border border-slate-200 bg-white shadow-sm transition">
                    <Disclosure.Button className="flex w-full items-center justify-between gap-4 rounded-2xl px-6 py-5 text-left font-sans focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{section.meta.titleShort}</p>
                        <h3 className="mt-1 text-lg font-semibold text-slate-800">{section.title}</h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Versi {section.meta.versi} · Terakhir diperbarui {section.meta.terakhirDiperbarui}
                        </p>
                      </div>
                      <ChevronDown
                        className={`h-6 w-6 text-slate-500 transition-transform ${open ? "rotate-180 text-blue-500" : ""}`}
                        aria-hidden="true"
                      />
                    </Disclosure.Button>

                    <Disclosure.Panel static>
                      <div className="border-t border-slate-100 px-6 py-6">
                        <div className="mb-5 flex flex-wrap items-center gap-3">
                          <button
                            onClick={() => handleCopyPrompt(section)}
                            className="interactive-button inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                          >
                            {copiedId === section.meta.id ? <ClipboardCheck className="h-4 w-4 text-emerald-500" /> : <ClipboardCopy className="h-4 w-4" />}
                            {copiedId === section.meta.id ? "Prompt Disalin" : "Salin Prompt"}
                          </button>
                          <a
                            href={section.meta.assets.starterZip}
                            download
                            className="interactive-button inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                          >
                            <Download className="h-4 w-4" />
                            Unduh Starter
                          </a>
                          <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
                            <Clock className="h-4 w-4" />
                            {section.meta.durasiMenit} menit
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600">
                            <Target className="h-4 w-4" />
                            {section.meta.level}
                          </span>
                        </div>

                        {activeTab === "ringkas" && renderRingkas(section)}
                        {activeTab === "lengkap" && renderLengkap(section)}
                        {activeTab === "guru" && renderGuru(section)}
                      </div>
                    </Disclosure.Panel>
                  </div>
                )}
              </Disclosure>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

function MetaOverview({ section }: { section: PromptSection }) {
  return (
    <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Identitas</p>
        <p className="mt-2 text-sm text-slate-600">ID: {section.meta.id}</p>
        <p className="text-sm text-slate-600">Title Short: {section.meta.titleShort}</p>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tujuan Pembelajaran</p>
        <ul className="mt-2 space-y-1 text-sm text-slate-600">
          {section.meta.tujuanPembelajaran.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tag</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {section.meta.tag.map((tag) => (
            <span key={tag} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CardBlock({
  title,
  icon,
  items,
  content
}: {
  title: string;
  icon: ReactNode;
  items?: string[];
  content?: React.ReactNode;
}) {
  return (
    <div className="h-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-slate-700">
        {icon}
        <h4 className="text-base font-semibold">{title}</h4>
      </div>
      {items ? (
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-blue-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-3 text-sm text-slate-600">{content}</div>
      )}
    </div>
  );
}

function TipsColumn({ title, items, accent }: { title: string; items: string[]; accent: string }) {
  return (
    <div>
      <h5 className={`text-sm font-semibold ${accent}`}>{title}</h5>
      <ul className="mt-2 space-y-2 text-xs text-slate-600">
        {items.map((item) => (
          <li key={item} className="rounded-lg bg-slate-50 p-2">{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ChecklistPanel({
  section,
  checks,
  onToggle
}: {
  section: PromptSection;
  checks: boolean[];
  onToggle: (sectionId: string, index: number) => void;
}) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-emerald-700">
          <CheckCircle2 className="h-5 w-5" />
          <h4 className="text-base font-semibold">Checklist Stop Condition</h4>
        </div>
        <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
          {checks.filter(Boolean).length}/{section.stop.kriteria.length} selesai
        </span>
      </div>
      <ul className="mt-3 space-y-2">
        {section.stop.kriteria.map((item, index) => {
          const checked = checks[index] ?? false;
          return (
            <li key={item} className="flex items-start gap-3 rounded-lg bg-white/80 p-3 shadow-sm">
              <button
                type="button"
                onClick={() => onToggle(section.meta.id, index)}
                className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded border ${
                  checked ? "border-emerald-500 bg-emerald-500 text-white" : "border-emerald-400 bg-white text-emerald-500"
                } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500`}
                aria-pressed={checked}
                aria-label={`Toggle checklist ${item}`}
              >
                {checked ? <CheckCircle2 className="h-4 w-4" /> : null}
              </button>
              <span className="text-sm text-slate-600">{item}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
