import { contextBridge, ipcRenderer } from 'electron';
import type { AixDesktopAPI, DesktopSpineEvent } from '../shared/api.js';

const api: AixDesktopAPI = {
  getStatus: () => ipcRenderer.invoke('system:getStatus'),

  listSkills: (category) => ipcRenderer.invoke('skills:list', category),
  getSkill: (name) => ipcRenderer.invoke('skills:get', name),
  validateSkills: () => ipcRenderer.invoke('skills:validate'),
  getSkillReference: (skillName, refPath) => ipcRenderer.invoke('skills:getReference', skillName, refPath),
  installProvider: (provider) => ipcRenderer.invoke('system:installProvider', provider),
  listMemories: () => ipcRenderer.invoke('memory:list'),
  searchMemories: (query) => ipcRenderer.invoke('memory:search', query),
  pushMemory: (title, body, tags) => ipcRenderer.invoke('memory:push', title, body, tags),
  deleteMemory: (id) => ipcRenderer.invoke('memory:delete', id),
  toggleKbService: (action) => ipcRenderer.invoke('system:toggleKbService', action),
  listSessions: () => ipcRenderer.invoke('spine:listSessions'),
  getSessionArtifact: (sessionId, artifactName) => ipcRenderer.invoke('spine:getArtifact', sessionId, artifactName),
  runVerify: (sessionId, command) => ipcRenderer.invoke('verify:run', sessionId, command),
  startSpine: (task, mode) => ipcRenderer.invoke('spine:start', task, mode),
  respondHitl: (requestId, decision, note) => ipcRenderer.invoke('spine:respondHitl', requestId, decision, note),
  onSpineEvent: (callback) => {
    const listener = (_: unknown, event: unknown) => {
      callback(event as DesktopSpineEvent);
    };
    ipcRenderer.on('spine:event', listener);
    return () => {
      ipcRenderer.removeListener('spine:event', listener);
    };
  },
};

contextBridge.exposeInMainWorld('aixAPI', api);
