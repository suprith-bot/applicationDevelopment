const AWS = require('aws-sdk');
const { Client } = require('@opensearch-project/opensearch');
const ssm = new AWS.SSM();

function getSSMParameter(name) {
    const response =ssm.getParameter({
      Name: name,
      WithDecryption: true,
    }).promise();
    return response.Parameter.Value;
  }
  const username = getSSMParameter('username');
  const password = getSSMParameter('password');
    // Create OpenSearch client
  const client = new Client({ node: `https://${process.env.OPENSEARCH_ENDPOINT}`,
      auth: { username, password }});  
module.exports.searchProducts=async(validatedParams)=>{
  
 /* This code snippet is constructing a search query based on the parameters provided in
 `validatedParams`. */
    const { Keywords, Category, Subcategory, MinPrice, MaxPrice } = validatedParams;
    const searchQuery = {
        bool: {
          must: [],
          filter: [],
        },
      };
    
      if (Keywords) {
        searchQuery.bool.must.push({
          multi_match: {
            query: Keywords,
            fields: ['name^3', 'description', 'tags'],
          },
        });
      }
    
      if (Category) {
        searchQuery.bool.filter.push({ term: { category: Category } });
      }
    
      if (Subcategory) {
        searchQuery.bool.filter.push({ term: { subcategory: Subcategory } });
      }
    
      if (MinPrice || MaxPrice) {
        const range = {};
        if (MinPrice) range.gte = parseFloat(MinPrice);
        if (MaxPrice) range.lte = parseFloat(MaxPrice);
        searchQuery.bool.filter.push({ range: { price: range } });
      }
    
    /* This code snippet is using the OpenSearch client to perform a search operation on an index named
    'products'. It constructs a search query based on the parameters provided in `validatedParams`
    and then logs the constructed search query to the console. The search query is then passed to
    the `client.search` method to execute the search operation. The result of the search operation
    is stored in the `result` variable using `await` to wait for the operation to complete. */
      try {
        console.log(searchQuery)
        const result = await client.search({
          index: 'products',
          body: { query: searchQuery },
        });
    
      /* This code snippet is constructing a response object that will be returned from the
      `searchProducts` function.  */
        return {
          statusCode: 200,
          body: JSON.stringify(result.body.hits.hits.map((hit) => hit._source)),
        };
      } catch (error) {
        console.error(`Error searching products: ${error.message}`);
        return {
          statusCode: 500,
          body: JSON.stringify({ message: 'Failed to search products' }),
        };
        
      }
}