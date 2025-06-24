import { ipcMain, dialog, shell } from "electron";
import fs from "fs";
import path from "path";
import os from "os";
import https from "https";
import http from "http";
import { URL } from "url";

export function addFileDialogEventListeners() {
  ipcMain.handle("dialog:openFile", async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ["openFile"],
    });
    return canceled ? null : filePaths[0];
  });

  ipcMain.handle("dialog:openFolder", async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    });
    return canceled ? null : filePaths[0];
  });

  ipcMain.handle("save-images", async (_event, baseFolder: string, files: { name: string; data: ArrayBuffer }[], subFolder: string) => {
    const targetDir = path.join(baseFolder, subFolder);
    fs.mkdirSync(targetDir, { recursive: true });
    for (const file of files) {
      fs.writeFileSync(path.join(targetDir, file.name), Buffer.from(file.data));
    }
    return targetDir;
  });

  ipcMain.handle("save-temp-image", async (_event, data: ArrayBuffer, ext: string) => {
    const tempDir = os.tmpdir();
    const fileName = `for-seo-md-temp-${Date.now()}.${ext}`;
    const filePath = path.join(tempDir, fileName);
    fs.writeFileSync(filePath, Buffer.from(data));
    return filePath;
  });

  ipcMain.handle("delete-temp-file", async (_event, filePath: string) => {
    try {
      fs.unlinkSync(filePath);
    } catch {
      // 이미 삭제됐거나 에러 무시
    }
  });

  function downloadWithRedirect(urlStr: string, filePath: string, maxRedirects: number = 5): Promise<string> {
    return new Promise((resolve, reject) => {
      if (maxRedirects <= 0) return reject(new Error("리다이렉트 한도 초과"));

      const urlObj = new URL(urlStr);
      const proto = urlObj.protocol === "https:" ? https : http;
      const options = {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        },
        rejectUnauthorized: false as unknown as boolean, // SSL 무시 (테스트용)
      };

      const file = fs.createWriteStream(filePath);
      const req = proto.get(urlStr, options, (res) => {
        const status = res.statusCode as number;
        if ([301, 302, 307, 308].includes(status)) {
          // 리다이렉트 follow
          file.close();
          fs.unlinkSync(filePath);
          return resolve(downloadWithRedirect(res.headers.location as string, filePath, maxRedirects - 1));
        }
        if (status !== 200) {
          file.close();
          fs.unlinkSync(filePath);
          return reject(new Error(`이미지 다운로드 실패: ${status}`));
        }
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve(filePath);
        });
        file.on("error", (err) => {
          file.close();
          fs.unlinkSync(filePath);
          reject(err);
        });
      });
      req.on("error", (err) => {
        file.close();
        fs.unlinkSync(filePath);
        reject(err);
      });
    });
  }

  ipcMain.handle("download-image-to-temp", async (_event, url: string, ext: string) => {
    const tempDir = os.tmpdir();
    const fileName = `for-seo-md-temp-${Date.now()}.${ext}`;
    const filePath = path.join(tempDir, fileName);
    await downloadWithRedirect(url, filePath);
    return filePath;
  });

  ipcMain.handle("read-file-as-dataurl", async (_event, filePath: string) => {
    const data = fs.readFileSync(filePath);
    const ext = path.extname(filePath).slice(1) || "jpg";
    const mime = ext === "png" ? "image/png" : "image/jpeg";
    return `data:${mime};base64,${data.toString("base64")}`;
  });

  ipcMain.handle("open-file-location", async (_event, filePath: string) => {
    shell.showItemInFolder(filePath);
  });
} 