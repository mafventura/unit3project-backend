import "dotenv/config"
import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import mongoose from "mongoose"

const app = express()

app.use(cors())
app.use(bodyParser.json())

const port = process.env.PORT || 4000

app.listen(port, () => {
    console.log(`listening on port ${port}`);
})

mongoose.connect(process.env.DATABASE_URL);

const userSchema = new mongoose.Schema({
    userEmail: {
      type: String,
      required: true,
    },
    lastLogin: {
      type: Date,
      required: true,
    },
  });

  const User = mongoose.model("User", userSchema);

  app.get("/", (req, res) => {
    res.json({ message: "server running - unit 3 project" });
  });

  app.get("/user/login", async (req, res) => {
    const user = await User.find({});
    res.json(user);
  });

  app.post("/user/login", async (req, res) => {
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