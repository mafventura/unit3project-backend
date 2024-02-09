import "dotenv/config";
import express, { Router } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { OAuth2Client } from "google-auth-library";
import passport from "../../passport.js";
import session from "express-session";
import { User } from "../../schema/userSchema.js";
import { ToDo } from "../../schema/ToDosSchema.js";
import { Schedule } from '../../schema/scheduleSchema.js'
import { Dailies } from "../../schema/DailiesSchema.js";
import authRoute from "../../routes/auth.js";
import serverless from "serverless-http"

const client = new OAuth2Client();

const api = express();
const SECRET = process.env.SECRET;

api.use(bodyParser.json());

api.use(
  session({
    secret: "r8q,+&1LM3)CD*zAGpx1xm{NeQhc;#",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 }, // 1 hour
  })
);

api.use(passport.initialize());
api.use(passport.session());

api.use(
  cors()
);

api.use("/auth/", authRoute);

const router = Router()

router.get("/user/login", async (req, res) => {
  const user = await User.find({});
  res.json(user);
});

router.post("/users/add", async (req, res) => {
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

router.get("/todos", async (req, res) => {
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

router.post("/todos/add", async (req, res) => {
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

router.delete("/todos/:id", async (req, res) => {
  try {
    await ToDo.deleteOne({ _id: req.params.id });
    console.log("todo deleted----------");
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
  }
});

router.put("/todos/:id", async (req, res) => {
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

router.post("/dailies/add", async (req, res) => {
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


router.get('/dailies', async (req, res) => {
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

router.delete('/dailies/:id', async(req, res) => {
  try {
    await Dailies.deleteOne({_id: req.params.id})
    console.log("<------------daily deleted----------");
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
})

router.put("/dailies/:id" , async(req, res) => {
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

router.get("/schedules", async (req, res) => {
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

router.post("/schedules/add", async (req, res) => {
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

router.delete('/schedules/:id', async(req, res) => {
  try {
    await Schedule.deleteOne({_id: req.params.id})
    console.log("<------------schedule deleted----------");
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal server error" });
  }
})

router.put("/schedules/:id", async (req, res) => {
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

api.use("/api/", router)

export const handler = serverless(api)