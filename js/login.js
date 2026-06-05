if (getSession()) {
  window.location.href = "index.html";
}

const loginForm = document.getElementById("loginForm");
const authMessage = document.getElementById("authMessage");
const submitBtn = loginForm.querySelector('button[type="submit"]');

const configErr = getConfigError();
if (configErr) {
  showMessage(configErr, "error");
}

function showMessage(text, type) {
  authMessage.textContent = text;
  authMessage.className = `auth-message show ${type}`;
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  submitBtn.disabled = true;
  submitBtn.textContent = "Đang đăng nhập…";

  const result = await loginUser(
    document.getElementById("loginUser").value,
    document.getElementById("loginPass").value
  );

  submitBtn.disabled = false;
  submitBtn.textContent = "Đăng nhập";

  if (result.ok) {
    showMessage(result.message, "success");
    setTimeout(() => { window.location.href = "index.html"; }, 400);
  } else {
    showMessage(result.message, "error");
  }
});
