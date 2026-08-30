import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env";
import routes from "./routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json({ limit: "1mb" }));

app.use("/api", routes);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`POS backend listening on :${env.port}`);
});
