const router = require('./site')
const cors=require("cors");
const corsOptions ={
   origin:'*', 
   credentials:true,            
   optionSuccessStatus:200,
}


const route = (app) =>{

    app.use(cors(corsOptions))
    app.use(router)
}
module.exports = route