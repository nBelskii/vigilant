import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import incidentsRouter from "./routes/incidents";
import crimeRouter from "./routes/crime";
import alertsRouter from "./routes/alerts";
import airqualityRouter from "./routes/airquality";
import socialRouter from "./routes/social";
import trendsRouter from "./routes/trends";
import geocodeRouter from "./routes/geocode";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;

const ALLOWED_ORIGINS = [
  /^exp:\/\//,            // Expo Go (dev)
  /^http:\/\/localhost/,  // local dev
  /^http:\/\/192\.168\./,  // LAN dev (phone on same WiFi)
  /^https:\/\/nearby\.app$/, // production domain (update when you have one)
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile app native fetch, curl, health checks)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.some((pattern) => pattern.test(origin))) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
}));
app.use(express.json());

// 100 requests per minute per IP — enough for normal app polling,
// blocks anyone hammering the API.
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

app.get("/", (_req, res) => {
  res.json({ name: "Nearby API", status: "ok" });
});

app.use("/api/incidents", incidentsRouter);
app.use("/api/crime", crimeRouter);
app.use("/api/alerts", alertsRouter);
app.use("/api/airquality", airqualityRouter);
app.use("/api/social", socialRouter);
app.use("/api/trends", trendsRouter);
app.use("/api/geocode", geocodeRouter);

app.listen(PORT, () => {
  console.log(`Nearby backend listening on port ${PORT}`);
});
