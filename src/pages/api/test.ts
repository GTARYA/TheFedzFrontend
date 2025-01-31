// pages/api/testDb.ts
import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../libs/dbConnect";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    await dbConnect()
    res.status(200).json({ message: "Database connected successfully" });
  } catch (error) {
    res.status(500).json({ message: "Database connection failed", error });
  }
}
