const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { parse } = require('json2csv');

// Initialize AWS clients
const dynamoClient = new DynamoDBClient({ region: 'us-east-1' });
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const s3Client = new S3Client({ region: 'us-east-1' });

async function scanDynamoTable(tableName) {
    let allItems = [];
   

    try {
    
            const params = {
                TableName: tableName,
    
            };

            const command = new ScanCommand(params);
            const response = await docClient.send(command);

            allItems = allItems.concat(response.Items);
          

            console.log(`Scanned ${allItems.length} items...`);

   
            
        return allItems;
        

    } catch (error) {
        console.error("Error scanning DynamoDB:", error);
        throw error;
    }
}

async function exportToS3(data, bucketName, fileName) {
    try {
        const csv = parse(data);
        
        const uploadParams = {
            Bucket: bucketName,
            Key: fileName,
            Body: csv,
            ContentType: 'text/csv'
        };

        await s3Client.send(new PutObjectCommand(uploadParams));
        console.log(`Successfully uploaded to S3: ${fileName}`);
        
        return `s3://${bucketName}/${fileName}`;
    } catch (error) {
        console.error("Error uploading to S3:", error);
        throw error;
    }
}

async function exportDynamoDBToCSV(tableName, bucketName) {
    try {
        // Scan DynamoDB
        console.log(`Starting export from table: ${tableName}`);
        const items = await scanDynamoTable(tableName);

        if (items.length === 0) {
            console.log("No data found in table");
            return;
        }

        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `export-${tableName}-${timestamp}.csv`;

        // Upload to S3
        const s3Location = await exportToS3(items, bucketName, fileName);
        
        console.log("Export completed successfully");
        console.log("Total records:", items.length);
        console.log("S3 Location:", s3Location);

        return {
            recordCount: items.length,
            s3Location: s3Location
        };

    } catch (error) {
        console.error("Export failed:", error);
        throw error;
    }
}

// Usage
const tableName = "demo";  // Replace with your table name
const bucketName = "pdf-bucket-299-unique-name";  // Replace with your bucket name

exportDynamoDBToCSV(tableName, bucketName)
    .then(result => console.log("Export Result:", result))
    .catch(error => console.error("Error:", error));
