const http = require("http");
const https = require("https");
//const next = require("next");
const express = require("express");
const WebSocketServer = require("ws").Server;
const child_process = require("child_process");
const url = require("url");
const fs = require("fs");

const port = parseInt(process.env.PORT, 10) || 3000;

const cert = process.env.CERT_FILE
  ? fs.readFileSync(process.env.CERT_FILE)
  : undefined;
const key = process.env.KEY_FILE
  ? fs.readFileSync(process.env.KEY_FILE)
  : undefined;
const transcode = process.env.SMART_TRANSCODE || true;
const options = {
  cert,
  key,
};

const app = express();
const server = http.createServer(app);

const wss = new WebSocketServer({
  server,
});

wss.on("connection", (ws, req) => {
  console.log("Streaming socket connected");

  const queryString = url.parse(req.url).search;
  const params = new URLSearchParams(queryString);
  const baseUrl = params.get("url") ?? "rtmp://rtmp-server:1935/live";
  const key = params.get("key") ?? "mytv";

  const rtmpUrl = `${baseUrl}/${key}`;

  const videoCodec = [
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    // "-tune",
    // "zerolatency",
    // "-vf",
    // "scale=-2:0",
  ];

  const audioCodec = ["-c:a", "aac", "-b:a", "128k"];

  const ffmpeg = child_process.spawn("ffmpeg", [
    "-i",
    "-",

    //force to overwrite
    "-y",

    "-v",
    "error",

    // used for audio sync
    // "-use_wallclock_as_timestamps",
    // "1",
    // "-async",
    // "1",

    // ...videoCodec,

    // ...audioCodec,
    //'-filter_complex', 'aresample=44100', // resample audio to 44100Hz, needed if input is not 44100
    //'-strict', 'experimental',
    // "-bufsize",
    // "1000",
    "-f",
    "flv",
    // "-profile:v",
    // "baseline",
    rtmpUrl,
  ]);

  // Kill the WebSocket connection if ffmpeg dies.
  ffmpeg.on("close", (code, signal) => {
    console.log(
      "FFmpeg child process closed, code " + code + ", signal " + signal
    );
    ws.terminate();
  });

  // Handle STDIN pipe errors by logging to the console.
  // These errors most commonly occur when FFmpeg closes and there is still
  // data to write.f If left unhandled, the server will crash.
  ffmpeg.stdin.on("error", (e) => {
    console.log("FFmpeg STDIN Error", e);
  });

  // FFmpeg outputs all of its messages to STDERR. Let's log them to the console.
  ffmpeg.stderr.on("data", (data) => {
    ws.send("ffmpeg got some data");
    console.log("FFmpeg STDERR:", data.toString());
  });

  ws.on("message", (msg) => {
    if (Buffer.isBuffer(msg)) {
      console.log("this is some video data");
      ffmpeg.stdin.write(msg);
    } else {
      console.log(msg);
    }
  });

  ws.on("close", (e) => {
    console.log("Client closed the connection");
    ffmpeg.kill("SIGINT");
  });
});

server.listen(port, () => {
  console.log(`WebSocket Server listening on port ${port}`);
});
