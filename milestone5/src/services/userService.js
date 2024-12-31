const dynamoHelper=require('../utils/dynamoHelper');
const {v4:uuidv4}=require('uuid');
const TABLE_NAME = process.env.DYNAMODB_TABLE;   

module.exports.createUser=async(value)=>{
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
module.exports.getUser=async(userId)=>{
    const key = { UserId: userId };
    console.log(TABLE_NAME);
    const user=await dynamoHelper.getItem(TABLE_NAME,key);
    if(!user){
        throw { statusCode: 404, message: 'User not found' };
    }
    return user;

}

module.exports.updateUser=async(value)=>{
   
    
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
