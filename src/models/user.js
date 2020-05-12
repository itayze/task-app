const mongoose = require('mongoose')
const validator= require('validator')
const bcrypt= require('bcryptjs')
const jwt= require('jsonwebtoken')
const Task=require('./task')

const userSchema= new mongoose.Schema({
    name:{
        type: String,
        required:true,
        trim:true
    },
    age:{
        type: Number,
        default:0
    },
    email:{
        type: String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true,
        validate(value)
        {
            if(!validator.isEmail(value))
            {
                throw new Error ("email is invalid")
            }
        }
    },
    password:{
        type: String,
        required:true,
        trim:true,
        minlength: 7,
        validate(value){
            if(value.includes('password'))
                {
                    throw new Error("passwords cannot contain the word password")
                }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
})

userSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

userSchema.methods.generateAuthToken= async function(){
    const user= this
    const token= jwt.sign({_id:user.id},process.env.JWT_SECRET)
    user.tokens= user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.methods.toJSON=function(){
    const user=this
    const userObject= user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.statics.findByCredentials= async (email,password)=>{

  const user= await User.findOne({email})
    if(!user)
    {
        throw new Error('login failed')
    }
    const isMatch= await bcrypt.compare(password,user.password)
    if(!isMatch)
    {
        throw new Error('login failed')
    }

    return user
}


userSchema.pre('save',async function(next){
    const user= this
    
    if(user.isModified('password'))//in case password is the field that was modified-let's hash it
    {
    user.password= await bcrypt.hash(user.password,8)
    }
        next()
    })
//delete user data(tasks) before removing a user
userSchema.pre('remove',async function (next){
const user= this
await Task.deleteMany({owner:user._id})

next()
})


const User = mongoose.model('User',userSchema)



module.exports=User