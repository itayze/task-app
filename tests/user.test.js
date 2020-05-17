const app=require('../src/app')
const request=require('supertest')
const User=require('../src/models/user')

const {userOne,userOneId,setupDatabase}=require ('./fixtures/db')


beforeEach(setupDatabase)

test('should sign up a new user', async()=>{

    const response=await request(app).post('/users').send({
        name:'itay',
        email:'itay@gmail.com',
        password:'123456789'
    }).expect(201)

    //check db operation was succesful
    const user= await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //check response.body
    expect(response.body).toMatchObject({
        user:{
            name:'itay',
            email:'itay@gmail.com',
            
        },
        token:user.tokens[0].token
    })

    //check that password was hashed
    expect(user.password).not.toBe('123456789')

})

test ('should login with existing user',async()=>{
    const response=await request(app).post('/users/login').send({
        email:userOne.email,
        password:userOne.password
    }).expect(200)

    //validate new token is saved 
    const user=await User.findById(userOneId)
    expect(response.body.token).toBe(user.tokens[1].token)
    
})

test ('should fail with non existing user',async()=>{
    await request(app).post('/users/login').send({
        email:'david2@gmail.com',
        password:'12345678'
    }).expect(400)
})

test('should get profile for user',async ()=>{
    await request(app)
    .get('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('should not get user profile for unauthorized user',async ()=>{
    request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test('should delete user', async()=>{
    await request(app)
    .delete('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)    
    .send()
    .expect(200)

    //validate user is removed
    const user= await User.findById(userOneId)
    expect(user).toBeNull()
    
    
})

test('should not delete user for unauthorized user',async()=>{
    await request(app)
    .delete('/users/me')
    .send()
    .expect(400)
})

test('should upload avatar image',async ()=>{
    await request(app)
    .post('/users/me/avatar')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .attach('avatar','tests/fixtures/profile-pic.jpg')
    .expect(200)

    const user= await User.findById(userOneId)
    expect(user.avatar).toEqual(expect.any(Buffer))

})

test('should update valid user field',async()=>{

    const response= await request(app)
    .patch('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send({
        name:'itay'
    })
    .expect(200)

    expect(response.body.name).toBe('itay')
})

test('should not update an invalid user fields',async()=>{
    await request(app)
    .patch('/users/me')
    .set('Authorization',`Bearer ${userOne.tokens[0].token}`)
    .send({
        location:'tel aviv'
    })
    .expect(400)

})