import express from "express";
import { psqlGetList, psqlGetData, psqlUpdateData } from "../handler/psql.js";
import { mongoDosenCol, mongoMhsCol, mongoTaCol, mongodbGetList, mongodbGetData, mongodbUpdateData } from "../handler/mongo.js";
import { combinePsqlMongo } from "../handler/additional.js";
import { ObjectId } from "mongodb";

export const router = express.Router();

router.get('/list', async (req, res) => {
  console.log(`get /dosen/list`);
  const psqlData = await psqlGetList(`dosen`, `dosen`);
  const mongodbData = await mongodbGetList(`dosen`);
  const list = combinePsqlMongo(psqlData, mongodbData);
  res.send(list);
});

router.get('/list-full', async (req, res) => {
  console.log(`get /dosen/list-full`);
  const psqlData = await psqlGetList(`dosen`, `dosen`);
  const mongodbData = await mongodbGetList(`dosen`);
  const list = combinePsqlMongo(psqlData, mongodbData);
  res.send(list);
});

router.get('/:username/data', async (req, res) => {
  console.log(`get /dosen/:username/data`);
  const username = req.params.username;
  const psqlData = await psqlGetData(`dosen`, username);
  res.send(psqlData);
});

router.get('/:username/data-full', async (req, res) => {
  console.log(`get /dosen/:username/data-full`);
  const username = req.params.username;
  const psqlData = await psqlGetData(`dosen`, username, true);
  const mongodbData = await mongodbGetData(`dosen`, username);
  const data = { ...psqlData, minat: mongodbData.minat };
  res.send(data);
});

router.put('/:username/profile', async (req, res) => {
  console.log(`put /dosen/:username/profile`);
  const username = req.params.username;
  const data = req.body;

  let fullname = '';
  if (data.gelar_depan) {
    fullname = `${data.gelar_depan} `;
  } else {
    data.gelar_depan = '';
  };

  if (data.gelar_belakang) {
    fullname += `${data.name}, ${data.gelar_belakang}`;
  };

  console.log(fullname);

  await psqlUpdateData(`dosen`, username,
    `name = '${data.name}', email = '${data.email}', nip = '${data.nip}',
    kbk = '${data.kbk}', gelar_depan = '${data.gelar_depan}', gelar_belakang = '${data.gelar_belakang}',
    fullname = '${fullname}', jabatan_fungsional = '${data.jabatan_fungsional}'`
  );

  await mongodbUpdateData(`dosen`, username, { $set: { fullname } });

  res.send(true);
});

router.put('/:username/profile/password', async (req, res) => {
  console.log(`put /dosen/:username/profile/password`);
  const username = req.params.username;
  const newPassword = req.body.password;
  await psqlUpdateData(`dosen`, username, `password = '${newPassword}'`);
  res.send(true);
});

router.get('/:username/penelitian', async (req, res) => {
  console.log(`get /dosen/:username/penelitian`);
  const username = req.params.username;
  const mongodbData = await mongodbGetData(`dosen`, username);
  res.send(mongodbData);
});

router.post('/:username/penelitian/minat', async (req, res) => {
  console.log(`post /dosen/:username/penelitian/minat`);
  const username = req.params.username;
  const minat = req.body.minat;

  try {
    await mongoDosenCol.updateOne({ _id: username }, { $push: { minat: minat } });
    res.send({
      message: `add new minat success`,
      status: true,
    });
  } catch (error) {
    res.send({
      message: error.message,
      status: false,
    });
  };
});

router.delete('/:username/penelitian/minat', async (req, res) => {
  console.log(`delete /dosen/:username/penelitian/minat`);
  const username = req.params.username;
  const index = req.body.index;

  try {
    await mongoDosenCol.updateOne({ _id: username }, { $unset: { [`minat.${index}`]: '' } });
    await mongoDosenCol.updateOne({ _id: username }, { $pull: { minat: null } });
    res.send({
      message: `delete minat success`,
      status: true,
    });
  } catch (error) {
    res.send({
      message: error.message,
      status: false,
    });
  };
});

// usulan judul dari dosen
router.get('/:username/tugas-akhir/usulan-dosen', async (req, res) => {
  console.log(`get /dosen/:username/tugas-akhir/usulan-dosen`);
  const username = req.params.username;
  const psqlData = await psqlGetData(`dosen`, username);
  const mongodbData = await mongodbGetData(`dosen`, username);

  res.send({
    kbk: psqlData.kbk,
    minat: mongodbData.minat,
    usulanTa: mongodbData.usulan_ta,
    jmlBimbinganUtama: mongodbData.bimbingan_utama.length,
  });
});

router.post('/:username/tugas-akhir/usulan-dosen', async (req, res) => {
  console.log(`post /dosen/:username/tugas-akhir/usulan-dosen`);
  const username = req.params.username;
  let usulanTa = {
    id: new ObjectId().toString(),
    ...req.body
  };
  const result = await mongodbUpdateData(`dosen`, username, { $push: { usulan_ta: usulanTa } });
  res.send(result);
});

router.delete('/:username/tugas-akhir/usulan-dosen', async (req, res) => {
  console.log(`delete /dosen/:username/tugas-akhir/usulan-dosen`);
  const username = req.params.username;
  const taId = req.body.taId;

  // hapus ta di db dosen
  try {
    await mongoDosenCol.updateOne({ _id: username }, { $pull: { usulan_ta: { id: taId } } })
  } catch (error) {
    console.log(error.message);
    res.send({
      status: false,
      message: error.message,
    });
  };

  // hapus semua ta pada db mhs
  try {
    await mongoMhsCol.updateMany({}, { $pull: { usulan_ta: { id: taId } } })
  } catch (error) {
    console.log(error.message);
    res.send({
      status: false,
      message: error.message,
    });
  };

  res.send({
    status: true,
    message: `success delete ta ${taId}`,
  });
});

router.delete('/:username/tugas-akhir/usulan-dosen/tolak', async (req, res) => {
  console.log(`delete /dosen/:username/tugas-akhir/usulan-dosen/tolak`);
  const username = req.params.username;
  const taId = req.body.taId;
  const mhsUsername = req.body.mhsUsername;

  // hapus mhs di dalam mhs_pengusul pada db dosen
  try {
    await mongoDosenCol.updateOne(
      { _id: username, [`usulan_ta.id`]: taId },
      {
        $pull: {
          [`usulan_ta.$.mhs_pengusul`]: {
            username: mhsUsername,
          }
        }
      }
    );
  } catch (error) {
    console.log(error.message);
    res.send({
      status: false,
      message: error.message,
    });
  };

  // hapus usulan_ta pada db mhs terkait
  try {
    await mongoMhsCol.updateOne(
      { _id: mhsUsername },
      { $pull: { usulan_ta: { id: taId } } }
    );
  } catch (error) {
    console.log(error.message);
    res.send({
      status: false,
      message: error.message,
    });
  };

  res.send({
    status: true,
    message: `success delete ta ${taId}`,
  });
});

router.post('/:username/tugas-akhir/usulan-dosen/diskusi', async (req, res) => {
  console.log(`post /dosen/:username/tugas-akhir/usulan-dosen/diskusi`);
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

router.delete('/:username/tugas-akhir/usulan-dosen/diskusi', async (req, res) => {
  console.log(`delete /dosen/:username/tugas-akhir/usulan-dosen/diskusi`);
  const username = req.params.username;
  const data = req.body;

  // hapus id usulan_ta pada db mhs
  try {
    await mongoMhsCol.updateOne(
      { _id: data.mhsUsername },
      { $pull: { usulan_ta: { id: data.taId } } }
    );
  } catch (error) {
    console.log(error.message);
    res.send(false);
  };

  // hapus mhs pada mhs_diskusi pada db dosen
  try {
    await mongoDosenCol.updateOne(
      { _id: username, [`usulan_ta.id`]: data.taId },
      {
        $pull: {
          [`usulan_ta.$.mhs_diskusi`]: {
            username: data.mhsUsername,
          }
        }
      }
    );
  } catch (error) {
    console.log(error.message);
    res.send(false);
  };

  res.send(true);
});

router.post('/:username/tugas-akhir/usulan-dosen/terima', async (req, res) => {
  console.log(`post /dosen/:username/tugas-akhir/usulan-dosen/terima`);
  const username = req.params.username;
  const data = req.body;

  // update db mhs
  // ambil data ta dari usulan_ta
  let mhsTaData = {};
  try {
    const response = await mongoMhsCol.findOne(
      { _id: data.mhsUsername, [`usulan_ta.id`]: data.taId },
      { projection: { [`usulan_ta.$`]: 1 } },
    );

    mhsTaData = { ...response.usulan_ta[0] };
  } catch (error) {
    res.send(false);
    console.log(error.message);
  };

  // pindahin mhsTaData ke field tugas_akhir
  try {
    await mongoMhsCol.updateOne(
      { _id: data.mhsUsername },
      {
        $set: {
          tugas_akhir: {
            id: data.taId,
            dosen1_username: mhsTaData.dosen1_username,
            dosen1_fullname: mhsTaData.dosen1_fullname,
            dosen2_username: '',
            dosen2_fullname: '',
            dosen3_username: '',
            dosen3_fullname: '',
          }
        }
      },
    );
  } catch (error) {
    console.log(error.message);
    res.send(false);
  };

  // hapus usulan_ta pada mhs terkait
  try {
    await mongoMhsCol.updateOne(
      { _id: data.mhsUsername },
      { $unset: { usulan_ta: '' } },
    );
  } catch (error) {
    console.log(error.message);
    res.send(false);
  };

  // hapus semua ta pada db mhs
  try {
    await mongoMhsCol.updateMany({}, { $pull: { usulan_ta: { id: data.taId } } })
  } catch (error) {
    console.log(error.message);
    res.send(false);
  };

  // update db dosen
  // tambahkan field bimbingan_utama[]
  try {
    await mongoDosenCol.updateOne(
      { _id: username },
      {
        $push: {
          bimbingan_utama: {
            id: data.taId,
            mhs_username: data.mhsUsername,
            mhs_name: data.mhsName,
          }
        }
      },
    );
  } catch (error) {
    console.log(error.message);
    res.send(false);
  };

  // hapus ta pada usulan_ta
  try {
    await mongoDosenCol.updateOne(
      { _id: username },
      { $pull: { usulan_ta: { id: data.taId } } },
    );
  } catch (error) {
    console.log(error.message);
    res.send(false);
  };

  // hapus semua permintaan mhs terkait di dalam usulan_ta (mhs_pengusul dan mhs_diskusi) pada seluruh dosen db
  try {
    await mongoDosenCol.updateMany(
      {},
      { $pull: { [`usulan_ta.$[].mhs_pengusul`]: { username: data.mhsUsername } } },
    );
  } catch (error) {
    // console.log(`mhs_pengusul: ${error.message}`);
    console.log(`mhs_pengusul: mhs username not found`);
  };

  try {
    await mongoDosenCol.updateMany(
      {},
      { $pull: { [`usulan_ta.$[].mhs_diskusi`]: { username: data.mhsUsername } } },
    );
  } catch (error) {
    // console.log(`mhs_diskusi: ${error.message}`);
    console.log(`mhs_diskusi: mhs username not found`);
  };

  // hapus semua permintaan mhs terkait di dalam usulan_mhs pada seluruh dosen db
  try {
    await mongoDosenCol.updateMany(
      {},
      { $pull: { [`usulan_mhs`]: { username: data.mhsUsername } } },
    );
  } catch (error) {
    // console.log(`mhs_diskusi: ${error.message}`);
    console.log(`usulan_mhs: ta id not found`);
  };

  // update tugas_akhir db
  // ambil tahun_ajaran mhs
  const mhsPsqlDb = await psqlGetData('mahasiswa', data.mhsUsername);

  let taData = {
    _id: data.taId,
    judul: mhsTaData.judul,
    skema: mhsTaData.skema,
    kbk: mhsTaData.kbk,
    minat: mhsTaData.minat,
    mhs_username: data.mhsUsername,
    mhs_name: data.mhsName,
    tahun: mhsPsqlDb.tahun_ajaran,
    tahap: 'Proposal',
    dosen1_username: mhsTaData.dosen1_username,
    dosen1_fullname: mhsTaData.dosen1_fullname,
    dosen1_bimbingan: [],
    dosen2_username: '',
    dosen2_fullname: '',
    dosen2_bimbingan: [],
    dosen3_username: '',
    dosen3_fullname: '',
    dosen3_bimbingan: [],
  };

  try {
    await mongoTaCol.insertOne(taData);
  } catch (error) {
    console.log(error.message);
    res.send(false);
  };

  // check jumlah bimbingan utama
  // jika kuota penuh maka hapus semua usulan dari mhs termasuk usulan judul dari pbb
  // jika kuota tidak penuh maka aman
  const maxBimbinganUtama = 6;
  let jmlBimbinganUtama = null;
  try {
    const response = await mongoDosenCol.findOne(
      { _id: username },
    );

    jmlBimbinganUtama = response.bimbingan_utama.length;
  } catch (error) {
    console.log(error.message);
    res.send(false);
  };

  if (jmlBimbinganUtama === maxBimbinganUtama) {
    // hapus semua usulan pada dosen db
    try {
      await mongoDosenCol.updateOne(
        { _id: username },
        { $set: { usulan_ta: [], usulan_mhs: [] } }
      );
    } catch (error) {
      console.log(error.message);
      res.send(false);
    };

    // hapus semua usulan mhs ke dosen terkait pada mhs db
    try {
      await mongoMhsCol.updateMany(
        {},
        { $pull: { usulan_ta: { dosen1_username: username } } }
      );
    } catch (error) {
      console.log(error.message);
      res.send(false);
    };
  };

  res.send(true);
});

// usulan dari mhs
router.get('/:username/tugas-akhir/usulan-mhs', async (req, res) => {
  console.log(`get /dosen/:username/tugas-akhir/usulan-mhs`);
  const username = req.params.username;
  const mongodbData = await mongodbGetData(`dosen`, username);
  if (mongodbData.usulan_mhs) {
    res.send(mongodbData.usulan_mhs);
  } else {
    res.send(false)
  };
});

router.post('/:username/tugas-akhir/usulan-mhs/diskusi', async (req, res) => {
  console.log(`post /dosen/:username/tugas-akhir/usulan-mhs/diskusi`);
  const username = req.params.username;
  const data = req.body;

  // update db mhs
  // simpen pesan dari pbb dan update tahap menjadi 'Diskusi'
  try {
    await mongoMhsCol.updateOne(
      { _id: data.mhsUsername, [`usulan_ta.id`]: data.taId },
      {
        $set: {
          [`usulan_ta.$.tahap`]: 'Diskusi',
          [`usulan_ta.$.msg`]: data.message,
        }
      }
    );
  } catch (error) {
    console.log(error.message);
    res.send(false);
  };

  // update db dosen
  // simpen pesan dan update tahap menjadi 'Diskusi'
  try {
    await mongoDosenCol.updateOne(
      { _id: username, [`usulan_mhs.id`]: data.taId },
      {
        $set: {
          [`usulan_mhs.$.tahap`]: 'Diskusi',
          [`usulan_mhs.$.msg`]: data.message,
        }
      }
    );
  } catch (error) {
    console.log(error.message);
    res.send(false);
  };

  res.send(true);
});

router.post('/:username/tugas-akhir/usulan-mhs/tolak', async (req, res) => {
  console.log(`post /dosen/:username/tugas-akhir/usulan-mhs/tolak`);
  const username = req.params.username;
  const data = req.body;

  // update db mhs
  try {
    await mongoMhsCol.updateOne({ _id: data.mhsUsername }, { $pull: { usulan_ta: { id: data.id } } });
  } catch (error) {
    console.log(error.message);
    res.send({
      status: false,
      message: error.message,
    });
  };

  // update db dosen
  try {
    await mongoDosenCol.updateOne({ _id: username }, { $pull: { usulan_mhs: { id: data.id } } });
  } catch (error) {
    console.log(error.message);
    res.send({
      status: false,
      message: error.message,
    });
  };

  res.send({
    status: true,
    message: `tolak usulan mhs success`,
  });
});

router.post('/:username/tugas-akhir/usulan-mhs/terima', async (req, res) => {
  console.log(`post /dosen/:username/tugas-akhir/usulan-mhs/terima`);
  const username = req.params.username;
  const data = req.body;
  // console.log(username);
  // console.log(data);

  // update db mhs
  // ambil data ta
  let mhsTaData = {};
  try {
    const taData = await mongoMhsCol.findOne(
      { [`usulan_ta.id`]: data.taId },
      { projection: { [`usulan_ta.$`]: 1 } },
    );

    mhsTaData = taData.usulan_ta[0];
  } catch (error) {
    console.log(error.message);
    res.send(false);
  };

  // console.log(mhsTaData);

  // pindahin ke mhsTaData ke field tugas_akhir
  try {
    await mongoMhsCol.updateOne(
      { _id: data.mhsUsername },
      {
        $set: {
          tugas_akhir: {
            id: data.taId,
            dosen1_username: mhsTaData.dosen1_username,
            dosen1_fullname: mhsTaData.dosen1_fullname,
            dosen2_username: '',
            dosen2_fullname: '',
            dosen3_username: '',
            dosen3_fullname: '',
          }
        }
      }
    );
  } catch (error) {
    console.log(error.message);
    res.send(false);
  };

  // hapus usulan_ta pada mhs terkait
  try {
    await mongoMhsCol.updateOne(
      { _id: data.mhsUsername },
      { $unset: { usulan_ta: '' } }
    );
  } catch (error) {
    console.log(error.message);
    res.send(false);
  };

  // update db dosen
  // tambahkan field bimbingan_utama[]
  try {
    await mongoDosenCol.updateOne(
      { _id: username },
      {
        $push: {
          bimbingan_utama: {
            id: data.taId,
            mhs_username: data.mhsUsername,
            mhs_name: data.mhsName,
          }
        }
      }
    );
  } catch (error) {
    console.log(error.message);
    res.send(false);
  };

  // hapus ta di usulan_mhs
  try {
    await mongoDosenCol.updateOne(
      { _id: username },
      { $pull: { usulan_mhs: { id: data.taId } } },
    );
  } catch (error) {
    console.log(error.message);
    res.send(false);
  };

  // hapus semua permintaan mhs terkait di dalam usulan_ta (mhs_pengusul dan mhs_diskusi) pada seluruh dosen db
  try {
    await mongoDosenCol.updateMany(
      {},
      { $pull: { [`usulan_ta.$[].mhs_pengusul`]: { username: data.mhsUsername } } },
    );
  } catch (error) {
    console.log(`mhs_pengusul: mhs username not found`);
  };

  try {
    await mongoDosenCol.updateMany(
      {},
      { $pull: { [`usulan_ta.$[].mhs_diskusi`]: { username: data.mhsUsername } } },
    );
  } catch (error) {
    console.log(`mhs_diskusi: mhs username not found`);
  };

  // hapus semua permintaan mhs terkait di dalam usulan_mhs pada seluruh dosen db
  try {
    await mongoDosenCol.updateMany(
      {},
      { $pull: { [`usulan_mhs`]: { username: data.mhsUsername } } },
    );
  } catch (error) {
    console.log(`usulan_mhs: ta id not found`);
  };

  // update tugas_akhir db
  // ambil tahun_ajaran mhs
  const mhsPsqlDb = await psqlGetData('mahasiswa', data.mhsUsername);

  let taData = {
    _id: data.taId,
    judul: mhsTaData.judul,
    skema: mhsTaData.skema,
    kbk: mhsTaData.kbk,
    minat: mhsTaData.minat,
    mhs_username: data.mhsUsername,
    mhs_name: data.mhsName,
    tahun: mhsPsqlDb.tahun_ajaran,
    tahap: 'Proposal',
    dosen1_username: mhsTaData.dosen1_username,
    dosen1_fullname: mhsTaData.dosen1_fullname,
    dosen1_bimbingan: [],
    dosen2_username: '',
    dosen2_fullname: '',
    dosen2_bimbingan: [],
    dosen3_username: '',
    dosen3_fullname: '',
    dosen3_bimbingan: [],
  };

  try {
    await mongoTaCol.insertOne(taData);
  } catch (error) {
    console.log(error.message);
    res.send(false);
  };

  // check jumlah bimbingan utama
  // jika kuota penuh maka hapus semua usulan dari mhs termasuk usulan judul dari pbb
  // jika kuota tidak penuh maka aman
  const maxBimbinganUtama = 6;
  let jmlBimbinganUtama = null;
  try {
    const response = await mongoDosenCol.findOne(
      { _id: username },
    );

    jmlBimbinganUtama = response.bimbingan_utama.length;
  } catch (error) {
    console.log(error.message);
    res.send(false);
  };

  if (jmlBimbinganUtama === maxBimbinganUtama) {
    // hapus semua usulan pada dosen db
    try {
      await mongoDosenCol.updateOne(
        { _id: username },
        { $set: { usulan_ta: [], usulan_mhs: [] } }
      );
    } catch (error) {
      console.log(error.message);
      res.send(false);
    };

    // hapus semua usulan mhs ke dosen terkait pada mhs db
    try {
      await mongoMhsCol.updateMany(
        {},
        { $pull: { usulan_ta: { dosen1_username: username } } }
      );
    } catch (error) {
      console.log(error.message);
      res.send(false);
    };
  };

  res.send(true);
});

router.get('/:username/tugas-akhir/usulan-pdp', async (req, res) => {
  console.log(`get /dosen/:username/tugas-akhir/usulan-pdp`);
  const username = req.params.username;
  const dosenData = await mongodbGetData(`dosen`, username);
  if (dosenData.usulan_pdp) {
    res.send(dosenData.usulan_pdp);
  } else {
    res.send(false);
  };
});

router.post('/:username/tugas-akhir/usulan-pdp/diskusi', async (req, res) => {
  console.log(`post /dosen/:username/tugas-akhir/usulan-pdp/diskusi`);
  const username = req.params.username;
  const data = req.body;

  // update db mhs
  // simpen pesan dari pbb dan update tahap menjadi 'Diskusi'
  try {
    await mongoMhsCol.updateOne(
      { _id: data.mhsUsername, [`usulan_pdp.ta_id`]: data.id },
      {
        $set: {
          [`usulan_pdp.$.tahap`]: 'Diskusi',
          [`usulan_pdp.$.msg`]: data.message,
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
      { _id: username, [`usulan_pdp._id`]: data.id },
      {
        $set: {
          [`usulan_pdp.$.tahap_usulan`]: 'Diskusi',
          [`usulan_pdp.$.msg`]: data.message,
        }
      }
    );
  } catch (error) {
    console.log(error.message);
  };

  res.send(true);
});

router.post('/:username/tugas-akhir/usulan-pdp/tolak', async (req, res) => {
  console.log(`post /dosen/:username/tugas-akhir/usulan-pdp/tolak`);
  const username = req.params.username;
  const taId = req.body.taId;
  const mhsUsername = req.body.mhsUsername;
  console.log(req.body);

  // hapus mhs pada db dosen
  try {
    await mongoDosenCol.updateOne(
      { _id: username },
      { $pull: { usulan_pdp: { _id: taId } } }
    );
  } catch (error) {
    console.log(error.message);
    res.send({
      status: false,
      message: error.message,
    });
  };

  // hapus usulan_pdp pada db mhs terkait
  try {
    await mongoMhsCol.updateOne(
      { _id: mhsUsername },
      { $pull: { usulan_pdp: { ta_id: taId } } }
    );
  } catch (error) {
    console.log(error.message);
    res.send({
      status: false,
      message: error.message,
    });
  };

  res.send({
    status: true,
    message: `success delete ta ${taId}`,
  });
});

router.post('/:username/tugas-akhir/usulan-pdp/terima', async (req, res) => {
  console.log(`post /dosen/:username/tugas-akhir/usulan-pdp/terima`);
  const username = req.params.username;
  const data = req.body;
  console.log(data);

  // update db dosen
  try {
    await mongoDosenCol.updateOne(
      { _id: username },
      {
        $push: {
          bimbingan_pdp: {
            id: data.taId,
            degree: data.degree,
            mhs_username: data.mhsUsername,
            mhs_name: data.mhsName,
          }
        }
      }
    );
  } catch (error) {
    console.log(error.message);
    res.send(false);
  };

  try {
    await mongoDosenCol.updateOne(
      { _id: username },
      { $pull: { usulan_pdp: { _id: data.taId } } }
    );
  } catch (error) {
    console.log(error.message);
    res.send(false);
  };

  const dosenPsqlData = await psqlGetData(`dosen`, username);

  // update db mhs
  try {
    if (data.degree === 'Pembimbing Pendamping Pertama') {
      await mongoMhsCol.updateOne(
        { _id: data.mhsUsername },
        {
          $set: {
            'tugas_akhir.dosen2_username': username,
            'tugas_akhir.dosen2_fullname': dosenPsqlData.fullname,
          }
        }
      );
    } else if (data.degree === 'Pembimbing Pendamping Kedua') {
      await mongoMhsCol.updateOne(
        { _id: data.mhsUsername },
        {
          $set: {
            'tugas_akhir.dosen3_username': username,
            'tugas_akhir.dosen3_fullname': dosenPsqlData.fullname,
          }
        }
      );
    };

  } catch (error) {
    console.log(error.message);
    res.send(false);
  };

  let updatedData = {};
  if (data.degree === 'Pembimbing Pendamping Pertama') {
    updatedData = {
      dosen2_username: username,
      dosen2_fullname: dosenPsqlData.fullname,
    };
  } else if (data.degree === 'Pembimbing Pendamping Kedua') {
    updatedData = {
      dosen3_username: username,
      dosen3_fullname: dosenPsqlData.fullname,
    };
  };

  try {
    await mongoMhsCol.updateOne(
      { _id: data.mhsUsername },
      { $pull: { usulan_pdp: { ta_id: data.taId } } }
    );
  } catch (error) {
    console.log(error.message);
    res.send(false);
  };

  // update db tugas_akhir
  try {
    await mongoTaCol.updateOne(
      { _id: data.taId },
      { $set: updatedData }
    );
  } catch (error) {
    console.log(error.message);
    res.send(false);
  };

  res.send(true);
});

router.get('/:username/bimbingan', async (req, res) => {
  console.log(`get /dosen/:username/bimbingan`);
  const username = req.params.username;

  let dosenData = {};
  try {
    dosenData = await mongoDosenCol.findOne({ _id: username });
  } catch (error) {
    console.log(error.message);
    res.send(false)
  };

  const taIdListUtama = dosenData.bimbingan_utama.map((item) => item.id);
  const taIdListPdp = dosenData.bimbingan_pdp.map((item) => item.id);

  let taIdList = [];
  taIdListUtama.forEach((item) => { taIdList.push(item) });
  taIdListPdp.forEach((item) => { taIdList.push(item) });

  let taList = [];
  for await (const id of taIdList) {
    try {
      const taData = await mongoTaCol.findOne({ _id: id });
      taList.push(taData);
    } catch (error) {
      console.log(error.message);
    };
  };

  let bimbinganUtama = [];
  let bimbinganPdp1 = [];
  let bimbinganPdp2 = [];

  taList.forEach((item) => {
    if (item.dosen1_username === username) {
      bimbinganUtama.push(item);
    } else if (item.dosen2_username === username) {
      bimbinganPdp1.push(item);
    } else if (item.dosen3_username === username) {
      bimbinganPdp2.push(item);
    };
  });

  res.send({
    utama: bimbinganUtama,
    pdp1: bimbinganPdp1,
    pdp2: bimbinganPdp2,
  });
});