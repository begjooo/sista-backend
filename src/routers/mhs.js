import express from "express";
import { getLoggedUser } from "../handler/auth.js";
import { getMhsData, getMhsList, pengajuanSempro } from "../handler/mhs.js";

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

router.post('/sempro', async (req, res) => {
  const pengajuan = await pengajuanSempro(req.body);
  res.send(true);
});