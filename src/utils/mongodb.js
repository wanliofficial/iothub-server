import mongoose from 'mongoose'
require('dotenv').config()

mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if(err) console.log("Database connection failed", err)
    else console.log("Database connection successful")
})

export default mongoose