import express from "express";

export const router = express.Router();

router.get('/', (req, res) => {
  res.send('selamat datang di halaman mahasiswa');
});


router.get('/data', (req, res) => {
  console.log(`request data from frontend`);
  res.send({
    nama: 'Bagja',
    nim: '11',
  });
});

router.get('/dosen-list', (req, res) => {
  console.log(`request lecturer list`);
  res.send([
    {
      nama: 'pa eril',
      nip: '11111',
    },
    {
      nama: 'pa opik',
      nip: '22222',
    },
    {
      nama: 'pa megi',
      nip: '33333',
    },
    {
      nama: 'pa teguh',
      nip: '44444',
    },
    {
      nama: 'pa bagja',
      nip: '55555',
    },
    {
      nama: 'pa eril',
      nip: '11111',
    },
    {
      nama: 'pa opik',
      nip: '22222',
    },
    {
      nama: 'pa megi',
      nip: '33333',
    },
    {
      nama: 'pa teguh',
      nip: '44444',
    },
    {
      nama: 'pa bagja',
      nip: '55555',
    },
    {
      nama: 'pa eril',
      nip: '11111',
    },
    {
      nama: 'pa opik',
      nip: '22222',
    },
    {
      nama: 'pa megi',
      nip: '33333',
    },
    {
      nama: 'pa teguh',
      nip: '44444',
    },
    {
      nama: 'pa bagja',
      nip: '55555',
    },
    {
      nama: 'pa eril',
      nip: '11111',
    },
    {
      nama: 'pa opik',
      nip: '22222',
    },
    {
      nama: 'pa megi',
      nip: '33333',
    },
    {
      nama: 'pa bagja',
      nip: '55555',
    },
    {
      nama: 'pa opik',
      nip: '22222',
    },
    {
      nama: 'pa megi',
      nip: '33333',
    },
    {
      nama: 'pa bagja',
      nip: '55555',
    },
  ]);
});

router.post('/pilih-pbb', (req, res) => {
  console.log(req.body);
  res.send(true);
});