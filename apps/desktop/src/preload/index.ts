import { contextBridge, ipcRenderer } from 'electron';
import type { AixDesktopAPI } from '../shared/api.js';

const api: AixDesktopAPI = {
  getStatus: () => ipcRenderer.invoke('system:getStatus'),

  listSkills: (category) => ipcRenderer.invoke('skills:list', category),
  getSkill: (name) => ipcRenderer.invoke('skills:get', name),
  validateSkills: () => ipcRenderer.invoke('skills:validate'),

  listMemories: () => ipcRenderer.invoke('memory:list'),
  searchMemories: (query) => ipcRenderer.invoke('memory:search', query),
  pushMemory: (title, body, tags) => ipcRenderer.invoke('memory:push', title, body, tags),

  listSessions: () => ipcRenderer.invoke('spine:listSessions'),
  getSessionArtifact: (sessionId, artifactName) => ipcRenderer.invoke('spine:getArtifact', sessionId, artifactName),
  runVerify: (sessionId, command) => ipcRenderer.invoke('verify:run', sessionId, command),
};

contextBridge.exposeInMainWorld('aixAPI', api);
