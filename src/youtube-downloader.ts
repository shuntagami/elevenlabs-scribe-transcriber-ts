import fs from "fs";
import path from "path";
import ytdl from "@distube/ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import { sanitizeFilename } from "./utils.js";

/**
 * YouTubeの動画をMP3形式でダウンロードする
 * @param url YouTubeのURL
 * @param outputDir 出力ディレクトリ(デフォルト: youtube_downloads)
 * @returns ダウンロードしたMP3ファイルのパスとメタデータ、エラー時はnull
 */
export const downloadFromYoutube = async (
  url: string,
  outputDir = path.join(process.env.PROJECT_ROOT || "", "youtube_downloads")
): Promise<{ filePath: string; title: string; url: string } | null> => {
  try {
    // 出力ディレクトリが存在しない場合は作成
    const absoluteOutputDir = path.resolve(outputDir);
    fs.mkdirSync(absoluteOutputDir, { recursive: true });
    console.log(`Output directory: ${absoluteOutputDir}`);

    // 動画情報を取得
    const info = await ytdl.getInfo(url);
    const videoTitle = info.videoDetails.title;
    console.log(`Video title: ${videoTitle}`);

    // 安全なファイル名を生成
    const safeFilename = sanitizeFilename(`${videoTitle}.mp3`);
    const outputPath = path.join(absoluteOutputDir, safeFilename);

    // ytdl-coreでストリームを取得
    const videoStream = ytdl(url, {
      quality: "highestaudio",
      filter: "audioonly",
    });

    // ffmpegでMP3に変換
    return new Promise((resolve, reject) => {
      ffmpeg(videoStream)
        .audioBitrate(192)
        .save(outputPath)
        .on("error", (err) => {
          console.error(
            `Error occurred during YouTube video download: ${err.message}`
          );
          reject(err);
        })
        .on("end", () => {
          console.log(`Download completed: ${outputPath}`);
          resolve({ filePath: outputPath, title: videoTitle, url });
        });
    });
  } catch (error) {
    console.error(
      `Error occurred during YouTube download: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return null;
  }
};
