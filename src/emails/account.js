const sgMail=require('@sendgrid/mail')
const sendGridAPIKey=process.env.SENDGRID_API_KEY

sgMail.setApiKey(sendGridAPIKey)



const sendWelcomeEmail=(email,name)=>{

    sgMail.send({
        to:email,
        from:'itayze92@gmail.com',
        subject:'Thanks for joining in',
        text: `welcome to the app, ${name}. I hope you find it useful`
    })

}

const sendCancelationEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'itayze92@gmail.com',
        subject:'Is there anything we can do so you stay with us?',
        text: `Goodbye, ${name}. Please share your thougts with us, so we undestand how we can improve`
    })
}

module.exports={
    sendWelcomeEmail,
    sendCancelationEmail
}