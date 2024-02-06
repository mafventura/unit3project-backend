import mongoose from "mongoose";

mongoose.connect(process.env.DATABASE_URL);

const scheduleSchema = new mongoose.Schema({
    date: Date,
    time: [String],
    event: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

export const Schedule = mongoose.model("Schedule", scheduleSchema);