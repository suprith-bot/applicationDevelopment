const dynamoHelper=require('../utils/dynamoHelper');
const TABLE_NAME = process.env.CART_TABLE;  



module.exports.createCart=async(cartData)=>{
    const{userId,productId,quantity}=cartData;
    if(!userId || !productId || !quantity){
        throw { statusCode: 400, message: 'UserId, ProductId and Quantity are required' };
    }
  
    const newCart = {
        UserId: userId,
        ProductId: productId,
        Quantity: quantity
      };
      console.log(TABLE_NAME);
      await dynamoHelper.putItem(TABLE_NAME, newCart);

    return { newCart };

}
module.exports.deleteCart=async(userId,productId)=>{
   
    if(!userId || !productId){
        throw { statusCode: 400, message: 'UserId and ProductId are required' };
    }
    const key = { UserId: userId,ProductId:productId };
    console.log(TABLE_NAME);
    const cart=await dynamoHelper.getItem(TABLE_NAME,key);
    if(!cart){
        throw { statusCode: 404, message: 'Cart not found' };
    }
    await dynamoHelper.deleteItem(TABLE_NAME,key);
    return;

}
