const express = require('express')
const exphbs = require('express-handlebars')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const flash = require('express-flash')

const app = express()

const conn = require('./db/conn')

const Tought = require('./models/Tought')
const User = require('./models/User')

const toughtsRoutes = require('./routes/toughtsRoutes')
const authRoutes = require('./routes/authRoutes')

const ToughtController = require('./controllers/ToughtController')



app.engine("handlebars", exphbs.engine())
app.set("view engine", "handlebars")


app.use(
  express.urlencoded({
    extended: true
  })
)

app.use(express.json())

app.use(
  session({
    name:"session",
    secret: "nosso_secret",
    resave: false,
    saveUninitialized: false,
    store: new FileStore({
      logFn:function() {},
      path: require('path').join(require('os').tmpdir(), 'sessions')
    }),
    cookie: {
      secure:false,
      maxAge: 360000,
      expires: new Date(Date.now() + 360000),
      httponly:true
    }
  })
)

app.use(flash())

app.use(express.static('public'))

app.use((req,res, next) => {
  if(req.session.userId) {
    res.locals.session = req.session
  }
  next()
})


app.use('/toughts', toughtsRoutes)
app.use('/', authRoutes)

app.get('/', ToughtController.showToughts)

conn
// .sync({force: true})
.sync()
.then(() => {
  app.listen(3000)
})
.catch((err) => console.log(err))


