import 'dotenv/config'
import connectDB from "./src/db/dbconnect.js"
import app from "./app.js"

connectDB()
.then(() => {
    app.listen(process.env.PORT || 7860, () => {
        console.log(`Server is running on port : ${process.env.PORT || 8000}`);
    })
})
.catch((err) =>{
        console.log("Database connection failed. Server not started.", err);
    })