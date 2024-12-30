const userService=require('../services/userService');

module.exports.createUser=async(event)=>{
    try{
        const body=JSON.parse(event.body);
        
        const response=await userService.createUser(body);

    
    return{
        statusCode:201,
        body:JSON.stringify({ message: 'User created successfully', userId: response.userId })
    }}
    catch(err){
       console.log(err);
       return{
        statusCode:err.statusCode || 500,
        body:JSON.stringify({ message: 'Error creating user:'+err.message })
        
}
     
}}
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
module.exports.updateUser=async(event)=>{
    try{
        
      
        const body=JSON.parse(event.body);
        const response=await userService.updateUser(body);
        
        return{
            statusCode:204,
            body:JSON.stringify(response)
        }
    }
    catch(err){
        return{
            statusCode:err.statusCode || 500,
            body:JSON.stringify({ message: 'Error updating user:'+err.message })
            
    }
    }
}
