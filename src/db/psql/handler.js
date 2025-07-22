import { psql } from "./conn.js";

export async function createTable(tableName, columnQuery) {
  console.log(`psql: create '${tableName}' table`);
  try {
    await psql.query(`create table ${tableName} ${columnQuery};`);
    console.log(`psql: '${tableName}' table created`);
  } catch (error) {
    console.log(`psql: ${error.message}`);
  };
};

export async function checkTable(tableName) {
  // console.log(`checkTable()`);
  try {
    const isTableExist = await psql.query(`select * from ${tableName};`);
    return true;
  } catch (error) {
    console.log(`psql: ${error.message}`);
    return false;
  };
};

export async function setMandatoryTables() {
  const TableEnum = [
    {
      name: `dosen`,
      query: `(
        username varchar(18) primary key,
        password varchar(100),
        name varchar(100),
        email varchar(255),
        kbk varchar(100),
        minat varchar[],
        kode varchar(10),
        gelar_depan varchar(20),
        gelar_belakang varchar(20),
        fullname varchar(150),
        jabatan_fungsional varchar(30),
        job varchar(20),
        pengajuan_id int[],
        bimbingan_id varchar[]
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
        kbk varchar(100),
        pengajuan_id int,
        pbb_1_id varchar(18),
        pbb_2_id varchar(18),
        pbb_3_id varchar(18),
        proposal_id int,
        tugas_akhir_id int,
        job varchar(20)
      );`,
    },
    {
      name: `pengajuan`,
      query: `(
        id bigserial primary key,
        mhs_id varchar(9),
        minat varchar[],
        judul varchar(200),
        deskripsi varchar(1000),
        calon_pbb_utama_id varchar[],
        calon_pbb_pendamping_id varchar[],
        status varchar(20),
        waktu_kadaluarsa date
      );`,
    },
  ];

  for await (const item of TableEnum) {
    const isTableExist = await checkTable(item.name);
    if (!isTableExist) {
      await createTable(item.name, item.query);
    };
  };
};

export async function insertData(tableName, columnQuery, valueQuery) {
  // console.log(`insertData()`);
  try {
    await psql.query(`insert into ${tableName} ${columnQuery} values ${valueQuery};`);
    return {
      status: true,
      message: `psql: Insert data success!`,
    };
  } catch (error) {
    console.log(`psql: ${error.message}`);
    return {
      status: false,
      message: `${error.message}`,
    };;
  };
};

export async function getFullDb(tableName) {
  console.log(`getFullDb()`);
  try {
    const result = await psql.query(`select * from ${tableName} where job = 'dosen';`);
    return result;
  } catch (error) {
    console.log(`psql: ${error.message}`);
    return false;
  };
};

export async function getDb(tableName) {
  console.log(`getDb()`);
  try {
    const result = await psql.query(`select 
      username, kbk, minat, kode, fullname, jabatan_fungsional, job
      from ${tableName} where job = 'dosen';`);
    return result;
  } catch (error) {
    console.log(`psql: ${error.message}`);
    return false;
  };
};

export async function getFullData(tableName, username) {
  console.log(`getFullData()`);
  try {
    const result = await psql.one(`select * from ${tableName} where username = '${username}';`);
    return result;
  } catch (error) {
    console.log(`psql: ${error.message}`);
    return false;
  };
};

export async function getData(tableName, username) {
  console.log(`getData()`);
  try {
    let result = await psql.one(`select * from ${tableName} where username = '${username}';`);
    delete result.password;
    return result;
  } catch (error) {
    console.log(`psql: ${error.message}`);
    return false;
  };
};

export async function updateData(tableName, username, query) {
  console.log(`updateData()`);
  try {
    await psql.one(`update ${tableName} set ${query} where username = '${username}';`);
    return true;
  } catch (error) {
    console.log(`psql: ${error.message}`);
    return false;
  };
};