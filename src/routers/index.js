import express from "express";
import { getLoggedUser, login } from "../handler/auth.js";
import { getFullData, insertData } from "../db/psql/handler.js";

export const router = express.Router();

router.post('/register/dosen', async (req, res) => {
  console.log('/register/dosen');
  const data = req.body;
  const result = await insertData(`dosen`, `(username, password, job)`, `('${req.body.username}', '${req.body.password}', 'dosen')`);
  res.send(result);
});

router.post('/register/mhs', async (req, res) => {
  console.log('/register/mhs');
  const data = req.body;
  const result = await insertData(`mahasiswa`,
    `(username, password, name, email, tahun_ajaran, prodi, kelas, job)`,
    `('${data.username}', '${data.password}', '${data.name}', '${data.email}', '${data.tahunAjaran}', '${data.prodi}', '${data.kelas}', 'mahasiswa')`
  );
  res.send(result);
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
    res.send(0);
  };
});

router.post('/user', async (req, res) => {
  console.log(`/user`);
  try {
    const data = await getLoggedUser(req.cookies['jwt']);
    res.send(data);
  } catch (error) {
    res.send(0);
  };
});

router.post('/logout', (req, res) => {
  console.log('logout');
  res.cookie('jwt', '', { maxAge: 0 });
  res.send('logout success');
});