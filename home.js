import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

import { calculateMatchScore, isCompatibleMBTI } from "./match-utils.js"; // ✅ import từ file dùng chung

const firebaseConfig = {
  apiKey: "AIzaSyAK7OVFlCVjkxuKkXuQ6ZEdMFM4x7ohTBU",
  authDomain: "henhovietnhat.firebaseapp.com",
  projectId: "henhovietnhat",
  storageBucket: "henhovietnhat.appspot.com",
  messagingSenderId: "934244268292",
  appId: "1:934244268292:web:d2f69f325473b3534ef851",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const container = document.getElementById("suggestions");
const userAvatar = document.getElementById("userAvatar");
const quizReminder = document.getElementById("quizReminder");
const goToQuizBtn = document.getElementById("goToQuizBtn");
const closeQuizBtn = document.getElementById("closeQuizBtn");
const personalitySummary = document.getElementById("personalitySummary");
const mbtiResult = document.getElementById("mbtiResult");
const loveStyleResult = document.getElementById("loveStyleResult");
const lifestyleResult = document.getElementById("lifestyleResult");
const colorFoodResult = document.getElementById("colorFoodResult");

function normalizeImgurLink(link) {
  if (!link.includes("i.imgur.com") && link.includes("imgur.com")) {
    const idMatch = link.match(/\/([a-zA-Z0-9]+)(\.(jpg|jpeg|png|gif))?/);
    if (idMatch) {
      const id = idMatch[1];
      const ext = idMatch[2] || ".jpg";
      return `https://i.imgur.com/${id}${ext}`;
    }
  }
  return link;
}

function showQuizReminder() {
  quizReminder.classList.remove("hidden");
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const quizRef = doc(db, "quizResults", user.uid);
    const quizSnap = await getDoc(quizRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      let avatar = data.avatar || "https://via.placeholder.com/100";
      avatar = normalizeImgurLink(avatar);
      userAvatar.src = avatar;
      userAvatar.addEventListener("click", () => {
        window.location.href = "profile.html";
      });
    }

    if (!quizSnap.exists()) {
      showQuizReminder();
      return;
    }

    const quizData = quizSnap.data();
    mbtiResult.textContent = quizData.mbti || "(chưa có)";
    loveStyleResult.textContent = quizData.loveStyle || "(chưa có)";
    lifestyleResult.textContent = quizData.lifestyle || "(chưa có)";
    colorFoodResult.textContent = quizData.colorFoodStyle || "(chưa có)";
    personalitySummary.classList.remove("hidden");

    const allUsers = await getDocs(collection(db, "users"));
    const candidates = [];

    for (const docSnap of allUsers.docs) {
      const uid = docSnap.id;
      if (uid === user.uid) continue;

      const profile = docSnap.data();
      const otherQuizSnap = await getDoc(doc(db, "quizResults", uid));
      if (!otherQuizSnap.exists()) continue;

      const quiz = otherQuizSnap.data();
      if (!quiz.answers || !quizData.answers) continue;

      const finalScore = calculateMatchScore(quizData, quiz);
      if (finalScore < 50) continue;

      const mbtiOK = isCompatibleMBTI(quizData.mbti, quiz.mbti);
      const loveOK = quizData.loveStyle === quiz.loveStyle;

      candidates.push({
        uid,
        profile,
        match: finalScore,
        mbti: quiz.mbti,
        loveStyle: quiz.loveStyle,
        lifestyle: quiz.lifestyle || "(?)",
        colorFoodStyle: quiz.colorFoodStyle || "(?)",
        mbtiExplain: mbtiOK
          ? "Hai kiểu MBTI có thể bổ sung cho nhau."
          : "Hai kiểu MBTI không tương hợp.",
        loveExplain: loveOK
          ? "Hai phong cách yêu giống nhau."
          : "Phong cách yêu khác nhau – có thể học hỏi lẫn nhau.",
      });
    }

    if (candidates.length === 0) {
      container.innerHTML = "<p>Không tìm thấy bạn phù hợp hôm nay.</p>";
      return;
    }

    candidates.sort((a, b) => b.match - a.match);
    container.innerHTML = "";

    candidates.slice(0, 5).forEach((pick) => {
      const card = document.createElement("div");
      card.className = "user-card";
      const name = pick.profile.name || "Không tên";
      const age = pick.profile.age || "?";
      const bio = pick.profile.bio || "Không có mô tả";
      const avatar = normalizeImgurLink(
        pick.profile.avatar || "https://via.placeholder.com/100"
      );

      card.innerHTML = `
        <img src="${avatar}" alt="${name}" style="cursor:pointer;" />
        <h3 style="cursor:pointer;">${name}</h3>
        <p>Tuổi: ${age}</p>
        <p>${bio}</p>
        <p><strong>Tổng điểm phù hợp:</strong> ${pick.match}%</p>
        <p><strong>MBTI:</strong> ${pick.mbti}</p>
        <p><strong>Love Style:</strong> ${pick.loveStyle}</p>
        <p><strong>Lifestyle:</strong> ${pick.lifestyle}</p>
        <p><strong>Gu màu/ẩm thực:</strong> ${pick.colorFoodStyle}</p>
        <div class="explain">
          <p><strong>💡 MBTI:</strong> ${pick.mbtiExplain}</p>
          <p><strong>💘 Love Style:</strong> ${pick.loveExplain}</p>
          <p style="margin-top: 10px; color: #1976d2; font-weight: bold; cursor: pointer;">➡ Chi tiết</p>
        </div>
      `;

      card.querySelector("img").addEventListener("click", () => {
        window.location.href = `user.html?id=${pick.uid}`;
      });
      card.querySelector("h3").addEventListener("click", () => {
        window.location.href = `user.html?id=${pick.uid}`;
      });
      card
        .querySelector(".explain p:last-child")
        .addEventListener("click", () => {
          window.location.href = `user.html?id=${pick.uid}`;
        });

      container.appendChild(card);
    });
  } catch (error) {
    console.error("❌ Lỗi khi tải dữ liệu:", error);
    container.innerHTML = `<p>Lỗi khi tải dữ liệu: ${error.message}</p>`;
  }
});

goToQuizBtn?.addEventListener("click", () => {
  window.location.href = "love-quiz.html";
});

closeQuizBtn?.addEventListener("click", () => {
  quizReminder.classList.add("hidden");
});

window.logout = () => {
  signOut(auth).then(() => {
    window.location.href = "index.html";
  });
};
