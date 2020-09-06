const request = require("request");
const sqlite3 = require("sqlite3").verbose();

// First find Container ID asscoiated with launch of application
const agentID = "8671622363177684";

let launchAgent = async function () {
  let options = {
    method: "POST",
    url: "https://api.phantombuster.com/api/v2/agents/launch",
    headers: {
      "content-type": "application/json",
      "x-phantombuster-key": "foonbLh9lI7h0RUMifOuZza54fOoH6ls9kmy63kRp3g",
    },
    body: { id: agentID },
    json: true,
  };
  return new Promise((resolve, reject) => {
    request(options, async function (error, response, body) {
      if (error) throw new Error(error);
      resolve(body.containerId);
    });
  });
};

let ids = async function () {
  let options = {
    method: "GET",
    url: "https://api.phantombuster.com/api/v2/containers/fetch-all",
    qs: { agentId: agentID },
    headers: {
      accept: "application/json",
      "x-phantombuster-key": "foonbLh9lI7h0RUMifOuZza54fOoH6ls9kmy63kRp3g",
    },
  };

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) throw new Error(error);
      resolve(JSON.parse(body));
    });
  });
};

let info = async function (containerId) {
  options = {
    method: "GET",
    url: "https://api.phantombuster.com/api/v2/containers/fetch-result-object",
    qs: { id: `${containerId}` },
    headers: {
      accept: "application/json",
      "x-phantombuster-key": "foonbLh9lI7h0RUMifOuZza54fOoH6ls9kmy63kRp3g",
    },
  };
  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) throw new Error(error);
      let fire = JSON.parse(body);
      resolve(JSON.parse(fire.resultObject));
    });
  });
};

async function data() {
  //   let ConatinerId = await launchAgent();
  //   console.log(ConatinerId);
  let data = await ids();
  let userinfo;
  for (let x of data.containers) {
    let tmp = await info(x.id);
    if (tmp != null) {
      userinfo = tmp;
      break;
    }
  }
  //   addToDB(userinfo);
}

function addToDB(userinfo) {
  let db = new sqlite3.Database("./test.db", (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Connected to the in-memory SQlite database.");
  });

  for (x of userinfo) {
    if (x.error) continue;
    db.run(
      `INSERT OR IGNORE INTO users(profile_url, first_name, last_name) VALUES("${x.url}", "${x.firstName}", "${x.lastName}")`
    );
    let index = 1;
    if (x.sharedConnections) {
      while (true) {
        let common = "commonConnection" + `${index}`;
        if (!x[common]) break;
        db.run(
          `INSERT OR IGNORE INTO connections(user_profile, mutual_connection) VALUES("${x.url}", "${x[common]}")`
        );
        db.run(
          `INSERT OR IGNORE INTO users(profile_url, first_name, last_name) VALUES("${x.url}", "${x.firstName}", "${x.lastName}")`
        );
        index++;
      }
    }
  }

  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log("Close the database connection.");
  });
}

data();
