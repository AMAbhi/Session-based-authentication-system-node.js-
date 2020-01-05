const express = require('express')
const session = require('express-session')

const TWO_HOURS = 1000*60*60*2
const {
    PORT = 3000,
    NODE_ENV = 'development',
    SESS_NAME = 'sid',
    SESS_SECRET = '#pass\2018',
    SESS_LIFETIME = TWO_HOURS
} = process.env

const app = express()
const IN_PROD = NODE_ENV === 'production'

const users = [
    {id:1, name: 'Abhi', email: 'abhi@gmail.com', password: '123'},

]
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(session({
    name: SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: SESS_SECRET,
    cookie:{
        maxAge:SESS_LIFETIME,
        sameSite: true,
        secure: IN_PROD
    }
    
}))

app.listen(PORT, ()=>console.log(
    `http://localhost:${PORT}`
))

const redirectLogin = (req, res, next) =>{
    if(!req.session.userId) {
        res.redirect('/login')
    } else {
        next()
    }
}

const redirectHome = (req, res, next) =>{
    if(req.session.userId) {
        res.redirect('/home')
    } else {
      next()
    }
}

app.get('/',(req, res)=>{
    const {userId} = req.session
    console.log(req.session)
    console.log(userId)
    res.send(`
        <h1>Welcome</h1>
        ${userId ? `
            <a href='/home'>Home</a>
            <form method='post' action='/logout'>
                <button>Logout</button>
            </form>
        ` : `
            <a href='/login'>Login</a>
            
        `}
    
    
    `)
})

app.get('/home', redirectLogin, (req, res)=>{
    res.send(`
        <h1>Home</h1>
        <a href='/'>Main</a>
    `)
})

app.get('/login', redirectHome, (req, res)=>{
    res.send(`
        <center>
        <h1>Login</h1>
        <form method='post' action='/login'>
        <input type='email' name='email' placeholder='Email' required /> <br> <br>
        <input type='password' name='password' placeholder='password' required /> <br> <br>
        <input type = 'submit' />
        </form>
        </center>
    `)
})



app.post('/login',redirectHome, (req, res)=>{
    const {email,password}=req.body

    if(email && password) {
        const user = users.find (
            user => user.email === email && user.password === password
        )
        if (user) {
            req.session.userId = user.id
            return res.redirect('/home')
        }
    }
  
    res.redirect('/login')
})



app.post('/logout',redirectLogin, (req, res)=>{
    req.session.destroy(err =>{
        if(err) {
            return res.redirect('/home')
        }

        res.clearCookie(SESS_NAME)
        res.redirect('/login')
    })
})

