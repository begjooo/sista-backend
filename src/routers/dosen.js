import express from "express";
import { getFullDb, getDb, getData, getFullData, updateData } from "../db/psql/handler.js";

export const router = express.Router();

router.get('/list-full', async (req, res) => {
  const list = await getFullDb(`dosen`);
  console.log(list);
  res.send(list);
});

router.get('/list', async (req, res) => {
  const list = await getDb(`dosen`);
  res.send(list);
});

router.get('/data/:username', async (req, res) => {
  const username = req.params.username;
  const data = await getData(`dosen`, username);
  res.send(data);
});

router.post('/data/:username/profile/edit', async (req, res) => {
  const username = req.params.username;
  const newData = req.body;

  let fullname = '';

  if (newData.gelar_depan) {
    fullname = `${newData.gelar_depan} `;
  };

  if (newData.gelar_belakang) {
    fullname += `${newData.name}, ${newData.gelar_belakang} `;
  };

  await updateData(`dosen`, username,
    `name = '${newData.name}', email = '${newData.email}', kode = '${newData.kode}',
    kbk = '${newData.kbk}', jabatan_fungsional = '${newData.jabatan_fungsional}',
    gelar_depan = '${newData.gelar_depan}', gelar_belakang = '${newData.gelar_belakang}',
    fullname = '${fullname}'`
  );

  res.send(true);
});

router.post('/data/:username/profile/edit/password', async (req, res) => {
  const username = req.params.username;
  const newPassword = req.body.password;

  // await updateData(`dosen`, username, `password = '${newPassword}'`);

  res.send(true);
});

router.get('/data-full/:username', async (req, res) => {
  const username = req.params.username;
  const data = await getFullData(`dosen`, username);
  res.send(data);
});