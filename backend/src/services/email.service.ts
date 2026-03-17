import nodemailer from "nodemailer";

// ── configura transporter ────────────────────────────────────────────────────
// Suporta Gmail, Outlook ou qualquer SMTP via variáveis de ambiente.
// Para testes locais, usa Ethereal (https://ethereal.email) automaticamente
// quando EMAIL_USER não estiver configurado.

async function getTransporter() {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    // Produção: usa credenciais reais do .env
    return nodemailer.createTransport({
      host:   process.env.EMAIL_HOST   || "smtp.gmail.com",
      port:   Number(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Desenvolvimento: cria conta temporária no Ethereal para ver o email
  // sem precisar de credenciais reais
  const testAccount = await nodemailer.createTestAccount();
  console.log("📧 [Email] Usando conta Ethereal de teste:");
  console.log("   User:", testAccount.user);
  console.log("   Pass:", testAccount.pass);

  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

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

          <!-- cabeçalho -->
          <tr>
            <td style="background:#0B3530;padding:28px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">Medichain</span>
                    <span style="font-size:26px;font-weight:900;color:#CBE54E;">✛</span>
                  </td>
                  <td align="right">
                    <span style="font-size:12px;color:rgba(255,255,255,0.5);font-weight:500;">
                      Prescrição Digital
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- corpo -->
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

              <!-- detalhes da receita -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:#F0F2F0;border-radius:10px;padding:20px;margin-bottom:24px;">
                <tr>
                  <td style="padding-bottom:12px;">
                    <span style="font-size:11px;font-weight:600;text-transform:uppercase;
                                 letter-spacing:0.06em;color:#9CA3AF;">Medicamento</span><br/>
                    <span style="font-size:15px;font-weight:600;color:#111827;">
                      ${opts.medication}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:12px;">
                    <span style="font-size:11px;font-weight:600;text-transform:uppercase;
                                 letter-spacing:0.06em;color:#9CA3AF;">Dosagem</span><br/>
                    <span style="font-size:14px;color:#374151;">${opts.dosage}</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span style="font-size:11px;font-weight:600;text-transform:uppercase;
                                 letter-spacing:0.06em;color:#9CA3AF;">Código da Receita</span><br/>
                    <span style="font-size:12px;color:#374151;font-family:monospace;
                                 word-break:break-all;">${opts.prescriptionId}</span>
                  </td>
                </tr>
              </table>

              <!-- QR code -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <p style="font-size:13px;color:#6B7280;margin:0 0 12px;font-weight:500;">
                      Apresente este QR Code na farmácia:
                    </p>
                    <img src="${opts.qrDataUrl}"
                         width="160" height="160"
                         alt="QR Code da receita"
                         style="border-radius:8px;border:3px solid #CBE54E;" />
                  </td>
                </tr>
              </table>

              <!-- botão validar -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center">
                    <a href="${opts.validateUrl}"
                       style="display:inline-block;padding:13px 32px;background:#CBE54E;
                              color:#0B3530;font-size:14px;font-weight:700;
                              text-decoration:none;border-radius:8px;">
                      Verificar receita online
                    </a>
                  </td>
                </tr>
              </table>

              <!-- aviso de segurança -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:#fefce8;border:1px solid #fde68a;border-radius:8px;padding:14px;">
                <tr>
                  <td>
                    <p style="font-size:12px;color:#92400e;margin:0;line-height:1.6;">
                      🔒 <strong>Receita autenticada via blockchain.</strong><br/>
                      Esta receita é de uso único e está registrada de forma imutável
                      na rede Ethereum Sepolia. Não compartilhe o código com terceiros.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- rodapé -->
          <tr>
            <td style="background:#F9FAFB;border-top:1px solid #E5E7EB;
                        padding:20px 32px;text-align:center;">
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
  patientName:    string;
  patientEmail:   string;
  prescriptionId: string;
  medication:     string;
  dosage:         string;
  doctorEmail:    string;
  qrDataUrl:      string;
  baseUrl:        string;
  pdfBuffer?:     Buffer;   // PDF gerado pelo pdf.service
}

export async function notifyPatient(opts: NotifyPatientOptions): Promise<void> {
  const validateUrl = `${opts.baseUrl}/patient?id=${opts.prescriptionId}`;

  try {
    const transporter = await getTransporter();

    const info = await transporter.sendMail({
      from:    `"Medi-Chain" <${process.env.EMAIL_USER || "medichain@example.com"}>`,
      to:      opts.patientEmail,
      subject: `✛ Sua receita médica está pronta — Medi-Chain`,
      html:    buildEmailHtml({
        patientName:    opts.patientName,
        prescriptionId: opts.prescriptionId,
        medication:     opts.medication,
        dosage:         opts.dosage,
        doctorEmail:    opts.doctorEmail,
        qrDataUrl:      opts.qrDataUrl,
        validateUrl,
      }),
      attachments: opts.pdfBuffer ? [
        {
          filename:    `receita-${opts.prescriptionId.slice(0, 12)}.pdf`,
          content:     opts.pdfBuffer,
          contentType: "application/pdf",
        },
      ] : [],
    });

    // em modo Ethereal, loga o link para visualizar o email no navegador
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log("📧 [Email] Preview (Ethereal):", previewUrl);
    } else {
      console.log("📧 [Email] Enviado para:", opts.patientEmail, "| ID:", info.messageId);
    }
  } catch (err) {
    // notificação não deve quebrar o fluxo principal
    console.error("📧 [Email] Falha ao enviar notificação:", err);
  }
}
