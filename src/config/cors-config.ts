import cors from "cors";
import { Express } from "express";

export const corsConfig = (app: Express) => {
  const corsOptions = {
    origin: ["http://localhost:5173"],
    credentials: true,
  };
  app.use(cors(corsOptions));
};
