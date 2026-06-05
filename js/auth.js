const AUTH_USERS_KEY = "pubg_tool_users";
const AUTH_SESSION_KEY = "pubg_tool_session";

function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return "h" + Math.abs(hash).toString(36);
}

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
}

function initDefaultAdmin() {
  const users = getUsers();
  if (users.length === 0) {
    saveUsers([
      {
        username: "admin",
        password: hashPassword("admin123"),
        role: "admin",
        createdAt: Date.now(),
      },
    ]);
  }
}

function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(AUTH_SESSION_KEY));
  } catch {
    return null;
  }
}

function setSession(user) {
  sessionStorage.setItem(
    AUTH_SESSION_KEY,
    JSON.stringify({ username: user.username, role: user.role })
  );
}

function clearSession() {
  sessionStorage.removeItem(AUTH_SESSION_KEY);
}

function registerUser(username, password) {
  const name = username.trim().toLowerCase();
  if (name.length < 3) {
    return { ok: false, message: "Tên đăng nhập tối thiểu 3 ký tự." };
  }
  if (password.length < 6) {
    return { ok: false, message: "Mật khẩu tối thiểu 6 ký tự." };
  }

  const users = getUsers();
  if (users.some((u) => u.username === name)) {
    return { ok: false, message: "Tên đăng nhập đã tồn tại." };
  }

  const role = users.length === 0 ? "admin" : "user";
  users.push({
    username: name,
    password: hashPassword(password),
    role,
    createdAt: Date.now(),
  });
  saveUsers(users);
  return { ok: true, message: "Đăng ký thành công! Bạn có thể đăng nhập." };
}

function loginUser(username, password) {
  const name = username.trim().toLowerCase();
  const users = getUsers();
  const user = users.find((u) => u.username === name);

  if (!user || user.password !== hashPassword(password)) {
    return { ok: false, message: "Sai tên đăng nhập hoặc mật khẩu." };
  }

  setSession(user);
  return { ok: true, message: "Đăng nhập thành công!" };
}

function requireAuth() {
  initDefaultAdmin();
  if (!getSession()) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

function logout() {
  clearSession();
  window.location.href = "login.html";
}

initDefaultAdmin();
