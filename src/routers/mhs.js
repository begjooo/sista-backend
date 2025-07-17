import express from "express";
import { getMhsData, getMhsList } from "../handler/mhs/data.js";
import { pengajuanTa } from "../handler/mhs/pengajuanTa.js";
import { permintaanBimbingan } from "../handler/dosen/pengajuanTa.js";

export const router = express.Router();

router.get('/list', async (req, res) => {
  const list = await getMhsList();
  res.send(list);
});

router.get('/data/:username', async (req, res) => {
  const username = req.params.username;
  const data = await getMhsData(username);
  res.send(data);
});

router.post('/ta/pengajuan', async (req, res) => {
  const ajuanMhs = req.body;
  const statusTa = await pengajuanTa(ajuanMhs);
  // console.log(statusTa);
  const statusPbb = await permintaanBimbingan(ajuanMhs.username, ajuanMhs.pbb);
  // console.log(pengajuan);
  res.send(statusTa);
});