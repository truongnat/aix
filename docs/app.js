let allSkills = [];

const skillsGrid = document.getElementById('skillsGrid');
const skillSearch = document.getElementById('skillSearch');

async function init() {
  try {
    const response = await fetch('skills.json');
    allSkills = await response.json();
    renderSkills(allSkills);
  } catch (error) {
    console.error('Failed to load skills:', error);
    skillsGrid.innerHTML = '<div class="error">Failed to load skills. Please check if skills.json exists.</div>';
  }
}

function renderSkills(skills) {
  skillsGrid.innerHTML = skills.map(skill => `
    <div class="skill-card">
      <span class="skill-tag">${skill.domain}</span>
      <div class="skill-name">${skill.name}</div>
      <p class="skill-desc">${skill.description}</p>
      <div class="copy-cmd">
        <span>/list-skills ${skill.id}</span>
        <button class="copy-btn" onclick="copyText('/list-skills ${skill.id}')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        </button>
      </div>
    </div>
  `).join('');
}

skillSearch.addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase();
  const filtered = allSkills.filter(skill => 
    skill.name.toLowerCase().includes(query) || 
    skill.description.toLowerCase().includes(query) ||
    skill.id.toLowerCase().includes(query)
  );
  renderSkills(filtered);
});

function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    // Show a temporary success state
    const btn = event.currentTarget;
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00ffaa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    setTimeout(() => {
      btn.innerHTML = originalContent;
    }, 2000);
  });
}

init();
