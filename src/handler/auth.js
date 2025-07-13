import { getDosenDb } from "./dosen.js";
import { getMhsDb } from "./mhs.js";
import jwt from "jsonwebtoken";

const { JsonWebTokenError } = jwt;

const AccessEnum = {
  0: 'error',
  1: 'admin',
  2: 'dosen/tendik',
  3: 'mahasiswa',
};

async function identifyAccess(username) {
  console.log(`identify access (admin, dosen/tendik, or mhs)`);
  if (username.length === 18 && username === '121314151617181910') {
    return AccessEnum[1];
  } else if (username.length === 6) {
    return AccessEnum[2];
  } else if (username.length === 3) {
    return AccessEnum[3];
  } else {
    return AccessEnum[0];
  };
};

async function checkEntity(access, username, password) {
  let db = [];
  if (access === AccessEnum[1] || access === AccessEnum[2]) {
    db = await getDosenDb();
  } else if (access === AccessEnum[3]) {
    db = await getMhsDb();
  };

  const entity = await db.find((item) => item.username === username && item.password === password);

  if (entity) {
    entity.access = access;
    return {
      username: entity.username,
      access: entity.access,
    };
  } else {
    return 0;
  };
};

export async function login(username, password) {
  console.log(`[${username}] try to login`);
  const access = await identifyAccess(username);
  console.log(access);
  if (access !== AccessEnum[0]) {
    let result = await checkEntity(access, username, password);
    console.log(result);
    if (result) {
      const token = jwt.sign({
        username: result.username,
        access: result.access
      }, 'secret');

      return { username: result.username, access: result.access, token };
    }
  } else {
    return 0;
  };
};

export async function getLoggedUser(cookie) {
  const decode = jwt.verify(cookie, 'secret');

  if (!decode.username) {
    return 0;
  } else {
    let db = [];
    if (decode.access === AccessEnum[1] || decode.access === AccessEnum[2]) {
      db = await getDosenDb();
    } else if (decode.access === AccessEnum[3]) {
      db = await getMhsDb();
    };

    const user = db.find((item) => {
      delete item.password;
      return item.username === decode.username;
    });

    return user;
  };
};