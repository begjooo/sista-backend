import express from "express";
import { pengajuanTa } from "../handler/mhs/pengajuanTa.js";
import { permintaanBimbingan } from "../handler/dosen/pengajuanTa.js";
import { psqlGetData, getFullData } from "../handler/psql.js";
import { mongodbGetData, mongodbUpdateData } from "../handler/mongodb.js";
import { mongoDosenCol, mongoMhsCol } from "../db/mongo/conn.js";
import { ObjectId } from "mongodb";

export const router = express.Router();

router.get('/list', async (req, res) => {
  // const list = await getMhsList();
  res.send(list);
});

router.get('/:username/data', async (req, res) => {
  const username = req.params.username;
  const psqlData = await psqlGetData(`mahasiswa`, username);
  // console.log(psqlData);
  const mongodbData = await mongodbGetData(`mahasiswa`, username);
  // console.log(mongodbData);
  if (psqlData && mongodbData) {
    res.send({ pribadi: psqlData, portofolio: mongodbData.portofolio });
  } else {
    res.send(false);
  };
});

router.get('/:username/tugas-akhir/usulan/data', async (req, res) => {
  const username = req.params.username;
  const psqlData = await psqlGetData(`mahasiswa`, username);
  // console.log(psqlData);
  const mongodbData = await mongodbGetData(`mahasiswa`, username);
  // console.log(mongodbData);
  if (psqlData && mongodbData) {
    res.send({
      pribadi: psqlData,
      portofolio: mongodbData.portofolio,
      usulan_ta: mongodbData.usulan_ta,
      tugas_akhir: mongodbData.tugas_akhir,
    });
  } else {
    res.send(false);
  };
});

router.post('/:username/tugas-akhir/usulan/tambah', async (req, res) => {
  const username = req.params.username;
  const usulanData = req.body;
  // console.log(username);
  // console.log(usulanData)

  let usulanMhs = { ...usulanData };
  delete usulanMhs.name;

  // simpen/tambah ke dosenColl
  let usulanToDosen = {};
  if (usulanData.type === `dosen`) { // jika type dosen maka usulan_ta.mhs_pengusul
    usulanToDosen = {
      username: username,
      name: usulanData.name,
      degree: usulanData.degree,
    };

    await mongodbUpdateData(`mahasiswa`, username, { $push: { usulan_ta: usulanMhs } });
    await mongoDosenCol.updateOne(
      { _id: usulanData.dosen_username, [`usulan_ta.id`]: usulanData.id },
      { $push: { [`usulan_ta.$.mhs_pengusul`]: usulanToDosen } }
    );

  } else if (usulanData.type === `mahasiswa`) { // jika type mahasiswa maka usulan_mhs
    const taId = new ObjectId().toString();

    usulanMhs.id = taId;
    await mongodbUpdateData(`mahasiswa`, username, { $push: { usulan_ta: usulanMhs } });

    usulanToDosen = { ...usulanData };
    usulanToDosen.id = taId;
    usulanToDosen.username = username;
    delete usulanToDosen.dosen_username;
    delete usulanToDosen.dosen_fullname;
    delete usulanToDosen.type;

    await mongoDosenCol.updateOne(
      { _id: usulanData.dosen_username },
      { $push: { usulan_mhs: usulanToDosen } }
    );
  };

  res.send(true);
});