import HLSServer from "hls-server";
import http from "http";

const server = http.createServer((req, res) => {
  // You can also set using the following method
  res.setHeader(
    "Access-Control-Allow-Origin",
    "*"
  ); /* @dev First, read about security */
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*"); // Might be helpful
});
const hls = new HLSServer(server, {
  path: "/streams", // Base URI to output HLS streams
  dir: "public/videos/encoded", // Directory that input files are stored
});
server.listen(8000);
server.on("listening", () => {
  console.log("Server is up on port 8000!");
});
