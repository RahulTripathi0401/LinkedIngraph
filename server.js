const express = require("express");
const app = express();
const port = 3111;
const path = require("path");
var cors = require("cors");
const info = require("./database");
const query = require("./query");
app.use(cors());
app.use(express.static("html"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/html/index.html"));
});

app.get("/connections/:keyword", async (req, res) => {
  try {
    const searchParameter = req.params.keyword;
    console.log(searchParameter);

    const data = await info.edges(searchParameter);
    if (data.length === 0) {
      res.status(400);
      res.json(JSON.stringify({ error: `The ${searchParameter} keyword does not exists in the database` }));
    } else {
      res.json(JSON.stringify(data));
    }
  } catch (e) {
    res.send(e);
  }
});

app.get("/nodes/:keyword", async (req, res) => {
  try {
    const searchParameter = req.params.keyword;
    const data = await info.nodes(searchParameter);
    if (data.length === 0) {
      res.status(400);
      res.json(JSON.stringify({ error: `The ${searchParameter} keyword does not exists in the database` }));
    } else {
      res.json(JSON.stringify(data));
    }
  } catch (e) {
    res.status(400);
    res.send(e);
  }
});

app.post("/launch/:keyword", async (req, res) => {
  try {
    const searchParameter = String(req.params.keyword);
    await query.data(searchParameter);
    res.send("Scrape Finished");
  } catch (e) {
    console.log(e);
    res.status(400);
    res.json(JSON.stringify({ error: e }));
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
