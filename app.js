import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import 'dotenv/config';
import { psqlConn, psqlInit } from "./src/handler/psql.js";
import { mongoConn } from "./src/handler/mongo.js";
import { router as routerIndex } from "./src/routers/index.js";
import { router as routerAdmin } from "./src/routers/admin.js";
import { router as routerDosen } from "./src/routers/dosen.js";
import { router as routerMhs } from "./src/routers/mhs.js";
import { router as routerTa } from "./src/routers/ta.js";
import { router as routerAdministrasi } from "./src/routers/administrasi.js";
import { router as routerBerkas } from "./src/routers/berkas.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: [
    'http://localhost:5173', // local
    'http://192.168.80.132:81', // dummy server
    'http://192.168.1.161:80', // telkom server
    'https://1633cff5314d.ngrok-free.app', // ngrok frontend url
  ],
}));

await psqlConn();
await psqlInit();
await mongoConn();

app.use('/', routerIndex);
app.use('/admin', routerAdmin);
app.use('/dosen', routerDosen);
app.use('/mhs', routerMhs);
app.use('/ta', routerTa);
app.use('/administrasi', routerAdministrasi);
app.use('/berkas', routerBerkas);

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});