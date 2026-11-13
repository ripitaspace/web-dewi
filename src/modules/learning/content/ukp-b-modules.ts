import { buildUkpModule } from "./ukp-c-builder";
import { akuntansiPerpajakanBSpec } from "./ukp-b-specs/akuntansi-perpajakan";
import { beaMeteraiBSpec } from "./ukp-b-specs/bea-meterai";
import { kupPpspPengadilanPajakBSpec } from "./ukp-b-specs/kup-ppsp-pengadilan-pajak";
import { pbbP5lBSpec } from "./ukp-b-specs/pbb-p5l";
import { pphOrangPribadiBSpec } from "./ukp-b-specs/pph-orang-pribadi";
import { pphPemotonganPemungutanBSpec } from "./ukp-b-specs/pph-pemotongan-pemungutan";
import { pphBadanBSpec } from "./ukp-b-specs/pph-badan";
import { ppnDanSptPpnBSpec } from "./ukp-b-specs/ppn-dan-spt-ppn";
import type { LearningModule } from "../types";

export const ukpBModulesBySlug: Record<string, LearningModule> = {
  "ukp-b-akuntansi-perpajakan": buildUkpModule(akuntansiPerpajakanBSpec),
  "ukp-b-bea-meterai": buildUkpModule(beaMeteraiBSpec),
  "ukp-b-kup-ppsp-pengadilan-pajak": buildUkpModule(kupPpspPengadilanPajakBSpec),
  "ukp-b-pbb-p5l": buildUkpModule(pbbP5lBSpec),
  "ukp-b-pph-orang-pribadi": buildUkpModule(pphOrangPribadiBSpec),
  "ukp-b-pph-pemotongan-pemungutan": buildUkpModule(pphPemotonganPemungutanBSpec),
  "ukp-b-pph-badan": buildUkpModule(pphBadanBSpec),
  "ukp-b-ppn-dan-spt-ppn": buildUkpModule(ppnDanSptPpnBSpec),
};
