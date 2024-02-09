import mongoose from "mongoose";

mongoose.connect(process.env.DATABASE_URL)

const dailiesSchema = new mongoose.Schema({ 

    water: String, 
    mood: String,
    sleep: String,
    quote:String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
    

},{ timestamps: true } )

export const Dailies = mongoose.model("Dailies", dailiesSchema)