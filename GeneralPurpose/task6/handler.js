
const cognitoAuth = require('./auth/cognitoAuth');

// Authentication endpoints
exports.signUp = async (event) => {
    try {
        const { email, password,phone_number } = JSON.parse(event.body);
        const userAttributes = [
            { Name: 'email', Value: email }
        ];
         // Validate phone number format (E.164 format)
         const phoneRegex = /^\+[1-9]\d{1,14}$/;
         if (phone_number && !phoneRegex.test(phone_number)) {
             return {
                 statusCode: 400,
                 body: JSON.stringify({ 
                     error: 'Phone number must be in E.164 format (e.g., +12065550100)' 
                 })
             };
         }
        
        // Add phone number if provided
        if (phone_number) {
            userAttributes.push({ Name: 'phone_number', Value: phone_number });
        }
        const result = await cognitoAuth.signUp(email, password,userAttributes);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'User registered successfully',
                userSub: result.UserSub
            })
        };
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: error.message })
        };
    }
};

exports.confirmSignUp = async (event) => {
    try {
        const { email, code } = JSON.parse(event.body);
        await cognitoAuth.confirmSignUp(email, code);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'User confirmed successfully'
            })
        };
    } catch (error) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: error.message })
        };
    }
};

exports.signIn = async (event) => {
    try {
        const { email, password } = JSON.parse(event.body);
        
        if (!email || !password) {
            return {
                statusCode: 400,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
                body: JSON.stringify({ error: 'Email and password are required' })
            };
        }

        const result = await cognitoAuth.signIn(email, password);
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({
                token: result.AccessToken,
                idToken: result.IdToken,
                refreshToken: result.RefreshToken
            })
        };
    } catch (error) {
        console.error('SignIn Error:', error);  // Add logging
        return {
            statusCode: error.statusCode || 401,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ 
                error: error.message || 'Authentication failed',
                code: error.code
            })
        };
    }
};

exports.hello = async (event) => {
    const user = event.requestContext.authorizer.claims;

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*", // Allow all origins
            "Access-Control-Allow-Headers": "Content-Type", // Specify allowed headers
        },
        body: JSON.stringify({
            message: "Hello! You are authenticated.",
            user: {
                email: user.email,
                phone_number: user.phone_number,
                sub: user.sub, // Cognito User Sub
            },
        }),
    };
};





