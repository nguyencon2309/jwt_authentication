const bcrypt = require("bcrypt");
const UserModel= require("../models/UserModel");
const mongoose = require("mongoose");
const { request } = require("express");
const { response } = require("express");
require('dotenv').config()
const constsalt = process.env.salt||10;

const jwt = require('jsonwebtoken')





const validatePasword = (password) => {
    /**
     * Check pw hợp lệ
     */
    return password.match(
        // Tối thiểu tám ký tự, ít nhất một chữ cái, một số và một ký tự đặc biệt
        ///^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
    );
  };

const createUser = async (request, response) => {
    let bodyRequest = request.body;
    bodyRequest.username=bodyRequest.username.toLowerCase()

    if(!bodyRequest.username) {
        return response.status(400).json({
            status: "Error 400: Bad Request",
            message: "username is required"
        })
    }
    if(!bodyRequest.email) {
        return response.status(400).json({
            status: "Error 400: Bad Request",
            message: "email is required"
        })
    }
 
    if(!bodyRequest.password) {
        return response.status(400).json({
            status: "Error 400: Bad Request",
            message: "password is required"
        })
    }
    // if (!validatePasword(bodyRequest.password)) {
    //     return response.status(400).json({
    //         status: "Error 400: Bad Request",
    //         message: "password is not valid"
    //     })
    // }


    let usergmail = await UserModel.findOne({email:bodyRequest.email})
    if(usergmail) {
        return response.status(400).json({
            status: "Error 400: Bad Request",
            message: "email da ton tai"
        })
    }

    let user = new UserModel(bodyRequest);
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    // user.save((error, doc) => {
    //     if(error) {
    //         response.status(500).json({
    //             status: "Error 500: Email đã được đăng ký",
    //             message: error.message
    //         })
    //     } else {
    //         response.status(201).send({
    //             status: "Success 201: Đăng ký thành công",
    //             doc: doc
    //         })
    //     }
    // })
    await user.save();
    
    response.send(user);
}

const logInUser = async (request, response) => {
    let bodyRequest = request.body;
    console.log(bodyRequest)
    const user = await UserModel.findOne({ username:bodyRequest.username });
    if (user) {
      
      const validPassword = bcrypt.compare(bodyRequest.password,user.password)
      
      if (validPassword) {

        const payload = {_id:user.user_id,username:user.username}

        const accessToken = jwt.sign(
            payload,
            process.env.ACCESS_TOKEN_PRIVATE_KEY,
            { expiresIn: "14m" }
        );

        response.status(200).json({ status: "ok",accessToken });
      } else {
        response.status(400).json({ error: "Password không đúng!!!" });
      }
    } else {
        response.status(401).json({ error: "Username không đúng!!!" });
    }
}


const updateUser = async (request, response) => {
    let bodyRequest = request.body;
    console.log(bodyRequest)

    if (!validatePasword(bodyRequest.password)) {
        return response.status(400).json({
            status: "Error 400: Bad Request",
            message: "password is not valid"
        })
    }

    // user.save((error, doc) => {
    //     if(error) {
    //         response.status(500).json({
    //             status: "Error 500: Email đã được đăng ký",
    //             message: error.message
    //         })
    //     } else {
    //         response.status(201).send({
    //             status: "Success 201: Đăng ký thành công",
    //             doc: doc
    //         })
    //     }
    // })
    await user.save();
    response.send(user);
}
const getProfile = async(req,res) => {
    console.log("abc",req.user)
    return res.json({"profile":req.user})
}
module.exports = {
    createUser,
    logInUser,
    getProfile
}