import NodeMediaServer from "node-media-server";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";

ffmpeg.setFfmpegPath(ffmpegPath.path);

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: 8000,
    allow_origin: "*",
    mediaroot: "./dist",
  },
  trans: {
    ffmpeg: ffmpegPath.path,
    tasks: [
      {
        app: "live",
        hls: true,
        hlsFlags: "[hls_time=2:hls_list_size=3]",
        hlsKeep: false,
      },
    ],
    MediaRoot: "./dist",
  },
};

var nms = new NodeMediaServer(config);
nms.run();
