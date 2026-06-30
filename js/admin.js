if (!requireAdmin()) throw new Error("Forbidden");

document.getElementById("btnLogout").addEventListener("click", logout);

const adminMessage = document.getElementById("adminMessage");
const dbStatus = document.getElementById("dbStatus");
const createUserForm = document.getElementById("createUserForm");
const userTableBody = document.getElementById("userTableBody");
const createBtn = createUserForm.querySelector('button[type="submit"]');

function showMessage(text, type) {
  adminMessage.textContent = text;
  adminMessage.className = `auth-message show ${type}`;
}

function showDbStatus(text, ok) {
  if (!dbStatus) return;
  dbStatus.textContent = text;
  dbStatus.className = ok ? "db-status ok" : "db-status error";
}

function formatDate(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleDateString("vi-VN");
}

function renderUserTable() {
  userTableBody.innerHTML = '<tr><td colspan="4" style="color:var(--muted)">Đang tải…</td></tr>';

  listUsersForAdmin().then((result) => {
    userTableBody.innerHTML = "";

    if (result.error) {
      showMessage(result.error, "error");
    }

    const users = result.users || [];
    if (users.length === 0) {
      userTableBody.innerHTML = '<tr><td colspan="4" style="color:var(--muted)">Chưa có tài khoản.</td></tr>';
      return;
    }

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
        btn.addEventListener("click", async () => {
          if (!confirm(`Xóa tài khoản "${user.username}"?`)) return;
          btn.disabled = true;
          const delResult = await deleteUserByAdmin(user.username);
          showMessage(delResult.message, delResult.ok ? "success" : "error");
          if (delResult.ok) {
            renderUserTable();
          } else {
            btn.disabled = false;
          }
        });
      }
      actionCell.appendChild(btn);
      userTableBody.appendChild(tr);
    });
  });
}

createUserForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const pass = document.getElementById("newPass").value;
  const pass2 = document.getElementById("newPass2").value;
  if (pass !== pass2) {
    showMessage("Mật khẩu nhập lại không khớp.", "error");
    return;
  }

  createBtn.disabled = true;
  createBtn.textContent = "Đang tạo…";

  const result = await createUserByAdmin(
    document.getElementById("newUser").value,
    pass
  );

  createBtn.disabled = false;
  createBtn.textContent = "Tạo tài khoản";
  showMessage(result.message, result.ok ? "success" : "error");

  if (result.ok) {
    createUserForm.reset();
    renderUserTable();
  }
});

showDbStatus("Tài khoản hardcode — không dùng database", true);
renderUserTable();
