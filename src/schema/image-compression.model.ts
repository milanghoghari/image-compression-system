import mongoose from "mongoose";

// schmea for image
const imageSchema = new mongoose.Schema({
  serialNumber: { type: String },
  productName: { type: String },
  inputImageUrl: { type: String },
  outputImageUrl: { type: String },
});

// schema for product
const productSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    images: [imageSchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret, options) => {
        delete ret._id;
        delete ret.__v;
        delete ret.deletedAt;
        delete ret.deleted;
      },
    },
  }
);

const Product = mongoose.model("Product", productSchema, "Products");

export default Product;
