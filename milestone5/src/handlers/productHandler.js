const { Client } = require('@opensearch-project/opensearch');
const AWS = require('aws-sdk');
const username =process.env.USERNAME_SSM
const password =process.env.PASSWORD_SSM

// Create OpenSearch client
const client = new Client({ node: `https://${process.env.OPENSEARCH_ENDPOINT}`,
  auth: { username, password }});



//to search the products 

module.exports.searchProducts = async (event) => {

  const { Keywords, Category, Subcategory, MinPrice, MaxPrice } = event.queryStringParameters || {};

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
        fields: ['name^3', 'keywords', 'tags'],
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

  try {
    console.log(searchQuery)
    const result = await client.search({
      index: 'products',
      body: { query: searchQuery },
    });

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
};

