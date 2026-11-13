import { buildUkpModule } from "./ukp-c-builder";
import { beaMeteraiASpec } from "./ukp-a-specs/bea-meterai";
import { kupPpspPengadilanPajakASpec } from "./ukp-a-specs/kup-ppsp-pengadilan-pajak";
import { pphOrangPribadiASpec } from "./ukp-a-specs/pph-orang-pribadi";
import { pphPemotonganPemungutanASpec } from "./ukp-a-specs/pph-pemotongan-pemungutan";
import { ppnDanSptPpnASpec } from "./ukp-a-specs/ppn-dan-spt-ppn";
import type { LearningModule } from "../types";

export const ukpAModulesBySlug: Record<string, LearningModule> = {
  "ukp-a-bea-meterai": buildUkpModule(beaMeteraiASpec),
  "ukp-a-kup-ppsp-pengadilan-pajak": buildUkpModule(kupPpspPengadilanPajakASpec),
  "ukp-a-pph-orang-pribadi": buildUkpModule(pphOrangPribadiASpec),
  "ukp-a-pph-pemotongan-pemungutan": buildUkpModule(pphPemotonganPemungutanASpec),
  "ukp-a-ppn-dan-spt-ppn": buildUkpModule(ppnDanSptPpnASpec),
};
