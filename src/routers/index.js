import express from "express";
import { getLoggedUser, login } from "../handler/auth.js";

export const router = express.Router();

router.post('/login', async (req, res) => {
  console.log(`/login`)
  const username = req.body.username;
  const password = req.body.password;
  const loginResult = await login(username, password);
  console.log(loginResult)

  if (loginResult) {
    res.cookie('jwt', loginResult.token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.send(loginResult);
  } else {
    res.send(0);
  }
});

router.post('/user', async (req, res) => {
  console.log(`/user`)
  try {
    const data = await getLoggedUser(req.cookies['jwt']);
    res.send(data);
  } catch (error) {
    res.send(0);
  };
});

router.post('/logout', (req, res) => {
  console.log('logout');
  res.cookie('jwt', '', { maxAge: 0 });
  res.send('logout success');
});