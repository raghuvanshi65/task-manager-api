const jwt = require('jsonwebtoken');
const User = require('../models/user');


//This is a middleware function that takes a header called Authorization that contins BearerToken 
//And then is verifies token is valid or not and then it searches for the user with the decoded token
//information and the token , throws error if unauthorized or else calls next() and pass token and user in req
const auth = async (req , res , next) =>{
	try {
		const token = req.header('Authorization').replace('Bearer ' , '');
		const decoded = await jwt.verify(token , "secret1210");

		const user = await User.findOne({_id : decoded._id , 'tokens.token' : token });
		
		if(!user)
			throw new Error();

		req.token = token;
		req.user = user;
		next();
	} catch (err) {
		res.status(401).send({
			error : "UnAuthorized Bearer User Token , Please authorize !!"
		})
	}
}

module.exports = auth;