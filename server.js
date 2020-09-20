const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
var cors = require("cors");
const info = require("./database");
const query = require("./query");
app.use(cors());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/app.html"));
});

app.get("/connections/:keyword", async (req, res) => {
  try {
    const searchParameter = req.params.keyword;
    console.log(searchParameter);

    const data = await info.edges(searchParameter);
    if (data.length === 0) {
      res.status(400);
      res.json(`The ${searchParameter} keyword does not exists`);
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
      res.send(`The ${searchParameter} keyword does not exists`);
      console.log("here");
    } else {
      res.json(JSON.stringify(data));
    }
  } catch (e) {
    res.send(e);
  }
});

app.post("/launch/:keyword", async (req, res) => {
  try {
    const searchParameter = String(req.params.keyword);
    console.log("here");
    await query.data(searchParameter);
    res.send("Scrape Finished");
  } catch (e) {
    res.send(e);
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
