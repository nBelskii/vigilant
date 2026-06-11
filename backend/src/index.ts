import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import incidentsRouter from "./routes/incidents";
import alertsRouter from "./routes/alerts";
import airqualityRouter from "./routes/airquality";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ name: "Vigilant API", status: "ok" });
});

app.use("/api/incidents", incidentsRouter);
app.use("/api/alerts", alertsRouter);
app.use("/api/airquality", airqualityRouter);

app.listen(PORT, () => {
  console.log(`Vigilant backend listening on port ${PORT}`);
});
