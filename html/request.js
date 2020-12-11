const showGraph = document.getElementById("show");
const searchGraph = document.getElementById("existing");
const error = document.getElementById("error");
const success = document.getElementById("success");
const textArea = document.getElementById("cookies");

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
      nodeDistance: 1000, // Put more distance between the nodes.
    },
  },
};

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

searchGraph.addEventListener("click", async () => {
  initialise();
  let cookie = getCookies();
  if (!cookie) {
    return;
  }

  const searchWord = {
    url: String(document.getElementById("searchKeyword").value),
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
  if (data.data.length === 0) {
    error.style.display = "block";
    error.innerText = `The search url does not exist in the database`;
    return;
  }
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
  success.innerText = `We have found a graph that matches the ${searchWord}, hold on while we create it !`;
  var container = document.getElementById("mynetwork");
  var info = { nodes: nodes, edges: edges };
  var gph = new vis.Network(container, info, options);
  gph.stabilize();
});
