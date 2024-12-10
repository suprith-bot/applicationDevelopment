const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
   
module.exports.searchProducts=async(query)=>{try{
    const {
        Keywords,
        Category,
        Subcategory,
        MinPrice,
        MaxPrice
    } =query;
    if (!Keywords) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Keywords are required." })
        };
    }

    // Construct the query
    let params = {
        TableName: process.env.PRODUCTS_TABLE,
        FilterExpression: "contains(#name, :keywords)",
        ExpressionAttributeNames: {
            "#name": "Name",
        },
        ExpressionAttributeValues: {
            ":keywords": Keywords,
        }
    };

    // Add optional filters
    if (Category) {
        params.FilterExpression += " AND #category = :category";
        params.ExpressionAttributeNames["#category"] = "Category";
        params.ExpressionAttributeValues[":category"] = Category;
    }

    if (Subcategory) {
        params.FilterExpression += " AND #subcategory = :subcategory";
        params.ExpressionAttributeNames["#subcategory"] = "Subcategory";
        params.ExpressionAttributeValues[":subcategory"] = Subcategory;
    }

    if (MinPrice) {
        params.FilterExpression += " AND Price >= :minPrice";
        params.ExpressionAttributeValues[":minPrice"] = parseFloat(MinPrice);
    }

    if (MaxPrice) {
        params.FilterExpression += " AND Price <= :maxPrice";
        params.ExpressionAttributeValues[":maxPrice"] = parseFloat(MaxPrice);
    }
console.log(params);
    const result = await dynamoDb.query(params).promise();

        // Optional: Filter on Keywords in application logic (DynamoDB can't do full-text search)
        const filteredItems = Keywords
            ? result.Items.filter((item) =>
                  item.Name.toLowerCase().includes(Keywords.toLowerCase())
              )
            : result.Items;

        return {
            statusCode: 200,
            body: JSON.stringify({ products: filteredItems })
        };
    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "An error occurred." })
        };
    }

}