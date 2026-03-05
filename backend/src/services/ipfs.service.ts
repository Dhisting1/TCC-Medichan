import axios from "axios";
import FormData from "form-data";

export async function uploadToIPFS(data: any) {
  const form = new FormData();

  form.append("file", JSON.stringify(data));

  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    form,
    {
      headers: {
        ...form.getHeaders(),
        pinata_api_key: process.env.PINATA_API_KEY!,
        pinata_secret_api_key: process.env.PINATA_SECRET!,
      },
    },
  );

  return res.data.IpfsHash;
}
