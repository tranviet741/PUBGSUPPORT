// Tài khoản cố định (role: user) — dùng khi chưa có Supabase hoặc cần tài khoản demo
const HARDCODED_USERS = [
  {
    username: "cappy",
    password: "123qwe!@#",
    role: "user",
  },
];

function findHardcodedUser(username, password) {
  const name = username.trim().toLowerCase();
  const user = HARDCODED_USERS.find((u) => u.username === name);
  if (!user || user.password !== password) return null;
  return { username: user.username, role: user.role };
}
