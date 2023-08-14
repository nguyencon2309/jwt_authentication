const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username :{type:String,required:true,unique:true},  
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true ,unique: true,
    match: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i},
  user_id: { type: String, required: true },
  password: { type: String, required: true, minLength:6, match :
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
   },
  rule: { type: Number, required: true ,enum : [1,2] ,default :[1] }
});

const UserModel = mongoose.model('users', UserSchema);

module.exports = UserModel;

