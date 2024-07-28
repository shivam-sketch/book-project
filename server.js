import express from "express";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";
import connect from "./database/conn.js";
import http from "http";
import cookieParser from "cookie-parser";
// require("dotenv").config();
import logger from "morgan";
import path from "path";
import debug from "debug";
import createHttpError from "http-errors";
const analyze = debug("backend:server");

//App router
import authRouter from "./routes/api/v1/auth.js";
import bookRouter from "./routes/api/v1/book.js";

import HttpExceptionHandler from "./exceptions/HttpExceptionHandler.js";

const app = express();
const __dirname = path.resolve();

// middle-wares
app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));
app.use(cookieParser());
app.use(logger("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

var server = http.createServer(app);

// creating a server

// connect server only when the databse is connected
connect()
  .then(() => {
    try {
      server.listen(port, () => {
        console.log("server listening on the port : ", port);
      });
    } catch (error) {
      console.log("error in starting server");
    }
  })
  .catch((error) => {
    console.log("Invalid db connection...", error);
  });

server.on("error", onError);
server.on("listening", onListening);

app.get("/", async (req, res) => {
  res
    .status(200)
    .json({
      status: true,
      message: "Server Is Running Now Add /api/v1 to the url",
    });
});

app.get("/api/v1", async (req, res) => {
  res.status(200).json({ status: true, message: "server is running" });
});

// routes files

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/book", bookRouter);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  analyze("Listening on " + bind);
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createHttpError(404));
});

// Expection
app.use(HttpExceptionHandler.handler);
