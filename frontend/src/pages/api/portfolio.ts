import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await axios.get("https://stock-portfolio-service-71f7.onrender.com/portfolio");
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error("API Proxy Error:", error.response?.status, error.response?.data);
    res
      .status(error.response?.status || 500)
      .json({ error: error.response?.data || "Failed to fetch portfolio" });
  }
}
