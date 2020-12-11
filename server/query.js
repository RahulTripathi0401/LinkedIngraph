import request from "request";
import sqlite3 from "sqlite3";
import path from "path";

const __dirname = path.resolve();
const SalesNavID = "628734535269933";
const ProfileUrl = "6522377449152116";
const APIToken = "Oxymn77yzTJ4LWF6MSC4dOGxnSsEH41ImmruWpAWKHU";
// let db = new sqlite3.Database(`${__dirname}/database/test.db`);
let db = new sqlite3.Database("/Users/dev/Desktop/graph/database/test.db");
/**
 * @param search The search keyword passed into the function
 * @returns a promise which resolves to the containerID associated with the keyword search
 */

let SearchNavlaunch = async function (search, cookie, AgentID) {
  const options = {
    method: "POST",
    url: "https://api.phantombuster.com/api/v2/agents/launch",
    headers: {
      "content-type": "application/json",
      "x-phantombuster-key": APIToken,
    },
    body: {
      id: AgentID,
      arguments: `{
        "sessionCookie": "${cookie}",
        "searches": "${search}",
        "numberOfProfiles": 1000,
        "extractDefaultUrl": false,
        "removeDuplicateProfiles": false,
        "accountSearch": false,
        "watcherMode": false
      }`,
    },
    json: true,
  };
  return new Promise((resolve, reject) => {
    request(options, async function (error, response, body) {
      if (error) throw error;
      resolve(body.containerId);
    });
  });
};

let launchAgent = async function (search, cookie, AgentID) {
  const options = {
    method: "POST",
    url: "https://api.phantombuster.com/api/v2/agents/launch",
    headers: {
      "content-type": "application/json",
      "x-phantombuster-key": APIToken,
    },
    body: {
      id: AgentID,
      arguments: `{ 	"sessionCookie": "${cookie}", 	"search": "${search}", "numberOfProfiles": 1000, "circles": { 		"first": false, 		"second": true, 		"third": true 	}, 	"category": "People", 	"csvName": "tmp", 	"removeDuplicateProfiles": false, 	"watcherMode": false }`,
    },
    json: true,
  };
  return new Promise((resolve, reject) => {
    request(options, async function (error, response, body) {
      if (error) throw error;
      resolve(body.containerId);
    });
  });
};

/**
 * @param containerId the containerId assocaited with a search
 * @returns A JSON object that contains the result of that containerId
 */

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
      if (error) throw error;
      let fire = JSON.parse(body);
      resolve(JSON.parse(fire.resultObject));
    });
  });
};

/**
 *
 * @param {*} ms The amount of time to sleep in ms
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * @param userinfo takes in a defined JSON object that has information about the user
 * @param keyword the keyword associated with the a search e.g. "head of learning"
 * @returns a list of common urls that have not been scraped. These common URLS contain
 *  the mutual connection information which need to be later scraped.
 */

async function addToDB(userinfo, keyword) {
  let temp = [];
  for (let x of userinfo) {
    // If for some reason the object has an error
    if (x.error) continue;
    // Insert into the keywords table the keyword and userprofile associated with that keyword. This is later
    //  used to construct the graph.
    x.name = x.name.replace(/"|`|'/g, "");
    const id = x.profileUrl.replace(
      /,NAME_SEARCH.*$|^https:\/\/www.linkedin.com\/sales\/people\//g,
      ""
    );
    const mutualConnectionsURL =
      "https://www.linkedin.com/search/results/people/?facetConnectionOf=%5B%22" +
      id +
      "%22%5D&facetNetwork=%5B%22F%22%5D&origin=MEMBER_PROFILE_CANNED_SEARCH";
    const profileUrl = "https://www.linkedin.com/in/" + id;
    db.run(
      `INSERT OR IGNORE INTO keywords(keyword, profile_url) VALUES("${keyword}", "${profileUrl}")`
    );
    if (x.sharedConnectionsCount > 0) {
      db.run(
        `INSERT OR IGNORE INTO users(profile_url, name, commonConnections, location, companyID) VALUES("${profileUrl}", "${x.name}", "${mutualConnectionsURL}", "${x.location}", "${x.companyId}")`
      );
      temp[mutualConnectionsURL] = profileUrl;
    } else {
      db.run(
        `INSERT OR IGNORE INTO users(profile_url, name, location, companyID) VALUES("${profileUrl}", "${x.name}", "${x.location}", "${x.companyId}")`
      );
    }
  }
  return temp;
}

/**
 *
 * @param {*} profile_url The user profile
 * @param {*} userinfo One of the user profile's connections
 * @param {*} keyword Keyword to store in the database
 */
async function addMutualConnections(profile_url, userinfo, keyword) {
  if (userinfo.error) return;
  userinfo.name = userinfo.name.replace(/"|`|'/g, "");
  userinfo.url = await getID(userinfo.allCommonConnections);
  console.log(userinfo.url);
  db.run(
    `INSERT OR IGNORE INTO connections(user_profile, mutual_connection) VALUES("${profile_url}", "${userinfo.url}")`
  );
  db.run(
    `INSERT OR IGNORE INTO users(profile_url, name, commonConnections, location) VALUES("${userinfo.url}", "${userinfo.name}", "${userinfo.allCommonConnections}", "${userinfo.location}")`
  );
  db.run(
    `INSERT OR IGNORE INTO keywords(profile_url, keyword) VALUES("${userinfo.url}", "${keyword}")`
  );
}

/**
 *
 * @param {*} AWSurl AWS url that contains the JSON result object
 * @returns JSON object that contains the data
 */
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

async function getMutualConnections(containers, keyword, connections) {
  for (let x of containers) {
    if (x === null || x === undefined) continue;
    let TempData = await info(x);
    console.log(TempData);
    if (TempData != null) {
      if (TempData.jsonUrl) {
        let mutalConnectionsInfo = await awsJSON(TempData.jsonUrl);
        for (x of mutalConnectionsInfo) {
          // let profile_url = x.;
          // await addMutualConnections(profile_url, x, keyword);
        }
      } else {
        let mutualCOnnectionUrl = TempData[0].query;
        let profile_url = connections[mutualCOnnectionUrl];
        for (let k of TempData) {
          if (k.allCommonConnections) {
            console.log("here");
            await addMutualConnections(profile_url, k, keyword);
          }
        }
      }
    }
  }
}

async function getID(url) {
  let id = url.replace(
    /^https:\/\/www.linkedin.com\/search\/results\/people\/\?facetConnectionOf=%5B%22|%22%.*$/g,
    ""
  );
  let profileUrl = "https://www.linkedin.com/in/" + id;
  return profileUrl;
}

async function scrapeMutualConnections(commonURLS, cookie) {
  let containerIds = [];
  for (let [key, value] of Object.entries(commonURLS)) {
    const containerID = await launchAgent(key, cookie, ProfileUrl);
    containerIds.push(containerID);
    console.log(containerIds);
    await sleep(5000);
  }
  console.log("done");
  return containerIds;
}

export async function data(searchKeyWord, cookies) {
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
  //   throw "You have already searched for this term - scraping again will not add any information";
  for (let x of cookies) {
    console.log(x);
    // let ConatinerId = await SearchNavlaunch(searchKeyWord, x, SalesNavID);
    let ConatinerId = 8589441525635451;
    console.log(ConatinerId);
    // Hack need to find a better way to wait for response
    // await sleep(720000); // Equivalent to 12 minutes
    let userinfo = await info(ConatinerId);
    if (userinfo.jsonUrl) {
      userinfo = await awsJSON(userinfo.jsonUrl);
    }
    // console.log(userinfo);
    const commonConnections = await addToDB(userinfo, searchKeyWord);
    // console.log(commonConnections);

    // let containerIds = await scrapeMutualConnections(commonConnections, x);
    // console.log(containerIds);
    await getMutualConnections(containerIds, searchKeyWord, commonConnections);
  }
}

/*
 * Flow
 * run scrapper with keyword search
 * Find the latest agent object and add all the users to the db
 * foreach user, add their mutuals to the sheet if the common url does not exists in the database
 * Run the scrapper scraping all of their connections
 * Add all the mutual connections to the database
 */
