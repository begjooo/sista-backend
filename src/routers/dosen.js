import express from "express";
import { mongoDosenCol } from "../db/mongo/conn.js";
import { getFullDb, psqlGetDb, getFullData, psqlGetData, psqlUpdateData } from "../handler/psql.js";
import { mongodbGetList, mongodbGetData, mongodbUpdateData } from "../handler/mongodb.js";
import { combinePsqlAndMongodb } from "../handler/additional.js";

export const router = express.Router();

router.get('/list-full', async (req, res) => {
  const list = await getFullDb(`dosen`, `dosen`);
  console.log(list);
  res.send(list);
});

router.get('/list', async (req, res) => {
  const psqlData = await psqlGetDb(`dosen`, `dosen`);
  // console.log(psqlData);
  const mongodbData = await mongodbGetList(`dosen`);
  // console.log(mongodbData);
  const result = combinePsqlAndMongodb(psqlData, mongodbData);
  console.log(result);
  res.send(result);
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

  await mongodbUpdateData(`dosen`, username, { $set: { fullname } });

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

router.post('/:username/minat/tambah', async (req, res) => {
  const username = req.params.username;
  const minat = req.body;
  const result = await mongodbUpdateData(`dosen`, username, { $set: { minat } });
  res.send(result);
});

router.get('/:username/tugas-akhir/usulan/list', async (req, res) => {
  const username = req.params.username;
  const psqlData = await psqlGetData(`dosen`, username);
  // console.log(psqlData);
  const kbk = psqlData.kbk;

  const mongodbData = await mongodbGetData(`dosen`, username);
  // console.log(mongodbData);
  const minat = mongodbData.minat;
  const usulanTa = mongodbData.tugas_akhir;

  res.send({ kbk, minat, usulanTa });
});

router.post('/:username/tugas-akhir/usulan/tambah', async (req, res) => {
  const username = req.params.username;
  const usulanTa = req.body;
  const result = await mongodbUpdateData(`dosen`, username, { $push: { tugas_akhir: usulanTa } });
  res.send(result);
});

router.post('/:username/tugas-akhir/usulan/hapus', async (req, res) => {
  const username = req.params.username;
  const usulanIndex = req.body.index;
  const result = await mongodbUpdateData(`dosen`, username, { $unset: { [`tugas_akhir.${usulanIndex}`]: 1 } });
  await mongodbUpdateData(`dosen`, username, { $pull: { tugas_akhir: null } });
  res.send(result);
});