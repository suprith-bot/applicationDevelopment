const dynamoHelper=require('../utils/dynamoHelper');
const TABLE_NAME=process.env.ORDER_TABLE; 
const {v4:uuidv4}=require('uuid');

module.exports.checkout=async(orderData)=>{
    const { UserID, ShippingAddress, PaymentMethod, CartItems }=orderData;
    if(!UserID || !ShippingAddress || !PaymentMethod || !CartItems){
        throw { statusCode: 400, message: 'UserID, ShippingAddress, PaymentMethod and CartItems are required' };
    }
    let totalAmount=0;
    for(const item of CartItems){
        const key={ProductID:item.ProductID};
        const product=await dynamoHelper.getItem('ProductsTable-dev',key);
        if(!product){
            throw { statusCode: 404, message: 'Product not found' };
        }
        totalAmount+=product.Price*item.Quantity;
    }
    const orderId = `${uuidv4()}`;
    const order={
        OrderId: orderId,
        UserId: UserID,
        ShippingAddress: ShippingAddress,
        PaymentMethod: PaymentMethod,
        CartItems: CartItems,
        OrderStatus: 'Pending',
        TotalAmount:totalAmount,
        CreatedAt: new Date().toISOString()
    }
    await dynamoHelper.putItem(TABLE_NAME, order);
    return { orderId };
    
}

module.exports.orderTrack=async(orderId)=>{
    const key={
        OrderId:orderId};
    const order=await dynamoHelper.getItem(TABLE_NAME,key);
    if(!order){
        throw { statusCode: 404, message: 'Order not found' };
    }
    return order;

}

module.exports.orderHistory=async(userId)=>{

    
    const key={":userID":userId};
    const order=await dynamoHelper.queryItems(TABLE_NAME, key);
 
    if(!order){
        throw { statusCode: 404, message: 'Order not found' };
    }
    return order;

}