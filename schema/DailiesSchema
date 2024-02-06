import mongoose from "mongoose";

mongoose.connect(process.env.DATABASE_URL)

const dailiesSchema = new mongoose.Schema({ 

    water: Number, 
    mood: String,
    sleep: Number,
    quote:String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
    

},{ timestamps: true } )

export const Dailies = mongoose.model("Dailies", dailiesSchema)