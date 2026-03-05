import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import prescriptionRoutes from "./routes/prescription.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/prescriptions", prescriptionRoutes);

app.listen(3000, () => {
  console.log("MediChain API running");
});
