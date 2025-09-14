import express from "express";
import { getLoggedUser, login } from "../handler/auth.js";
import { psqlInsert } from "../handler/psql.js";
import { mongodbInsertData } from "../handler/mongo.js";

export const router = express.Router();

router.post('/register/dosen', async (req, res) => {
  console.log('/register/dosen');
  const data = req.body;
  const psqlResult = await psqlInsert(
    `dosen`,
    `(username, password, job)`,
    `('${data.username.toUpperCase()}', '${data.password}', '${data.job}')`
  );

  const mongodbResult = await mongodbInsertData(`dosen`, {
    _id: data.username.toUpperCase(), fullname: '', minat: [], bimbingan_utama: [], bimbingan_pdp: [], usulan_ta: [], usulan_mhs: [], usulan_pdp: [],
  });

  if (psqlResult.status && mongodbResult.status) {
    res.send({ status: true });
  } else {
    res.send({ psql: psqlResult.message, mongodb: mongodbResult.message });
  };
});

router.post('/register/mhs', async (req, res) => {
  console.log('/register/mhs');
  const data = req.body;

  const psqlResult = await psqlInsert(
    `mahasiswa`,
    `(username, password, name, email, tahun_ajaran, prodi, kelas, job)`,
    `('${data.username.toUpperCase()}', '${data.password}', '${data.name}', '${data.email}', '${data.tahunAjaran}', '${data.prodi}', '${data.kelas}', 'mahasiswa')`
  );

  const mongodbResult = await mongodbInsertData(`mahasiswa`, {
    _id: data.username, name: data.name, prodi: data.prodi, kelas: data.kelas, tahun_ajaran: data.tahunAjaran, cv: [],
  });

  if (psqlResult.status && mongodbResult.status) {
    res.send({ status: true });
  } else {
    res.send({ psql: psqlResult.message, mongodb: mongodbResult.message });
  };
});

router.post('/login', async (req, res) => {
  console.log(`/login`)
  const username = req.body.username.toUpperCase();
  const password = req.body.password;

  const loginResult = await login(username, password);

  if (loginResult) {
    res.cookie('jwt', loginResult.token, {
      secure: true,
      httpOnly: true,
      sameSite: 'none',
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