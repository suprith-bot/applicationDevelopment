const { SESClient, CreateTemplateCommand } = require("@aws-sdk/client-ses");

// Create SES client - no need to specify credentials
const sesClient = new SESClient({ region: "us-east-1" }); 
// Just specify your region

const createEmailTemplate = async () => {
  const templateData = {
    Template: {
      TemplateName: "TransactionalEmailTemplate",
      SubjectPart: "{{subject}}",
      HtmlPart: `
        <html>
          <body>
            <h1>Hello {{name}},</h1>
            <p>{{message}}</p>
            <p>Order Details:</p>
            <ul>
              <li>Order ID: {{orderId}}</li>
              <li>Status: {{orderStatus}}</li>
              <li>Total: {{total}}</li>
            </ul>
            <p>Thank you for your business!</p>
          </body>
        </html>
      `,
      TextPart: "Hello {{name}},\n\n{{message}}\n\nOrder Details:\nOrder ID: {{orderId}}\nStatus: {{orderStatus}}\nTotal: ${{total}}"
    }
  };

  try {
    const command = new CreateTemplateCommand(templateData);
    await sesClient.send(command);
    console.log("Template created successfully");
  } catch (error) {
    if (error.name === 'AlreadyExistsException') {
      console.log("Template already exists");
    } else {
      console.error("Error creating template:", error);
      throw error;
    }
  }
};

createEmailTemplate();
