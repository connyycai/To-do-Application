const firebase = require("./firebase/cred.js");
const express = require("express");
const app = express();
const cors = require("cors");
const db = firebase.firestore();
const pbk = require("pbkdf2");
const jwt = require("jsonwebtoken");

app.use(express.json());
app.use(cors());

app.get("/", async (req, res) => {
  const todo = db.collection("todos");
  const todos = await todo.get();
  const ret = todos.docs.map((obj) => obj.data());
  res.json(ret);
});

app.get("/:user_id", async (req, res) => {
  const todo = db.collection("todos");
  const user = req.params.user_id;
  const todos = await todo.where("email", "==", user).get();
  const ret = todos.docs.map((obj) => obj.data());
  res.json(ret);
});

function authMiddleware(req, res, next) {
  if (req.headers["authorization"]) {
    const headers = req.headers["authorization"].split(" ");
    if (headers.length === 2 && headers[0] === "Bearer") {
      let token = headers[1];
      try {
        let decodedToken = jwt.verify(token, process.env["JWTSECRET"]);
        req.user = decodedToken;
        next();
      } catch (e) {
        return res.status(401).json({ msg: e.message });
      }
    } else {
      return res.status(401).json({ msg: "invalid token" });
    }
  } else {
    return res.status(401).json({ msg: "token was not found in header" });
  }
}

//post
app.post("/", authMiddleware, async (req, res) => {
  const body = req.body;
  if (body.email === req.user) {
    const todos = db.collection("todos");
    const doc = await todos.add({
      todo: body.todo,
      email: body.email
    });
    await todos.doc(doc.id).update({
      todo: body.todo,
      email: body.email,
      uid: doc.id
    });
    res.status(200).send("OK");
  } else {
    res.status(401).send("Not authorized.");
  }
});

//delete
app.delete("/", authMiddleware, async (req, res) => {
  const body = req.body;
  if (body.email === req.user) {
    const todo = db.collection("todos");
    const ret = await todo.doc(body.uid).delete();
    res.json(ret);
  } else {
    res.status(401).send("Not authorized.");
  }
});

app.post("/register", async (req, res) => {
  // Get the username and password
  const { username, password } = req.body;
  // Hash password
  const passHashed = pbk
    .pbkdf2Sync(password, process.env["SALT"], 1000, 32, "sha256")
    .toString();
  // Check duplicate
  const check = await db.collection("user").doc(username).get();
  if (check.exists) {
    return res.status(400).json({ msg: "User exists" });
  }
  const user = await db.collection("user").doc(username).set({
    username: username,
    password: passHashed,
    salt: process.env["SALT"]
  });
  const token = jwt.sign(username, process.env["JWTSECRET"]);
  if (!token) {
    return res.status(403).send({
      message: "No token provided!"
    });
  }

  res.json({
    msg: "Successfully created",
    data: { username: username },
    token: token
  });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log("username " + username);
  console.log("password " + password);
  // Hash the password
  const passHashed = pbk
    .pbkdf2Sync(password, process.env["SALT"], 1000, 32, "sha256")
    .toString();
  // Get the user
  const check = await db.collection("user").doc(username).get();
  // Check if user exists
  if (!check.exists) {
    return res.status(400).json({ msg: "User does not exist" });
  }
  // Cross reference the stored password with the incoming password (hashed)
  const user = check.data();
  // Check if passwords match
  if (passHashed === user.password) {
    // Issue token if passwords match
    const token = jwt.sign(username, process.env["JWTSECRET"]);
    return res.json({
      msg: "Successfully logged in",
      data: { username: username },
      token: token
    });
  } else {
    // Return a 401 if passwords do not match
    return res.status(401).json({ msg: "Username or password was incorrect" });
  }
});

app.listen(process.env["PORT"], () =>
  console.log(`App listening on port ${process.env["PORT"]}`)
);
