require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = 9000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGO_URI);
let users;

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.post("/signup", async (req, res) => {
  try {
    const { f_name, l_name, username, password } = req.body;

    if (!f_name || !l_name || !username || !password) {
      return res.status(400).json({
        message: "Please fill in every signup field.",
      });
    }

    const existingUser = await users.findOne({ username });

    if (existingUser) {
      return res.status(409).json({
        message: "That username already exists.",
      });
    }

    await users.insertOne({ f_name, l_name, username, password });

    res.status(201).json({
      message: "Account created successfully.",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Unable to create account. Please try again.",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Enter your username and password.",
      });
    }

    const user = await users.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({
        message: "Incorrect username or password.",
      });
    }

    res.json({
      message: `Login successful. Welcome, ${user.f_name}!`,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Unable to log in. Please try again.",
    });
  }
});

async function startServer() {
  await client.connect();

  const database = client.db("pa2_database");
  users = database.collection("users");

  await users.createIndex({ username: 1 }, { unique: true });

  console.log("Connected to MongoDB");

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Database connection failed:", error.message);
});
