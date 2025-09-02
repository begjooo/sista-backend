import { psql } from "../db/psql/conn.js";

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
  console.log(`checkTable()`);
  try {
    const isTableExist = await psql.query(`select * from ${tableName};`);
    return true;
  } catch (error) {
    console.log(`psql: ${error.message}`);
    return false;
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
  ];

  for await (const item of TableEnum) {
    const isTableExist = await checkTable(item.name);
    if (!isTableExist) {
      await createTable(item.name, item.query);
    };
  };
};

export async function psqlInsertData(tableName, columnQuery, valueQuery) {
  console.log(`psqlInsertData()`);
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
    };;
  };
};

export async function psqlGetFullList(tableName, job) {
  console.log(`psqlGetFullList()`);
  try {
    const result = await psql.query(`select * from ${tableName} where job = '${job}';`);
    return result;
  } catch (error) {
    console.log(`psql: ${error.message}`);
    return false;
  };
};

export async function psqlGetList(tableName, job) {
  console.log(`psqlGetList()`);
  try {
    const result = await psql.query(`select 
      username, nip, kbk, fullname, jabatan_fungsional, job
      from ${tableName} where job = '${job}';`);
    return result;
  } catch (error) {
    console.log(`psql: ${error.message}`);
    return false;
  };
};

export async function psqlGetFullData(tableName, username) {
  console.log(`psqlGetFullData()`);
  try {
    const result = await psql.one(`select * from ${tableName} where username = '${username}';`);
    return result;
  } catch (error) {
    console.log(`psql: ${error.message}`);
    return false;
  };
};

export async function psqlGetData(tableName, username) {
  console.log(`psqlGetData()`);
  try {
    let result = await psql.one(`select * from ${tableName} where username = '${username}';`);
    delete result.password;
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