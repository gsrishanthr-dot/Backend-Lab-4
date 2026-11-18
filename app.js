const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json()); // lets us read the JSON body of POST requests

const dbPath = path.join(__dirname, "users.db");
const PORT = process.env.PORT || 3000;

// Kept in a constant for now; moves to .env in Lab 8.
const SECRET_KEY = "MY_SECRET_TOKEN";

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });

    await db.exec(`
      CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        password TEXT NOT NULL
      );
    `);

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// POST /register/  -> create a user with a hashed password
app.post("/register/", async (request, response) => {
  try {
    const { username, name, password } = request.body;

    if (!username || !name || !password) {
      return response.status(400).send("username, name and password are required");
    }
    if (password.length < 6) {
      return response.status(400).send("Password is too short");
    }

    const selectUserQuery = `SELECT * FROM user WHERE username = ?;`;
    const dbUser = await db.get(selectUserQuery, [username]);

    if (dbUser !== undefined) {
      return response.status(400).send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createUserQuery = `
      INSERT INTO user (username, name, password)
      VALUES (?, ?, ?);
    `;
    await db.run(createUserQuery, [username, name, hashedPassword]);

    response.status(201).send("User created successfully");
  } catch (error) {
    console.log(`Register error: ${error.message}`);
    response.status(500).send("Internal server error");
  }
});

// POST /login/  -> verify credentials and return a JWT
app.post("/login/", async (request, response) => {
  try {
    const { username, password } = request.body;

    if (!username || !password) {
      return response.status(400).send("username and password are required");
    }

    const selectUserQuery = `SELECT * FROM user WHERE username = ?;`;
    const dbUser = await db.get(selectUserQuery, [username]);

    if (dbUser === undefined) {
      return response.status(400).send("Invalid user");
    }

    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (!isPasswordMatched) {
      return response.status(400).send("Invalid password");
    }

    // Only the username goes into the payload, never the password.
    const payload = { username: dbUser.username };
    const jwt_token = jwt.sign(payload, SECRET_KEY);
    response.status(200).send({ jwt_token });
  } catch (error) {
    console.log(`Login error: ${error.message}`);
    response.status(500).send("Internal server error");
  }
});

module.exports = app;
