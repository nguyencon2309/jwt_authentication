const mongoose = require('mongoose');
require('dotenv').config();
async function connect() {
    try {
        await mongoose.connect(`${process.env.DB}`);
        console.log("connect thanh cong")
    }
    catch (error) {
        console.log("connect fail");
    }

}


module.exports = { connect };