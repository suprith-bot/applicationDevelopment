const {SESClient, SendTemplatedEmailCommand}=require('@aws-sdk/client-ses');
const {SNSClient,PublishCommand}=require('@aws-sdk/client-sns');
const snsClient=new SNSClient({region:"us-east-1"});
const sesClient = new SESClient({ region: "us-east-1" });
require('dotenv').config();     
const publishToSNS=async (message)=> {
    try {
        
        const params = {
            Message: JSON.stringify(message),
            TopicArn: process.env.SNS_TOPIC_ARN
        };
        const command = new PublishCommand(params);
        const response = await snsClient.send(command);
        // const result = await SNSClient.publish(params).promise();
        console.log('Published to SNS:', response.MessageId);
        return response.MessageId;
    } catch (error) {
        console.error('Error publishing to SNS:', error);
        throw error;
    }
}

const sendEmail=async(recipientEmail)=>{
    input={
        Destination:{
            ToAddresses:[recipientEmail]
        },
        Source:"suprith.l@7edge.com",
        Template:"TransactionalEmailTemplate",
        TemplateData:JSON.stringify({subject:"claimed! booyah",name:"xxxxx",
            message:"You have won 1 lakh rupees","orderId":"XXXXXX",
            orderStatus:"Delivered",total:"100000"})
    };
    try{
    const command=new SendTemplatedEmailCommand(input);
    const response=await sesClient.send(command);
    console.log("Email sent successfully",response);
    }catch(error){
        const bounceNotification = {
            notificationType: 'Bounce',
            bounce: {
                bounceType: 'Permanent', // or 'Transient' based on error
                bouncedRecipients: [{
                    emailAddress: recipientEmail,
                    action: 'failed',
                    status: error.code,
                    diagnosticCode: error.message
                }],
                timestamp: new Date().toISOString(),
                feedbackId: `${Date.now()}-${recipientEmail}`
            },
            mail: {
                timestamp: new Date().toISOString(),
                source: this.senderEmail,
                destination: [recipientEmail],
                messageId: `${Date.now()}-error`
            }
        };

        // Publish bounce to SNS
        await publishToSNS(bounceNotification);
        
        return null;
    }
    }



sendEmail("bhhcjc@7edge.com")