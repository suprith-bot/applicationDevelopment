const userService=require('../services/userService');
//fetch the details of the user
module.exports.getUser=async(event)=>{
    try{const userId=event.pathParameters.userId;
         
        const response=await userService.getUser(userId);
        return{
            statusCode:200,
            body:JSON.stringify(response)
        }
    }
    catch(err){
       
       
        return{
            statusCode:err.statusCode || 500,
            body:JSON.stringify({ message: 'Error getting user:'+err.message })
            
    }
    }
}

