if (!requireAdmin()) throw new Error("Forbidden");

document.getElementById("btnLogout").addEventListener("click", logout);

const adminMessage = document.getElementById("adminMessage");
const createUserForm = document.getElementById("createUserForm");
const userTableBody = document.getElementById("userTableBody");

function showMessage(text, type) {
  adminMessage.textContent = text;
  adminMessage.className = `auth-message show ${type}`;
}

function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("vi-VN");
}

function renderUserTable() {
  const users = listUsersForAdmin();
  userTableBody.innerHTML = "";

  users.forEach((user) => {
    const tr = document.createElement("tr");
    const roleClass = user.role === "admin" ? "admin" : "user";
    tr.innerHTML = `
      <td>${user.username}</td>
      <td><span class="role-badge ${roleClass}">${user.role}</span></td>
      <td>${formatDate(user.createdAt)}</td>
      <td></td>
    `;

    const actionCell = tr.lastElementChild;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn-delete";
    btn.textContent = "Xóa";
    btn.disabled = user.protected;
    if (!user.protected) {
      btn.addEventListener("click", () => {
        if (!confirm(`Xóa tài khoản "${user.username}"?`)) return;
        const result = deleteUserByAdmin(user.username);
        showMessage(result.message, result.ok ? "success" : "error");
        if (result.ok) renderUserTable();
      });
    }
    actionCell.appendChild(btn);
    userTableBody.appendChild(tr);
  });
}

createUserForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const pass = document.getElementById("newPass").value;
  const pass2 = document.getElementById("newPass2").value;
  if (pass !== pass2) {
    showMessage("Mật khẩu nhập lại không khớp.", "error");
    return;
  }
  const result = createUserByAdmin(
    document.getElementById("newUser").value,
    pass
  );
  showMessage(result.message, result.ok ? "success" : "error");
  if (result.ok) {
    createUserForm.reset();
    renderUserTable();
  }
});

renderUserTable();
