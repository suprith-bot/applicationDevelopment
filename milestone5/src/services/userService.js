const dynamoHelper=require('../utils/dynamoHelper');
const {v4:uuidv4}=require('uuid');
const validation= require('../utils/validation');
const TABLE_NAME = process.env.DYNAMODB_TABLE;   

module.exports.createUser=async(userData)=>{
    const{name,email,password,shippingAddress}=userData;
 // Validate required fields
 if (!name || !email || !password) {
    throw { statusCode: 400, message: 'Name, Email, and Password are required' };
}

// Validate each field
if (!validation.isValidName(name)) {
    throw { statusCode: 400, message: 'Name must be between 2 and 50 characters' };
}

if (!validation.isValidEmail(email)) {
    throw { statusCode: 400, message: 'Invalid Email format' };
}

if (!validation.isValidPassword(password)) {
    throw { 
        statusCode: 400, 
        message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number' 
    };
}

if (shippingAddress && !validation.isValidAddress(shippingAddress)) {
    throw { 
        statusCode: 400, 
        message: 'Shipping address must include street, city, state, and zipCode' 
    };
}
    
    const userId = `${uuidv4()}`;
   
    const newUser = {
        UserId: userId,
        Name: name,
        Email: email,
        Password: password,
        Address: shippingAddress
        
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

module.exports.updateUser=async(userData)=>{
    const {UserId,Name,Email,Address} = userData;
    
    const key = { UserId: UserId };
    console.log(key);
    const user=await dynamoHelper.getItem(TABLE_NAME, key);
    if(!user){
        throw { statusCode: 404, message: 'User not found' };
    }
    let updateExpression = 'SET ';
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};
    
    // Build update expression dynamically based on provided fields
    if (userData.Name) {
        updateExpression += ' #n = :name,';
        expressionAttributeValues[':name'] = userData.Name;
        expressionAttributeNames['#n'] = 'Name';
    }
    
    if (userData.Email) {
        if (!validation.isValidEmail(userData.Email)) {
            throw { statusCode: 400, message: 'Invalid Email' };
        }
        updateExpression += ' #e = :email,';
        expressionAttributeValues[':email'] = userData.Email;
        expressionAttributeNames['#e'] = 'Email';
    }
    
    if (userData.Address) {
        updateExpression += ' #a = :address,';
        expressionAttributeValues[':address'] = userData.Address;
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
    const updatedUser = { ...user, ...userData };
    await dynamoHelper.updateItem(TABLE_NAME, key, updateExpression,expressionAttributeValues,expressionAttributeNames);
    return updatedUser;

}