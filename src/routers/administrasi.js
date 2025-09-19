import express from "express";
import fs from "fs";
import multer from "multer";
import { admDirPath } from "../handler/berkas.js";

export const router = express.Router();

const localStorage = multer.diskStorage({
  destination: admDirPath,
  filename: function (req, file, cb) {
    console.log(`filename`);
    console.log(req.body.formData);
    cb(null, `${file.originalname}`);
  },
});

const multerAdministrasi = multer({ storage: localStorage });

router.post('/dok', multerAdministrasi.single(`file`), (req, res) => {
  console.log(`post /administrasi`);
  res.send(true);
});

router.get('/list', (req, res) => {
  console.log(`get /administrasi/list`);
  const docName = fs.readdirSync(admDirPath);
  const list = docName.map((item) => {
    return {
      name: item,
      path: `/administrasi/${item}`
    };
  });

  res.send(list);
});