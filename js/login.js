if (getSession()) {
  window.location.href = "index.html";
}

const loginForm = document.getElementById("loginForm");
const authMessage = document.getElementById("authMessage");
const submitBtn = document.getElementById("loginSubmit");
const authLoading = document.getElementById("authLoading");
const authPage = document.querySelector(".auth-page");
const loginUserInput = document.getElementById("loginUser");
const loginPassInput = document.getElementById("loginPass");

function showMessage(text, type) {
  authMessage.textContent = text;
  authMessage.className = `auth-message show ${type}`;
}

function setLoading(active) {
  submitBtn.disabled = active;
  submitBtn.classList.toggle("loading", active);
  authLoading.classList.toggle("show", active);
  authLoading.setAttribute("aria-hidden", active ? "false" : "true");
  authPage.classList.toggle("is-loading", active);
  loginUserInput.disabled = active;
  loginPassInput.disabled = active;
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  setLoading(true);
  authMessage.className = "auth-message";

  const result = await loginUser(loginUserInput.value, loginPassInput.value);

  if (result.ok) {
    authLoading.querySelector("p").textContent = "Đăng nhập thành công!";
    showMessage(result.message, "success");
    setTimeout(() => { window.location.href = "index.html"; }, 500);
    return;
  }

  setLoading(false);
  authLoading.querySelector("p").textContent = "Đang xác thực…";
  showMessage(result.message, "error");
});
