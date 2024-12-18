const { S3Client,GetObjectCommand, PutObjectCommand }= require("@aws-sdk/client-s3");
const { getSignedUrl }= require("@aws-sdk/s3-request-presigner");
const multipart = require('parse-multipart');

const REGION = process.env.AWS_REGION;


// Configure S3 Client
const s3Client = new S3Client({ region: REGION });


// Generate Pre-signed URL for upload/download
module.exports.generatePresignedUrlHandler = async (event) => {
  try {
    const { key, expiresIn } = JSON.parse(event.body);

    const bucketName = process.env.S3_BUCKET;
    const expiration = parseInt(expiresIn) || 3600; // Default to 1 hour if not provided

    let command;

    // Configure the S3 command based on operation

      command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      });

    // Generate pre-signed URL
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: expiration });

    return {
      statusCode: 200,
      body: JSON.stringify({
        url: presignedUrl,
        expiresIn: expiration
      }),
    };
  } catch (error) {
    console.error("Error generating pre-signed URL:", error);
   
  }
};



const isValidFile = (fileType, fileSize) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  return allowedTypes.includes(fileType) && fileSize <= maxSize;
};




exports.upload = async (event) => {
  console.log("Headers:", JSON.stringify(event.headers, null, 2));

  try {
    // Ensure the content-type header exists
    const contentType = event.headers['Content-Type'] || event.headers['content-type'];
    if (!contentType) {
      throw new Error('Content-Type header is missing');
    }

    // Extract boundary and parse multipart data
    const boundary = multipart.getBoundary(contentType);
    const parts = multipart.Parse(Buffer.from(event.body, event.isBase64Encoded ? 'base64' : 'utf8'), boundary);

    if (!parts || parts.length === 0) {
      throw new Error('No files found in the request');
    }

    const file = parts[0];

    // Validate the file type and size
    if (!isValidFile(file.type, file.data.length)) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          message: 'Invalid file. Only PDF and images under 5MB are allowed.'
        })
      };
    }

    // Generate a unique file name
    const uniqueFileName = `${Date.now()}-${file.filename}`;

    // Upload the file to S3
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: uniqueFileName,
      Body: file.data,
      ContentType: file.type
    });

    await s3Client.send(command);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'File uploaded successfully',
        fileName: uniqueFileName
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Error uploading file',
        error: error.message
      })
    };
  }
};
// curl -X POST 'https://z7gw7deajg.execute-api.us-east-1.amazonaws.com/dev/upload'   -H "Content-Type: multipart/form-data"  --form 'file=@"/C:/Users/ASUS/Do
// wnloads/assignment2 (12).pdf"'


