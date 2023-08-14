
const { createUser,getProfile} = require("../app/controller/UserController")
const {
    login,
    refreshToken,
    logout,
    getAllUser,
    resetPassWord

} = require('../app/auth/auth.controller')

const {
    verifyToken,
    verifyTokenAuth

} = require('../app/auth/auth.method')




const express = require("express")
const router = express.Router();



router.post("/register", createUser);
router.post("/login", login);
router.post('/logout',verifyTokenAuth,logout)
//app.post('/loggin',logInUser)


router.post('/refreshToken',refreshToken)
router.get('/getProfile',verifyTokenAuth,getProfile)



router.get('/getAllUsers',getAllUser)
router.post('/resetpassword',resetPassWord)


// exports router
module.exports = router