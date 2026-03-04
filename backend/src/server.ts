import express from "express";
import cors from "cors";
import prescriptionRoutes from "./routes/prescription.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/prescriptions", prescriptionRoutes);

app.listen(3000, () => {
  console.log("MediChain API running on port 3000");
});
