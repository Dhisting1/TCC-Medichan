import { Resend } from "resend";

// ── configuração do Resend ───────────────────────────────────────────────────
// Usa a API do Resend via HTTPS (Railway permite, ao contrário do SMTP)
// Cadastro gratuito em https://resend.com — 100 emails/dia

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// ── template do email ────────────────────────────────────────────────────────
function buildEmailHtml(opts: {
  patientName: string;
  prescriptionId: string;
  medication: string;
  dosage: string;
  doctorEmail: string;
  qrDataUrl: string;
  validateUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sua receita médica — Medi-Chain</title>
</head>
<body style="margin:0;padding:0;background:#F0F2F0;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0F2F0;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">

          <tr>
            <td style="background:#0B3530;padding:28px 32px;">
              <span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Medichain</span>
              <span style="font-size:26px;font-weight:900;color:#CBE54E;">+</span>
            </td>
          </tr>

          <tr>
            <td style="padding:32px;">
              <p style="font-size:16px;color:#0B3530;font-weight:700;margin:0 0 8px;">
                Olá, ${opts.patientName}!
              </p>
              <p style="font-size:14px;color:#6B7280;margin:0 0 24px;line-height:1.6;">
                Uma nova receita médica foi registrada para você na blockchain Medi-Chain.
                Apresente o QR Code abaixo ou o código da receita na farmácia para retirar
                seu medicamento.
              </p>

              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:#F0F2F0;border-radius:10px;padding:20px;margin-bottom:24px;">
                <tr><td style="padding-bottom:12px;">
                  <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#9CA3AF;">Medicamento</span><br/>
                  <span style="font-size:15px;font-weight:600;color:#111827;">${opts.medication}</span>
                </td></tr>
                <tr><td style="padding-bottom:12px;">
                  <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#9CA3AF;">Dosagem</span><br/>
                  <span style="font-size:14px;color:#374151;">${opts.dosage}</span>
                </td></tr>
                <tr><td>
                  <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#9CA3AF;">Código da Receita</span><br/>
                  <span style="font-size:12px;color:#374151;font-family:monospace;word-break:break-all;">${opts.prescriptionId}</span>
                </td></tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr><td align="center">
                  <p style="font-size:13px;color:#6B7280;margin:0 0 12px;font-weight:500;">
                    Apresente este QR Code na farmácia:
                  </p>
                  <img src="${opts.qrDataUrl}" width="160" height="160" alt="QR Code"
                       style="border-radius:8px;border:3px solid #CBE54E;" />
                </td></tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr><td align="center">
                  <a href="${opts.validateUrl}"
                     style="display:inline-block;padding:13px 32px;background:#CBE54E;color:#0B3530;font-size:14px;font-weight:700;text-decoration:none;border-radius:8px;">
                    Verificar receita online
                  </a>
                </td></tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:14px;">
                <tr><td>
                  <p style="font-size:12px;color:#92400e;margin:0;line-height:1.6;">
                    🔒 <strong>Receita autenticada via blockchain.</strong><br/>
                    Esta receita é de uso único e está registrada de forma imutável
                    na rede Ethereum Sepolia. Não compartilhe o código com terceiros.
                  </p>
                </td></tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background:#F9FAFB;border-top:1px solid #E5E7EB;padding:20px 32px;text-align:center;">
              <p style="font-size:12px;color:#9CA3AF;margin:0;">
                Medi-Chain — Sistema de E-Prescription com Blockchain<br/>
                Instituto Federal de Brasília · TCC Sistemas para Internet
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// ── função principal exportada ───────────────────────────────────────────────
export interface NotifyPatientOptions {
  patientName: string;
  patientEmail: string;
  prescriptionId: string;
  medication: string;
  dosage: string;
  doctorEmail: string;
  qrDataUrl: string;
  baseUrl: string;
  pdfBuffer?: Buffer;
}

export async function notifyPatient(opts: NotifyPatientOptions): Promise<void> {
  if (!resend) {
    console.warn("[Email] RESEND_API_KEY não configurada — pulando envio.");
    return;
  }

  const validateUrl = `${opts.baseUrl}/patient?id=${opts.prescriptionId}`;
  const from = process.env.RESEND_FROM || "Medi-Chain <onboarding@resend.dev>";

  try {
    const result = await resend.emails.send({
      from,
      to: opts.patientEmail,
      subject: "✛ Sua receita médica está pronta — Medi-Chain",
      html: buildEmailHtml({
        patientName: opts.patientName,
        prescriptionId: opts.prescriptionId,
        medication: opts.medication,
        dosage: opts.dosage,
        doctorEmail: opts.doctorEmail,
        qrDataUrl: opts.qrDataUrl,
        validateUrl,
      }),
      attachments: opts.pdfBuffer
        ? [
            {
              filename: `receita-${opts.prescriptionId.slice(0, 12)}.pdf`,
              content: opts.pdfBuffer,
            },
          ]
        : undefined,
    });

    if (result.error) {
      console.error("[Email] Erro do Resend:", result.error);
      throw new Error(result.error.message);
    }

    console.log("[Email] Resend ID:", result.data?.id);
  } catch (err: any) {
    console.error("[Email] Falha:", err.message);
    throw err;
  }
}
