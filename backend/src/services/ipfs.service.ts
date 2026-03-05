import axios from "axios";

export async function uploadToIPFS(data: any) {
  try {
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      data,
      {
        headers: {
          Authorization: `Bearer ${process.env.PINATA_JWT}`,
          "Content-Type": "application/json",
        },
      },
    );

    return res.data.IpfsHash;
  } catch (error: any) {
    console.error("IPFS ERROR:", error.response?.data || error);

    throw error;
  }
}
