/* ============================================================
   app.js — Tartaros recruitment site
   All editable text lives in /content/*.json
   Edit those files, not this one, unless changing site logic.
   ============================================================ */

// ── Helpers ─────────────────────────────────────────────────

async function loadJSON(path) {
  const res = await fetch(path);
  return res.json();
}

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

// ── Render: Hero & Stats (site.json) ────────────────────────

function renderSite(s) {
  // nav logo + wordmark
  document.querySelectorAll('.nav-logo').forEach(i => i.src = s.clan_icon);
  document.querySelectorAll('.hero-icon').forEach(i => i.src = s.clan_icon);

  // hero text
  document.querySelector('.eyebrow').textContent    = s.hero.eyebrow;
  document.querySelector('.hero-title').textContent = s.hero.title;
  document.querySelector('.hero-sub').textContent   = s.hero.subtitle;
  document.querySelector('.hero-tagline').textContent = s.hero.tagline;

  // stat bar
  const bar = document.querySelector('.stat-bar');
  bar.innerHTML = s.stats.map(st =>
    `<div class="stat"><div class="stat-n">${st.value}</div><div class="stat-l">${st.label}</div></div>`
  ).join('');

  // footer
  document.querySelector('footer p').innerHTML = s.footer;

  // recruiters (join page + modal apply)
  const recContainer = document.getElementById('recruiter-cards');
  if (recContainer) {
    recContainer.innerHTML = s.recruiters.map(r => `
      <div class="rec">
        <div class="rec-av" style="background:linear-gradient(${r.gradient})">${r.initial}</div>
        <div><p class="rec-name">${r.username}</p><p class="rec-role">${r.role}</p></div>
      </div>`).join('');
  }

  // store webhook for form use
  window.WEBHOOK_URL = s.webhook_url;
}

// ── Render: About (about.json) ──────────────────────────────

function renderAbout(a) {
  const page = document.getElementById('page-about');

  const titleHTML = a.title
    .replace('<highlight>', '<span style="color:var(--accent)">')
    .replace('</highlight>', '</span>')
    .replace('<em>', '<span style="color:var(--muted);font-style:italic">')
    .replace('</em>', '</span>');

  const pillarsHTML = a.pillars.map(p =>
    `<div class="acard reveal">
      ${p.icon ? `<div class="acard-ico">${p.icon}</div>` : ''}
      <p class="acard-title">${p.title}</p>
      <p class="acard-body">${p.body}</p>
    </div>`).join('');

  const valuesHTML = a.values.map(v =>
    `<div class="rule reveal">
      <span class="rule-n">${v.numeral}</span>
      <p class="rule-t"><strong>${v.title}</strong> ${v.body}</p>
    </div>`).join('');

  page.querySelector('.section').innerHTML = `
    <p class="slabel reveal">${a.label}</p>
    <h2 class="stitle reveal">${titleHTML}</h2>
    <p class="sbody reveal">${a.intro}</p>
    <div class="about-grid">${pillarsHTML}</div>
    <p class="slabel reveal">${a.values_label}</p>
    <h3 class="stitle reveal" style="font-size:1.45rem;margin-bottom:1.4rem">${a.values_title}</h3>
    <div class="rules">${valuesHTML}</div>`;
}

// ── Render: Teams (content/teams/*.json) ────────────────────

function teamCardHTML(t) {
  const isCustomColor = !t.tag_class;
  const tagStyle = isCustomColor
    ? `style="background:${t.color}22;color:${t.color}"`
    : '';
  const cardBorderStyle = isCustomColor
    ? `style="border-color:${t.color}33;cursor:pointer"
       onmouseenter="this.style.borderColor='${t.color}'"
       onmouseleave="this.style.borderColor='${t.color}33'"`
    : '';
  const colorClass = isCustomColor ? '' : colorClassFromTag(t.tag_class);

  return `
    <div class="tcard ${colorClass} reveal" ${cardBorderStyle} onclick="openModal('${t.id}')">
      <span class="ctag ${t.tag_class}" ${tagStyle}>${t.tag_label}</span>
      <p class="cname">${t.name}</p>
      <p class="cquote">${t.card_quote}</p>
      <p class="cdesc">${t.card_desc}</p>
      <div class="cfoot">
        <div class="ccode-wrap">
          <span class="ccode-lbl">Code</span>
          <span class="ccode" onclick="event.stopPropagation();quickCopy(this,'${t.code}')">${t.code}</span>
        </div>
        <span class="cdetails">Full Details →</span>
      </div>
    </div>`;
}

function colorClassFromTag(tagCls) {
  const map = { ctb: 'tb', ctp: 'tp', ctg: 'tg', cty: 'ty' };
  return map[tagCls] || '';
}

function renderTeams(teams) {
  const page    = document.getElementById('page-teams');
  const section = page.querySelector('.section');
  const ctTeams    = teams.filter(t => t.section === 'ct');
  const otherTeams = teams.filter(t => t.section === 'other');

  section.innerHTML = `
    <p class="slabel reveal">Find your fit</p>
    <h2 class="stitle reveal">Which one sounds like it fits you?</h2>
    <p class="sbody reveal">Between us we have teams for every kind of player. From top 25 grinders to people who just want to log in, have fun, and collect rewards — no matter where you are in your BTD6 experience, there's a spot here just for you. Click any card to see the full details.</p>

    <p class="slabel reveal" style="margin-bottom:.7rem">⚔️ CT Teams</p>
    <div class="teams-grid" style="margin-bottom:2.5rem">
      ${ctTeams.map(teamCardHTML).join('')}
    </div>

    <p class="slabel reveal" style="margin-bottom:.7rem">💥 Boss Rush & Social Seasons</p>
    <div class="teams-grid" style="margin-bottom:2.5rem">
      ${otherTeams.map(teamCardHTML).join('')}
    </div>

    <div class="tcard tgr nocursor reveal" style="display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;gap:.7rem;max-width:420px">
      <p style="font-size:2rem">🤔</p>
      <p class="cname">Not sure yet?</p>
      <p class="cdesc" style="margin-bottom:.4rem">→ Reach out anyway. We can help you find your fit.</p>
      <button class="btn btn-outline" style="font-size:.76rem;padding:.45rem 1.1rem" onclick="showPage('join')">Get In Touch</button>
    </div>`;

  // Store teams globally for modal use
  window.TEAMS_DATA = {};
  teams.forEach(t => window.TEAMS_DATA[t.id] = t);
}

// ── Render: Perks (perks.json) ───────────────────────────────

function renderPerks(p) {
  const page = document.getElementById('page-perks');
  page.querySelector('.section').innerHTML = `
    <p class="slabel reveal">${p.label}</p>
    <h2 class="stitle reveal">${p.title}</h2>
    <p class="sbody reveal">${p.intro}</p>
    <div class="perks-grid">
      ${p.perks.map(pk => `
        <div class="pcard reveal">
          ${pk.icon ? `<div class="pico">${pk.icon}</div>` : ''}
          <div><p class="ptitle">${pk.title}</p><p class="pbody">${pk.body}</p></div>
        </div>`).join('')}
    </div>`;
}

// ── Render: Join (join.json) ─────────────────────────────────

function renderJoin(j, recruiters) {
  const page = document.getElementById('page-join');
  page.querySelector('.section').innerHTML = `
    <div style="max-width:680px">
      <p class="slabel reveal">${j.label}</p>
      <h2 class="stitle reveal">${j.title}</h2>
      <p class="join-intro reveal">${j.intro}</p>

      <div class="app-form reveal">
        <div class="form-row">
          <label class="form-label">Discord username <span class="req-star">*</span></label>
          <input class="form-input" type="text" id="f-discord" placeholder="${j.form.discord_placeholder}" autocomplete="off">
        </div>
        <div class="form-row">
          <label class="form-label">Which team interests you? <span class="req-star">*</span></label>
          <select class="form-input" id="f-team">
            <option value="">— Select a team —</option>
            <optgroup label="⚔️ Competitive CT">
              <option>Tartaros (Main)</option>
              <option>The Hlls</option>
              <option>Tartaros Academy</option>
              <option>Tartaros University</option>
              <option>Banana Battalion</option>
            </optgroup>
            <optgroup label="🪴 Relaxed CT">
              <option>Tartaros Sanctum</option>
              <option>Banana Bunch</option>
              <option>Tartaros Sandbox</option>
            </optgroup>
            <optgroup label="💥 Other Modes">
              <option>Banana Blitz (Boss Rush)</option>
              <option>Banana Brigade (Social Seasons)</option>
            </optgroup>
            <option value="Not sure">Not sure yet — help me decide</option>
          </select>
        </div>
        <div class="form-row">
          <label class="form-label">Tell us a bit about how you play <span style="color:var(--muted);font-weight:400">(optional)</span></label>
          <textarea class="form-input form-textarea" id="f-note" placeholder="${j.form.note_placeholder}"></textarea>
        </div>
        <div class="form-row">
          <label class="form-label">BTD6 profile screenshot <span class="req-star">*</span></label>
          <div class="upload-area" id="upload-area" onclick="document.getElementById('f-file').click()">
            <input type="file" id="f-file" accept="image/*" style="display:none" onchange="handleFile(this)">
            <div id="upload-placeholder">
              <div style="font-size:2rem;margin-bottom:.5rem">📸</div>
              <p style="font-size:.9rem;color:var(--muted);margin-bottom:.25rem">${j.form.upload_hint}</p>
              <p style="font-size:.75rem;color:var(--muted);opacity:.6">${j.form.upload_subhint}</p>
            </div>
            <div id="upload-preview" style="display:none;text-align:center">
              <img id="preview-img" style="max-width:100%;max-height:200px;border-radius:6px;margin-bottom:.5rem">
              <p id="preview-name" style="font-size:.8rem;color:var(--muted)"></p>
              <p style="font-size:.75rem;color:var(--accent);margin-top:.25rem">Click to change</p>
            </div>
          </div>
        </div>
        <button class="submit-btn" id="submit-btn" onclick="submitApplication()">
          <span id="submit-label">${j.form.submit_label}</span>
        </button>
        <div id="form-success" style="display:none">
          <div style="text-align:center;padding:2rem 1rem">
            <div style="font-size:3rem;margin-bottom:1rem">✅</div>
            <p style="font-family:'Rajdhani',sans-serif;font-size:1.3rem;font-weight:700;margin-bottom:.5rem">Application sent!</p>
            <p style="font-size:.9rem;color:var(--muted);line-height:1.7">${j.success_message}</p>
          </div>
        </div>
        <div id="form-error" style="display:none;margin-top:1rem">
          <div class="join-note" style="border-color:rgba(239,83,80,.3);background:rgba(239,83,80,.05)">
            <strong style="color:var(--red)">⚠️ Something went wrong.</strong><br>
            <span id="error-msg" style="color:var(--muted)"></span>
          </div>
        </div>
      </div>

      <div style="margin-top:2.5rem;padding-top:2rem;border-top:1px solid var(--border)">
        <p class="slabel" style="margin-bottom:.7rem">${j.direct_contact_label}</p>
        <p style="font-size:.875rem;color:var(--muted);margin-bottom:1.2rem;line-height:1.7">${j.direct_contact_body}</p>
        <div class="rec-cards" id="recruiter-cards"></div>
      </div>
    </div>`;

  // Populate recruiter cards
  const recContainer = document.getElementById('recruiter-cards');
  recContainer.innerHTML = recruiters.map(r => `
    <div class="rec reveal">
      <div class="rec-av" style="background:linear-gradient(${r.gradient})">${r.initial}</div>
      <div><p class="rec-name">${r.username}</p><p class="rec-role">${r.role}</p></div>
    </div>`).join('');

  // Store success message for submit function
  window.SUCCESS_MESSAGE = j.success_message;
}

// ── Modal ────────────────────────────────────────────────────

function openModal(id) {
  const t = window.TEAMS_DATA[id];
  if (!t) return;

  document.getElementById('modal-bar').style.background = t.color;

  const tag = document.getElementById('mtag');
  tag.textContent = t.tag_label;
  if (t.tag_class) {
    tag.className = 'mtag ' + t.tag_class;
    tag.removeAttribute('style');
  } else {
    tag.className = 'mtag';
    tag.style.background = t.color + '22';
    tag.style.color = t.color;
  }

  document.getElementById('mname').textContent   = t.name;
  document.getElementById('mplace').innerHTML    = t.placement;

  document.getElementById('mbody').innerHTML = `
    <div class="msec">
      <p class="mquote">${t.modal_quote}</p>
      <p class="msec-title">About this team</p>
      <p class="mdesc">${t.modal_desc}</p>
    </div>
    <div class="msec">
      <p class="msec-title">Requirements & expectations</p>
      <div class="req-list">
        ${t.requirements.map(r => `
          <div class="req-item"><div class="rdot"></div><p>${r}</p></div>`).join('')}
      </div>
    </div>
    <div class="msec">
      <p class="msec-title">Team join code</p>
      <div class="mcode-box">
        <div><p class="mcode-lbl">Copy and enter in-game</p><p class="mcode-val">${t.code}</p></div>
        <button class="copybtn" onclick="copyModal(this,'${t.code}')">Copy</button>
      </div>
    </div>
    <div class="mapply">
      <button class="btn btn-primary" onclick="closeModal();showPage('join')" style="font-size:.82rem">Apply for this team →</button>
    </div>`;

  document.getElementById('modal-bg').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-bg').classList.remove('open');
  document.body.style.overflow = '';
}

function bgClose(e) {
  if (e.target === document.getElementById('modal-bg')) closeModal();
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ── Navigation ───────────────────────────────────────────────

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  const tab = document.querySelector(`[data-page="${id}"]`);
  if (tab) tab.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  setTimeout(revealAll, 60);
}

document.querySelectorAll('.nav-tab').forEach(btn => {
  btn.addEventListener('click', () => showPage(btn.dataset.page));
});

// ── Reveal animations ────────────────────────────────────────

function revealAll() {
  document.querySelectorAll('.page.active .reveal').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 52);
  });
}

const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.07 });

// ── Copy helpers ─────────────────────────────────────────────

function copyModal(btn, code) {
  navigator.clipboard.writeText(code).catch(() => {});
  btn.textContent = 'Copied!';
  btn.classList.add('done');
  setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('done'); }, 1800);
}

function quickCopy(el, code) {
  navigator.clipboard.writeText(code).catch(() => {});
  const t = document.getElementById('toast');
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1800);
}

// ── Form / Webhook ───────────────────────────────────────────

let selectedFile = null;

function handleFile(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 8 * 1024 * 1024) {
    showError('That image is over 8MB. Please use a smaller file.');
    return;
  }
  selectedFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('upload-placeholder').style.display = 'none';
    document.getElementById('upload-preview').style.display     = 'block';
    document.getElementById('preview-img').src                  = e.target.result;
    document.getElementById('preview-name').textContent         = file.name;
  };
  reader.readAsDataURL(file);
}

function showError(msg) {
  document.getElementById('error-msg').textContent       = msg;
  document.getElementById('form-error').style.display   = 'block';
}

function hideError() {
  document.getElementById('form-error').style.display = 'none';
}

async function submitApplication() {
  hideError();
  const discord = document.getElementById('f-discord').value.trim();
  const team    = document.getElementById('f-team').value;
  const note    = document.getElementById('f-note').value.trim();

  if (!discord)      { showError('Please enter your Discord username.'); return; }
  if (!team)         { showError("Please select which team you're interested in."); return; }
  if (!selectedFile) { showError('Please upload a screenshot of your BTD6 profile.'); return; }

  const btn   = document.getElementById('submit-btn');
  const label = document.getElementById('submit-label');
  btn.disabled      = true;
  label.textContent = 'Sending...';

  try {
    const formData = new FormData();
    formData.append('file', selectedFile, selectedFile.name);

    const payload = {
      embeds: [{
        title: '⚔️ New Tartaros Application',
        color: 0x4fc3f7,
        fields: [
          { name: '👤 Discord',      value: discord,            inline: true },
          { name: '🎯 Team Interest', value: team,               inline: true },
          { name: '📝 Note',         value: note || '*No message provided*', inline: false }
        ],
        footer:    { text: 'Tartaros Recruitment' },
        timestamp: new Date().toISOString()
      }]
    };

    formData.append('payload_json', JSON.stringify(payload));

    const res = await fetch(window.WEBHOOK_URL, { method: 'POST', body: formData });

    if (res.ok) {
      document.querySelector('.app-form').style.display = 'none';
      document.getElementById('form-success').style.display = 'block';
    } else {
      showError('Discord returned an error. Please DM a recruiter directly.');
      btn.disabled      = false;
      label.textContent = 'Send Application ⚔️';
    }
  } catch (e) {
    showError('Could not connect. Check your internet and try again, or DM a recruiter directly.');
    btn.disabled      = false;
    label.textContent = 'Send Application ⚔️';
  }
}

// ── Boot: load all content and render ───────────────────────

async function boot() {
  // Load all team files — add/remove filenames here to add/remove teams
  const teamFiles = [
    'content/teams/tartaros-main.json',
    'content/teams/the-hlls.json',
    'content/teams/tartaros-academy.json',
    'content/teams/tartaros-university.json',
    'content/teams/banana-battalion.json',
    'content/teams/tartaros-sanctum.json',
    'content/teams/banana-bunch.json',
    'content/teams/tartaros-sandbox.json',
    'content/teams/banana-blitz.json',
    'content/teams/banana-brigade.json',
  ];

  const [site, about, perks, join, ...teams] = await Promise.all([
    loadJSON('content/site.json'),
    loadJSON('content/about.json'),
    loadJSON('content/perks.json'),
    loadJSON('content/join.json'),
    ...teamFiles.map(loadJSON),
  ]);

  renderSite(site);
  renderAbout(about);
  renderTeams(teams);
  renderPerks(perks);
  renderJoin(join, site.recruiters);

  // Start reveal observer after render
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  revealAll();
}

boot();
