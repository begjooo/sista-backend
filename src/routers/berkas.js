import express from "express";
import fs from "fs";
import multer from "multer";

export const router = express.Router();
const dirPath = `./public/berkas`;

router.post('/:username', (req, res) => {
  console.log(`post /berkas/:username`);
  const username = req.params.username;
  console.log(username);
  const body = req.body;
  console.log(body);
  console.log(req)
  res.send(true);
});

const mulUpload = multer({ dest: `./uploads` });

router.post('/multer/:username', mulUpload.single('file'), (req, res) => {
  console.log(`post /berkas/:username`);
  const username = req.params.username;
  console.log(username);
  const body = req.body;
  console.log(body);
  console.log(req);
  res.send(true);
});