const dynamoHelper = require('../utils/dynamoHelper');
const TABLE_NAME = process.env.ORDER_TABLE;
const { v4: uuidv4 } = require('uuid');

module.exports.checkout = async (validatedData) => {
    try {
        const { UserID, shippingAddress, PaymentMethod, CartItems } = validatedData;
        
        // Calculate total amount using BatchGetItem
        let totalAmount = 0;
        const keys = CartItems.map(item => ({
            ProductID: item.ProductID
        }));

        const batchGetParams = {
            RequestItems: {
                'ProductsTable-dev': {
                    Keys: keys
                }
            }
        };

        const batchResults = await dynamoHelper.batchGetItem(batchGetParams);
        const products = batchResults.Responses['ProductsTable-dev'];
      /*  the `Map` constructor. It is mapping each product object from the `products` array to a key-value pair in the `productMap`,
      where the key is the `ProductID` of the product and the value is the product object itself. */
        const productMap = new Map(
            products.map(product => [product.ProductID, product])
        );

    /* This part of the code is iterating over each item in the `CartItems` array. For each item, it
    retrieves the corresponding product from the `productMap` using the `ProductID` as the key. If
    the product is not found in the `productMap`, it throws an error indicating that the product was
    not found. */
        for (const item of CartItems) {
            const product = productMap.get(item.ProductID);
            if (!product) {
                throw { statusCode: 404, message: `Product not found: ${item.ProductID}` };
            }
            totalAmount += product.Price * item.Quantity;
        }

        // Generate order ID
        const orderNo = uuidv4();

        // Create order with new structure
        const order = {
            PK: 'ORDER',
            SK: `USER#${UserID}#ORDER#${orderNo}`,
            UserId: UserID,
            OrderNo: orderNo,
            ShippingAddress: shippingAddress,
            PaymentMethod: PaymentMethod,
            CartItems: CartItems,
            OrderStatus: 'Pending',
            TotalAmount: totalAmount,
            CreatedAt: new Date().toISOString()
        };

        await dynamoHelper.putItem(TABLE_NAME, order);
        return { orderNo };
    } catch (error) {
        throw error;
    }
};

module.exports.orderTrack = async (userId, orderNo) => {
//this method is used to fetch the order no. of particular user
    try {
        const key = {
            PK: 'ORDER',
            SK: `USER#${userId}#ORDER#${orderNo}`
        };

        const order = await dynamoHelper.getItem(TABLE_NAME, key);
        if (!order) {
            throw { statusCode: 404, message: 'Order not found' };
        }
        return order;
    } catch (err) {
        throw err;
    }
};

module.exports.orderHistory = async (userId) => {
    try {
      /* This code snippet is defining a parameter object `params` that will be used to query the
      DynamoDB table. Here's what each key in the `params` object is doing:
      the partition key is 'ORDER' and the sk is used  with begins_with  that will help to fetch the data based 
      on pattern  */
        const params = {
            TableName: TABLE_NAME,
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
            ExpressionAttributeValues: {
                ':pk': 'ORDER',
                ':sk': `USER#${userId}#ORDER#`
            }
        };

        const orders = await dynamoHelper.query(params);
        if (!orders) {
            throw { statusCode: 404, message: 'No orders found' };
        }
        return orders;
    } catch (err) {
        throw err;
    }
};
