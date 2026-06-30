const AUTH_SESSION_KEY = "pubg_tool_session";
const LEGACY_USERS_KEY = "pubg_tool_users";
const ADMIN_USER = "admin";
const ADMIN_PASS = "pass123qwe!@#";

try {
  localStorage.removeItem(LEGACY_USERS_KEY);
} catch {}

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

async function loginUser(username, password) {
  const name = username.trim().toLowerCase();

  if (name === ADMIN_USER) {
    if (password !== ADMIN_PASS) {
      return { ok: false, message: "Sai tên đăng nhập hoặc mật khẩu." };
    }
    setSession({ username: ADMIN_USER, role: "admin" });
    return { ok: true, message: "Đăng nhập thành công!" };
  }

  const hardcoded = findHardcodedUser(username, password);
  if (hardcoded) {
    setSession(hardcoded);
    return { ok: true, message: "Đăng nhập thành công!" };
  }

  return { ok: false, message: "Sai tên đăng nhập hoặc mật khẩu." };
}

async function createUserByAdmin(username, password) {
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

  return addHardcodedUser(name, password);
}

async function deleteUserByAdmin(username) {
  if (!isAdmin()) {
    return { ok: false, message: "Chỉ admin mới được xóa tài khoản." };
  }

  const name = username.trim().toLowerCase();
  if (name === ADMIN_USER) {
    return { ok: false, message: "Không thể xóa tài khoản admin." };
  }

  return removeHardcodedUser(name);
}

async function listUsersForAdmin() {
  const adminEntry = {
    username: ADMIN_USER,
    role: "admin",
    createdAt: null,
    protected: true,
  };

  if (!isAdmin()) {
    return { ok: false, users: [], error: "Không có quyền admin." };
  }

  const users = listHardcodedUsersForAdmin().map((u) => ({
    username: u.username,
    role: u.role,
    createdAt: u.createdAt,
    protected: u.protected,
  }));

  return { ok: true, users: [adminEntry, ...users], error: null };
}

function requireAuth() {
  if (!getSession()) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

function requireAdmin() {
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
