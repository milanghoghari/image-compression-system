import axios from "axios";
import sharp from "sharp";
import { Upload } from "@aws-sdk/lib-storage";
import {
  ObjectCannedACL,
  PutObjectCommandInput,
  S3 as S3Client,
} from "@aws-sdk/client-s3";
import config from "../../config.json";
import Product from "../schema/image-compression.model";
import { sendWebhook } from "./webhook.utils";

const uploadToS3 = async (buffer, contentType, fileName) => {
  try {
    let s3Client = new S3Client({
      credentials: {
        accessKeyId: config.aws.accessKeyId,
        secretAccessKey: config.aws.secretAccessKey,
      },
      region: config.aws.region,
    });

    const s3FilePath = config.aws.bucketPath + fileName;

    let params: PutObjectCommandInput = {
      Bucket: config.aws.bucket,
      Key: s3FilePath,
      Body: buffer,
      ContentType: contentType,
      ...(config.aws.acl
        ? {
            ACL: config.aws.acl as ObjectCannedACL,
          }
        : null),
    };

    let s3Uploader = new Upload({
      leavePartsOnError: false,
      client: s3Client,
      params: params,
    });

    s3Uploader.on("httpUploadProgress", (progress) => {
      console.log("S3 Uploading Progress", progress);
    });

    let uploadRes = await s3Uploader.done();
    console.log("Image uploaded to S3 : ", uploadRes);

    // Return the public URL of the uploaded file
    return `https://${config.aws.bucket}.s3.${config.aws.region}.amazonaws.com/${s3FilePath}`;
  } catch (error) {
    console.log(`ERROR :: while uploading to s3 : `, error);
    return null;
  }
};

export async function compressImage({
  requestId,
  data,
}: {
  requestId: string;
  data: any[];
}) {
  try {
    const compressedImages: any[] = [];
    for (let product of data) {
      await Promise.all(
        product.inputImageUrls.map(async (url, index) => {
          const response = await axios({
            url,
            responseType: "arraybuffer",
          });

          const buffer = Buffer.from(response.data, "binary");
          const metaData = await sharp(buffer).metadata();

          // resize the image
          const resizedBuffer = await sharp(buffer)
            .resize({ width: Math.floor(metaData.width! / 2) })
            .toBuffer();

          const fileExtension = metaData.format;
          const fileName = `${
            requestId + product.productName
          }-${index}.${fileExtension}`;

          const imageUrl = await uploadToS3(
            resizedBuffer,
            `image/${fileExtension}`,
            fileName
          );

          compressedImages.push({
            serialNumber: product.serialNumber,
            productName: product.productName,
            inputImageUrl: url,
            outputImageUrl: imageUrl,
          });
        })
      );
    }

    const product = await Product.findOne({ requestId });
    if (product) {
      product.status = "completed";
      product.images = compressedImages.map((image) => ({
        serialNumber: image.serialNumber,
        productName: image.productName,
        inputImageUrl: image.inputImageUrl,
        outputImageUrl: image.outputImageUrl,
      }));

      await product.save();

      await sendWebhook(requestId, "completed");
    }
  } catch (error) {
    console.log("ERROR :: compressing image :: ", error);
    await sendWebhook(requestId, "failed");
  }
}
