const { ApiGatewayManagementApiClient, PostToConnectionCommand } = require('@aws-sdk/client-apigatewaymanagementapi');
const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const client = new ApiGatewayManagementApiClient({
  endpoint: `https://t7wv8iz0pk.execute-api.us-east-1.amazonaws.com/dev/`
});




// Helper function to send message to a connection
const sendMessageToConnection = async (connectionId, message) => {
  try {
    input={
      ConnectionId: connectionId,
      Data: JSON.stringify(message)}

    const command = new PostToConnectionCommand(input);
const response = await client.send(command);
return response;
  } catch (error) {
    if (error.statusCode === 410) {
      console.log(`Found stale connection, deleting ${connectionId}`);
    }
  }
};

// Connect handler
exports.connect = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const params = {
    TableName: 'websocket-connections',
    Item: { connectionId },
  };
  await dynamoDb.put(params).promise();
  return { statusCode: 200 };
};

// Disconnect handler
exports.disconnect = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const params = {
    TableName: 'websocket-connections',
    Key: { connectionId },
  };
  await dynamoDb.delete(params).promise();
  return { statusCode: 200 };
};

// Default handler
exports.default = async (event) => {
  return {
    statusCode: 200,
    body: 'Received message on $default route'
  };
};

// Send message handler
exports.sendMessage = async (event) => {
  const connectionId = event.requestContext.connectionId;
  const body = JSON.parse(event.body);
  const transfer=body.transfer;
  const message = body.message;

  try {
   const response=await sendMessageToConnection(transfer, {
          message: message,
          sender: connectionId
        });
        console.log(response);



    return { statusCode: 200, body: 'Message sent' };
  } catch (error) {
    return { statusCode: 500, body: 'Failed to send message: ' + JSON.stringify(error) };
  }
};

exports.sendAllMessage = async (event) => {
  
 
  const connectionId = event.requestContext.connectionId;
  const body = JSON.parse(event.body);
  const message = body.message;

  try {
    // Get all connections
    const connections = await dynamoDb.scan({
      TableName: process.env.CONNECTIONS_TABLE
    }).promise();

    // Broadcast message to all connections except sender
    const sendMessages = connections.Items.map(({ connectionId: connId }) => {
      if (connId !== connectionId) {
        return sendMessageToConnection(connId, {
          message: message,
          sender: connectionId
        });
      }
    });

    await Promise.all(sendMessages);

    return { statusCode: 200, body: 'Message sent' };
  } catch (error) {
    return { statusCode: 500, body: 'Failed to send message: ' + JSON.stringify(error) };
  }
};
