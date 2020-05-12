const express= require('express')
const app = express()
const port= process.env.PORT
require('./db/mongoose')
const User=require('./models/user')
const Task=require('./models/task')
const userRouter= require('./routers/user')
const taskRouter= require('./routers/task')


const multer= require('multer')
const upload=multer({
    dest:'images'
})

app.post('/upload',upload.single('upload'),(req,res)=>{
    res.send()
})


app.use(express.json()) //convers JSON into object we can work with
app.use(userRouter)
app.use(taskRouter)


app.listen(port,()=>{
    console.log('app is running on port '+port)
})

const jwt= require('jsonwebtoken')

