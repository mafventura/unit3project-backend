import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import passport from "./passport.js";
import session from "express-session";
import { User } from "./schema/userSchema.js";
import { ToDo } from "./schema/ToDosSchema.js";
import authRoute from "./routes/auth.js";

const client = new OAuth2Client();

const app = express();
const SECRET = process.env.SECRET;

app.use(bodyParser.json());

app.use(
  session({
    secret: "r8q,+&1LM3)CD*zAGpx1xm{NeQhc;#",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 }, // 1 hour
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

app.use("/auth", authRoute);

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

app.get("/user/login", async (req, res) => {
  const user = await User.find({});
  res.json(user);
});

app.post("/users/add", async (req, res) => {
  const now = new Date();

  if ((await User.countDocuments({ userEmail: req.body.userEmail })) === 0) {
    const newUser = new User({
      userEmail: req.body.userEmail,
      lastLogin: now,
    });
    newUser
      .save()
      .then(() => {
        res.sendStatus(200);
      })
      .catch((err) => {
        res.sendStatus(500);
      });
  } else {
    await User.findOneAndUpdate(
      { userEmail: req.body.userEmail },
      { lastLogin: now }
    );
    res.sendStatus(200);
  }
});

app.get("/todos", async (req, res) => {
  try {
    const userEmail = req.header("user-email");
    const user = await User.findOne({ email: userEmail });
    if (user) {
      const allTodos = await ToDo.find({ userId: user._id });
      res.json(allTodos);
    } else {
      console.log("Not found");
      res.status(500).json({ message: "User not found" });
    }
  } catch (e) {
    console.error(e);
  }
});

app.post("/todos/add", async (req, res) => {
  console.log(req.header);
  try {
    const userEmail = req.header("user-email");
    const user = await User.findOne({ email: userEmail });
    if (user) {
      const todo = req.body;
      // console.log(req.body);
      const newTodo = new ToDo({
        todo: todo.todo,
        completed: todo.completed,
        userId: user._id,
      });
      newTodo.save();
      console.log(newTodo);
      res.sendStatus(200);
    } else {
      console.log("Not found");
      res.status(500).json({ message: "User not found" });
    }
  } catch (e) {
    console.error(e);
  }
});

app.delete("/todos/:id", async (req, res) => {
  try {
    await ToDo.deleteOne({ _id: req.params.id });
    console.log("todo deleted----------");
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
  }
});

app.put('/todos/:id', async (req, res) => {
  try {
    const todo = req.body
    console.log(todo.completed)
    await ToDo.updateOne({_id: req.params.id}, {todo: todo.todo, completed: todo.completed})
    res.sendStatus(200)
    console.log('updated todo------------->')
  } catch (e) {
    console.error(e)
  }
})