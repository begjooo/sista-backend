import express from "express";
import { psqlGetData, psqlRemove } from "../handler/psql.js";
import { mongoDosenCol, mongoMhsCol } from "../handler/mongo.js";

export const router = express.Router();

router.get('/data/:username', async (req, res) => {
  const username = req.params.username;
  const data = await psqlGetData(`dosen`, username, true);
  res.send(data);
});

router.delete('/:job', async (req, res) => {
  console.log(`delete /admin/:job`);
  const job = req.params.job;
  const username = req.body.username;
  console.log(job, username);

  try {
    switch (job) {
      case 'dosen':
        console.log(`hapus dosen`);
        await mongoDosenCol.deleteOne({ _id: username });
        break;
      case 'mahasiswa':
        console.log(`hapus mhs`);
        await mongoMhsCol.deleteOne({ _id: username });
        break;
      default:
        console.log(`hapus tendik/plp`)
        break;
    }
  } catch (error) {
    console.log(error.message);
  };

  await psqlRemove(job, username);

  res.send(true);
});

router.get('/usulan-ta', async (req, res) => {
  console.log(`get /admin/usulan-ta`);
  let mongoDosenData = null
  try {
    mongoDosenData = await mongoDosenCol.find({}).toArray();
  } catch (error) {
    console.log(error.message);
    res.send(false);
  };

  let usulanDosen = [];
  mongoDosenData.forEach((item) => {
    if (item.usulan_ta.length !== 0) {
      item.usulan_ta.forEach((usulan) => {
        usulanDosen.push({
          id: usulan.id,
          judul: usulan.judul,
          dosen_username: item._id,
          dosen_fullname: item.fullname,
          kbk: usulan.kbk,
          minat: usulan.minat,
          skema: usulan.skema,
          deskripsi: usulan.deskripsi,
          mhs_pengusul: usulan.mhs_pengusul,
          mhs_diskusi: usulan.mhs_diskusi,
        });
      });
    };
  });

  let usulanMhs = [];
  mongoDosenData.forEach((item) => {
    if (item.usulan_mhs.length !== 0) {
      item.usulan_mhs.forEach((usulan) => {
        usulanMhs.push({
          id: usulan.id,
          judul: usulan.judul,
          dosen_username: item._id,
          dosen_fullname: item.fullname,
          kbk: usulan.kbk,
          minat: usulan.minat,
          skema: usulan.skema,
          deskripsi: usulan.deskripsi,
          mhs_username: usulan.username,
          mhs_name: usulan.name,
          tahap: usulan.tahap,
          degree: usulan.degree,
        });
      });
    };
  });

  res.send({ usulanDosen, usulanMhs });
});