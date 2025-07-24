import express from "express";
import { getFullDb, getDb, getFullData, getData, psqlUpdateData } from "../handler/psql.js";
import { mongodbUpdateData } from "../handler/mongodb.js";

export const router = express.Router();

router.get('/list-full', async (req, res) => {
  const list = await getFullDb(`dosen`, `dosen`);
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

router.get('/data-full/:username', async (req, res) => {
  const username = req.params.username;
  const data = await getFullData(`dosen`, username);
  res.send(data);
});

router.post('/data/:username/profile/edit', async (req, res) => {
  const username = req.params.username;
  const data = req.body;
  console.log(data);

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

  await mongodbUpdateData(`dosen`, username, { fullname });

  res.send(true);
});

router.post('/data/:username/profile/edit/password', async (req, res) => {
  const username = req.params.username;
  const newPassword = req.body.password;

  await updateData(`dosen`, username, `password = '${newPassword}'`);

  res.send(true);
});

router.get('/data/:username/penelitian', async (req, res) => {
  const username = req.params.username;
  res.send(true);
});

router.post('/data/:username/penelitian/edit', async (req, res) => {
  const username = req.params.username;
  const newData = req.body;
  console.log(newData);

  // const result = await mongoDosenCol.insertOne({ _id: username, kbk: 'asd', minat: 'waveguide' });
  // console.log(result);
  // console.log(mongoDosenCol);

  res.send(true);
});