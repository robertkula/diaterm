import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { io } from "socket.io-client";

const terminal = new Terminal();
const fitAddon = new FitAddon();
terminal.loadAddon(fitAddon);
document.addEventListener("DOMContentLoaded", function () {
  let containerElement = document.getElementById("terminal-container");
  terminal.open(containerElement);
  fitAddon.fit();
  let lsButton = document.getElementById("command-ls");
  lsButton.addEventListener("click", function () {
    console.log("button clicked");
    sendLS();
  });
});

const socket = io();

socket.on("connect", function () {
  terminal.write("\r\n*** Connected to server ***\r\n");
});

terminal.onKey(function (ev) {
  socket.emit("data", ev.key);
});

socket.on("data", function (data) {
  terminal.write(data);
  console.log(data);
});

socket.on("disconnect", function () {
  terminal.write("\r\n*** Disconnected from server ***\r\n");
});

console.log("running");

function sendLS() {
  let lsUrl = window.location.href + "ls";
  fetch(lsUrl, {
    method: "POST",
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Success:", data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
