import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.get("/health", (_, res) => res.status(200).send("ok"));
app.get("/", (_, res) => res.send({ status: "studly api running" }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`api listening on :${port}`));
