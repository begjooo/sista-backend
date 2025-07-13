import express from "express";
import { getMhsData, getMhsList } from "../handler/mhs.js";

export const router = express.Router();

router.get('/', (req, res) => {
  console.log('selamat datang di halaman mahasiswa');
  res.send({
    name: 'Bagja',
    username: '11',
  });
});

router.get('/list', async (req, res) => {
  const list = await getMhsList();
  res.send(list);
});

router.get('/data/:username', async (req, res) => {
  const username = req.params.username;
  const data = await getMhsData(username);
  res.send(data);
});

router.post('/sempro', (req, res) => {
  console.log(req.body);
  res.send(true);
});