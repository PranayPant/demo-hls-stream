import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";

ffmpeg.setFfmpegPath(ffmpegPath.path);

export function encode(fileName) {
  // Below is FFMPEG converting MP4 to HLS with reasonable options.
  // https://www.ffmpeg.org/ffmpeg-formats.html#hls-2
  ffmpeg(`dist/videos/raw/${fileName}.mp4`, { timeout: 432000 })
    .addOptions([
      "-profile:v baseline", // baseline profile (level 3.0) for H264 video codec
      "-level 3.0",
      "-s 640x360", // 640px width, 360px height output video dimensions
      "-start_number 0", // start the first .ts segment at index 0
      "-hls_time 10", // 10 second segment duration
      "-hls_list_size 0", // Maxmimum number of playlist entries (0 means all entries/infinite)
      "-f hls", // HLS format
    ])
    .output(`dist/videos/encoded/${fileName}.m3u8`)
    .on("end", () => console.log("Done!"))
    .run();
}

encode("brahma-jeeva-maya-1");
