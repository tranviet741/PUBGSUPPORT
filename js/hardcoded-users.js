const LOCAL_USERS_KEY = "pubg_tool_local_users";

// Tài khoản cố định trong file — chỉnh trực tiếp tại đây
const HARDCODED_USERS = [
  {
    username: "cappy",
    password: "123qwe!@#",
    role: "user",
  },
];

function normalizeUsername(username) {
  return username.trim().toLowerCase();
}

function getLocalUsers() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveLocalUsers(users) {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
}

function getAllHardcodedUsers() {
  const fileUsers = HARDCODED_USERS.map((u) => ({
    ...u,
    username: normalizeUsername(u.username),
    protected: true,
  }));
  const fileNames = new Set(fileUsers.map((u) => u.username));
  const localUsers = getLocalUsers()
    .map((u) => ({
      ...u,
      username: normalizeUsername(u.username),
      protected: false,
    }))
    .filter((u) => !fileNames.has(u.username));

  return [...fileUsers, ...localUsers];
}

function findHardcodedUser(username, password) {
  const name = normalizeUsername(username);
  const user = getAllHardcodedUsers().find((u) => u.username === name);
  if (!user || user.password !== password) return null;
  return { username: user.username, role: user.role || "user" };
}

function isUsernameTaken(username) {
  const name = normalizeUsername(username);
  return getAllHardcodedUsers().some((u) => u.username === name);
}

function addHardcodedUser(username, password) {
  const name = normalizeUsername(username);
  if (isUsernameTaken(name)) {
    return { ok: false, message: "Tên đăng nhập đã tồn tại." };
  }

  const users = getLocalUsers();
  users.push({
    username: name,
    password,
    role: "user",
    createdAt: Date.now(),
  });
  saveLocalUsers(users);
  return { ok: true, message: `Đã tạo tài khoản "${name}".` };
}

function removeHardcodedUser(username) {
  const name = normalizeUsername(username);
  if (HARDCODED_USERS.some((u) => normalizeUsername(u.username) === name)) {
    return { ok: false, message: "Không thể xóa tài khoản hardcode trong file." };
  }

  const users = getLocalUsers();
  const next = users.filter((u) => normalizeUsername(u.username) !== name);
  if (next.length === users.length) {
    return { ok: false, message: "Không tìm thấy tài khoản." };
  }

  saveLocalUsers(next);
  return { ok: true, message: `Đã xóa tài khoản "${name}".` };
}

function listHardcodedUsersForAdmin() {
  return getAllHardcodedUsers().map((u) => ({
    username: u.username,
    role: u.role || "user",
    createdAt: u.createdAt || null,
    protected: u.protected,
  }));
}
