const cartService=require('../services/cartService');
const Joi=require('joi')
module.exports.addToCart=async(event)=>{
    try{
        const body=JSON.parse(event.body);

        
        const response=await cartService.createCart(body);

    
    return{
        statusCode:201,
        body:JSON.stringify({ message: 'cart added successfully' })
    }}
    catch(err){
       console.log(err);
        
        return{
            statusCode:err.statusCode || 500,
            body:JSON.stringify({ message: 'Error adding cart:'+err.message  })
            
    }
}}
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