const checkoutService=require('../services/checkoutService')
const Joi = require('joi');

/* The `cartItemSchema` constant is defining a schema using Joi for validating the structure of a cart
item object. It specifies that a cart item object should have two properties: */
const cartItemSchema = Joi.object({
    ProductID: Joi.string().required(),
    Quantity: Joi.number().integer().min(1).required()
});

/* The `shippingAddressSchema` constant is defining a schema using Joi for validating the structure of
a shipping address object. It specifies that a shipping address object should have four properties:
`street`, `city`, `state`, and `zipCode`, all of which are required fields. This schema ensures that
any shipping address data provided follows this specific structure and contains the necessary
information for processing a checkout order accurately. */
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
/**
 * The function `validateCheckoutData` validates order data using a schema and throws a 400 error with
 * detailed messages if validation fails.
 * @param orderData - Order data is the information provided by a customer during the checkout process,
 * such as items in the cart, shipping address, payment details, etc.
 * @returns The function `validateCheckoutData` returns the validated `orderData` if it passes the
 * validation against the `checkoutSchema`. If there are validation errors, it throws an error object
 * with a status code of 400 and a message containing the details of the validation errors joined
 * together.
 */
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


/* This code snippet defines a function named `checkout` that is exported as part of the module. Here's
a breakdown of what the function does: */
module.exports.checkout=async(event)=>{
    try{
        const body=JSON.parse(event.body);
        const validatedData = validateCheckoutData(body);
        const response=await checkoutService.checkout(validatedData);
        return{
            statusCode:201,
            body:JSON.stringify({ message: 'checkout successful',orderId:response })
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


