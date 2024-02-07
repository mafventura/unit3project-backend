import mongoose from "mongoose";

mongoose.connect(process.env.DATABASE_URL);

const toDoSchema = new mongoose.Schema({
    todo: String,
    completed: Boolean,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    date: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export const ToDo = mongoose.model("ToDo", toDoSchema);

