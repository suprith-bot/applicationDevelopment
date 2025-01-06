const dynamoHelper=require('../utils/dynamoHelper');
const {v4:uuidv4}=require('uuid');
const TABLE_NAME = process.env.DYNAMODB_TABLE;   

/* The `module.exports.createUser` function is a JavaScript asynchronous function that creates a new
user in a DynamoDB table.  */
module.exports.createUser=async(value)=>{
    try{
    const userId = `${uuidv4()}`;
   
    const newUser = {
        UserId: userId,
        Name: value.name,
        Email: value.email,
        Password: value.password,
        Address: value.shippingAddress
    };
      console.log(TABLE_NAME);
      await dynamoHelper.putItem(TABLE_NAME, newUser);

    return { userId };
    }
    catch(err){
        throw err;
    }
}
module.exports.getUser=async(userId)=>{
    try{
    const key = { UserId: userId };
    console.log(TABLE_NAME);
    const user=await dynamoHelper.getItem(TABLE_NAME,key);
    if(!user){
        throw { statusCode: 404, message: 'User not found' };
    }
    return user;
    }
    catch(err){
        throw err;
    }
}

/* The `module.exports.updateUser` function in the provided JavaScript code is responsible for updating
a user's information in a DynamoDB table. Here's a breakdown of what it does: */
module.exports.updateUser=async(value)=>{
   
    try{
    const key = { UserId: value.UserId };
    console.log(key);
    const user=await dynamoHelper.getItem(TABLE_NAME, key);
    if(!user){
        throw { statusCode: 404, message: 'User not found' };
    }
    let updateExpression = 'SET ';
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};
    
    // Build update expression dynamically based on provided fields
    if (value.Name) {
        updateExpression += ' #n = :name,';
        expressionAttributeValues[':name'] = value.Name;
        expressionAttributeNames['#n'] = 'Name';
    }
    
    if (value.Email) {
        updateExpression += ' #e = :email,';
        expressionAttributeValues[':email'] = value.Email;
        expressionAttributeNames['#e'] = 'Email';
    }
    
    if (value.Address) {
        updateExpression += ' #a = :address,';
        expressionAttributeValues[':address'] = value.Address;
        expressionAttributeNames['#a'] = 'Address';
    }
    // Remove trailing comma from updateExpression
    updateExpression = updateExpression.trim().replace(/,$/, '');
    console.log(updateExpression);
    console.log(expressionAttributeValues);

    // If no fields to update
    if (Object.keys(expressionAttributeValues).length === 0) {
        throw { statusCode: 400, message: 'No fields to update' };
    }
    const updatedUser = { ...user, ...value };
    await dynamoHelper.updateItem(TABLE_NAME, key, updateExpression,expressionAttributeValues,expressionAttributeNames);
    return updatedUser;
    }
    catch(err){
        throw err;
    }
}
