const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');
const { Pool } = require('pg');
const ssmClient = new SSMClient();   

async function getSSMParameter(name) {
  const command = new GetParameterCommand({
    Name: name,
    WithDecryption: true, // Decrypt the secure string
  });
  const { Parameter } = await ssmClient.send(command);
   return Parameter.Value;
  }

// PostgreSQL connection configuration


// Connect to PostgreSQL
exports.handler = async () => {let dbPassword;
  try {
    const dbPassword =await getSSMParameter('database_password');
    console.log('Connecting to PostgreSQL...');

  
    const client = new Pool({
      host: 'database-2.ch2e4w02wimq.us-east-1.rds.amazonaws.com', // RDS endpoint or localhost
      port: 5432,                              // Default PostgreSQL port
      user: 'postgres',                   // Database username
      password: dbPassword,               // Database password
      database: 'test'           // Database name
    });
    

  
    console.log('Connected to PostgreSQL successfully!');
    
    // Example query
    const res = await client.query('SELECT NOW()');
    console.log('Current Time:', res.rows[0]);
    


  } catch (err) {
    console.error('Error connecting to PostgreSQL:', err.stack);
  }
return{
  statusCode: 200,
  body: JSON.stringify({ message: 'Lambda triggeredd' })
}};


