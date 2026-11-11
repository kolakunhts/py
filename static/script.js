let isLoginMode = true;

const authBox = document.getElementById("auth-box");
const dashboardBox = document.getElementById("dashboard-box");
const formTitle = document.getElementById("form-title");
const authForm = document.getElementById("auth-form");
const submitBtn = document.getElementById("submit-btn");
const toggleLink = document.getElementById("toggle-link");
const toggleDesc = document.getElementById("toggle-desc");
const alertBox = document.getElementById("alert");
const userDisplay = document.getElementById("user-display");
const logoutBtn = document.getElementById("logout-btn");

// ສະຫຼັບລະຫວ່າງ Login ແລະ Register
toggleLink.addEventListener("click", (e) => {
      e.preventDefault();
      isLoginMode = !isLoginMode;
      hideAlert();

      if (isLoginMode) {
            formTitle.textContent = "ເຂົ້າສູ່ລະບົບ";
            submitBtn.textContent = "Login";
            toggleDesc.textContent = "ຍັງບໍ່ມີບັນຊີບໍ?";
            toggleLink.textContent = "ລົງທະບຽນທີ່ນີ້";
      } else {
            formTitle.textContent = "ລົງທະບຽນໃໝ່";
            submitBtn.textContent = "Register";
            toggleDesc.textContent = "ມີບັນຊີຢູ່ແລ້ວບໍ?";
            toggleLink.textContent = "Login ທີ່ນີ້";
      }
});

// ສົ່ງຂໍ້ມູນ Form
authForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
      const endpoint = isLoginMode ? "/api/login" : "/api/register";

      try {
            const res = await fetch(endpoint, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok) {
                  showAlert(data.message, "success");

                  if (isLoginMode) {
                        // ເມື່ອ Login ສຳເລັດ -> ສະແດງ Dashboard
                        setTimeout(() => {
                              authBox.classList.add("hidden");
                              dashboardBox.classList.remove("hidden");
                              userDisplay.textContent = data.username;
                              authForm.reset();
                              hideAlert();
                        }, 800);
                  } else {
                        // ລົງທະບຽນສຳເລັດ -> ປ່ຽນໄປໜ້າ Login ອັດຕະໂນມັດ
                        setTimeout(() => toggleLink.click(), 1200);
                  }
            } else {
                  showAlert(data.message, "error");
            }
      } catch (err) {
            showAlert("ເຊື່ອມຕໍ່ Server ບໍ່ໄດ້", "error");
      }
});

// ອອກຈາກລະບົບ
logoutBtn.addEventListener("click", async () => {
      await fetch("/api/logout", { method: "POST" });
      dashboardBox.classList.add("hidden");
      authBox.classList.remove("hidden");
});

function showAlert(message, type) {
      alertBox.textContent = message;
      alertBox.className = `alert ${type}`;
      alertBox.classList.remove("hidden");
}

function hideAlert() {
      alertBox.classList.add("hidden");
}