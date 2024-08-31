import express from "express";
import config from "./config.json";
import imageCompressionRouter from "./src/routes/image-compression.route";
import mongoose from "mongoose";

async function createServer() {
  const app = express();
  app.use(express.json());

  // get a port from configuration
  const port = config.port;

  app.listen(port, () => {
    console.log(`image-compression-service :: listening on port ${port}`);
  });

  app.use("/image-compression", imageCompressionRouter);
}

async function connectDB() {
  // get mongoDB connection URL
  const mongoDB_URL = config.mongoDB_URL;
  mongoose
    .connect(mongoDB_URL)
    .catch((err) => {
      console.log("MONGO DB :: connection error", err);
    })
    .then(() => {
      console.log("MONGO DB :: database connected");
    });
}

async function main() {
  // first create an express server
  await createServer();

  // connect DB
  await connectDB();
}

main();

process.on("uncaughtException", async (error) => {
  console.log("UNCAUGHT :: ERROR :: ", error);
});
