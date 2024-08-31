import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure the 'uploads' directory exists
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Define the storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store files in a specific directory within the project, e.g., 'uploads'
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Keep the original file extension and add a timestamp to the filename
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Define a file filter to allow only CSV files
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "text/csv" ||
    file.mimetype === "application/vnd.ms-excel"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only CSV files are allowed"));
  }
};

// Export a function to create a Multer instance
export function configureMulter() {
  return multer({
    storage: storage,
    fileFilter: fileFilter,
  });
}
