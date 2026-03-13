// ── Design System Medi-Chain (baseado nos protótipos do TCC) ─────────────────

export const TEAL    = "#0B3530";   // sidebar, headers de painéis
export const LIME    = "#CBE54E";   // ícones, botão primário, accent
export const BG      = "#F0F2F0";   // fundo da página
export const WHITE   = "#FFFFFF";   // cards
export const BORDER  = "#E5E7EB";   // bordas de card
export const MUTED   = "#6B7280";   // textos secundários
export const SUBTLE  = "#F9FAFB";   // fundo de inputs e cabeçalhos de card

// status
export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  ACTIVE:    { bg: "#DCFCE7", text: "#15803D" },
  VALID:     { bg: "#DCFCE7", text: "#15803D" },
  USED:      { bg: "#DBEAFE", text: "#1D4ED8" },
  REVOKED:   { bg: "#FEE2E2", text: "#DC2626" },
  NOT_FOUND: { bg: "#F3F4F6", text: "#6B7280" },
};

export const STATUS_LABELS: Record<string, string> = {
  ACTIVE:    "Ativa",
  VALID:     "Válida",
  USED:      "Dispensada",
  REVOKED:   "Revogada",
  NOT_FOUND: "Não encontrada",
};
