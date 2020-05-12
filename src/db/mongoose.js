const mongoose = require('mongoose')


mongoose.connect(process.env.MONGODB_URL,
{
    useNewUrlParser:true,
    useCreateIndex:true
})





// const myTask= new Task({
//     description:'go to mall   tomorrow   ',
//     completed:false
    
// })

// myTask.save().then((result)=>{
//     console.log(myTask)
// }).catch((error)=>{
//     console.log(error)
// })

