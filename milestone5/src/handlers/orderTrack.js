const checkoutService=require('../services/checkoutService')
//to track the status of the particular order
module.exports.orderTrack=async(event)=>{
    try{
        const orderId=event.pathParameters.orderId;
        const userId=event.queryStringParameters.userId;
        const response=await checkoutService.orderTrack(userId,orderId);
        return{
            statusCode:200,
            body:JSON.stringify({ message: 'order tracked successfully', order: response })
        }
    }
    catch(err){
        console.log(err);
        return{
            statusCode:err.statusCode || 500,
            body:JSON.stringify({ message: 'Error tracking order:'+err.message  })
        }
    }
}