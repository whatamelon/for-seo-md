/* eslint-disable @typescript-eslint/no-explicit-any */
import exposeContexts from "./helpers/ipc/context-exposer";
import { contextBridge, ipcRenderer } from "electron";

exposeContexts();

(async () => {
  const ElectronStoreModule = await import("electron-store");
  const ElectronStore = (ElectronStoreModule as any).default || ElectronStoreModule;
  const store = new (ElectronStore as any)();

  contextBridge.exposeInMainWorld("electronStore", {
    get: (key: string) => (store as any).get(key),
    set: (key: string, value: unknown) => (store as any).set(key, value),
  });
})();

contextBridge.exposeInMainWorld("electronAPI", {
  selectFile: () => ipcRenderer.invoke("dialog:openFile"),
  selectFolder: () => ipcRenderer.invoke("dialog:openFolder"),
  saveImages: (baseFolder: string, files: { name: string; data: ArrayBuffer }[], subFolder: string) =>
    ipcRenderer.invoke("save-images", baseFolder, files, subFolder),
  saveTempImage: (data: ArrayBuffer, ext: string) =>
    ipcRenderer.invoke("save-temp-image", data, ext),
  deleteTempFile: (filePath: string) =>
    ipcRenderer.invoke("delete-temp-file", filePath),
  downloadImageToTemp: (url: string, ext: string) =>
    ipcRenderer.invoke("download-image-to-temp", url, ext),
  readFileAsDataUrl: (filePath: string) =>
    ipcRenderer.invoke("read-file-as-dataurl", filePath),
  openFileLocation: (filePath: string) =>
    ipcRenderer.invoke("open-file-location", filePath),
});

contextBridge.exposeInMainWorld("electronLogger", {
  log: (...args: any[]) => ipcRenderer.send("console-log", ...args),
});
