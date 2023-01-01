const firebase = require("./middleware/firebase");
const express = require("express");
const db = firebase.firestore;
const pbk = require("pbkdf2");
const app = express();
app.use(express.json());

// Creates a user with password, no checks needed
app.post("/password", async (req, res) => {
  // Get the username and password from request
  const { username, password } = req.body;
  // Hash the password
  const passHashed = pbk
    .pbkdf2Sync(password, SALT, 1000, 32, "sha256")
    .toString();
  // Create the User
  await db.collection("user").doc(username).set({
    username: username,
    password: passHashed,
    salt: SALT
  });
  // Send message indicating success
  res.send("User Created");
});

// Verifies password
app.post("/verifyPassword", async (req, res) => {
  const { username, password } = req.body;
  // Hash the password
  const passHashed = pbk
    .pbkdf2Sync(password, SALT, 1000, 32, "sha256")
    .toString();
  // Get the user
  const check = await db.collection("user").doc(username).get();
  // Check if user exists
  if (!check.exists) {
    return res.status(400).send("User does not exist");
  }
  // Cross check the user's password with the passwordHash
  const user = check.data();
  // Check if passwords match
  if (passHashed === user.password) {
    // Send message indicating success
    res.send("Password Verified!");
  } else {
    // Send message indicating invalid password
    res.send("Password Invalid!");
  }
});

app.listen(4000, () => console.log("App listening on port 4000"));
