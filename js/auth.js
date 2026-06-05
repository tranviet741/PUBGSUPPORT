const AUTH_USERS_KEY = "pubg_tool_users";
const AUTH_SESSION_KEY = "pubg_tool_session";
const ADMIN_USER = "admin";
const ADMIN_PASS = "pass123qwe!@#";

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

function ensureAdminUser() {
  const users = getUsers().filter((u) => u.username !== ADMIN_USER);
  const existing = getUsers().find((u) => u.username === ADMIN_USER);
  users.unshift({
    username: ADMIN_USER,
    password: hashPassword(ADMIN_PASS),
    role: "admin",
    createdAt: existing?.createdAt || Date.now(),
    protected: true,
  });
  saveUsers(users);
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

function isAdmin() {
  const session = getSession();
  return session?.role === "admin" && session?.username === ADMIN_USER;
}

function createUserByAdmin(username, password) {
  if (!isAdmin()) {
    return { ok: false, message: "Chỉ admin mới được tạo tài khoản." };
  }

  const name = username.trim().toLowerCase();
  if (name === ADMIN_USER) {
    return { ok: false, message: "Không thể tạo tài khoản trùng admin." };
  }
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

  users.push({
    username: name,
    password: hashPassword(password),
    role: "user",
    createdAt: Date.now(),
  });
  saveUsers(users);
  return { ok: true, message: `Đã tạo tài khoản "${name}".` };
}

function deleteUserByAdmin(username) {
  if (!isAdmin()) {
    return { ok: false, message: "Chỉ admin mới được xóa tài khoản." };
  }

  const name = username.trim().toLowerCase();
  if (name === ADMIN_USER) {
    return { ok: false, message: "Không thể xóa tài khoản admin." };
  }

  const users = getUsers();
  const idx = users.findIndex((u) => u.username === name);
  if (idx === -1) {
    return { ok: false, message: "Tài khoản không tồn tại." };
  }

  users.splice(idx, 1);
  saveUsers(users);
  return { ok: true, message: `Đã xóa tài khoản "${name}".` };
}

function listUsersForAdmin() {
  if (!isAdmin()) return [];
  return getUsers().map((u) => ({
    username: u.username,
    role: u.role,
    createdAt: u.createdAt,
    protected: !!u.protected,
  }));
}

function loginUser(username, password) {
  const name = username.trim().toLowerCase();

  if (name === ADMIN_USER) {
    if (password !== ADMIN_PASS) {
      return { ok: false, message: "Sai tên đăng nhập hoặc mật khẩu." };
    }
    ensureAdminUser();
    setSession({ username: ADMIN_USER, role: "admin" });
    return { ok: true, message: "Đăng nhập thành công!" };
  }

  const users = getUsers();
  const user = users.find((u) => u.username === name);

  if (!user || user.password !== hashPassword(password)) {
    return { ok: false, message: "Sai tên đăng nhập hoặc mật khẩu." };
  }

  setSession(user);
  return { ok: true, message: "Đăng nhập thành công!" };
}

function requireAuth() {
  ensureAdminUser();
  if (!getSession()) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

function requireAdmin() {
  ensureAdminUser();
  if (!isAdmin()) {
    window.location.href = "index.html";
    return false;
  }
  return true;
}

function logout() {
  clearSession();
  window.location.href = "login.html";
}

ensureAdminUser();
