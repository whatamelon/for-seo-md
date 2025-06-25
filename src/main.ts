import { app, BrowserWindow, ipcMain } from "electron";
import registerListeners from "./helpers/ipc/listeners-register";
import path from "path";
import {
  installExtension,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";
import { spawn, exec } from "child_process";

const inDevelopment = process.env.NODE_ENV === "development";

function createWindow() {
  console.log("dev", inDevelopment);
  const preload = path.join(__dirname, "preload.js");
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      devTools: true,
      contextIsolation: true,
      nodeIntegration: true,
      nodeIntegrationInSubFrames: false,
      preload: preload,
    },
    titleBarStyle: "default",
  });
  registerListeners(mainWindow);

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }
}

async function installExtensions() {
  try {
    const result = await installExtension(REACT_DEVELOPER_TOOLS);
    console.log(`Extensions installed successfully: ${result.name}`);
  } catch {
    console.error("Failed to install extensions");
  }
}

// Python 패키지 설치 체크 및 자동 설치 함수
function ensurePythonPackages() {
  exec("pip show torch", (err) => {
    if (err) {
      // torch가 없으면 나머지도 없을 확률이 높으니 한 번에 설치
      const installCmd =
        "pip install torch pillow git+https://github.com/openai/CLIP.git llama-cpp-python";
      const installProcess = exec(installCmd);

      installProcess.stdout?.on("data", (data) => {
        console.log("[pip install]", data.toString());
      });
      installProcess.stderr?.on("data", (data) => {
        console.error("[pip install error]", data.toString());
      });
      installProcess.on("close", (code) => {
        if (code === 0) {
          console.log("필수 Python 패키지 설치 완료");
        } else {
          console.error("Python 패키지 설치 실패. 수동 설치 필요");
        }
      });
    } else {
      console.log("필수 Python 패키지 이미 설치됨");
    }
  });
}

app
  .whenReady()
  .then(() => {
    ensurePythonPackages();
    createWindow();
  })
  .then(installExtensions);

//osX only
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
//osX only ends

// 렌더러에서 오는 로그 메시지 수신
ipcMain.on("console-log", (_event, ...args) => {
  console.log("[렌더러]", ...args);
});

ipcMain.handle("get-smart-filename", async (event, imagePath: string) => {
  return new Promise((resolve, reject) => {
    const pythonPath = "python3"; // 또는 python
    const scriptPath = path.join(__dirname, "python", "infer.py");
    const proc = spawn(pythonPath, [scriptPath, imagePath]);
    let result = "";
    proc.stdout.on("data", (data) => {
      result += data.toString();
    });
    proc.stderr.on("data", () => {});
    proc.on("close", (code) => {
      if (code === 0) resolve(result);
      else reject("Python script failed");
    });
  });
});
