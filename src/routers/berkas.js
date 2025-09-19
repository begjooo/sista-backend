import express from "express";
import fs from "fs";
import multer from "multer";
import { taDirPath } from "../handler/berkas.js";

export const router = express.Router();

const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync(`${taDirPath}/${req.params.username}`)) {
      fs.mkdirSync(`${taDirPath}/${req.params.username}`);
    };

    cb(null, `${taDirPath}/${req.params.username}`);
  },
  filename: function (req, file, cb) {
    cb(null, `${file.originalname}`);
  },
});

const multerBerkasTa = multer({ storage: localStorage });

router.post('/ta/:username', multerBerkasTa.single(`file`), (req, res) => {
  console.log(`post /ta/:username`);
  res.send(true);
});