const userService=require('../services/userService');
const Joi = require('joi');

// Define Joi schemas
const addressSchema = Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required()
});

const createUserSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
        .min(8)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/)
        .required()
        .messages({
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        }),
    shippingAddress: addressSchema.required()
});
//to create user from fetching details like name ,email,address
module.exports.createUser=async(event)=>{
    try{
        
        const body=JSON.parse(event.body);
        console.log(body);
        const { error, value } = createUserSchema.validate(body, { abortEarly: false });
        console.log(value);
        if (error) {
            return { 
                statusCode: 400, 
                body: error.details.map(detail => detail.message).join(', ')
            };
        }
        console.log("testing.. function")
        
        const response=await userService.createUser(value);

    
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
