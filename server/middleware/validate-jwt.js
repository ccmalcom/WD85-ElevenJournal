// ! This file has a specific action: to check if the request has a token attatched

const jwt = require('jsonwebtoken'); //import JWT package
const { UserModel } = require('../models') //communicate with user model to find out info abt specific user

const validateJWT = async (req, res, next) =>{
    if (req.method == "OPTIONS"){ //?using OPTIONS method (rather than GET, POST, etc)
        next(); //nested middleware function that, when called, passes control to next middleware function
    } else if ( //If dealing with a POST/GET/PUT/DELETE request, we want to see if there is data in the auth header AND if that string includes the word Bearer
        req.headers.authorization &&
        req.headers.authorization.includes('Bearer')
    ) {
        const { authorization } = req.headers; //obj destructuring to pull value of auth header and store it in authorization variable
        console.log('authorization -->', authorization);
        const payload = authorization //ternary
        ? jwt.verify( //if value is true, do the following:
            authorization.includes('Bearer') //if token includes word Bearer, we extrapolate and return just the token from the whole string
            ? authorization.split(' ')[1]
            : authorization,
            process.env.JWT_SECRET
        )
        : undefined; //return undefined if the string is not verified (i think)

        console.log('payload-->', payload);

        if (payload) { //check if payload value is true
            let foundUser = await UserModel.findOne({where: {id: payload.id}}); //if it is, we use findOne to look for a user in our UserModel where the ID matches and then stores value of located user in foundUser
            console.log('foundUser -->', foundUser);

            if (foundUser){ //check if foundUser value is true (note: nested)
                console.log('request-->', req);
                req.user = foundUser; //*if we find the user that matches the info in the token, we create a new property called user to the req object. The value of this property is the info stored in foundUser (email and pass). This is important because we will now have access to this info when the middleware function is invoked.
                next(); //Since we are creating a middleware function, we have to use next(), which exits us out of this function
            } else {
                res.status(400).send({message: "Not Authorized"}); //unable to locate user
            } 
        } else {
            res.status(401).send({message: 'Invalid token'}); //payload cameback as undefined (line 19)
        }
    } else {
        res.status(403).send({message: "Forbidden"}); //If authorization obj in headers obj of the request is empty/does not include the word 'bearer'
    }
};

module.exports = validateJWT;