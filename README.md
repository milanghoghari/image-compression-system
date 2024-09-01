# Image Compression System

A Node.js application is designed to handle CSV files. It validates data, compresses images, and uploads them to Amazon S3. Data is also stored in a MongoDB database. The application includes two endpoints: one for file uploads and another for monitoring progress. You'll receive real-time updates via a webhook.

## Content

- [Features](#Features)
- [Tech-Stack](#Tech-Stack)
- [Installation](#Installation)

## Features

- **CSV Ingestion**: Accept CSV files with image URLs and product details.
- **Data Validation**: Ensure CSV data adheres to a predefined format and includes necessary headers.
- **Image Compression**: Compress images asynchronously to 50% of their original size using efficient algorithms.
- **S3 Upload**: Upload compressed images to an Amazon S3 bucket and obtain public URLs for access.
- **MongoDB Storage**: Store processed image data and related product information in a MongoDB database for efficient retrieval and management.
- **Unique Request IDs**: Assign unique identifiers to each processing request for tracking and reference.
- **Status Checking**: Provide API endpoints to check the status of processing requests, including progress and completion.
- **Webhook Notifications**: Send real-time updates on processing progress and completion to a specified webhook endpoint.

## Tech-Stack

- **Node.js**: A popular JavaScript runtime environment for building server-side applications.
- **Express.js**: A lightweight, flexible web framework for Node.js, providing a robust foundation for building API endpoints and handling HTTP requests.
- **Multer**: A middleware that handles multipart/form-data requests, making it easy to parse and process file uploads, including CSV files.
- **csv-parser**: A stream-based CSV parser that efficiently parses CSV data, allowing for incremental processing and handling large files.
- **MongoDB**: A popular NoSQL database that is well-suited for storing unstructured data like image metadata and product information.
- **Sharp**: A high-performance image processing library that can efficiently compress images without sacrificing quality.
- **AWS SDK for JavaScript**: A client-side library for interacting with AWS services, including S3, allowing for easy image uploads and retrieval of public URLs.
- **Axios**: A promise-based HTTP client that simplifies making HTTP requests to external APIs or services.
- **UUID**: A library for generating universally unique identifiers (UUIDs), which can be used to assign unique IDs to processing requests and track their progress.

## Installation

1. **Clone the Repository**:
   ```sh
   git clone https://github.com/milanghoghari/image-compression-system.git
   cd image-compression-system
   ```
2. **Install Dependecies**:
   ```sh
   npm i
   ```
3. **Start Application**:
   - for starting the app
   ```sh
   npm start
   ```
   - for testing in dev environment
   ```sh
   npm run dev
   ```
