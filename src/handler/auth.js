import jwt from "jsonwebtoken";
import { psqlGetData } from "./psql.js";

const AccessEnum = {
  0: 'error',
  1: 'admin',
  2: 'dosen',
  3: 'tendik',
  4: 'mahasiswa',
};

async function identifyAccess(username) {
  console.log(`identify access (admin, dosen, tendik, or mhs)`);
  if (username.length === 6 && username === 'EE000E') {
    return AccessEnum[1];
  } else if (username.length === 6) {
    return AccessEnum[2];
  } else if (username.length === 8) {
    return AccessEnum[3];
  } else if (username.length === 3) {
    return AccessEnum[4];
  } else {
    return AccessEnum[0];
  };
};

async function checkLogin(access, username, password) {
  console.log(`checkLogin()`);
  let user = null;
  if (access === AccessEnum[1] || access === AccessEnum[2]) {
    user = await psqlGetData(`dosen`, username, true);
  } else if (access === AccessEnum[3]) {
    user = await psqlGetData(`tendik`, username, true);
  } else if (access === AccessEnum[4]) {
    user = await psqlGetData(`mahasiswa`, username, true);
  };

  if (user.password === password) {
    return {
      username: user.username,
      job: user.job,
    };
  } else {
    return 0;
  };
};

export async function login(username, password) {
  console.log(`[${username}] try to login`);
  const access = await identifyAccess(username);
  if (access !== AccessEnum[0]) {
    let result = await checkLogin(access, username, password);
    if (result) {
      const token = jwt.sign({ username: result.username, job: result.job }, 'secret');
      return { username: result.username, job: result.job, token };
    } else {
      return 0;
    };
  } else {
    return 0;
  };
};

export async function getLoggedUser(cookie) {
  const claim = jwt.verify(cookie, 'secret');

  if (!claim.username) {
    return 0;
  } else {
    let user = null;
    if (claim.job === 'admin' || claim.job === 'dosen') {
      user = await psqlGetData(`dosen`, claim.username);
    } else if (claim.job === 'tendik') {
      user = await psqlGetData(`tendik`, claim.username);
    } else {
      user = await psqlGetData(`mahasiswa`, claim.username);
    };

    return user;
  };
};