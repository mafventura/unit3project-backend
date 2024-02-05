import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import passport from "./passport.js";
import session from "express-session";
import { User } from "./schema/userSchema.js";
// import passportSetup from "./passport.js";
import authRoute from "./routes/auth.js";

const client = new OAuth2Client();

const app = express();
const SECRET = process.env.SECRET;

// app.use(cors())
app.use(bodyParser.json());

app.use(
  // cookieSession({
  //   name: "session",
  //   keys: ["cyverwolve"],
  //   maxAge: 24 * 60 * 60 * 100,
  // })
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


// app.get("/", (req, res) => {
//   res.json({ message: "server running - unit 3 project" });
// });

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
    user.save();
    // const token = jwt.sign({ user }, SECRET);
    res.status(200).json({ payload, token });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
