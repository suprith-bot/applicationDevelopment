const cartService=require('../services/cartService');
const Joi=require('joi')

/* This code snippet is defining an asynchronous function `deleteFromCart` that is intended to handle a
request to delete an item from a user's cart. Here's a breakdown of what the function does: */
module.exports.deleteFromCart=async(event)=>{
    try{
        const userId=await event.pathParameters.userId;
        const productId=await event.pathParameters.productId;

    await cartService.deleteCart(userId,productId);


    return{
        statusCode:204,
        body:JSON.stringify({ message: 'cart deleted successfully' })
    }}
    catch(err){
       console.log(err);

        return{
            statusCode:err.statusCode || 500,
            body:JSON.stringify({ message: 'Error deleting cart:'+err.message  })

    }
}}