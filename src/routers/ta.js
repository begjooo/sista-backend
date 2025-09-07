import express from "express";
import { mongodbGetList } from "../handler/mongo.js";
import { psql } from "../handler/psql.js";

export const router = express.Router();

router.get('/list', async (req, res) => {
  const list = await mongodbGetList('tugas_akhir');
  res.send(list);
});

router.get('/aturan', async (req, res) => {
  console.log(`get /ta/aturan`);
  try {
    const jmlPenguji = await psql.one(`select * from aturan_ta where keterangan = 'jml_penguji'`);
    const usulanTglAwal = await psql.one(`select * from aturan_ta where keterangan = 'usulan_tgl_awal'`);
    const usulanTglAkhir = await psql.one(`select * from aturan_ta where keterangan = 'usulan_tgl_akhir'`);
    const PelaksanaanTglAwal = await psql.one(`select * from aturan_ta where keterangan = 'pelaksanaan_tgl_awal'`);
    const PelaksanaanTglAkhir = await psql.one(`select * from aturan_ta where keterangan = 'pelaksanaan_tgl_akhir'`);

    res.send({
      jmlPenguji: jmlPenguji.value,
      usulan: {
        awal: usulanTglAwal.value,
        akhir: usulanTglAkhir.value,
      },
      pelaksanaan: {
        awal: PelaksanaanTglAwal.value,
        akhir: PelaksanaanTglAkhir.value,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.send(false);
  };
});

router.put('/aturan', async (req, res) => {
  console.log(`put /ta/aturan`);
  try {
    await psql.one(`
      update aturan_ta set value = '${req.body.jmlPenguji}' where keterangan = 'jml_penguji';
      update aturan_ta set value = '${req.body.usulan.awal}' where keterangan = 'usulan_tgl_awal';
      update aturan_ta set value = '${req.body.usulan.akhir}' where keterangan = 'usulan_tgl_akhir';
      update aturan_ta set value = '${req.body.pelaksanaan.awal}' where keterangan = 'pelaksanaan_tgl_awal';
      update aturan_ta set value = '${req.body.pelaksanaan.akhir}' where keterangan = 'pelaksanaan_tgl_akhir';
    `);
  } catch (error) {
    console.log(error.message);
  };

  res.send(true);
});