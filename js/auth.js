const AUTH_SESSION_KEY = "pubg_tool_session";
const LEGACY_USERS_KEY = "pubg_tool_users";
const ADMIN_USER = "admin";
const ADMIN_PASS = "pass123qwe!@#";
const USERS_TABLE = "pubg_users";

try {
  localStorage.removeItem(LEGACY_USERS_KEY);
} catch {}

let supabaseClient = null;

function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return "h" + Math.abs(hash).toString(36);
}

function isSupabaseConfigured() {
  return (
    typeof SUPABASE_URL === "string" &&
    typeof SUPABASE_ANON_KEY === "string" &&
    !SUPABASE_URL.includes("YOUR_PROJECT") &&
    !SUPABASE_ANON_KEY.includes("YOUR_ANON") &&
    SUPABASE_URL.startsWith("https://")
  );
}

function getSupabase() {
  if (!isSupabaseConfigured()) return null;
  if (!supabaseClient && typeof supabase !== "undefined") {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabaseClient;
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

function getConfigError() {
  if (!isSupabaseConfigured()) {
    return "Chưa cấu hình Supabase. Điền SUPABASE_URL và SUPABASE_ANON_KEY trong js/supabase-config.js";
  }
  if (!getSupabase()) {
    return "Không tải được thư viện Supabase. Kiểm tra kết nối internet.";
  }
  return null;
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

  const configErr = getConfigError();
  if (configErr) return { ok: false, message: configErr };

  const db = getSupabase();
  const { data, error } = await db
    .from(USERS_TABLE)
    .select("username, password_hash, role")
    .eq("username", name)
    .maybeSingle();

  if (error) {
    return { ok: false, message: "Lỗi kết nối database: " + error.message };
  }
  if (!data || data.password_hash !== hashPassword(password)) {
    return { ok: false, message: "Sai tên đăng nhập hoặc mật khẩu." };
  }

  setSession({ username: data.username, role: data.role });
  return { ok: true, message: "Đăng nhập thành công!" };
}

async function createUserByAdmin(username, password) {
  if (!isAdmin()) {
    return { ok: false, message: "Chỉ admin mới được tạo tài khoản." };
  }

  const configErr = getConfigError();
  if (configErr) return { ok: false, message: configErr };

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

  const db = getSupabase();
  const { error } = await db.from(USERS_TABLE).insert({
    username: name,
    password_hash: hashPassword(password),
    role: "user",
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, message: "Tên đăng nhập đã tồn tại." };
    }
    return { ok: false, message: "Lỗi tạo tài khoản: " + error.message };
  }

  return { ok: true, message: `Đã tạo tài khoản "${name}".` };
}

async function deleteUserByAdmin(username) {
  if (!isAdmin()) {
    return { ok: false, message: "Chỉ admin mới được xóa tài khoản." };
  }

  const configErr = getConfigError();
  if (configErr) return { ok: false, message: configErr };

  const name = username.trim().toLowerCase();
  if (name === ADMIN_USER) {
    return { ok: false, message: "Không thể xóa tài khoản admin." };
  }

  const db = getSupabase();
  const { error } = await db.from(USERS_TABLE).delete().eq("username", name);

  if (error) {
    return { ok: false, message: "Lỗi xóa tài khoản: " + error.message };
  }

  return { ok: true, message: `Đã xóa tài khoản "${name}".` };
}

async function testSupabaseConnection() {
  const configErr = getConfigError();
  if (configErr) return { ok: false, message: configErr };

  const db = getSupabase();
  const { error } = await db.from(USERS_TABLE).select("username").limit(1);
  if (error) {
    return { ok: false, message: "Không kết nối được Supabase: " + error.message };
  }
  return { ok: true, message: "Đã kết nối Supabase — tài khoản lưu trên cloud." };
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

  const configErr = getConfigError();
  if (configErr) {
    return { ok: false, users: [adminEntry], error: configErr };
  }

  const db = getSupabase();
  const { data, error } = await db
    .from(USERS_TABLE)
    .select("username, role, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    return {
      ok: false,
      users: [adminEntry],
      error: "Lỗi tải danh sách từ Supabase: " + error.message,
    };
  }

  const users = (data || []).map((u) => ({
    username: u.username,
    role: u.role,
    createdAt: u.created_at ? new Date(u.created_at).getTime() : null,
    protected: false,
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
