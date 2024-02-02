import "dotenv/config"
import express from "express"
import cors from "cors"
import bodyParser from "body-parser"
import mongoose from "mongoose"
import jwt from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'

const client = new OAuth2Client();

const app = express()
const SECRET = process.env.SECRET

app.use(cors())
app.use(bodyParser.json())

const port = process.env.PORT || 4000

app.listen(port, () => {
    console.log(`listening on port ${port}`);
})

mongoose.connect(process.env.DATABASE_URL);

const userSchema = new mongoose.Schema({
  email: {
  required: true,
  unique: true,
  type: String,
  },
  name: {
  required: true,
  type: String
  },
  // password: {
  // required: false,
  // type: String
  // },
  // authSource: {
  // enum: [“self”, “google”],
  // default: “self”
  // }
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

  app.post("/google-auth", async (req, res) => {
    const { credential, user_id } = req.body;
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: user_id,
      });
      const payload = ticket.getPayload();
      const { email, given_name } = payload;
  
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          email,
          name: given_name,
          // authSource: 'google'
        });
      }
      user.save()
      // const token = jwt.sign({ user }, SECRET);
      res.status(200).json({ payload, token });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });
  