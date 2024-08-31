import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import { configureMulter } from "../utils/multer.utils";
import { MulterError } from "multer";
import fs from "fs";
import csvParser from "csv-parser";
import Product from "../schema/image-compression.model";
import { compressImage } from "../utils/cloudStorage.utils";
import { sendWebhook } from "../utils/webhook.utils";

const cleanHeader = (header) => {
  return String(header)
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
};

const validateCSVFile = async (filePath: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];
    let cleanedHeaders: any[] = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("headers", (headers) => {
        // Clean headers
        cleanedHeaders = headers.map((header) => cleanHeader(header));

        // Check if the cleaned headers contain the required columns
        if (!cleanedHeaders.includes("sno")) {
          return reject(`Invalid CSV Formate : 'sno' columns missing`);
        }
        if (!cleanedHeaders.includes("productname")) {
          return reject(`Invalid CSV Formate : 'productname' columns missing`);
        }
        if (!cleanedHeaders.includes("inputimageurls")) {
          return reject(
            `Invalid CSV Formate : 'inputimageurls' columns missing`
          );
        }
      })
      .on("data", (row) => {
        // Create a new object with cleaned headers as keys
        const cleanedRow = {};
        cleanedHeaders.forEach((header, index) => {
          if (String(row[Object.keys(row)[index]]).trim()) {
            cleanedRow[header] = row[Object.keys(row)[index]];
          } else {
            return reject("Invalid CSV format: Required columns missing");
          }
        });

        results.push({
          serialNumber: cleanedRow["sno"],
          productName: cleanedRow["productname"],
          inputImageUrls: cleanedRow["inputimageurls"]
            .split(",")
            .map((url) => url.trim()),
        });
      })
      .on("end", () => {
        // Example validation: Check if the required columns are present
        if (!results.length) {
          return reject("Invalid CSV Formate");
        } else {
          return resolve(results);
        }
      })
      .on("error", (error) => {
        return reject(error);
      });
  });
};

const upload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // generate a unique requestId
    const requestId = uuidv4();
    let filePath;
    // Get the multer instance
    const upload = configureMulter();
    const uploadSingle = upload.single("file");

    uploadSingle(req, res, async (err: any) => {
      if (err instanceof MulterError) {
        return res.status(500).send(`Multer error: ${err.message}`);
      } else if (err) {
        return res.status(400).send(`Error: ${err.message}`);
      }

      //@ts-ignore
      if (!req.file) {
        return res.status(400).send("No file uploaded.");
      }

      //@ts-ignore
      filePath = req.file.path;

      try {
        const data = await validateCSVFile(filePath);
        fs.unlinkSync(filePath);

        const product = new Product({
          requestId: requestId,
          status: "processing",
          images: data.flatMap((product) =>
            product.inputImageUrls.map((url) => ({
              serialNumber: product.serialNumber,
              productName: product.productName,
              inputImageUrl: url,
              outputImageUrl: null,
            }))
          ),
        });
        await product.save();

        await sendWebhook(requestId, "processing");

        compressImage({ requestId: requestId, data: data });

        return res.status(200).json({
          requestId: requestId,
        });
      } catch (error) {
        return res.status(400).json({ error: error });
      }
    });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

const checkStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { requestId } = req.params;
    const product = await Product.findOne({ requestId });

    if (!product) {
      return res.status(404).json({ error: "product not found!" });
    }

    return res.status(200).json({
      status: product.status,
      images: product.images,
    });
  } catch (error) {
    return res.status(500).json({ error: error });
  }
};

export default { upload, checkStatus };
