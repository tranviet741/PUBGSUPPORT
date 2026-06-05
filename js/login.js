if (getSession()) {
  window.location.href = "index.html";
}

const loginForm = document.getElementById("loginForm");
const authMessage = document.getElementById("authMessage");

function showMessage(text, type) {
  authMessage.textContent = text;
  authMessage.className = `auth-message show ${type}`;
}

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
