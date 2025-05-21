// profile.js - Cập nhật và load thông tin cá nhân người dùng (đầy đủ email, thời gian tạo, giữ nguyên chức năng cũ và kiểm tra quiz trước khi chuyển trang)

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";

const firebaseConfig = {
  apiKey: "AIzaSyAK7OVFlCVjkxuKkXuQ6ZEdMFM4x7ohTBU",
  authDomain: "henhovietnhat.firebaseapp.com",
  projectId: "henhovietnhat",
  storageBucket: "henhovietnhat.appspot.com",
  messagingSenderId: "934244268292",
  appId: "1:934244268292:web:d2f69f325473b3534ef851",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const avatarInput = document.getElementById("avatarFile");
const avatarPreview = document.getElementById("preview");

avatarInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const previewUrl = URL.createObjectURL(file);
    avatarPreview.src = previewUrl;
  }
});

document.getElementById("saveBtn").addEventListener("click", saveProfile);

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Vui lòng đăng nhập để chỉnh sửa thông tin.");
    window.location.href = "index.html";
    return;
  }

  const docRef = doc(db, "users", user.uid);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    const data = snap.data();
    document.getElementById("name").value = data.name || "";
    document.getElementById("age").value = data.age || "";
    document.getElementById("bio").value = data.bio || "";
    document.getElementById("gender").value = data.gender || "";
    document.getElementById("avatarUrl").value = data.avatar || "";
    avatarPreview.src = data.avatar || "https://via.placeholder.com/120";

    if (data.lookingFor) {
      const radio = document.querySelector(
        `input[name='lookingFor'][value='${data.lookingFor}']`
      );
      if (radio) radio.checked = true;
    }
  }
});

async function saveProfile() {
  const user = auth.currentUser;
  if (!user) {
    alert("Bạn chưa đăng nhập");
    return;
  }

  const name = document.getElementById("name").value.trim();
  const age = parseInt(document.getElementById("age").value);
  const bio = document.getElementById("bio").value.trim();
  const gender = document.getElementById("gender").value;
  const avatarLink = document.getElementById("avatarUrl").value.trim();
  const lookingFor = document.querySelector(
    'input[name="lookingFor"]:checked'
  )?.value;
  const email = user.email || "";
  const now = Date.now();

  let avatar = avatarLink || "https://via.placeholder.com/120";
  const fileInput = document.getElementById("avatarFile");

  if (fileInput.files.length > 0) {
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("https://api.imgur.com/3/image", {
        method: "POST",
        headers: {
          Authorization: "Client-ID 7bd825b419d3d23",
        },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        avatar = data.data.link;
      } else {
        alert("Lỗi khi tải ảnh lên Imgur");
        return;
      }
    } catch (err) {
      alert("Lỗi khi kết nối tới Imgur");
      return;
    }
  }

  const userDocRef = doc(db, "users", user.uid);
  const existing = await getDoc(userDocRef);
  const isNewUser = !existing.exists();

  const userData = {
    name,
    age,
    bio,
    gender,
    lookingFor,
    avatar,
    email,
  };

  if (isNewUser) {
    userData.joinedAt = now;
  }

  try {
    await setDoc(userDocRef, userData);
    alert("Lưu thành công!");

    // ✅ Kiểm tra nếu người dùng đã làm quiz chưa
    const quizSnap = await getDoc(doc(db, "quizResults", user.uid));
    if (quizSnap.exists()) {
      window.location.href = "home.html";
    } else {
      window.location.href = "love-quiz.html";
    }
  } catch (err) {
    console.error("Lỗi lưu Firestore:", err);
    alert("Lưu thất bại");
  }
}
