import express from "express";

export const router = express.Router();

router.get('/', (req, res) => {
  res.send('selamat datang di halaman dosen');
});

router.get('/data', (req, res) => {
  console.log(`request data from frontend`);
  res.send({
    nama: 'Bagja',
    nip: '11111',
  });
});