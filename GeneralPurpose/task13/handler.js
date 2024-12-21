// handler.js
const AWS = require('aws-sdk');
const csv = require('csv-parser');
const { Readable } = require('stream');

const s3 = new AWS.S3();
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.processCSV = async (event) => {
  try {
    console.log('Processing S3 event:', JSON.stringify(event, null, 2));

    const bucket = event.Records[0].s3.bucket.name;
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

    // Get file from S3
    const s3Object = await s3.getObject({ Bucket: bucket, Key: key }).promise();
    
    // Parse CSV
    const records = await parseCSV(s3Object.Body);
    
    // Validate records
    validateRecords(records);

    // Process records in batches
    const batchSize = 25;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await writeToDynamoDB(batch);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'CSV processed successfully',
        recordsProcessed: records.length
      })
    };

  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

const parseCSV = (fileContent) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    Readable.from(fileContent)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

const validateRecords = (records) => {
  // Check if records array is empty
  if (!records || records.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Check if userId exists in the first record
  if (!records[0].hasOwnProperty('id')) {
    throw new Error('CSV must contain userId column');
  }

  // Validate each record has userId
  records.forEach((record, index) => {
    if (!record.id) {
      throw new Error(`Missing userId in record at row ${index + 1}`);
    }
  });
};

const writeToDynamoDB = async (records) => {
  const batchWriteParams = {
    RequestItems: {
      'DemoTable2': records.map(record => ({
        PutRequest: {
          Item: {
            ...record,  // This includes userId from CSV
           
          }
        }
      }))
    }
  };

  try {
    await dynamoDB.batchWrite(batchWriteParams).promise();
    console.log(`Successfully wrote ${records.length} records to DynamoDB`);
  } catch (error) {
    console.error('Error writing to DynamoDB:', error);
    throw error;
  }
};

