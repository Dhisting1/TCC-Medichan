import PDFDocument from "pdfkit";

export interface PrescriptionPdfOptions {
  prescriptionId: string;
  patient: string;
  patientEmail: string;
  medication: string;
  dosage: string;
  doctorEmail: string;
  doctorCrm?: string;
  createdAt: Date;
  qrDataUrl: string; // data:image/png;base64,...
}

/*
Gera o PDF da prescrição e retorna como Buffer.
*/
export function generatePrescriptionPdf(
  opts: PrescriptionPdfOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 0 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const W = 595.28; // largura A4 em pontos
    const M = 48; // margem lateral
    const TEAL = "#0B3530";
    const LIME = "#CBE54E";

    // ── cabeçalho ──────────────────────────────────────────────────────────
    doc.rect(0, 0, W, 72).fill(TEAL);

    doc
      .fillColor("white")
      .font("Helvetica-Bold")
      .fontSize(22)
      .text("Medichain", M, 22);

    doc
      .fillColor(LIME)
      .fontSize(24)
      .text("+", M + 108, 20);

    doc
      .fillColor("white")
      .font("Helvetica")
      .fontSize(10)
      .text("Prescrição Médica Digital", W - M - 120, 30, {
        width: 120,
        align: "right",
      });

    // ── título ─────────────────────────────────────────────────────────────
    doc
      .fillColor(TEAL)
      .font("Helvetica-Bold")
      .fontSize(18)
      .text("Prescrição médica", M, 96, { align: "center", width: W - M * 2 });

    // ── linha divisória ────────────────────────────────────────────────────
    const lineY = 124;
    doc
      .moveTo(M, lineY)
      .lineTo(W - M, lineY)
      .strokeColor("#E5E7EB")
      .lineWidth(1)
      .stroke();

    // ── bloco "Dados do médico" ────────────────────────────────────────────
    doc
      .rect(M, 136, W - M * 2, 48)
      .fillColor("#F0F2F0")
      .fill();

    doc
      .fillColor("#9CA3AF")
      .font("Helvetica")
      .fontSize(9)
      .text("Dados do médico:", M + 12, 144);

    doc
      .fillColor(TEAL)
      .font("Helvetica-Bold")
      .fontSize(11)
      .text(opts.doctorEmail, M + 12, 156);

    if (opts.doctorCrm) {
      doc
        .fillColor(TEAL)
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(`CRM: ${opts.doctorCrm}`, W / 2, 156);
    }

    // ── bloco "Dados do paciente" ──────────────────────────────────────────
    doc
      .rect(M, 196, W - M * 2, 64)
      .fillColor("#F9FAFB")
      .fill();

    doc
      .fillColor("#9CA3AF")
      .font("Helvetica")
      .fontSize(9)
      .text("Dados do paciente:", M + 12, 204);

    doc
      .fillColor(TEAL)
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(`Paciente: ${opts.patient}`, M + 12, 216);

    const dateStr = opts.createdAt.toLocaleDateString("pt-BR");
    const validDate = new Date(opts.createdAt);
    validDate.setDate(validDate.getDate() + 30);
    const validStr = validDate.toLocaleDateString("pt-BR");

    doc
      .fillColor(TEAL)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(`Data da Prescrição: ${dateStr}`, M + 12, 234)
      .text(`Validade da Receita: 30 dias (${validStr})`, W / 2, 234);

    // ── dados da receita ───────────────────────────────────────────────────
    doc
      .fillColor(TEAL)
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("Dados da receita", M, 280);

    doc
      .moveTo(M, 296)
      .lineTo(W - M, 296)
      .strokeColor("#E5E7EB")
      .lineWidth(1)
      .stroke();

    // ícone checkmark + medicamento
    doc.fillColor(TEAL).font("Helvetica").fontSize(20).text("✓", M, 308);
    doc
      .fillColor("#374151")
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(opts.medication, M + 24, 312);
    doc
      .fillColor("#6B7280")
      .font("Helvetica")
      .fontSize(11)
      .text(opts.dosage, M + 24, 328, { width: W - M * 2 - 200 });

    // ── rodapé com QR Code ─────────────────────────────────────────────────
    const footerY = 680;
    doc
      .rect(M, footerY, W - M * 2, 80)
      .fillColor(TEAL)
      .fill();

    doc
      .fillColor("white")
      .font("Helvetica")
      .fontSize(8)
      .text(
        "RECEITA DIGITAL. SUA AUTENTICIDADE E DISPENSAÇÃO DEVEM SER VALIDADAS PELO\n" +
          "QR CODE CONFORME INSTRUÇÕES ABAIXO.",
        M + 12,
        footerY + 12,
        { width: W - M * 2 - 160 },
      );

    doc
      .fillColor(LIME)
      .font("Helvetica")
      .fontSize(8)
      .text(`ID: ${opts.prescriptionId}`, M + 12, footerY + 42, {
        width: W - M * 2 - 160,
      });

    // QR Code no canto inferior direito do rodapé
    const qrBase64 = opts.qrDataUrl.replace(/^data:image\/png;base64,/, "");
    const qrBuffer = Buffer.from(qrBase64, "base64");
    doc.image(qrBuffer, W - M - 80, footerY + 4, { width: 72, height: 72 });

    // ── nota de autenticação blockchain ────────────────────────────────────
    doc
      .fillColor("#9CA3AF")
      .font("Helvetica")
      .fontSize(8)
      .text(
        "Receita autenticada via blockchain — confira a sua validação no portal Medichain.com.br",
        M,
        772,
        { align: "center", width: W - M * 2 },
      );

    doc.end();
  });
}
