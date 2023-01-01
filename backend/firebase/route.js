const express = require("express");
const cors = require("cors");

const users = express.Router();
users.use(cors());
users.use(express.json());
