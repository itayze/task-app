const User=require('../../src/models/user')
const jwt= require('jsonwebtoken')
const mongoose= require('mongoose')
const Task=require('../../src/models/task')


const userOneId=new mongoose.Types.ObjectId()
const userOne={
    _id:userOneId,
    name:'david',
    email:'david@gmail.com',
    password:'david12345',
    tokens:[{
        token:jwt.sign({_id:userOneId},process.env.JWT_SECRET)
    }]
}

const userTwoId=new mongoose.Types.ObjectId()
const userTwo={
    _id:userTwoId,
    name:'itay',
    email:'itay123@gmail.com',
    password:'itaydjk2@123',
    tokens:[{
        token:jwt.sign({_id:userTwoId},process.env.JWT_SECRET)
    }]
}

const taskOne={
    _id: new mongoose.Types.ObjectId(),
    description: 'first task',
    completed:false,
    owner:userOneId
}
const taskTwo={
    _id: new mongoose.Types.ObjectId(),
    description: 'second task',
    completed:true,
    owner:userOneId
}
const taskThree={
    _id: new mongoose.Types.ObjectId(),
    description: 'third task',
    completed:true,
    owner:userTwoId
}

const setupDatabase= async ()=>{
    await User.deleteMany()
    await Task.deleteMany()
await new User(userOne).save()
await new User(userTwo).save()
await new Task(taskOne).save()
await new Task(taskTwo).save()
await new Task(taskThree).save()

}


module.exports={
    setupDatabase,
    userOne,
    userOneId,
    userTwo,
    userTwoId,
    taskOne,
    taskTwo,
    taskThree
}