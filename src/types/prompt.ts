export interface PromptAssets {
  starterZip: string;
  gambarContoh: string;
}

export interface PromptMeta {
  id: string;
  titleShort: string;
  level: string;
  durasiMenit: number;
  prasyarat: string[];
  tujuanPembelajaran: string[];
  tag: string[];
  assets: PromptAssets;
  versi: string;
  terakhirDiperbarui: string;
}

export interface PromptRole {
  deskripsi: string;
  fokus: string;
}

export interface PromptTask {
  tujuan: string[];
  instruksi: string;
}

export interface PromptContext {
  situasi: string[];
}

export interface PromptReasoning {
  prinsip: string;
  strukturDasar: Record<string, string>;
  strategi: string[];
}

export interface PromptOutput {
  bentuk: string[];
  tugasSiswa: string;
}

export interface PromptStop {
  kriteria: string[];
}

export interface PromptTips {
  aksesibilitas: string[];
  kesalahanUmum: string[];
  tantangan: string[];
}

export interface PromptSection {
  title: string;
  meta: PromptMeta;
  role: PromptRole;
  task: PromptTask;
  context: PromptContext;
  reasoning: PromptReasoning;
  output: PromptOutput;
  stop: PromptStop;
  tips: PromptTips;
}

export interface PromptSchema {
  schemaId: string;
  sections: PromptSection[];
}
