const express= require('express')
const User= require('../models/user')
const router =new express.Router()
const auth= require('../middlewares/auth')
const multer=require('multer')
const sharp=require('sharp')
const {sendWelcomeEmail,sendCancelationEmail}=require('../emails/account')


router.post('/users', async (req,res)=>{ //add a new user
    const user = new User(req.body)
    
    try{
        await user.save()
        sendWelcomeEmail(user.email,user.name)
        const token = await user.generateAuthToken()
       
        res.status(201).send({user,token})
    }
    catch(e){
        res.status(400).send(e)
    }
})

router.get('/users/me',auth,async (req,res)=>{ //show user profile
res.send(req.user)
})


//update user details
router.patch('/users/me',auth, async (req,res)=>{ 
  //validate update operation  
  const updates=Object.keys(req.body)
  const allowedUpdates= ['name','email','password','age']
  const isInvalidOperation= updates.every((update)=> allowedUpdates.includes(update))
  
  if(!isInvalidOperation)
  {
     return res.status(400).send({error:'invalid updates'})
  }

    try{
        const user= req.user
        updates.forEach((update)=>user[update]=req.body[update])
        await user.save()

      
        res.send(user)
    }
    catch(e)
    {
        res.status(400).send()
    }
})

router.delete('/users/me',auth,async (req,res)=>{ //delete a user

    try{
       await req.user.remove()
       sendCancelationEmail(req.user.email,req.user.name)
        res.send(req.user)
    }
    catch(e)
    {
        res.status(500).send()
    }

})

router.post('/users/login', async (req,res)=>{ //usen login
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()
        res.send({user,token})
    }
    catch(e){
        res.status(400).send()
    }
})

router.post('/users/logout',auth,async(req,res)=>{ //logout from current session (device)

    try{
        req.user.tokens= req.user.tokens.filter((token)=>{
            return token.token != req.token
        })
        await req.user.save()
        res.send()
    }
    catch(e)
    {
        res.status(500).send()
    }
})

router.post('/users/logoutAll',auth,async (req,res)=>{ //logout all sessions (all devices)
try{

    req.user.tokens=[]
    await req.user.save()
    res.send()
}
catch(e)
{
    res.status(500).send()
}
})

const upload= multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/))
        {
            return cb(new Error('please upload an image'))
        }
        cb(undefined,true)
    }
})
router.post('/users/me/avatar',auth,upload.single('avatar'),async (req,res)=>{ //upload a profile picture
const buffer= await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer()
req.user.avatar=buffer
await req.user.save()
res.send()
},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
})

router.delete('/users/me/avatar',auth,async (req,res)=>{ //delete a profile picture
    req.user.avatar=undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req,res)=>{ //get user's profile picture
    try{
    const user=await User.findById(req.params.id)
    if(!user || !user.avatar) //user wasnt found or user doesnt have an image
    {
        throw new Error() //go to catch
    }       
    
    res.set('Content-Type','image/png') //to show image on browser- we set it manually
    res.send(user.avatar)

    }
    catch(e)
    {
        res.status(404).send()
    }

})



module.exports=router