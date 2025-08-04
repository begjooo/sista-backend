import express from "express";
import { getLoggedUser, login } from "../handler/auth.js";
import { psqlInsertData } from "../handler/psql.js";
import { mongodbInsertData, mongodbUpdateData } from "../handler/mongodb.js";
import { mongoDosenCol } from "../db/mongo/conn.js";

export const router = express.Router();

router.post('/register/dosen', async (req, res) => {
  console.log('/register/dosen');
  const data = req.body;
  const psqlResult = await psqlInsertData(`dosen`, `(username, password, job)`, `('${data.username}', '${data.password}', '${data.job}')`);

  let mongodbResult = {};

  try {
    await mongoDosenCol.insertOne({ _id: data.username, minat: [], bimbingan_utama: [], usulan_ta: [], usulan_mhs: [] });
    mongodbResult = {
      status: true,
      message: `mongodb: insert data success!`,
    };
  } catch (error) {
    console.log(`mongodb: ${error.message}`);
    mongodbResult = {
      status: false,
      message: error.message,
    };
  };

  if (psqlResult.status && mongodbResult.status) {
    res.send({ status: true });
  } else {
    res.send({ psql: psqlResult, mongodb: mongodbResult });
  };
});

router.post('/register/mhs', async (req, res) => {
  console.log('/register/mhs');
  const data = req.body;
  console.log(data);

  const psqlResult = await psqlInsertData(`mahasiswa`,
    `(username, password, name, email, tahun_ajaran, prodi, kelas, job)`,
    `('${data.username}', '${data.password}', '${data.name}', '${data.email}', '${data.tahunAjaran}', '${data.prodi}', '${data.kelas}', 'mahasiswa')`
  );

  const mongodbResult = await mongodbInsertData(`mahasiswa`, data.username);
  await mongodbUpdateData(`mahasiswa`, data.username, { $set: { name: data.name, tahun_ajaran: data.tahunAjaran } });

  if (psqlResult.status && mongodbResult.status) {
    res.send({ status: true });
  } else {
    res.send({ psql: psqlResult, mongodb: mongodbResult });
  };
});

router.post('/login', async (req, res) => {
  console.log(`/login`)
  const username = req.body.username;
  const password = req.body.password;

  const loginResult = await login(username, password);

  if (loginResult) {
    res.cookie('jwt', loginResult.token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.send(loginResult);
  } else {
    res.send(false);
  };
});

router.post('/user', async (req, res) => {
  console.log(`/user`);
  try {
    const data = await getLoggedUser(req.cookies['jwt']);
    res.send(data);
  } catch (error) {
    res.send(false);
  };
});

router.post('/logout', (req, res) => {
  console.log('logout');
  res.cookie('jwt', '', { maxAge: 0 });
  res.send('logout success');
});