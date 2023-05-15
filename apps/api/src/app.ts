import cookieParser from "cookie-parser";
import cors from "cors";
import express, { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import helmet from "helmet";
import router from "./routes/router";
import { PORT } from "./utils/env";
import logger from "./utils/logger";
const app = express();

// Configure Express App Instance
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(logger.dev, logger.combined);

app.use(cors());
app.use(helmet());
app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Swagger Documentation
import swaggerUi from "swagger-ui-express";
import swaggerFile from "../swagger_output.json";
app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));

// pour accéder au port dynamique de scalingo depuis le frontend
app.get("/port", (req, res) => {
  res.json({ port: PORT });
});
// This middleware adds the json header to every response
app.use("*", (req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

// Assign Routes
app.use("/", router);

const errorHandler: ErrorRequestHandler = (
  _err: Error,
  _req: Request,
  _res: Response,
  _next: NextFunction
) => {};
app.use(errorHandler);

export default app;
