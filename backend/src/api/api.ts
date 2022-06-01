import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import { buildRoutes } from "./routes";

export const startApi = () => {
  const app = express();
  app.use(express.json());
  app.use(cors());
  const port = process.env?.PORT ?? 3000;

  const routes = buildRoutes();
  app.use(routes);

  app.use(express.static("../frontend/dist"));

  app.get("*", (_req, res) => {
    res.sendFile("index.html", { root: "../frontend/dist" });
  });

  app.listen(port, () => {
    console.log(`Custom URL manifest updater stared at port: ${port}`);
  });
};
