const puppeteer = require("puppeteer");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const node=require("@aws-sdk/node-http-handler");

const client = new S3Client({
  region: 'us-east-1',
  requestHandler: new (node.NodeHttpHandler)({
    connectionTimeout: 300000, // Connection timeout in ms (5 minutes)
    socketTimeout: 300000, // Socket timeout in ms (5 minutes)
  }),
});




async function generatePDF(htmlContent, fileName) {
  let browser;
  try {
    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Create a new page
    const page = await browser.newPage();

    // Set HTML content
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    // Generate PDF as buffer
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    console.log("PDF generated successfully");

    // Upload to S3
    const s3Params = {
      Bucket: 'pdf-bucket-299',
      Key: `pdfs/${fileName}`,
      Body: pdfBuffer,
      ContentType: 'application/pdf'
    };

    const command = new PutObjectCommand(s3Params);
    await client.send(command);

    console.log(`PDF uploaded successfully to S3: ${s3Params.Key}`);

    return {
      success: true,
      s3Key: s3Params.Key,
      bucket: 'pdf-bucket-299'
    };

  } catch (error) {
    console.error("Error generating or uploading PDF:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Example HTML content
const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Sample PDF</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
    }
    h1 {
      color: #333;
    }
    p {
      line-height: 1.5;
    }
    img {
      max-width: 100%;
    }
  </style>
</head>
<body>
  <h1>Welcome to PDF Generation</h1>
  <p>This is a sample PDF generated from HTML content using Puppeteer.</p>
  <img src="https://gratisography.com/wp-content/uploads/2024/10/gratisography-birthday-dog-sunglasses-1036x780.jpg" alt="Sample Image">
</body>
</html>
`;


generatePDF(htmlContent,'test.pdf');
