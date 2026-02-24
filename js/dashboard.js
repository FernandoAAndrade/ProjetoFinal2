const API = 'http://localhost:3000/api';

// Auth guard
const token = localStorage.getItem('nexus_token');
const userLocal = JSON.parse(localStorage.getItem('nexus_user') || '{}');
if (!token) window.location.href = 'login.html';

// Set date
const dateEl = document.getElementById('dash-date');
if (dateEl) {
  const now = new Date();
  dateEl.textContent = now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

// Populate UI from local cache immediately
function populateFromLocal(user) {
  const initial = (user.name || 'U')[0].toUpperCase();
  const firstName = (user.name || 'Usuario').split(' ')[0];

  const greetEl = document.getElementById('greeting-name');
  if (greetEl) greetEl.textContent = firstName;

  const sidebarName = document.getElementById('sidebar-name');
  if (sidebarName) sidebarName.textContent = user.name || '-';

  const sidebarPlan = document.getElementById('sidebar-plan');
  if (sidebarPlan) sidebarPlan.textContent = 'Plano ' + capitalize(user.plan || 'Starter');

  const sidebarAvatar = document.getElementById('sidebar-avatar');
  if (sidebarAvatar) sidebarAvatar.textContent = initial;

  const profileAvatar = document.getElementById('profile-avatar');
  if (profileAvatar) profileAvatar.textContent = initial;

  const profileFullName = document.getElementById('profile-full-name');
  if (profileFullName) profileFullName.textContent = user.name || '-';

  const profileEmailDisplay = document.getElementById('profile-email-display');
  if (profileEmailDisplay) profileEmailDisplay.textContent = user.email || '-';

  const profileNameInput = document.getElementById('profile-name-input');
  if (profileNameInput) profileNameInput.value = user.name || '';

  const profileEmailInput = document.getElementById('profile-email-input');
  if (profileEmailInput) profileEmailInput.value = user.email || '';

  const profilePlanBadge = document.getElementById('profile-plan-badge');
  if (profilePlanBadge) profilePlanBadge.textContent = capitalize(user.plan || 'Starter');

  const planName = document.getElementById('plan-name');
  if (planName) planName.textContent = capitalize(user.plan || 'Starter');
}

// Fetch fresh data from server
async function loadUserData() {
  try {
    const res = await fetch(`${API}/user/stats`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (res.status === 401 || res.status === 403) { logout(); return; }
    const data = await res.json();
    const user = data.user;

    // Update localStorage
    localStorage.setItem('nexus_user', JSON.stringify(user));
    populateFromLocal(user);

    // Login count
    const loginCountEl = document.getElementById('login-count');
    if (loginCountEl) loginCountEl.textContent = data.loginCount || 0;

    // Account created
    const sinceEl = document.getElementById('profile-since');
    if (sinceEl) sinceEl.value = new Date(user.created_at).toLocaleDateString('pt-BR');

    const createdEl = document.getElementById('account-created');
    if (createdEl) createdEl.textContent = new Date(user.created_at).toLocaleDateString('pt-BR');

  } catch (err) {
    console.error('Erro ao carregar dados:', err);
  }
}

// Update last login time
const lastLoginEl = document.getElementById('last-login-time');
if (lastLoginEl) lastLoginEl.textContent = 'Agora mesmo';

// Init
if (userLocal.name) populateFromLocal(userLocal);
loadUserData();

// Navigation
function showSection(name) {
  document.querySelectorAll('.profile-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));

  const section = document.getElementById('section-' + name);
  if (section) section.classList.add('active');

  // Highlight correct sidebar item
  const items = document.querySelectorAll('.sidebar-item');
  items.forEach(item => {
    if (item.getAttribute('onclick') === `showSection('${name}')`) {
      item.classList.add('active');
    }
  });
}

// Update profile
async function updateProfile(e) {
  e.preventDefault();
  const name = document.getElementById('profile-name-input').value.trim();
  const errEl = document.getElementById('profile-alert-error');
  const okEl = document.getElementById('profile-alert-success');
  errEl.classList.remove('show');
  okEl.classList.remove('show');

  if (!name) {
    document.getElementById('profile-error-msg').textContent = 'O nome nao pode estar vazio.';
    errEl.classList.add('show'); return;
  }
  try {
    const res = await fetch(`${API}/user/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ name })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    const user = JSON.parse(localStorage.getItem('nexus_user') || '{}');
    user.name = name;
    localStorage.setItem('nexus_user', JSON.stringify(user));
    populateFromLocal(user);

    document.getElementById('profile-success-msg').textContent = 'Perfil atualizado com sucesso!';
    okEl.classList.add('show');
    setTimeout(() => okEl.classList.remove('show'), 3000);
  } catch (err) {
    document.getElementById('profile-error-msg').textContent = err.message || 'Erro ao atualizar.';
    errEl.classList.add('show');
  }
}

function logout() {
  localStorage.removeItem('nexus_token');
  localStorage.removeItem('nexus_user');
  window.location.href = 'login.html';
}

function capitalize(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}
