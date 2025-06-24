const express = require('express')
const cors = require('cors')
const session = require('express-session')

const app = express()
const PORT = process.env.PORT || 3000

const { ValidationError } = require('./middleware/CustomErrors')

const authRoutes = require('./routes/auth')
const newsRoutes = require('./routes/news')
const articleRoutes = require('./routes/articles')

app.use(cors())
app.use(express.json())

let sessionConfig = {
  name: 'sessionId',
  secret: 'keep it secret, keep it safe',
  cookie: {
    maxAge: 1000 * 60 * 5,
    secure: process.env.RENDER ? true : false,
    httpOnly: false,
  },
  resave: false,
  saveUninitialized: false,
}

app.use((err, req, res, next) => {
    if (err instanceof ValidationError) {
      return res.status(err.statusCode).json({ error: err.message })
    }

    // For Additional Prisma Checks
    res.status(500).json({ error: "Internal Server Error" })
})  

app.use(session(sessionConfig))
app.use(authRoutes)
app.use(newsRoutes)
app.use(articleRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})