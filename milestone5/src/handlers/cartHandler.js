const cartService=require('../services/cartService');
module.exports.addToCart=async(event)=>{
    try{
        const body=JSON.parse(event.body);
        
        const response=await cartService.createCart(body);

    
    return{
        statusCode:201,
        body:JSON.stringify({ message: 'cart added successfully', cart: response.newCart })
    }}
    catch(err){
       console.log(err);
        
        return{
            statusCode:Error.statusCode || 500,
            body:JSON.stringify({ message: 'Error adding cart' })
            
    }
}}
module.exports.deleteFromCart=async(event)=>{
    try{
        const body=JSON.parse(event.body);

        const response=await cartService.deleteCart(body);


    return{
        statusCode:201,
        body:JSON.stringify({ message: 'cart deleted successfully' })
    }}
    catch(err){
       console.log(err);

        return{
            statusCode:Error.statusCode || 500,
            body:JSON.stringify({ message: 'Error deleting cart' })

    }
}}