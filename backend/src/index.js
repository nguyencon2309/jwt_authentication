const express = require('express')
const { request, response } = require("express");
const db = require('./app/config/index')
const route = require('./router/index')



const path = require("path");

const app = express()
const port = process.env.PORT

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
db.connect()
// app.get('/test', (req, res) => {
//   res.send('Hello World!')
// })
// app.post('/re',(req,res)=>{
// 	console.log(req.body)
// 	res.send('app post')
// })
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
route(app)

