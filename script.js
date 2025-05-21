import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import {
  getFirestore,
  getDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAK7OVFlCVjkxuKkXuQ6ZEdMFM4x7ohTBU",
  authDomain: "henhovietnhat.firebaseapp.com",
  projectId: "henhovietnhat",
  storageBucket: "henhovietnhat.firebasestorage.app",
  messagingSenderId: "934244268292",
  appId: "1:934244268292:web:d2f69f325473b3534ef851",
  measurementId: "G-SQDJLLLP21",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let isLogin = true;

const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const actionBtn = document.getElementById("actionBtn");
const toggleForm = document.getElementById("toggleForm");
const formTitle = document.getElementById("formTitle");
const confirmPasswordContainer = document.getElementById(
  "confirmPasswordContainer"
);

toggleForm.addEventListener("click", () => {
  isLogin = !isLogin;
  formTitle.innerText = isLogin ? "Đăng nhập" : "Đăng ký";
  actionBtn.innerText = isLogin ? "Đăng nhập" : "Đăng ký";
  toggleForm.innerText = isLogin
    ? "Chưa có tài khoản? Đăng ký"
    : "Đã có tài khoản? Đăng nhập";
  confirmPasswordContainer.classList.toggle("hidden", isLogin);
});

// Đăng nhập hoặc đăng ký
actionBtn.addEventListener("click", async () => {
  const userEmail = email.value.trim();
  const userPass = password.value.trim();

  if (!userEmail || !userPass) return alert("Vui lòng nhập đầy đủ thông tin!");

  if (isLogin) {
    try {
      await signInWithEmailAndPassword(auth, userEmail, userPass);
      // Đăng nhập thành công, sẽ kiểm tra ở onAuthStateChanged
    } catch (err) {
      alert("Lỗi đăng nhập: " + err.message);
    }
  } else {
    const userConfirm = confirmPassword.value.trim();
    if (userPass !== userConfirm) {
      alert("Mật khẩu không khớp!");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, userEmail, userPass);
      // Người dùng mới → chuyển luôn đến profile để nhập thông tin
      window.location.href = "profile.html";
    } catch (err) {
      alert("Lỗi đăng ký: " + err.message);
    }
  }
});

// Kiểm tra hồ sơ sau khi đăng nhập
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      window.location.href = "home.html"; // Đã có hồ sơ
    } else {
      window.location.href = "profile.html"; // Cần cập nhật hồ sơ
    }
  }
});

// Mật khẩu 👁️
document.getElementById("togglePassword").addEventListener("click", () => {
  const type = password.type === "password" ? "text" : "password";
  password.type = type;
  togglePassword.textContent = type === "password" ? "👁️" : "🙈";
});

document
  .getElementById("toggleConfirmPassword")
  .addEventListener("click", () => {
    const type = confirmPassword.type === "password" ? "text" : "password";
    confirmPassword.type = type;
    toggleConfirmPassword.textContent = type === "password" ? "👁️" : "🙈";
  });

window.showLogin = () => {
  document.getElementById("welcomeScreen").classList.add("hidden");
  document.getElementById("authBox").classList.remove("hidden");
};
