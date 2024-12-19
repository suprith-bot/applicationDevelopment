exports.main = async (event) => {
    try {
      for (const record of event.Records) {
        const message = JSON.parse(record.body);
        console.log('Processing message:', message);
        if (message.value<2){
          throw new Error('Invalid value');
        }
  
        // Your custom processing logic here
      }
      return { statusCode: 200 };
    } catch (error) {
      console.error('Error processing messages:', error);
      throw error; // Retry and DLQ
    }
  };
  
  exports.dlq = async (event) => {
    try {
      for (const record of event.Records) {
        const message = JSON.parse(record.body);
        console.log('Handling DLQ message:', message);
  
        // Handle failed messages (e.g., logging or manual intervention)
      }
      return { statusCode: 200 };
    } catch (error) {
      console.error('Error handling DLQ messages:', error);
      throw error; // Optional
    }
  };
  