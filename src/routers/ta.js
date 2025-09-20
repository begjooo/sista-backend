import express from "express";
import { mongodbGetList } from "../handler/mongo.js";
import { psql, psqlInsert } from "../handler/psql.js";

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

router.post('/lini-waktu', async (req, res) => {
  console.log(`post /ta/lini-waktu`);
  console.log(req.body);

  await psqlInsert(
    `aturan_ta`,
    `(keterangan, name, value)`,
    `('${req.body.awal_ket}', '${req.body.nama}', '${req.body.awal_val}')`
  );

  await psqlInsert(
    `aturan_ta`,
    `(keterangan, name, value)`,
    `('${req.body.akhir_ket}', '${req.body.nama}', '${req.body.akhir_val}')`
  );

  res.send(true);
});

router.get('/lini-waktu', async (req, res) => {
  console.log(`get /ta/lini-waktu`);
  const aturanList = await psql.query(`select * from aturan_ta;`);
  const liniWaktuList = aturanList.filter((item) => item.keterangan.includes(`tgl`));
  // console.log(liniWaktuList)
  const groupedLw = Object.groupBy(liniWaktuList, ({ name }) => name);
  console.log(groupedLw);
  const objectKeyLw = Object.keys(groupedLw);
  console.log(objectKeyLw);
  res.send(liniWaktuList);
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