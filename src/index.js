// install npm i express
// install npm i bcryptjs
const express = require('express')
require('./db/mongoose')


const userRouter=require('./routers/user')
const taskRouter=require('./routers/task')

const app = express()
const port = process.env.PORT || 3000


// /middleware function
// app.use((req,res,next)=>{
//     if(req.method==='GET'){
//        res.send('get request disabled')
//     }else{
//         next()

//     }

// })



//middleware function
// app.use((req,res,next)=>{
    
//     res.status(503).send('site is under maintenance')
// })



//to parse incoming json data from postman
app.use(express.json())


app.use(userRouter)
app.use(taskRouter)




app.listen(port,()=>{
    console.log('Server is up on port'+port)
})

