import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const skillsDir = './skills';
const outputFilePath = './docs/skills.json';

const getSkills = () => {
  const skills = [];
  const items = fs.readdirSync(skillsDir);

  for (const item of items) {
    const skillPath = path.join(skillsDir, item);
    if (fs.statSync(skillPath).isDirectory()) {
      const mdPath = path.join(skillPath, 'SKILL.md');
      if (fs.existsSync(mdPath)) {
        const content = fs.readFileSync(mdPath, 'utf8');
        const { data } = matter(content);
        skills.push({
          id: item,
          name: data.name || item,
          description: data.description || '',
          domain: data.metadata?.domain || 'General'
        });
      }
    }
  }
  return skills;
};

const skills = getSkills();
fs.writeFileSync(outputFilePath, JSON.stringify(skills, null, 2));
console.log(`Generated ${skills.length} skills to ${outputFilePath}`);
