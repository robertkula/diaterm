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

function expect(waitFor) {
  return new Promise((resolve) => {
    connStream.on("data", function (data) {
      let dataString = data.toString("binary");
      if (dataString.endsWith(waitFor)) {
        resolve(dataString);
      }
    });
  });
}

function send(command) {
  connStream.write(command + "\n");
}

async function ls() {
  send("ls");
  let result = await expect("$ ");
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
        if (err) throw err;
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
