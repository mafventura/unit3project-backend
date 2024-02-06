import mongoose from "mongoose";

mongoose.connect(process.env.DATABASE_URL);

const toDoSchema = new mongoose.Schema({
    todo: String,
    completed: Boolean,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

export const ToDo = mongoose.model("ToDo", toDoSchema);

