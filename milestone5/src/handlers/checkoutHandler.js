const checkoutService=require('../services/checkoutService')
const Joi = require('joi');

const cartItemSchema = Joi.object({
    ProductID: Joi.string().required(),
    Quantity: Joi.number().integer().min(1).required()
});

const shippingAddressSchema = Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required()
});

const checkoutSchema = Joi.object({
    UserID: Joi.string().required(),
    shippingAddress: shippingAddressSchema.required(),
    PaymentMethod: Joi.string().required(),
    CartItems: Joi.array().items(cartItemSchema).min(1).required()
});

// Validation function
const validateCheckoutData = (orderData) => {
    const { error, value } = checkoutSchema.validate(orderData, { abortEarly: false });
    if (error) {
        throw {
            statusCode: 400,
            message: error.details.map(detail => detail.message).join(', ')
        };
    }
    return value;
};


module.exports.checkout=async(event)=>{
    try{
        const body=JSON.parse(event.body);
        const validatedData = validateCheckoutData(body);
        const response=await checkoutService.checkout(validatedData);
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
