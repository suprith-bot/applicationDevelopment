const userService=require('../services/userService');
const Joi = require('joi');

// Define Joi schemas
const addressSchema = Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required()
});

const updateUserSchema = Joi.object({
    UserId: Joi.string().required(),
    Name: Joi.string().min(2).max(50),
    Email: Joi.string().email(),
    Address: addressSchema
}).min(2);

//to update the user details
module.exports.updateUser=async(event)=>{
    try{
        const body=JSON.parse(event.body);
        const { error, value } = updateUserSchema.validate(body, { abortEarly: false });
        if (error) {
            return {
                statusCode: 400,
                body: error.details.map(detail => detail.message).join(', ')
            };
        }
        const response=await userService.updateUser(value);
        
        return{
            statusCode:204
          
        }
    }
    catch(err){
        return{
            statusCode:err.statusCode || 500,
            body:JSON.stringify({ message: 'Error updating user:'+err.message })
            
    }
    }
}
