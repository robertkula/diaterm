var os = require("os");
const { Client } = require("ssh2");
const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

let port = 8000;

const conn = new Client();
let connStream;

app.use("/main.js", express.static(__dirname + "/dist/main.js"));
app.use("/xterm.css", express.static(require.resolve("xterm/css/xterm.css")));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

function expect(waitFor, skipFirst) {
  return new Promise((resolve) => {
    let result = "";
    let waitForData = function (data) {
      let dataString = data.toString("binary");
      console.log(`data is {${dataString}}`);
      if (dataString.endsWith("\r\n")) {
        dataString = dataString.slice(0, -2);
      }
      if (skipFirst && dataString.startsWith(skipFirst)) {
        console.log("skipping first");
        skipFirst = false;
      } else if (dataString.endsWith(waitFor)) {
        connStream.off("data", waitForData);
        resolve(result);
      } else {
        result += dataString;
      }
    };
    connStream.on("data", waitForData);
  });
}

function send(command) {
  connStream.write(command + "\n");
}

async function ls() {
  send("ls");
  let result = await expect("$ ", "ls");
  console.log(`result is\n{${result}}`);
  return { result: result };
}

app.post("/ls", (req, res) => {
  console.log("ls received");
  ls().then((result) => res.json(result));
});

io.on("connection", function (socket) {
  conn
    .on("ready", () => {
      conn.shell((err, stream) => {
        connStream = stream;
        if (err) {
          socket.emit("data", "cannot cannot to ssh server");
          return;
        }
        stream
          .on("close", () => {
            console.log("Stream :: close");
            conn.end();
          })
          .on("data", (data) => {
            socket.emit("data", data.toString("binary"));
          });

        socket.on("data", function (data) {
          stream.write(data);
        });
      });
    })
    .connect({
      host: "localhost",
      port: 22,
      username: "test",
      password: "test1",
    });
});

http.listen(port, () => {
  console.log("Listening on http://localhost:" + port);
});
