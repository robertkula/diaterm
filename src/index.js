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
});

const socket = io();

socket.on("connect", function () {
  terminal.write("\r\n*** Disconnected from server ***\r\n");
});

terminal.onKey(function (ev) {
  socket.emit("data", ev.key);
});

socket.on("data", function (data) {
  terminal.write(data);
});

socket.on("disconnect", function () {
  terminal.write("\r\n*** Disconnected from server ***\r\n");
});
