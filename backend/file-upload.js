const express = require("express");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const { storage } = require("../firebase");
const cors = require("cors");

const files = express.Router();
files.use(cors());

files.get("/get_files/:file_name", async (req, res) => {
  try {
    const fileName = req.params.file_name;
    const fileLocation = path.join(__dirname, "../files", fileName);
    const downloadOption = {
      destination: fileLocation
    };
    if (!fs.existsSync(fileLocation)) {
      await storage.bucket().file(fileName).download(downloadOption);
    }
    return res.status(200).sendFile(fileLocation);
  } catch (error) {
    return res.status(404).send("No such file exists");
  }
});

files.post("/", multer().single("demo_image"), async (req, res) => {
  const file = req.file;
  if (file !== undefined) {
    // Upload file via buffers
    await storage
      .bucket()
      .file("profilePics/" + req.file.originalname)
      .save(req.file.buffer);
    return res.status(201).json({ msg: "Successfully uploaded" });
  }
  return res.status(400).json({ msg: "File could not be loaded" });
});

module.exports = files;
