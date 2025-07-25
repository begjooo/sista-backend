import express from "express";
import { getFullDb, getDb, getFullData, psqlGetData, psqlUpdateData } from "../handler/psql.js";
import { mongodbGetData, mongodbUpdateData } from "../handler/mongodb.js";

export const router = express.Router();

router.get('/list-full', async (req, res) => {
  const list = await getFullDb(`dosen`, `dosen`);
  console.log(list);
  res.send(list);
});

router.get('/list', async (req, res) => {
  const list = await getDb(`dosen`);
  res.send(list);
});

router.get('/data/:username', async (req, res) => {
  const username = req.params.username;
  const data = await psqlGetData(`dosen`, username);
  res.send(data);
});

router.get('/data-full/:username', async (req, res) => {
  const username = req.params.username;
  const data = await getFullData(`dosen`, username);
  res.send(data);
});

router.post('/data/:username/profile/edit', async (req, res) => {
  const username = req.params.username;
  const data = req.body;

  let fullname = '';
  if (data.gelar_depan) {
    fullname = `${data.gelar_depan} `;
  };

  if (data.gelar_belakang) {
    fullname += `${data.name}, ${data.gelar_belakang}`;
  };

  await psqlUpdateData(`dosen`, username,
    `name = '${data.name}', email = '${data.email}', kode = '${data.kode}',
    kbk = '${data.kbk}', gelar_depan = '${data.gelar_depan}', gelar_belakang = '${data.gelar_belakang}',
    fullname = '${fullname}', jabatan_fungsional = '${data.jabatan_fungsional}'`
  );

  await mongodbUpdateData(`dosen`, username, { fullname });

  res.send(true);
});

router.post('/data/:username/profile/edit/password', async (req, res) => {
  const username = req.params.username;
  const newPassword = req.body.password;
  await psqlUpdateData(`dosen`, username, `password = '${newPassword}'`);
  res.send(true);
});

router.get('/data/:username/minat', async (req, res) => {
  const username = req.params.username;
  const result = await mongodbGetData(`dosen`, username);
  res.send(result);
});

router.get('/:username/tugas-akhir/usulan', async (req, res) => {
  const username = req.params.username;
  // console.log(username);
  const psqlData = await psqlGetData(`dosen`, username);
  const kbk = psqlData.kbk;
  // console.log(kbk);
  const mongodbData = await mongodbGetData(`dosen`, username);
  // console.log(mongodbData);
  const minat = mongodbData.minat;
  // console.log(minat);
  const result = { kbk, minat };
  console.log(result);
  res.send(result);
});

router.get('/:username/tugas-akhir/usulan/tambah', async (req, res) => {
  const username = req.params.username;
  const usulanTa = req.body;
  console.log(usulanTa);
  // const result = await mongodbGetData(`dosen`, username);
  res.send();
});

router.get('/:username/tugas-akhir/usulan/hapus', async (req, res) => {
  const username = req.params.username;
  const usulanTa = req.body;
  console.log(usulanTa);
  // const result = await mongodbGetData(`dosen`, username);
  res.send(true);
});