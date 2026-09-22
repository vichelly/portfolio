import type { Localized } from "@/lib/i18n/locale"

/** Every piece of interface copy, in both languages. */
export const UI = {
  onTheTrail: { en: "On the trail", pt: "Na trilha" },
  parkourDetour: { en: "Parkour detour", pt: "Desvio de parkour" },
  readAsText: { en: "Read as text", pt: "Ler como texto" },
  keyboardHint: {
    en: "WASD / arrows to walk · Space to jump",
    pt: "WASD / setas para andar · Espaço para pular",
  },
  jump: { en: "JUMP", pt: "PULAR" },
  switchLanguage: { en: "Switch to Portuguese", pt: "Mudar para inglês" },
  fallbackKicker: { en: "The whole trail, as text", pt: "A trilha inteira, em texto" },
  fallbackClose: {
    en: "Close and return to the world",
    pt: "Fechar e voltar para o mundo",
  },
  fallbackTitle: { en: "All portfolio content", pt: "Todo o conteúdo do portfólio" },
  courseTitle: { en: "Reach the star", pt: "Chegue até a estrela" },
  courseSubtitle: {
    en: "Fall and you start over. Nothing else changes.",
    pt: "Se cair, recomeça. Nada mais muda.",
  },
  detourSign: { en: "PARKOUR COURSE", pt: "PISTA DE PARKOUR" },
  detourSignSub: {
    en: "optional detour · no content this way",
    pt: "desvio opcional · sem conteúdo por aqui",
  },
} satisfies Record<string, Localized>
