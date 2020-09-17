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
    // db.run(`INSERT OR IGNORE INTO keywords(keyword, profile_url) VALUES("${keyword}", "${x.url}")`);
    if (x.sharedConnections) {
      if (x.allCommonConnections) {
        // db.run(
        //   `INSERT OR IGNORE INTO users(profile_url, first_name, last_name, commonConnections) VALUES("${x.url}", "${x.firstName}", "${x.lastName}", "${x.allCommonConnections}")`
        // );
        temp.push(x.allCommonConnections);
      } else {
        // db.run(
        //   `INSERT OR IGNORE INTO users(profile_url, first_name, last_name) VALUES("${x.url}", "${x.firstName}", "${x.lastName}")`
        // );
        if (x.commonConnection1) {
          // db.run(
          //   `INSERT OR IGNORE INTO connections(user_profile, mutual_connection) VALUES("${x.url}", "${x.commonConnection1}")`
          // );
          // db.run(`INSERT OR IGNORE INTO users(profile_url) VALUES("${x.commonConnection1}")`);
        }
        if (x.commonConnection2) {
          // db.run(
          //   `INSERT OR IGNORE INTO connections(user_profile, mutual_connection) VALUES("${x.url}", "${x.commonConnection2}")`
          // );
          // db.run(`INSERT OR IGNORE INTO users(profile_url) VALUES("${x.commonConnection2}")`);
        }
      }
    } else {
      console.log(x);
      db.run(
        `INSERT OR IGNORE INTO users(profile_url, first_name, last_name) VALUES("${x.url}", "${x.firstName}", "${x.lastName}")`,
        (err, row) => {
          if (err) console.log(err);
        }
      );
    }
  }
  return temp;
}

async function addMutualConnections(profile_url, userinfo, keyword) {
  if (userinfo.error) return;
  db.run(
    `INSERT OR IGNORE INTO connections(user_profile, mutual_connection) VALUES("${profile_url}", "${userinfo.url}")`
  );
  db.run(
    `INSERT OR IGNORE INTO users(profile_url, first_name, last_name) VALUES("${userinfo.url}", "${userinfo.firstName}", "${userinfo.lastName}")`
  );
  db.run(`INSERT OR IGNORE INTO keywords(profile_url, keyword) VALUES("${userinfo.urls}", "${keyword}")`);
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
          // await addMutualConnections(profile_url, x, keyword);
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
        console.log(queryURL);
        let profile_url = information[0].profile_url;

        for (let k of mutalConnectionsInfo) {
          // console.log(`${profile_url} --> ${k.url} else`);
          // await addMutualConnections(profile_url, k, keyword);
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
  // console.log(ConatinerId);

  // await sleep(3600000);

  let userinfo = await info("5238730920386243");

  const commonConnections = await addToDB(userinfo, searchKeyWord);
  // console.log(commonConnections);
  // let containerIds = await scrapeMutualConnections(commonConnections);

  let containerIds = [
    "4880749027382179",
    "4465994509800951",
    "5819285003376512",
    "78909650127112",
    "6898217625305028",
    "6640732834356630",
    "4448266026167661",
    "3149533372628958",
    "2673554966213635",
    "1309340472042134",
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    "4025128365663202",
    "3308133802368237",
    undefined,
    undefined,
    "5740167403750670",
    undefined,
    undefined,
    "5613881370169783",
    undefined,
    undefined,
    undefined,
    "3355760127579919",
    undefined,
    undefined,
    "7896915961366923",
    undefined,
    undefined,
    "5150313639123018",
    undefined,
    undefined,
    undefined,
    undefined,
    "4504820906189929",
    "5296165496388236",
    "7038101412243388",
    undefined,
    "6698048672105650",
    "59898679347046",
    "6527433522251064",
    undefined,
    undefined,
    undefined,
    "1998806191617600",
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    "8436849828265656",
    "7647960045578901",
    "3788664469966422",
    "6334001863796236",
    "4210347251028888",
    undefined,
    undefined,
    undefined,
    "2686844042398487",
    "826642483242905",
    "1580471180566960",
    "5149996584991893",
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    "1840574038587811",
    undefined,
    undefined,
    undefined,
  ];
  // await sleep(900000);
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

data("aerospace");
