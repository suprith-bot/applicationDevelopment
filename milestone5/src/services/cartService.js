const dynamoHelper=require('../utils/dynamoHelper');
const TABLE_NAME = process.env.CART_TABLE;  



module.exports.createCart=async(cartData)=>{
    try{
    const{userId,productId,quantity}=cartData;
    if(!userId || !productId || !quantity){
        throw { statusCode: 400, message: 'UserId, ProductId and Quantity are required' };
    }
  
/* The code snippet `const newCart = { UserId: userId, ProductId: productId, Quantity: quantity };` is
creating a new object named `newCart` with three properties: `UserId`, `ProductId`, and `Quantity`.
These properties are being assigned values from the `cartData` object that is passed into the
`createCart` function. This object is then used to represent a new item in a shopping cart before it
is stored in a DynamoDB table. */
    const newCart = {
        UserId: userId,
        ProductId: productId,
        Quantity: quantity
      };
      console.log(TABLE_NAME);
      await dynamoHelper.putItem(TABLE_NAME, newCart);

    return { newCart };
    }catch(error){
        throw error;
    }

}
module.exports.deleteCart=async(userId,productId)=>{
    try{
   
    if(!userId || !productId){
        throw { statusCode: 400, message: 'UserId and ProductId are required' };
    }
    /* The code snippet you provided is for the `deleteCart` function in your JavaScript code. Here's
    what it does:
    it checks whether the data is there in cart ,then the delete item is called */
    const key = { UserId: userId,ProductId:productId };
    console.log(TABLE_NAME);
    const cart=await dynamoHelper.getItem(TABLE_NAME,key);
    if(!cart){
        throw { statusCode: 404, message: 'Cart not found' };
    }
    await dynamoHelper.deleteItem(TABLE_NAME,key);
    return;
    }
    catch(error){
        throw error;
    }
}
