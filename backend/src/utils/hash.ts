import crypto from "crypto";

export function generateHash(data: string) {
  const hash = crypto.createHash("sha256").update(data).digest("hex");

  return "0x" + hash;
}
