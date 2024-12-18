const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const node=require("@aws-sdk/node-http-handler");
const fs= require("fs");
const path =require("path");

const REGION = "us-east-1"; // Replace with your AWS region
const BUCKET_NAME = "my-upload-bucket-hvxyewhdfcgthd";

const s3Client = new S3Client({
  region: REGION,
  requestHandler: new (node.NodeHttpHandler)({
    connectionTimeout: 300000, // Connection timeout in ms (5 minutes)
    socketTimeout: 300000, // Socket timeout in ms (5 minutes)
  }),
});

const uploadFileToS3 = async (filePath, bucketName, key) => {
  try {
    const fileStream = fs.createReadStream(filePath);
    const uploadParams = {
      Bucket: bucketName,
      Key: key,
      Body: fileStream,
      ContentType: "application/pdf",
    };

    console.log(`Uploading file ${key} to bucket ${bucketName}...`);
    const data = await s3Client.send(new PutObjectCommand(uploadParams));
    console.log("File uploaded successfully:", data);
  } catch (error) {
    console.error("Error uploading file:", error);
  }
};
// Usage
const filePath = "C:\\Users\\ASUS\\Downloads\\assignment1 (16).pdf"; // Local file path
const fileKey = path.basename(filePath); // File name in S3

uploadFileToS3(filePath, BUCKET_NAME, fileKey);
