const { Client } = require('@opensearch-project/opensearch');
const AWS = require('aws-sdk');
const dynamodb = AWS.DynamoDB.Converter;


const ssm = new AWS.SSM();

async function getSSMParameter(name) {
  const response = await ssm.getParameter({
    Name: name,
    WithDecryption: true,
  }).promise();
  return response.Parameter.Value;
}



const ensureIndex = async () => {
  try {
    const indexExists = await client.indices.exists({ index: 'products' });
    
    if (!indexExists.body) {
      await client.indices.create({
        index: 'products',
        body: {
          mappings: {
            properties: {
      id: {
        type: "keyword"
      },
      name: {
        type: "text",
        analyzer: "standard"
      },
      category: {
        type: "keyword"
      },
      subcategory: {
        type: "keyword"
      },
      keywords: {
        type: "text",
        analyzer: "standard"
      },
      price: {
        type: "float"
      }
    }
          }
        }
      });
      console.log('Index created successfully');
    }
  } catch (error) {
    console.error('Error checking/creating index:', error.message, error.meta?.body);
    throw error;
  }
};

module.exports.syncDynamoToOpenSearch = async (event) => {
  const username =await getSSMParameter('username');
const password =await getSSMParameter('password');

// Create OpenSearch client
const client = new Client({ node: `https://${process.env.OPENSEARCH_ENDPOINT}`,
  auth: { username, password }});

   
  for (const record of event.Records) {
    const { eventName, dynamodb: dbRecord } = record;
console.log('dbRecord', dbRecord);
    // Convert DynamoDB record to JSON
    const newData = dbRecord.NewImage ? dynamodb.unmarshall(dbRecord.NewImage) : null;
    const oldData = dbRecord.OldImage ? dynamodb.unmarshall(dbRecord.OldImage) : null;
    console.log('newData', newData);
    console.log('oldData', oldData);
    try {
      if ((eventName === 'INSERT' || eventName === 'MODIFY') && newData) {
        const document = {
          id: newData.ProductID,
          name: newData.Name,
          category: newData.Category,
          subcategory: newData.Subcategory,
          keywords: Array.from(newData.Keywords.values),
          price: parseFloat(newData.Price),
        };
        console.log('Document to index:', document);

        // Add/Update document in OpenSearch
        const response = await client.index({
          index: 'products',
          id: document.id,
          body: document,
        });
        console.log('OpenSearch Response:', response);
      } else if (eventName === 'REMOVE' && oldData) {
        console.log(`Deleting document with ID: ${oldData.ProductID}`);

        // Delete document from OpenSearch
        const response = await client.delete({
          index: 'products',
          id: oldData.ProductID,
        });
        console.log('OpenSearch Response:', response);
      }
    } catch (error) {
      console.error(`Error syncing data to OpenSearch:`,{
        message: error.message,
        body: error.meta?.body,
        statusCode: error.meta?.statusCode,
        headers: error.meta?.headers,
        stack: error.stack,
        fullError: JSON.stringify(error, null, 2)
      });
    }
  }
};

