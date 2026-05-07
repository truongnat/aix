import { describe, it, expect } from 'vitest';
import { listSkillDirs, readSkillInfo } from './skills.js';
import { resolve } from 'node:path';

const REPO_ROOT = resolve(import.meta.dirname, '../..');

describe('listSkillDirs', () => {
  it('finds all skill directories', () => {
    const dirs = listSkillDirs(REPO_ROOT);
    expect(dirs.length).toBeGreaterThan(80);
  });

  it('each dir has a SKILL.md', () => {
    const dirs = listSkillDirs(REPO_ROOT);
    for (const dir of dirs) {
      const info = readSkillInfo(dir);
      expect(info.hasSkillMd).toBe(true);
    }
  });
});

describe('readSkillInfo', () => {
  it('extracts name from frontmatter', () => {
    const dirs = listSkillDirs(REPO_ROOT);
    const reactPro = dirs.find(d => d.endsWith('/react-pro'));
    expect(reactPro).toBeDefined();
    const info = readSkillInfo(reactPro!);
    expect(info.name).toBe('react-pro');
    expect(info.hasSkillMd).toBe(true);
    expect(info.description).toBeTruthy();
  });

  it('name matches folder for all skills', () => {
    const dirs = listSkillDirs(REPO_ROOT);
    for (const dir of dirs) {
      const info = readSkillInfo(dir);
      if (info.name) {
        expect(info.name).toBe(info.folder);
      }
    }
  });
});
