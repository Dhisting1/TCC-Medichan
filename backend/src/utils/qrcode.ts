import QRCode from "qrcode";

export async function generateQR(data: string) {
  return await QRCode.toDataURL(data);
}
