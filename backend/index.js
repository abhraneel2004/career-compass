import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import careerRoutes from "./routes.js";

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT) || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", careerRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ status: true, msg: "Server is up and running" });
});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
