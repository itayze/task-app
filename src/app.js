const express= require('express')
const app = express()

require('./db/mongoose')
const User=require('./models/user')
const Task=require('./models/task')
const userRouter= require('./routers/user')
const taskRouter= require('./routers/task')



app.use(express.json()) //convers JSON into object we can work with
app.use(userRouter)
app.use(taskRouter)

module.exports=app


