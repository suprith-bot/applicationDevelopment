const checkoutService=require('../services/checkoutService')
module.exports.checkout=async(event)=>{
    try{
        const body=JSON.parse(event.body);
        const response=await checkoutService.checkout(body);
        return{
            statusCode:201,
            body:JSON.stringify({ message: 'checkout successful',orderId:response.orderId })
        }
    }
    catch(err){
        console.log(err);
        return{
            statusCode:err.statusCode || 500,
            body:JSON.stringify({ message: 'Error checking out:'+err.message  })
        }
  
    }
}
module.exports.orderTrack=async(event)=>{
    try{
        const orderId=event.pathParameters.orderId;
        const response=await checkoutService.orderTrack(orderId);
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
