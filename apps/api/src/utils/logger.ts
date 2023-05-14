import fs from "fs";
import morgan from "morgan";
import path from "path";
import { createStream } from "rotating-file-stream";
// log directory path
const logDirectory = path.resolve(__dirname, "../../log");

// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

// create a rotating write stream
const accessLogStream = createStream("access.log", {
  interval: "1d",
  path: logDirectory,
});

export default {
  dev: morgan("dev"),
  combined: morgan("combined", { stream: accessLogStream }),
};
