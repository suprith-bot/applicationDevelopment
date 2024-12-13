const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const sesClient = new SESClient();

const createSendEmailCommand = (toAddress, fromAddress) => {
  return new SendEmailCommand({
    Destination: {
      ToAddresses: [toAddress],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: "<h1>Hello</h1><p>you have won 1 lakh rupees</p>",
        },
        Text: {
          Charset: "UTF-8",
          Data: "Hello,\nsend the card details",
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "send credit card details",
      },
    },
    Source: fromAddress,
  });
};

const sendEmail = async () => {
  const sendEmailCommand = createSendEmailCommand(
    
    "suprith.l@7edge.com","suprith.l@7edge.com" // Replace with verified recipient email
         // Replace with verified sender email
  );

  try {
    const response = await sesClient.send(sendEmailCommand);
    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

exports.handleSESNotification = async (event) => {
  try {
      // Add logging to debug the incoming event
      console.log('Received event:', JSON.stringify(event, null, 2));

      let message;
      try {
          message = JSON.parse(event.Records[0].Sns.Message);
      } catch (parseError) {
          console.error('Error parsing SNS message:', parseError);
          // If parsing fails, check if the message is already an object
          message = typeof event.Records[0].Sns.Message === 'object' 
              ? event.Records[0].Sns.Message 
              : null;
          
          if (!message) {
              throw new Error('Unable to parse SNS message');
          }
      }

      console.log('Parsed message:', JSON.stringify(message, null, 2));


      return {
          statusCode: 200,
          body: JSON.stringify({
              success: true,
              result
          })
      };
  } catch (error) {
      console.error('Notification processing error:', error);
      return {
          statusCode: 500,
          body: JSON.stringify({
              success: false,
              error: error.message,
              errorDetails: error.stack
          })
      };
  }
};



