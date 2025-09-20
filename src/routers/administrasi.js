import express from "express";
import fs from "fs";
import multer from "multer";
import { admDirPath } from "../handler/berkas.js";
import { psql, psqlInsert } from "../handler/psql.js";

export const router = express.Router();

const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, admDirPath);
  },
  filename: function (req, file, cb) {
    console.log(file);
    cb(null, `${file.originalname}`);
  },
});

const multerAdministrasi = multer({ storage: localStorage });

router.post('/', multerAdministrasi.single(`file`), async (req, res) => {
  console.log(`post /administrasi`);
  const filePath = `/administrasi/${req.body.name}`;
  const updateDbResult = await psqlInsert(`template_dok`,
    `(kode, name, type, keterangan, path)`,
    `('${req.body.kode}', '${req.body.name}', '${req.body.type}', '${req.body.keterangan}', '${filePath}')`
  );

  if (!updateDbResult.status) {
    fs.unlinkSync(`${admDirPath}/${req.body.name}`);
  };

  res.send(true);
});

router.delete('/', async (req, res) => {
  console.log(`delete /administrasi`);
  const kodeFile = req.body.kode;

  let fileData = null;
  try {
    fileData = await psql.one(`select * from template_dok where kode = '${kodeFile}'`);
  } catch (error) {
    console.log(error.message)
  };

  try {
    await psql.one(`delete from template_dok where kode = '${kodeFile}'`);
  } catch (error) {
    console.log(error.message)
  };

  fs.unlinkSync(`./public${fileData.path}`);

  res.send(true);
});

router.get('/list', async (req, res) => {
  console.log(`get /administrasi/list`);
  const psqlTemplateDok = await psql.query(`select * from template_dok`);
  res.send(psqlTemplateDok);
});