import express from "express";
import { pengajuanTa } from "../handler/mhs/pengajuanTa.js";
import { permintaanBimbingan } from "../handler/dosen/pengajuanTa.js";
import { psqlGetData, getFullData } from "../handler/psql.js";
import { mongodbGetData } from "../handler/mongodb.js";

export const router = express.Router();

router.get('/list', async (req, res) => {
  // const list = await getMhsList();
  res.send(list);
});

router.get('/data/:username', async (req, res) => {
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

router.post('/:username/tugas-akhir/usulan/tambah', async (req, res) => {
  const username = req.params.username;
  const usulanMhs = req.body;
  console.log(username);
  console.log(usulanMhs);
  // const statusTa = await pengajuanTa(ajuanMhs);
  // console.log(statusTa);
  // const statusPbb = await permintaanBimbingan(ajuanMhs.username, ajuanMhs.pbb);
  // console.log(pengajuan);
  res.send(true);
});