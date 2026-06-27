# Electron — decision trees

## IPC: invoke vs send

```
Need request/response with promise?
├── ipcMain.handle / ipcRenderer.invoke
└── Fire-and-forget events → ipcRenderer.send / on
```

## electron-builder vs electron-forge

```
Team preference and CI integration?
├── Pick one; document in repo; avoid mixing without reason
```

## Single instance vs multi-window

```
Mail-like multi-window product?
├── Track windows in main; single-instance lock per app policy
```

## Auto-update channel

```
Beta users vs stable?
├── Separate update channels; sign all artifacts
```

## Sandbox (`webPreferences.sandbox`)

```
Need Node-ish native addons or legacy preload patterns incompatible with sandbox?
├── Document exception; minimize exposed surface
└── Prefer sandbox: true — validate with integration tests on each OS
```

## Further reading

- [main-preload-and-ipc.md](main-preload-and-ipc.md), [edge-cases.md](edge-cases.md)
