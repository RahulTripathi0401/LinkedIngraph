const showGraph = document.getElementById("show");
const searchGraph = document.getElementById("existing");
const error = document.getElementById("error");
const success = document.getElementById("success");
const textArea = document.getElementById("cookies");
const load = document.getElementById("load");
const existingGraphs = document.getElementById("existing");


const options = {
  manipulation: false,
  height: "100%",
  nodes: {
    shapeProperties: {
      interpolation: false, // 'true' for intensive zooming
    },
  },
  edges: {
    arrows: "from",
    length: 1000,
  },
  physics: {
    // Even though it's disabled the options still apply to network.stabilize().
    enabled: false,
    solver: "repulsion",
    repulsion: {
      nodeDistance: 3000, // Put more distance between the nodes.
    },
  },
};

document.addEventListener("DOMContentLoaded", async function(event) {
  await fetch(`http://206.189.155.84/existing_graphs`)
  .then(async (res) => {
    let data = await res.json();
    let keywords = data.keywords;
    let first = document.createElement("option");
    existingGraphs.appendChild(first);

    console.log(keywords);
    for (let i = 0; i < keywords.length; i += 1){
      let select = document.createElement("option");
      select.innerText = keywords[i].keyword;
      existingGraphs.appendChild(select);
    }
  })
});



async function initialise() {
  error.innerText = "";
  error.style.display = "none";
  success.innerText = "";
  success.style.display = "none";
}

function getCookies() {
  let cookie = textArea.value.split(",");
  if (cookie.length === 1 && !cookie[0]) {
    error.innerText = "Bad Cookie";
    error.style.display = "block";
    return false;
  }
  console.log(cookie);
  return cookie;
}

showGraph.addEventListener("click", async () => {
  initialise();
  let cookies = getCookies();
  if (!cookies) {
    return;
  }
  const searchWord = String(document.getElementById("searchKeyword").value);

  const data = JSON.stringify({ cookie: cookies, url: searchWord });
  success.innerText = "Scraping Data this may take a while please be patient !";
  success.style.display = "block";
  console.log(success);
  await fetch(`${this.window.location.href}launch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: data,
  }).then(async (res) => {
    let data = await res.json();
    console.log(data);
  });
});

searchGraph.addEventListener("change", async () => {
  initialise();
  let cookie = getCookies();
  if (!cookie) {
    return;
  }
  console.log("here");
  const e = document.getElementById("existing");
  var url = e.options[e.selectedIndex].text;

  const searchWord = {
    url: String(url),
  };
  let data = await fetch(`${this.window.location.href}connections`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(searchWord),
  })
    .then(async (response) => {
      if (response.ok) {
        return response.json();
      }
    })
    .catch((err) => {
      console.warn("Something went wrong.", err);
    });
  const edges = data.data;
  data = await fetch(`${this.window.location.href}nodes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(searchWord),
  })
    .then(async (response) => {
      if (response.ok) {
        return response.json();
      }
    })
    .catch((err) => {
      // There was an error
      console.warn("Something went wrong.", err);
    });
  const nodes = data.data;
  console.log(nodes);
  load.style.display = 'block';
  // success.innerText = `We have found a graph that matches the ${searchWord}, hold on while we create it !`;
  var container = document.getElementById("mynetwork");
  var info = { nodes: nodes, edges: edges };
  var gph = await new vis.Network(container, info, options);
  await gph.stabilize();
  console.log("done");
  setTimeout(function () {
  load.style.display = 'none';
}, 1500);
});
