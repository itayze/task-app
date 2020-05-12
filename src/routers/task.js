const express=require('express')
const Task= require('../models/task')
const router = new express.Router()
const auth= require('../middlewares/auth')

router.post('/tasks',auth,async (req,res)=>{ //add a new task

    const task= new Task ({
        ...req.body,
        owner:req.user._id})
    try{
        await task.save()
        res.status(201).send()
    }
    catch(e)
    {
        res.status(500).send(e)
    }

})

router.get('/tasks',auth,async (req,res)=>{ //show all tasks

    const match={}
    const sort={}
    if(req.query.completed)
    {
        match.completed= req.query.completed==='true'
    }
    if(req.query.sortBy)
    {
        const parts=req.query.sortBy.split(':')
        sort[parts[0]]=parts[1]==='desc'? -1: 1

    }
    try{
        const user= req.user
         await user.populate({
             path:'tasks',
             match,
             options:{
                 limit:parseInt(req.query.limit),
                 skip:parseInt(req.query.skip),
                 sort

             }
         }).execPopulate()
        res.send(user.tasks)
    }
    catch(e){
        res.status(404).send()
    }

})

router.get('/tasks/:id',auth,async (req,res)=>{ //show specific task

    const _id=req.params.id

    try{
       const task= await Task.findOne({_id,owner:req.user._id})

       if(!task)
       {
           return res.status(404).send()
       }
       res.send(task)
    }
    catch(e)
    {
        res.status(500).send()
    }
    
})


//update a task
router.patch('/tasks/:id',auth, async (req,res)=>{ 
    //validate update operation  
  const updates=Object.keys(req.body)
  const allowedUpdates= ['description','completed']
  const isInvalidOperation= updates.every((update)=>allowedUpdates.includes(update))
  
  if(!isInvalidOperation)
  {
     return res.status(400).send({error:'invalid updates'})
  }
  
      try{
          const task= await Task.findOne({_id:req.params.id,owner:req.user._id})
          if(!task)
          {
              res.status(404).send()
          }
          updates.forEach((update)=>task[update]=req.body[update])
          await task.save()
      res.send(task)    
      }
      catch(e)
      {
          res.status(500).send()
      }
  })



    router.delete('/tasks/:id',auth,async (req,res)=>{
        try{
            const task= await Task.findOneAndDelete({_id: req.params.id, owner :req.user._id})
            
            if(!task)
            {
                res.status(404).send()
            }
            res.send(task)
        }catch(e){
            res.status(500).send()
        }
    })


module.exports=router