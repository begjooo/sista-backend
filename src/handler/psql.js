import pgPromise from "pg-promise";

const pgp = pgPromise({});

export const psql = pgp(`postgres://${process.env.PSQL_USERNAME}:${process.env.PSQL_PASSWORD}@${process.env.PSQL_HOST}:${process.env.PSQL_PORT}/${process.env.PSQL_DB_NAME}`);

export async function psqlConn() {
  try {
    await psql.connect();
    console.log(`psql: connection to '${process.env.PSQL_DB_NAME}' db success`);
    return true;
  } catch (error) {
    console.log(`psql: ${error.message}`);
    return false;
  };
};

export async function createTable(tableName, columnQuery) {
  console.log(`psql: create '${tableName}' table`);
  try {
    await psql.query(`create table ${tableName} ${columnQuery};`);
    console.log(`psql: '${tableName}' table created`);
  } catch (error) {
    console.log(`psql: ${error.message}`);
  };
};

async function checkTable(tableName) {
  console.log(`checkTable()`);
  try {
    await psql.query(`select * from ${tableName};`);
    return true;
  } catch (error) {
    console.log(`psql: ${error.message}`);
    return false;
  };
};

export async function psqlInsert(tableName, columnQuery, valueQuery) {
  console.log(`psqlInsert()`);
  try {
    await psql.query(`insert into ${tableName} ${columnQuery} values ${valueQuery};`);
    return {
      status: true,
      message: `psql: insert data success!`,
    };
  } catch (error) {
    console.log(`psql: ${error.message}`);
    return {
      status: false,
      message: `${error.message}`,
    };
  };
};

export async function psqlInit() {
  const TableEnum = [
    {
      name: `dosen`,
      query: `(
        username varchar(6) primary key,
        password varchar,
        name varchar,
        nip varchar,
        email varchar,
        kbk varchar,
        gelar_depan varchar,
        gelar_belakang varchar,
        fullname varchar,
        jabatan_fungsional varchar,
        job varchar
      );`,
    },
    {
      name: `mahasiswa`,
      query: `(
        username varchar(9) primary key,
        password varchar(100),
        name varchar(100),
        email varchar(255),
        tahun_ajaran varchar(20),
        prodi varchar(50),
        kelas varchar(10),
        job varchar(20)
      );`,
    },
    {
      name: `aturan_ta`,
      query: `(
        keterangan varchar primary key,
        name varchar,
        value varchar
      );`,
    },
    {
      name: `template_dok`,
      query: `(
        kode varchar primary key,
        name varchar,
        type varchar,
        keterangan varchar,
        path varchar
      );`,
    },
  ];

  for await (const item of TableEnum) {
    const isTableExist = await checkTable(item.name);
    if (!isTableExist) {
      await createTable(item.name, item.query);
    };
  };

  await psqlInsert(`dosen`, `(username, password, name, fullname, job)`, `('EE000E', 'admin', 'Admin', 'Admin', 'admin')`);
  await psqlInsert(`aturan_ta`, `(keterangan, name, value)`, `('max_bimbingan_utama', 'Jumlah Maksimal Pembimbing Utama', '6')`);
  await psqlInsert(`aturan_ta`, `(keterangan, name, value)`, `('jml_penguji', 'Jumlah Maksimal Penguji Tugas Akhir', '3')`);
  await psqlInsert(`aturan_ta`, `(keterangan, name, value)`, `('usulan_tgl_awal', 'Usulan Pembimbing', '2025-09-01')`);
  await psqlInsert(`aturan_ta`, `(keterangan, name, value)`, `('usulan_tgl_akhir', 'Usulan Pembimbing', '2025-09-30')`);
  await psqlInsert(`aturan_ta`, `(keterangan, name, value)`, `('pelaksanaan_tgl_awal', 'Pelaksanaan Tugas Akhir', '2025-09-01')`);
  await psqlInsert(`aturan_ta`, `(keterangan, name, value)`, `('pelaksanaan_tgl_akhir', 'Pelaksanaan Tugas Akhir', '2026-08-31')`);
};

export async function psqlRemove(tableName, username) {
  console.log(`psqlRemove()`);
  try {
    await psql.query(`delete from ${tableName} where username = '${username}';`);
  } catch (error) {
    console.log(error);
  };
};

export async function psqlGetList(tableName, job, password = false) {
  console.log(`psqlGetList()`);
  try {
    let result = await psql.query(`select * from ${tableName} where job = '${job}';`);
    if (!password) {
      result.forEach((item) => { delete item.password });
    };

    return result;
  } catch (error) {
    console.log(`psql: ${error.message}`);
    return false;
  };
};

export async function psqlGetData(tableName, username, password = false) {
  console.log(`psqlGetData()`);
  try {
    let result = await psql.one(`select * from ${tableName} where username = '${username}';`);
    if (!password) {
      delete result.password;
    };

    return result;
  } catch (error) {
    console.log(`psql: ${error.message}`);
    return false;
  };
};

export async function psqlUpdateData(tableName, username, query) {
  console.log(`psqlUpdateData()`);
  try {
    await psql.one(`update ${tableName} set ${query} where username = '${username}';`);
    return true;
  } catch (error) {
    console.log(`psql: ${error.message}`);
    return false;
  };
};