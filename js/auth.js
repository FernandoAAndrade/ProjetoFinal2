const API = 'http://localhost:3000/api';

// Check if already logged in
if (localStorage.getItem('nexus_token')) {
  window.location.href = 'dashboard.html';
}

// Check URL param for default tab
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('tab') === 'register') switchTab('register');

function switchTab(tab) {
  const loginForm = document.getElementById('form-login');
  const registerForm = document.getElementById('form-register');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  hideAlerts();

  if (tab === 'login') {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
  } else {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    tabLogin.classList.remove('active');
    tabRegister.classList.add('active');
  }
}

function showError(msg) {
  const el = document.getElementById('alert-error');
  document.getElementById('alert-error-msg').textContent = msg;
  el.classList.add('show');
  document.getElementById('alert-success').classList.remove('show');
}

function showSuccess(msg) {
  const el = document.getElementById('alert-success');
  document.getElementById('alert-success-msg').textContent = msg;
  el.classList.add('show');
  document.getElementById('alert-error').classList.remove('show');
}

function hideAlerts() {
  document.getElementById('alert-error').classList.remove('show');
  document.getElementById('alert-success').classList.remove('show');
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (loading) {
    btn.classList.add('btn-loading');
    btn.innerHTML = '<div class="spinner"></div> Aguarde...';
  } else {
    btn.classList.remove('btn-loading');
    if (btnId === 'btn-login') btn.innerHTML = 'Entrar na conta';
    else btn.innerHTML = 'Criar conta gratis';
  }
}

async function handleLogin(e) {
  e.preventDefault();
  hideAlerts();
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  if (!email || !password) { showError('Preencha todos os campos.'); return; }

  setLoading('btn-login', true);
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao fazer login');

    localStorage.setItem('nexus_token', data.token);
    localStorage.setItem('nexus_user', JSON.stringify(data.user));
    showSuccess('Login realizado! Redirecionando...');
    setTimeout(() => window.location.href = 'dashboard.html', 1000);
  } catch (err) {
    showError(err.message);
    setLoading('btn-login', false);
  }
}

async function handleRegister(e) {
  e.preventDefault();
  hideAlerts();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirm = document.getElementById('reg-confirm').value;

  if (!name || !email || !password || !confirm) { showError('Preencha todos os campos.'); return; }
  if (password.length < 6) { showError('A senha deve ter pelo menos 6 caracteres.'); return; }
  if (password !== confirm) { showError('As senhas nao coincidem.'); return; }

  setLoading('btn-register', true);
  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao criar conta');

    localStorage.setItem('nexus_token', data.token);
    localStorage.setItem('nexus_user', JSON.stringify(data.user));
    showSuccess('Conta criada! Bem-vindo ao Nexus! Redirecionando...');
    setTimeout(() => window.location.href = 'dashboard.html', 1200);
  } catch (err) {
    showError(err.message);
    setLoading('btn-register', false);
  }
}
