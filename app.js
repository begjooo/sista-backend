import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { router as routerIndex } from "./src/routers/index.js";
import { router as routerAdmin } from "./src/routers/admin.js";
import { router as routerDosen } from "./src/routers/dosen.js";
import { router as routerMhs } from "./src/routers/mhs.js";
import { psqlConn } from "./src/db/psql/conn.js";
import { psqlInit, psqlInsertData } from "./src/handler/psql.js";
import { mongoConn } from "./src/db/mongo/conn.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  credentials: true,
  origin: ['http://localhost:3000', 'http://localhost:5173'],
}));

await psqlConn();
await psqlInit();
await psqlInsertData(`dosen`, `(username, password, name, fullname, job)`, `('121314151617181910', 'admin', 'Admin', 'Admin', 'admin')`);
await mongoConn();

app.use('/', routerIndex);
app.use('/admin', routerAdmin);
app.use('/dosen', routerDosen);
app.use('/mhs', routerMhs);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});