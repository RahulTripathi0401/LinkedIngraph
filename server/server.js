import express from "express";
import path from "path";
import cors from "cors";
import { edges, nodes } from "./database.js";
import { data } from "./query.js";

const port = 3311;
const app = express();
const __dirname = path.resolve();

app.use(cors());
app.use(express.json());
app.use(express.static("html"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/html/index.html"));
});

app.use(
  "/scripts",
  express.static(__dirname + "/node_modules/vis-network/dist/")
);

app.post("/connections", async (req, res) => {
  try {
    let url = req.body.url;
    let info = await edges(url);
    res.json({ data: info });
  } catch (e) {
    res.status(400);
    res.send(e);
  }
});

app.post("/nodes", async (req, res) => {
  try {
    let url = req.body.url;
    const info = await nodes(url);
    res.json({ data: info });
  } catch (e) {
    res.status(400);
    res.send(e);
  }
});

app.post("/launch", async (request, response) => {
  try {
    const cookies = request.body.cookie;
    const url = request.body.url;
    console.log(cookies);
    console.log(url);
    await data(url, cookies);
    response.json({ test: "Scrape Finished" });
  } catch (e) {
    console.log(e);
    response.status(400);
    response.json({ error: e });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
