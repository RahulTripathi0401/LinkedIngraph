const request = require("request");
const sqlite3 = require("sqlite3").verbose();
const credentials = require(`./client.json`);
const searchByKeywordID = "3980003998118353";
const searchMutualConnectionsID = "3032528682541051";
const APIToken = "CBCC4KSe2uJhEoB1vOk1Vmlo96j1ss5KpM6YlKt09lU";
const defulatCookie =
  "AQEDAQQJx2IFPUfWAAABdC4I1ukAAAF0UhVa6VYAR_i-LUnBtTQ-mp7mRGuSP5mdw7QNaf47_Kwugyinnx0V6BE1xry4vfK2GVb9DG8j4XlgTshq4vxNbuoSIOPJyUAWowsBVdGickWd5RzgcDN1vdls";
const db = new sqlite3.Database("./test.db");

let launchAgent = async function (search) {
  const options = {
    method: "POST",
    url: "https://api.phantombuster.com/api/v2/agents/launch",
    headers: {
      "content-type": "application/json",
      "x-phantombuster-key": "CBCC4KSe2uJhEoB1vOk1Vmlo96j1ss5KpM6YlKt09lU",
    },
    body: {
      id: searchByKeywordID,
      arguments: `{ 	"sessionCookie": "AQEDAQQJx2IFPUfWAAABdC4I1ukAAAF0UhVa6VYAR_i-LUnBtTQ-mp7mRGuSP5mdw7QNaf47_Kwugyinnx0V6BE1xry4vfK2GVb9DG8j4XlgTshq4vxNbuoSIOPJyUAWowsBVdGickWd5RzgcDN1vdls", 	"search": "${search}", "circles": { 		"first": false, 		"second": true, 		"third": true 	}, 	"category": "People", 	"csvName": "tmp", 	"removeDuplicateProfiles": false, 	"watcherMode": false }`,
    },
    json: true,
  };
  return new Promise((resolve, reject) => {
    request(options, async function (error, response, body) {
      if (error) throw new Error(error);
      resolve(body.containerId);
    });
  });
};

let ids = async function (agentID) {
  let options = {
    method: "GET",
    url: "https://api.phantombuster.com/api/v2/containers/fetch-all",
    qs: { agentId: agentID },
    headers: {
      accept: "application/json",
      "x-phantombuster-key": APIToken,
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
  const options = {
    method: "GET",
    url: "https://api.phantombuster.com/api/v2/containers/fetch-result-object",
    qs: { id: `${containerId}` },
    headers: {
      accept: "application/json",
      "x-phantombuster-key": APIToken,
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

let getResults = async function (containerId) {
  const options = {
    method: "GET",
    url: "https://api.phantombuster.com/api/v2/containers/fetch-output",
    qs: { id: containerId },
    headers: {
      accept: "application/json",
      "x-phantombuster-key": APIToken,
    },
  };

  request(options, function (error, response, body) {
    if (error) throw new Error(error);

    console.log(body);
  });
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function addToDB(userinfo, keyword) {
  let temp = [];
  for (let x of userinfo) {
    if (x.error) continue;
    db.run(`INSERT OR IGNORE INTO keywords(keyword, profile_url) VALUES("${keyword}", "${x.url}")`);
    x.lastName = x.lastName.replace(/"/g, "");
    x.firstName = x.firstName.replace(/"/g, "");
    if (x.sharedConnections) {
      if (x.allCommonConnections) {
        db.run(
          `INSERT OR IGNORE INTO users(profile_url, first_name, last_name, commonConnections) VALUES("${x.url}", "${x.firstName}", "${x.lastName}", "${x.allCommonConnections}")`
        );
        temp.push(x.allCommonConnections);
      } else {
        db.run(
          `INSERT OR IGNORE INTO users(profile_url, first_name, last_name) VALUES("${x.url}", "${x.firstName}", "${x.lastName}")`
        );
        if (x.commonConnection1) {
          db.run(
            `INSERT OR IGNORE INTO connections(user_profile, mutual_connection) VALUES("${x.url}", "${x.commonConnection1}")`
          );
          db.run(`INSERT OR IGNORE INTO users(profile_url) VALUES("${x.commonConnection1}")`);
        }
        if (x.commonConnection2) {
          db.run(
            `INSERT OR IGNORE INTO connections(user_profile, mutual_connection) VALUES("${x.url}", "${x.commonConnection2}")`
          );
          db.run(`INSERT OR IGNORE INTO users(profile_url) VALUES("${x.commonConnection2}")`);
        }
      }
    } else {
      db.run(
        `INSERT OR IGNORE INTO users(profile_url, first_name, last_name) VALUES("${x.url}", "${x.firstName}", "${x.lastName}")`
      );
    }
  }
  return temp;
}

async function addMutualConnections(profile_url, userinfo, keyword) {
  if (userinfo.error) return;
  userinfo.firstName = userinfo.firstName.replace(/"/g, "");
  userinfo.lastName = userinfo.lastName.replace(/"/g, "");
  db.run(
    `INSERT OR IGNORE INTO connections(user_profile, mutual_connection) VALUES("${profile_url}", "${userinfo.url}")`
  );
  db.run(
    `INSERT OR IGNORE INTO users(profile_url, first_name, last_name) VALUES("${userinfo.url}", "${userinfo.firstName}", "${userinfo.lastName}")`
  );
  db.run(`INSERT OR IGNORE INTO keywords(profile_url, keyword) VALUES("${userinfo.url}", "${keyword}")`);
}

let awsJSON = async function (AWSurl) {
  let options = {
    method: "GET",
    url: `${AWSurl}`,
    headers: {
      accept: "application/json",
      "x-phantombuster-key": APIToken,
    },
  };

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) throw new Error(error);
      resolve(JSON.parse(body));
    });
  });
};

async function getMutualConnections(containers, keyword) {
  for (let x of containers) {
    if (x === null || x === undefined) continue;
    // db.run(`INSERT OR IGNORE INTO containers(container_id) VALUES(${x})`);
    let TempData = await info(x);
    if (TempData != null) {
      if (TempData.jsonUrl) {
        let mutalConnectionsInfo = await awsJSON(TempData.jsonUrl);
        for (x of mutalConnectionsInfo) {
          let queryURL = x.query;
          let sql = `SELECT profile_url from users where commonConnections = "${queryURL}"`;
          let information = await new Promise((resolve, reject) => {
            db.all(sql, [], (err, rows) => {
              if (err) {
                throw err;
              }
              resolve(rows);
            });
          });

          let profile_url = information[0].profile_url;
          await addMutualConnections(profile_url, x, keyword);
        }
      } else {
        let queryURL = TempData[0].query;
        let mutalConnectionsInfo = TempData;
        let sql = `SELECT profile_url from users where commonConnections = "${queryURL}"`;
        let information = await new Promise((resolve, reject) => {
          db.all(sql, [], (err, rows) => {
            if (err) {
              throw err;
            }
            resolve(rows);
          });
        });
        console.log("here");
        console.log(information);
        let profile_url = information[0].profile_url;

        for (let k of mutalConnectionsInfo) {
          // console.log(`${profile_url} --> ${k.url} else`);
          await addMutualConnections(profile_url, k, keyword);
        }
      }
    }
  }
}

async function scrapeMutualConnections(commonURLS) {
  let containerIds = [];
  for (let x of commonURLS) {
    let sql = `select * from users where commonConnections = "${x}"`;
    let information = await new Promise((resolve, reject) => {
      db.all(sql, [], (err, rows) => {
        if (err) {
          throw err;
        }
        resolve(rows);
      });
    });
    if (information.length !== 0) continue;
    const containerID = await launchAgent(x);
    console.log(containerID);
    containerIds.push(containerID);
  }
  return containerIds;
}

async function data(searchKeyWord) {
  let sql = `SELECT keyword from keywords where keyword = "${searchKeyWord}"`;
  let information = await new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows) => {
      if (err) {
        throw err;
      }
      resolve(rows);
    });
  });
  // if (information.length !== 0)
  //   return Error("You have already searched for this term - scraping again will not add any information");
  // let ConatinerId = await launchAgent(searchKeyWord);
  // Hack need to find a better way to wait for response
  console.log(2428408728255492);

  // await sleep(1500000); // Equivalent to 25 minutes

  let userinfo = await info("2428408728255492");
  if (userinfo.jsonUrl) {
    userinfo = await awsJSON(userinfo.jsonUrl);
  }
  console.log(userinfo);
  const commonConnections = await addToDB(userinfo, searchKeyWord);
  console.log(commonConnections);
  let containerIds = await scrapeMutualConnections(commonConnections);
  // console.log(containerIds);
  // await sleep(300000);
  // console.log("end sleep");
  // await getMutualConnections(containerIds, searchKeyWord);
}

/*
 * Flow
 * run scrapper with keyword search
 * Find the latest agent object and add all the users to the db
 * foreach user, add their mutuals to the sheet if the common url does not exists in the database
 * Run the scrapper scraping all of their connections
 * Add all the mutual connections to the database
 */
exports.data = data;
