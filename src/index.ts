import { transcribeWithScribe } from "./transcriber.js";
import { downloadFromYoutube } from "./youtube-downloader.js";
import { isYoutubeUrl } from "./utils.js";
import { TranscriptionOptions } from "./types.js";
import { TranscriptionConfig } from "./config.js";

/**
 * 指定された音声/動画ファイルまたはYouTube URLを文字起こしする
 * @param input 音声/動画ファイルのパスまたはYouTubeのURL
 * @param options 文字起こしのオプション
 * @returns 成功時は0、エラー時は1
 */
export const transcribe = async (
  input: string,
  options: TranscriptionOptions = {}
): Promise<number> => {
  try {
    // 入力がYouTubeのURLの場合、ダウンロードする
    let audioPath = input;
    let youtubeMetadata: { title: string; url: string } | undefined;
    if (isYoutubeUrl(input)) {
      console.log("YouTube URL detected. Starting download...");
      const downloadResult = await downloadFromYoutube(input);
      if (!downloadResult) {
        console.error(
          "Failed to download from YouTube. Stopping process."
        );
        return 1;
      }
      audioPath = downloadResult.filePath;
      youtubeMetadata = { title: downloadResult.title, url: downloadResult.url };
    }

    // 文字起こし処理を実行
    const config = TranscriptionConfig.create(options);
    config.youtubeMetadata = youtubeMetadata;
    return await transcribeWithScribe(audioPath, config);
  } catch (error) {
    console.error(
      `Error occurred: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return 1;
  }
};

// モジュールのエクスポート
export { downloadFromYoutube } from "./youtube-downloader.js";
export { transcribeWithScribe } from "./transcriber.js";
export * from "./types.js";
