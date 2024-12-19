const { CognitoIdentityProviderClient, InitiateAuthCommand,
     SignUpCommand, ConfirmSignUpCommand } = require('@aws-sdk/client-cognito-identity-provider');

const client = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

class CognitoService {
    constructor() {
       
        this.clientId = process.env.COGNITO_CLIENT_ID;
        this.userPoolId = process.env.COGNITO_USER_POOL_ID;
    }

    async signUp(email, password,userAttributes) {
        const command = new SignUpCommand({
            ClientId: this.clientId,
            Username: email,
            Password: password,
            UserAttributes: userAttributes
        });

        try {
            const response = await client.send(command);
            return response;
        } catch (error) {
            console.error('Error signing up:', error);
            throw error;
        }
    }

    async confirmSignUp(email, confirmationCode) {
        const command = new ConfirmSignUpCommand({
            ClientId: this.clientId,
            Username: email,
            ConfirmationCode: confirmationCode
        });

        try {
            const response = await client.send(command);
            return response;
        } catch (error) {
            console.error('Error confirming signup:', error);
            throw error;
        }
    }

    async signIn(email, password) {
        const command = new InitiateAuthCommand({
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: this.clientId,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            }
        });

        try {
            const response = await client.send(command);
            return response.AuthenticationResult;
        } catch (error) {
            console.error('Error signing in:', error);
            throw error;
        }
    }
  
}



module.exports = new CognitoService();
