import pgPromise from "pg-promise";

const pgp = pgPromise({});

const dbUsername = `postgres`;
const dbPassword = `qwe`;
const dbHost = `localhost`;
const dbPort = 5432;
const dbName = `sista`;

export const psql = pgp(`postgres://${dbUsername}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`);

export async function psqlConn() {
  try {
    await psql.connect();
    console.log(`psql: connect to '${dbName}' db`);
    return true;
  } catch (error) {
    console.log(`psql: ${error.message}`);
    return false
  };
};
