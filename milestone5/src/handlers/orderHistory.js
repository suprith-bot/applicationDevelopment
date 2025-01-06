const checkoutService=require('../services/checkoutService')
//fetch all the order history of a user
module.exports.orderHistory=async(event)=>{

    try{
        const body=event.queryStringParameters.userId;
    
        const response=await checkoutService.orderHistory(body);
       
        return{
            statusCode:200,
            body:JSON.stringify({ message: 'order history fetched successfully', order: response })
        }
    }
    catch(err){
        console.log(err);
        return{
            statusCode:err.statusCode || 500,
            body:JSON.stringify({ message: 'Error fetching order history:'+err.message  })
        }
    }
}
