import express from "express";
import { psqlGetData } from "../handler/psql.js";
import { mongodbGetData, mongodbUpdateData } from "../handler/mongodb.js";
import { mongoDosenCol, mongoMhsCol } from "../db/mongo/conn.js";
import { ObjectId } from "mongodb";

export const router = express.Router();

router.get('/list', async (req, res) => {
  // const list = await getMhsList();
  // res.send(list);
});

router.get('/:username/data', async (req, res) => {
  const username = req.params.username;
  const psqlData = await psqlGetData(`mahasiswa`, username);
  // console.log(psqlData);
  const mongodbData = await mongodbGetData(`mahasiswa`, username);
  // console.log(mongodbData);
  if (psqlData && mongodbData) {
    res.send({ pribadi: psqlData, cv: mongodbData.cv });
  } else {
    res.send(false);
  };
});


router.get('/:username/cv', async (req, res) => {
  console.log(`get /mhs/:username/cv`);
  const username = req.params.username;
  const mongodbData = await mongodbGetData(`mahasiswa`, username);
  res.send(mongodbData.cv);
});

router.post('/:username/cv', async (req, res) => {
  console.log(`post /mhs/:username/cv`);
  const username = req.params.username;
  const cv = req.body.cv;

  try {
    await mongoMhsCol.updateOne({ _id: username }, { $push: { cv: cv } });
    res.send({
      message: `add new cv success`,
      status: true,
    });
  } catch (error) {
    res.send({
      message: error.message,
      status: false,
    });
  };
});

router.delete('/:username/cv', async (req, res) => {
  console.log(`delete /mhs/:username/cv`);
  const username = req.params.username;
  const index = req.body.index;

  try {
    await mongoMhsCol.updateOne({ _id: username }, { $unset: { [`cv.${index}`]: '' } });
    await mongoMhsCol.updateOne({ _id: username }, { $pull: { cv: null } });
    res.send({
      message: `delete cv success`,
      status: true,
    });
  } catch (error) {
    res.send({
      message: error.message,
      status: false,
    });
  };
});

router.get('/:username/tugas-akhir/usulan', async (req, res) => {
  console.log(`get /mhs/:username/tugas-akhir/usulan`)
  const username = req.params.username;
  const psqlData = await psqlGetData(`mahasiswa`, username);
  const mongodbData = await mongodbGetData(`mahasiswa`, username);

  if (psqlData && mongodbData) {
    res.send({
      pribadi: psqlData,
      portofolio: mongodbData.portofolio,
      usulan_ta: mongodbData.usulan_ta,
      tugas_akhir: mongodbData.tugas_akhir,
      usulan_pdp: mongodbData.usulan_pdp,
    });
  } else {
    res.send(false);
  };
});

router.post('/:username/tugas-akhir/usulan', async (req, res) => {
  console.log(`post /mhs/:username/tugas-akhir/usulan`)
  const username = req.params.username;
  const usulanData = req.body;
  // console.log(username);
  // console.log(usulanData)

  let usulanMhs = { ...usulanData };
  delete usulanMhs.name;

  // simpen/tambah ke dosen collection
  let usulanToDosen = {};
  if (usulanData.type === `dosen`) { // jika type dosen maka usulan_ta.mhs_pengusul
    console.log(`usulan dosen`);
    usulanToDosen = {
      username: username,
      name: usulanData.name,
      degree: usulanData.degree,
    };

    await mongodbUpdateData(`mahasiswa`, username, { $push: { usulan_ta: usulanMhs } });
    await mongoDosenCol.updateOne(
      { _id: usulanData.dosen1_username, [`usulan_ta.id`]: usulanData.id },
      { $push: { [`usulan_ta.$.mhs_pengusul`]: usulanToDosen } }
    );

  } else if (usulanData.type === `mahasiswa`) { // jika type mahasiswa maka usulan_mhs
    console.log(`usulan mahasiswa`);
    const taId = new ObjectId().toString();

    usulanMhs.id = taId;
    await mongodbUpdateData(`mahasiswa`, username, { $push: { usulan_ta: usulanMhs } });

    usulanToDosen = { ...usulanData };
    usulanToDosen.id = taId;
    usulanToDosen.username = username;
    delete usulanToDosen.dosen1_username;
    delete usulanToDosen.dosen1_fullname;
    delete usulanToDosen.type;

    await mongoDosenCol.updateOne(
      { _id: usulanData.dosen1_username },
      { $push: { usulan_mhs: usulanToDosen } }
    );
  };

  res.send(true);
});

router.post('/:username/tugas-akhir/usulan-pdp', async (req, res) => {
  console.log(`post /mhs/:username/tugas-akhir/usulan-pdp`);
  const username = req.params.username;
  const usulanPdp = req.body;
  console.log(username);
  console.log(usulanPdp);

  // update mhs mongodb
  // tambah field usulan_pdp[]
  try {
    await mongoMhsCol.updateOne(
      { _id: username },
      { $push: { usulan_pdp: usulanPdp } }
    );
  } catch (error) {
    console.log(error.message);
    res.send(false);
  };

  // update dosen mongodb
  // ambil ta data
  const taData = await mongodbGetData('tugas_akhir', usulanPdp.ta_id);
  console.log(taData);
  // tambah field usulan_pdp[]
  try {
    await mongoDosenCol.updateOne(
      { _id: usulanPdp.username },
      {
        $push: {
          usulan_pdp: {
            ...taData,
            degree: usulanPdp.degree,
            tahap_usulan: usulanPdp.tahap,
            msg: ''
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