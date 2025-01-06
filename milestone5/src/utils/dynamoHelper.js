const { DynamoDBClient, PutItemCommand,GetItemCommand,UpdateItemCommand,DeleteItemCommand,QueryCommand,BatchGetItemCommand} = require("@aws-sdk/client-dynamodb");
const { marshall,unmarshall } = require("@aws-sdk/util-dynamodb");





const client = new DynamoDBClient({});
module.exports.putItem=async(tableName,item)=>{
    
    const params={
        TableName:tableName,
        Item:marshall(item),
    }
    try{
        await client.send(new PutItemCommand(params));
    }
    catch(err){
        throw { statusCode: 500, message: 'Failed to save data to DynamoDB' };
    }
}
module.exports.getItem=async(tableName, key)=>{
    console.log(key);
    const params={
        TableName:tableName,
        Key:marshall(key,{ removeUndefinedValues: true }),
    }
    try{
        const {Item}=await client.send(new GetItemCommand(params));
        return Item?unmarshall(Item): null;
    }
    catch(err){
        console.log(err);
        throw { statusCode: 500, message: 'Failed to fetch data from DynamoDB' };
    }
}

module.exports.updateItem=async(tableName, key, updateExpression, expressionAttributeValues,expressionAttributeNames)=>{
    const params={
        TableName:tableName,
        Key:marshall(key,{removeUndefinedValues: true}),
        UpdateExpression:updateExpression,
        ExpressionAttributeValues:marshall(expressionAttributeValues),
        ExpressionAttributeNames:expressionAttributeNames,
        ReturnValues:'UPDATED_NEW'
    }
    console.log('DynamoDB UpdateItem Params:', JSON.stringify(params, null, 2));
    try{
        const {Attributes}=await client.send(new UpdateItemCommand(params));
        return Attributes?unmarshall(Attributes):null;
    }
    catch(err){
        throw { statusCode: 500, message: 'Failed to update data in DynamoDB' };
    }
}
module.exports.deleteItem=async(tableName, key)=>{
    const params={
        TableName:tableName,
        Key:marshall(key, {removeUndefinedValues: true}),
    }
    try{
        await client.send(new DeleteItemCommand(params));
    }
    catch(err){
        throw { statusCode: 500, message: 'Failed to delete data from DynamoDB' };
    }
}
module.exports.query = async (params) => {
    const Aparams = {
        TableName: params.TableName,
        KeyConditionExpression: params.KeyConditionExpression,
        ExpressionAttributeValues: marshall(params.ExpressionAttributeValues, { removeUndefinedValues: true }),
        // ExpressionAttributeNames: expressionAttributeNames
    };
    
    try {
        const { Items } = await client.send(new QueryCommand(Aparams));
        return Items ? Items.map(item => unmarshall(item)) : [];
    } catch (err) {
        console.error('Error in query:', err);
        throw { statusCode: 500, message: 'Failed to query data from DynamoDB' };
    }
};

module.exports.batchGetItem = async (params) => {
    // Convert the Keys in the RequestItems to marshalled format
    const marshalledParams = {
        RequestItems: {}
    };

    for (const tableName in params.RequestItems) {
        marshalledParams.RequestItems[tableName] = {
            Keys: params.RequestItems[tableName].Keys.map(key => marshall(key))
        };
    }

    try {
        const { Responses } = await client.send(new BatchGetItemCommand(marshalledParams));
        
        // Unmarshall the responses
        const unmarshalledResponses = {};
        for (const tableName in Responses) {
            unmarshalledResponses[tableName] = Responses[tableName].map(item => unmarshall(item));
        }
        
        return { Responses: unmarshalledResponses };
    } catch (err) {
        console.error('Error in batchGetItem:', err);
        throw { statusCode: 500, message: 'Failed to batch get items from DynamoDB' };
    }
};
