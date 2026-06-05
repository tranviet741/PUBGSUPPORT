if (getSession()) {
  window.location.href = "index.html";
}

const tabLogin = document.getElementById("tabLogin");
const tabRegister = document.getElementById("tabRegister");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const authMessage = document.getElementById("authMessage");

function showMessage(text, type) {
  authMessage.textContent = text;
  authMessage.className = `auth-message show ${type}`;
}

function clearMessage() {
  authMessage.className = "auth-message";
  authMessage.textContent = "";
}

function switchTab(tab) {
  const isLogin = tab === "login";
  tabLogin.classList.toggle("active", isLogin);
  tabRegister.classList.toggle("active", !isLogin);
  loginForm.style.display = isLogin ? "flex" : "none";
  registerForm.style.display = isLogin ? "none" : "flex";
  clearMessage();
}

tabLogin.addEventListener("click", () => switchTab("login"));
tabRegister.addEventListener("click", () => switchTab("register"));

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const result = loginUser(
    document.getElementById("loginUser").value,
    document.getElementById("loginPass").value
  );
  if (result.ok) {
    showMessage(result.message, "success");
    setTimeout(() => { window.location.href = "index.html"; }, 400);
  } else {
    showMessage(result.message, "error");
  }
});

registerForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const pass = document.getElementById("regPass").value;
  const pass2 = document.getElementById("regPass2").value;
  if (pass !== pass2) {
    showMessage("Mật khẩu nhập lại không khớp.", "error");
    return;
  }
  const result = registerUser(
    document.getElementById("regUser").value,
    pass
  );
  if (result.ok) {
    showMessage(result.message, "success");
    switchTab("login");
  } else {
    showMessage(result.message, "error");
  }
});
