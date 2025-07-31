import express from "express";
import { mongoDosenCol, mongoMhsCol } from "../db/mongo/conn.js";
import { psqlGetFullDb, psqlGetDb, psqlGetFullData, psqlGetData, psqlUpdateData } from "../handler/psql.js";
import { mongodbGetList, mongodbGetData, mongodbUpdateData } from "../handler/mongodb.js";
import { combinePsqlAndMongodb } from "../handler/additional.js";
import { ObjectId } from "mongodb";

export const router = express.Router();

router.get('/list-full', async (req, res) => {
  console.log(`/dosen/list-full`);
  const list = await psqlGetFullDb(`dosen`, `dosen`);
  res.send(list);
});

router.get('/list', async (req, res) => {
  console.log(`/dosen/list`);
  const psqlData = await psqlGetDb(`dosen`, `dosen`);
  const mongodbData = await mongodbGetList(`dosen`);
  const list = combinePsqlAndMongodb(psqlData, mongodbData);
  res.send(list);
});

router.get('/:username/data', async (req, res) => {
  console.log(`/dosen/:username/data`);
  const username = req.params.username;
  const data = await psqlGetData(`dosen`, username);
  res.send(data);
});

router.get('/:username/data-full', async (req, res) => {
  console.log(`/dosen/:username/data-full`);
  const username = req.params.username;
  const data = await psqlGetFullData(`dosen`, username);
  res.send(data);
});

router.put('/:username/profile', async (req, res) => {
  console.log(`/dosen/:username/profile`);
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

router.put('/:username/profile/password', async (req, res) => {
  console.log(`/dosen/:username/profile/password`);
  const username = req.params.username;
  const newPassword = req.body.password;
  await psqlUpdateData(`dosen`, username, `password = '${newPassword}'`);
  res.send(true);
});

router.get('/:username/minat', async (req, res) => {
  console.log(`/dosen/:username/minat`);
  const username = req.params.username;
  const result = await mongodbGetData(`dosen`, username);
  res.send(result);
});

router.post('/:username/minat', async (req, res) => {
  console.log(`/dosen/:username/minat`);
  const username = req.params.username;
  const minat = req.body;
  const result = await mongodbUpdateData(`dosen`, username, { $set: { minat } });
  res.send(result);
});

router.get('/:username/tugas-akhir/usulan', async (req, res) => {
  console.log(`/dosen/:username/tugas-akhir/usulan`);
  const username = req.params.username;
  const psqlData = await psqlGetData(`dosen`, username);
  const kbk = psqlData.kbk;

  const mongodbData = await mongodbGetData(`dosen`, username);
  const minat = mongodbData.minat;
  const usulanTa = mongodbData.usulan_ta;

  res.send({ kbk, minat, usulanTa });
});

router.post('/:username/tugas-akhir/usulan', async (req, res) => {
  console.log(`/dosen/:username/tugas-akhir/usulan`);
  const username = req.params.username;
  let usulanTa = { ...req.body };
  usulanTa.id = new ObjectId().toString();
  const result = await mongodbUpdateData(`dosen`, username, { $push: { usulan_ta: usulanTa } });
  res.send(result);
});

router.delete('/:username/tugas-akhir/usulan', async (req, res) => {
  console.log(`/dosen/:username/tugas-akhir/usulan`);
  const username = req.params.username;
  const taId = req.body.taId;
  const result = await mongodbUpdateData(`dosen`, username, { $pull: { usulan_ta: { id: taId } } });
  res.send(result);
});

router.get('/:username/tugas-akhir/usulan-mhs', async (req, res) => {
  console.log(`/dosen/:username/tugas-akhir/usulan-mhs`);
  const username = req.params.username;
  const mongodbData = await mongodbGetData(`dosen`, username);
  res.send(mongodbData.usulan_mhs);
});

// khusus usulan dari dosen
router.post('/:username/tugas-akhir/usulan/diskusi', async (req, res) => {
  console.log(`/dosen/:username/tugas-akhir/usulan/diskusi`);
  const username = req.params.username;
  const data = req.body;

  // update db mhs
  // simpen pesan dari pbb dan update tahap menjadi 'Diskusi'
  try {
    await mongoMhsCol.updateOne(
      { _id: data.mhsUsername, [`usulan_ta.id`]: data.id },
      {
        $set: {
          [`usulan_ta.$.tahap`]: 'Diskusi',
          [`usulan_ta.$.msg`]: data.message,
        }
      }
    );
  } catch (error) {
    console.log(error);
  };

  // update db dosen
  // pindahin dari mhs_pengusul ke mhs_diskusi dan tambahkan juga pesan dari dosen ke mhs
  try {
    await mongoDosenCol.updateOne(
      { _id: username, [`usulan_ta.id`]: data.id },
      {
        $push: {
          [`usulan_ta.$.mhs_diskusi`]: {
            username: data.mhsUsername,
            name: data.mhsName,
            degree: data.degree,
            msg: data.message,
          }
        }
      }
    );
  } catch (error) {
    console.log(error.message);
  };

  // hapus yg ada di mhs_pengusul
  try {
    await mongoDosenCol.updateOne(
      { _id: username, [`usulan_ta.id`]: data.id },
      {
        $pull: {
          [`usulan_ta.$.mhs_pengusul`]: {
            username: data.mhsUsername,
          }
        }
      }
    );
  } catch (error) {
    console.log(error.message);
  };

  res.send(true);
});

// khusus usulan dari mhs
router.post('/:username/tugas-akhir/usulan-mhs/diskusi', async (req, res) => {
  console.log(`/dosen/:username/tugas-akhir/usulan-mhs/diskusi`);
  const username = req.params.username;
  const data = req.body;

  // update db mhs
  // simpen pesan dari pbb dan update tahap menjadi 'Diskusi'
  try {
    await mongoMhsCol.updateOne(
      { _id: data.mhsUsername, [`usulan_ta.id`]: data.id },
      {
        $set: {
          [`usulan_ta.$.tahap`]: 'Diskusi',
          [`usulan_ta.$.msg`]: data.message,
        }
      }
    );
  } catch (error) {
    console.log(error);
  };

  // update db dosen
  // simpen pesan dan update tahap menjadi 'Diskusi'
  try {
    await mongoDosenCol.updateOne(
      { _id: username, [`usulan_mhs.id`]: data.id },
      {
        $set: {
          [`usulan_mhs.$.tahap`]: 'Diskusi',
          [`usulan_mhs.$.msg`]: data.message,
        }
      }
    );
  } catch (error) {
    console.log(error);
  };

  res.send(true);
});

router.post('/:username/tugas-akhir/usulan-mhs/terima', async (req, res) => {
  console.log(`/dosen/:username/tugas-akhir/usulan-mhs/terima`);
  const username = req.params.username;
  const data = req.body;
  console.log(data);
  console.log(`terima usulan-mhs`);

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
  delete taForMhsDb.type;

  // pindahin ke bimbingan
  try {
    await mongoMhsCol.updateOne(
      { _id: data.mhsUsername },
      { $set: { tugas_akhir: taForMhsDb } }
    );
  } catch (error) {
    console.log(error.message);
  };

  // hapus usulan_ta
  try {
    await mongoMhsCol.updateOne(
      { _id: data.mhsUsername },
      { $unset: { usulan_ta: '' } }
    );
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

router.post('/:username/tugas-akhir/usulan-mhs/tolak', async (req, res) => {
  console.log(`/dosen/:username/tugas-akhir/usulan-mhs/tolak`);
  const username = req.params.username;
  const data = req.body;
  console.log(data);
  console.log(`tolak`);
  // update db mhs

  // update db dosen
  // try {
  //   await mongoDosenCol.updateOne({ _id: username }, { $pull: { usulan_mhs: { id: data.id } } });
  // } catch (error) {
  //   console.log(error.message);
  // };

  res.send(true);
});

router.get('/:username/bimbingan/list', async (req, res) => {
  console.log(`/dosen/:username/bimbingan/list`);
  const username = req.params.username;
  // console.log(username);
  let list = [];
  try {
    list = await mongoDosenCol.findOne({ _id: username });
    // console.log(list);
    res.send(list.bimbingan);
  } catch (error) {
    console.log(error.message);
    res.send(false)
  };
});