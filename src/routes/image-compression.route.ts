import express from "express";
import imageCompressionController from "../controllers/image-compression.controller";

const imageCompressionRouter = express.Router();

imageCompressionRouter.get(
  "/status/:requestId",
  imageCompressionController.checkStatus
);
imageCompressionRouter.post("/upload", imageCompressionController.upload);

export default imageCompressionRouter;
