//const randToken = require('rand-token');
const bcrypt = require('bcrypt');
const UserModel = require('../models/UserModel')

const UserToken = require('../models/UserToken')
const jwt = require("jsonwebtoken")


const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-={}[]:;'<>?,./";
const regex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/




const generatePassword = (length) => {

    /**
     * create random password with regex
     */

  let password = "";
  for (let i = 0; i < length; i++) {
    password += characters[Math.floor(Math.random() * characters.length)];
  }

  while (!password.match(regex)) {
    password = "";
    for (let i = 0; i < length; i++) {
      password += characters[Math.floor(Math.random() * characters.length)];
    }
  }

  return password;
};






const { decodeToken } = require('./auth.method')

const nodemailer = require('nodemailer')

const getAllUser = async (req, res) => {

	console.log("getAllUser")

	const users = await UserModel.find()
	console.log(users)
	res.json({ users })
}

const generateAccessToken = (user) => {

	return jwt.sign(
		{
			username: user.username,
			role: user.role,
		},
		process.env.ACCESS_TOKEN_PRIVATE_KEY,
		{ expiresIn: "60s" }
	);
};

const generateRefreshToken = (user) => {
	return jwt.sign(
		{
			username: user.username,
			role: user.role,
		},
		process.env.REFRESH_TOKEN_PRIVATE_KEY,
		{ expiresIn: "30d" }
	);
};

const login = async (req, res) => {
	let bodyRequest = req.body;
	console.log(bodyRequest)

	const user = await UserModel.findOne({ username: bodyRequest.username });
	if (user) {
		const validPassword = bcrypt.compare(
			bodyRequest.password,
			user.password
		)

		if (validPassword) {
			const accessToken = generateAccessToken(user);
			const refreshToken = generateRefreshToken(user);

			const userToken = await UserToken.findOne({ userId: user._id });
			if (userToken) await userToken.deleteOne();

			let usertoken = new UserToken({ userId: user._id, token: refreshToken });
			await usertoken.save()
			res.cookie("refreshToken", refreshToken, {
				httpOnly: true,
				secure: false,
				path: "/",
				sameSite: "strict",
			});

			res.status(200).json({
				massage: "Đăng nhập thành công",
				username: user.username,
				accessToken: accessToken,
				refreshToken: refreshToken
			})
		}
		else {
			console.log("smk")
			res.status(404).json({
				massage: "Sai mật khẩu",


			})
		}
	}
	else {
		console.log("stk")
		res.status(404).json({
			massage: "Sai tài khoản",
			body: req.body
		})
	}

};


const logout = async (req, res) => {
	res.clearCookie("refreshToken");
	res.status(200).json("Logged out successfully!");//frontend xoá accessToken
}


const refreshToken = async (req, res) => {
	// Lấy access token từ header
	const accessTokenFromHeader = req.headers.x_authorization;

	if (!accessTokenFromHeader) {
		return res.status(400).send('Không tìm thấy access token.');
	}

	// Lấy refresh token từ body

	const refreshTokenFromBody = req.body.refreshToken;

	if (!refreshTokenFromBody) {
		return res.status(400).send('Không tìm thấy refresh token.');
	}

	const accessTokenSecret =
		process.env.ACCESS_TOKEN_PRIVATE_KEY;//|| jwtVariable.accessTokenSecret;
	const accessTokenLife =
		process.env.ACCESS_TOKEN_LIFE;// || jwtVariable.accessTokenLife;

	// Decode access token đó
	// const decoded = await authMethod.decodeToken(
	// 	accessTokenFromHeader,
	// 	accessTokenSecret,
	// );
	const decoded = await decodeToken(
		accessTokenFromHeader,
		accessTokenSecret,
	);
	if (!decoded) {
		return res.status(400).send('Access token không hợp lệ.');
	}

	const username = decoded.username; // Lấy username từ payload

	const user = await UserModel.findOne({ username: username });
	if (!user) {
		return res.status(401).send('User không tồn tại.');
	}
	const userTk = await UserToken.findOne({ userId: user._id })

	if (userTk && refreshTokenFromBody !== userTk.token) {
		return res.status(400).send('Refresh token không hợp lệ.');
	}

	// Tạo access token mới


	const accessToken = generateAccessToken(user);
	if (!accessToken) {
		return res
			.status(400)
			.send('Tạo access token không thành công, vui lòng thử lại.');
	}
	return res.json({
		accessToken,
	});
};


const resetPassWord = async (req, res) => {
	const email = req.body
	
	const user = await UserModel.findOne({ email:req.body.email })
	if (!user) {
		res.status(404).send('Email address not found.');
		return;
	}
	


	// Generate a new password.
	const password = generatePassword(8);

	const salt = await bcrypt.genSalt(10);

	const hashedPassword = await bcrypt.hash(password, salt);

	// Update the user's password in the database.
	await UserModel.updateOne({email:user.email},{ password: hashedPassword });
	

	//Send the new password to the user via email.
	const transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		service:'send_email',
		port: 465,
		secure: true,
		auth: {
			user: process.env.system_email,
			pass: process.env.system_email_pw,
		},
	});

	const mailOptions = {
		//from: 'no-reply@yourwebsite.com',
		from: 'JourneyBuilder <noreply.journeybuilder@gmail.com>',//if reply will reply to noreply.journeybuilder@gmail.com
		replyTo: 'noreply.journeybuilder@gmail.com',
		to: user.email,
		subject: 'Your new password',
		text: `Your new password is: ${password}`,
	};

	transporter.sendMail(mailOptions, (err, info) => {
		if (err) {
			console.log(err);
			res.status(500).send('An error occurred.');
			return;
		}

		res.status(200).send('A new password has been sent to your email address.');
	});

}

module.exports = {
	login,
	logout,
	refreshToken,
	getAllUser,
	resetPassWord
}




