import express from "express";
import { mongoDosenCol, mongoMhsCol } from "../db/mongo/conn.js";
import { getFullDb, psqlGetDb, getFullData, psqlGetData, psqlUpdateData } from "../handler/psql.js";
import { mongodbGetList, mongodbGetData, mongodbUpdateData } from "../handler/mongodb.js";
import { combinePsqlAndMongodb } from "../handler/additional.js";
import { ObjectId } from "mongodb";

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
  const usulanTa = mongodbData.usulan_ta;
  res.send({ kbk, minat, usulanTa });
});

router.get('/:username/tugas-akhir/usulan-mhs/list', async (req, res) => {
  const username = req.params.username;
  const mongodbData = await mongodbGetData(`dosen`, username);
  res.send(mongodbData.usulan_mhs);
});

router.post('/:username/tugas-akhir/usulan/tambah', async (req, res) => {
  const username = req.params.username;
  let usulanTa = { ...req.body };
  usulanTa.id = new ObjectId().toString();
  const result = await mongodbUpdateData(`dosen`, username, { $push: { usulan_ta: usulanTa } });
  res.send(result);
});

router.post('/:username/tugas-akhir/usulan/hapus', async (req, res) => {
  const username = req.params.username;
  const taId = req.body.taId;
  const result = await mongodbUpdateData(`dosen`, username, { $pull: { usulan_ta: { id: taId } } });
  res.send(result);
});

// khusus usulan dari mhs
router.post('/:username/tugas-akhir/usulan/diskusi', async (req, res) => {
  const username = req.params.username;
  const data = req.body;

  // update db mhs
  // simpen pesan dari pbb dan update tahap menjadi 'Diskusi'
  try {
    await mongoMhsCol.updateOne({ _id: username, [`usulan_ta.id`]: data.id }, { $set: { [`usulan_ta.$.tahap`]: 'Diskusi', [`usulan_ta.$.msg`]: data.message } });
  } catch (error) {
    console.log(error);
  };

  // update db dosen
  // simpen pesan dan update tahap menjadi 'Diskusi'
  try {
    await mongoDosenCol.updateOne({ _id: data.dosenUsername, [`usulan_mhs.id`]: data.id }, { $set: { [`usulan_mhs.$.tahap`]: 'Diskusi', [`usulan_mhs.$.msg`]: data.message } });
  } catch (error) {
    console.log(error);
  };

  res.send(true);
});

// khusus usulan dari mhs
router.post('/:username/tugas-akhir/usulan/terima', async (req, res) => {
  const username = req.params.username;
  const data = req.body;
  console.log(data);
  console.log(`terima`);

  // update db mhs
  // ambil data ta
  let taForMhsDb = {};
  try {
    const taData = await mongoMhsCol.findOne(
      { [`usulan_ta.id`]: data.id },
      { projection: { [`usulan_ta.$`]: 1 } },
    );

    taForMhsDb = taData.usulan_ta[0];
  } catch (error) {
    console.log(error.message);
  };

  delete taForMhsDb.tahap;
  delete taForMhsDb.msg;

  // pindahin ke bimbingan
  try {
    await mongoMhsCol.updateOne({ _id: data.mhsUsername }, { $set: { tugas_akhir: taForMhsDb } });
  } catch (error) {
    console.log(error.message);
  };

  // hapus ta di usulan_ta
  try {
    await mongoMhsCol.updateOne({ _id: data.mhsUsername }, { $pull: { usulan_ta: { id: data.id } } });
  } catch (error) {
    console.log(error.message);
  };


  // update db dosen
  // ambil data ta
  let taForDosenDb = {};
  try {
    const taData = await mongoDosenCol.findOne(
      { [`usulan_mhs.id`]: data.id },
      { projection: { [`usulan_mhs.$`]: 1 } },
    );

    taForDosenDb = taData.usulan_mhs[0];
  } catch (error) {
    console.log(error.message);
  };

  delete taForDosenDb.tahap;
  delete taForDosenDb.msg;

  // pindahin ke bimbingan
  try {
    await mongoDosenCol.updateOne({ _id: username }, { $push: { bimbingan: taForDosenDb } });
  } catch (error) {
    console.log(error.message);
  };

  // hapus ta di usulan_mhs
  try {
    await mongoDosenCol.updateOne({ _id: username }, { $pull: { usulan_mhs: { id: data.id } } });
  } catch (error) {
    console.log(error.message);
  };

  res.send(true);
});

router.post('/:username/tugas-akhir/usulan/tolak', async (req, res) => {
  const username = req.params.username;
  const data = req.body;
  console.log(data);
  console.log(`tolak`);
  // update db mhs

  // update db dosen
  try {
    await mongoDosenCol.updateOne({ _id: username }, { $pull: { usulan_mhs: { id: data.id } } });
  } catch (error) {
    console.log(error.message);
  };

  res.send(true);
});
