const cartService=require('../services/cartService');
const Joi=require('joi')
/* This code snippet is defining a function called `addToCart` as part of the module exports. The
function is marked as `async`, meaning it will operate asynchronously. It takes an `event` parameter
and attempts to parse the JSON body from the event. */
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