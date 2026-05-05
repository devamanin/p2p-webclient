const { io } = require("socket.io-client");

const socket = io("https://web-production-17aa6.up.railway.app/", {
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log("Connected to server, requesting ICE servers...");
  socket.emit("get_ice_servers", {}, (data) => {
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
  });
});

socket.on("connect_error", (err) => {
  console.error("Connection error:", err);
  process.exit(1);
});
