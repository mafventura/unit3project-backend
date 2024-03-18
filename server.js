import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import passport from "./passport.js";
// import session from "express-session";
import session from "cookie-session";
import { User } from "./schema/userSchema.js";
import { ToDo } from "./schema/ToDosSchema.js";
import { Schedule } from './schema/scheduleSchema.js'
import authRoute from "./routes/auth.js";


import { Dailies } from "./schema/DailiesSchema.js";

const client = new OAuth2Client();

const app = express();
const SECRET = process.env.SECRET;

app.use(bodyParser.json());

app.use(
  session({
    secret: process.env.CLIENT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      // maxAge: 60 * 60 * 1000, // 1 hour
      maxAge: 86400000, // 24 hours session
      secure: true,
      // sameSite: "none",
      sameSite: 'strict',
      
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: "https://journee.site",
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
    res.status(500).json({ message: "Internal server error" });
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
        date: todo.date 
      });
      await newTodo.save();
      console.log(newTodo);
      res.sendStatus(200);
    } else {
      console.log("Not found");
      res.status(500).json({ message: "User not found" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
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

app.put("/todos/:id", async (req, res) => {
  try {
    const todo = req.body;
    console.log(todo.completed);
    await ToDo.updateOne(
      { _id: req.params.id },
      { 
        todo: todo.todo, 
        completed: todo.completed, 
        data: todo.date 
      }
    );
    res.sendStatus(200);
    console.log("updated todo------------->");
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/dailies/add", async (req, res) => {
  try {
    const userEmail = req.headers.useremail;
    const user = await User.findOne({ email: userEmail });
    const { water, mood, sleep, quote } = req.body;
    if (!water || !mood || !sleep || !quote) {
      return res.status(500).json({ error: "all fields required." });
    }
    const newEntry = await Dailies.create({
      water,
      mood,
      sleep,
      quote,
      userId: user._id,
    });
    res.status(200).json(newEntry);
  } catch (e) {
    console.error(e);
    res.status(500).json(e);
  }
});


app.get('/dailies', async (req, res) => {
  try {
    const userEmail = req.header("user-email")
    // const entries = await Dailies.find({ userId }).sort({ createdAt: 'desc' })
    const user = await User.findOne({ email: userEmail });
    if (user) {
      const allDailies = await Dailies.find({ userId: user._id });
      res.json(allDailies);
    } else {
      console.log("Not found");
      res.status(500).json({ message: "User not found" });

    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
})

app.delete('/dailies/:id', async(req, res) => {
  try {
    await Dailies.deleteOne({_id: req.params.id})
    console.log("<------------daily deleted----------");
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
})

app.put("/dailies/:id" , async(req, res) => {
  try {
    const daily = req.body
    await Dailies.updateOne(
      { _id: req.params.id },
      {
        water: daily.water,
        mood: daily.mood,
        sleep: daily.sleep,
        quote: daily.quote
      }
    )
    res.sendStatus(200)
    console.log("<-----------updated daily------------->");
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
})

app.get("/schedules", async (req, res) => {
  try {
    const userEmail = req.header("user-email");
    const user = await User.findOne({ email: userEmail });
    if (user) {
      const allSchedules = await Schedule.find({ userId: user._id });
      res.json(allSchedules);
    } else {
      console.log("Not found");
      res.status(500).json({ message: "User not found" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/schedules/add", async (req, res) => {
  try {
    const userEmail = req.header("user-email");
    const user = await User.findOne({ email: userEmail });
    if (user) {
      const schedule = req.body;
      const newSchedule = new Schedule({
        date: schedule.date,
        time: schedule.time,
        event: schedule.event, 
        userId: user._id,
      });
      await newSchedule.save();
      console.log(newSchedule);
      res.sendStatus(200);
    } else {
      console.log("Not found");
      res.status(500).json({ message: "User not found" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete('/schedules/:id', async(req, res) => {
  try {
    await Schedule.deleteOne({_id: req.params.id})
    console.log("<------------schedule deleted----------");
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
})

app.put("/schedules/:id", async (req, res) => {
  try {
    const schedule = req.body;
    await Schedule.updateOne(
      { _id: req.params.id },
      { 
        date: schedule.date, 
        time: schedule.time, 
        event: schedule.event 
      }
    );
    res.sendStatus(200);
    console.log("updated schedule------------->");
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
});
