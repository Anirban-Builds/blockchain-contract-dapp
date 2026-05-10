import express from 'express'
import cors from 'cors'
import contractRouter from './src/routes/contracts.routes.js'

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: false
}
))

app.use(express.json({ limit: '32kb' }))
app.use(express.urlencoded({ extended: true, limit: '32kb' }))
app.use(express.static('public'))

app.use('/contracts', contractRouter)

app.get("/", (req, res) => {
  res.send("Backend is Live 🚀")
})

export default app
