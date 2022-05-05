var fs = require("fs");
var path = require("path");
var os = require("os");
var pty = require("node-pty");
const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});

let port = 8000;

app.use("/main.js", express.static(__dirname + "/dist/main.js"));
app.use("/xterm.css", express.static(require.resolve("xterm/css/xterm.css")));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", function (socket) {
  var shell = os.platform() === "win32" ? "powershell.exe" : "bash";
  console.log(os.uptime());

  var ptyProcess = pty.spawn(shell, [], {
    name: "xterm-color",
    cols: 80,
    rows: 200,
    cwd: process.env.HOME,
    env: process.env,
  });

  ptyProcess.write("zsh\r");

  ptyProcess.on("data", function (data) {
    socket.emit("data", data.toString("binary"));
  });
  socket.on("data", function (data) {
    ptyProcess.write(data);
  });
});

http.listen(port, () => {
  console.log("Listening on http://localhost:" + port);
});
