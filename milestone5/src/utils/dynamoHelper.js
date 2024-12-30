const { DynamoDBClient, PutItemCommand,GetItemCommand,UpdateItemCommand,DeleteItemCommand,QueryCommand} = require("@aws-sdk/client-dynamodb");
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
module.exports.queryItems=async(tableName, expressionAttributeValues)=>{
    const params={
        TableName:tableName,
        IndexName:'UserIDIndex',
        KeyConditionExpression:"UserId = :userID",
        ExpressionAttributeValues:marshall(expressionAttributeValues),
    }
    console.log(params);
    try{
        const {Items}=await client.send(new QueryCommand(params));
       if(Items.length===0){
        return null
       }
        return Items?Items.map(item=>unmarshall(item)):null;
    }
    catch(err){
        throw { statusCode: 500, message: 'Failed to query data from DynamoDB' };
    }
}