const jwt = require('jsonwebtoken');
const promisify = require('util').promisify;

const sign = promisify(jwt.sign).bind(jwt);
const verify = promisify(jwt.verify).bind(jwt);

const UserModel = require('../models/UserModel')


const verifyToken = async (req,res) => {
	const token = req.headers.x_authorization;
	const secretKey = process.env.ACCESS_TOKEN_PRIVATE_KEY;
	try {
		return await verify(token, secretKey);
	} catch (error) {
		console.log(`Error in verify access token:  + ${error}`);
		return res.json({error});
	}
};

const verifyTokenAuth = async (req,res,next) => {

	

	const verified = verifyToken(req,res)
	if(!verified){
		return res
			.status(401)
			.send('Bạn chưa đăng nhập!');
	}
	
	req.user=await UserModel.findOne({username:verified.username})
	
	return next();
	

}
const verifyTokenAdmin = async (req,res,next) => {

	
	const verified = verifyTokenAuth(req,res,next)
	if(!verified){
		return res
			.status(401)
			.send('Bạn chưa đăng nhập!');
	}
	if(req.user.role===1){
		return res
			.status(401)
			.send('Bạn không có quyền này!');

	}
	return next();
	

}



const decodeToken = async (token, secretKey) => {
	try {
		return await verify(token, secretKey, {
			ignoreExpiration: true,
		});
	} catch (error) {
		console.log(`Error in decode access token: ${error}`);
		return null;
	}
};
module.exports = {
	decodeToken,
	verifyToken,
	verifyTokenAuth
}