import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";

import { calculateMatchScore } from "./match-utils.js"; // ✅ Dùng chung logic tính điểm

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

const mbtiEl = document.getElementById("mbti");
const loveEl = document.getElementById("loveStyle");
const lifestyleEl = document.getElementById("lifestyle");
const colorFoodEl = document.getElementById("colorFoodStyle");
const matchList = document.getElementById("matchList");

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

onAuthStateChanged(auth, async (user) => {
  if (!user) return (window.location.href = "index.html");

  const quizRef = doc(db, "quizResults", user.uid);
  const quizSnap = await getDoc(quizRef);
  if (!quizSnap.exists()) return alert("Không tìm thấy kết quả của bạn.");

  const result = quizSnap.data();

  mbtiEl.textContent = result.mbti;
  loveEl.textContent = result.loveStyle;
  lifestyleEl.textContent = result.lifestyle;
  colorFoodEl.textContent = result.colorFoodStyle;

  const allUsers = await getDocs(collection(db, "users"));
  const candidates = [];

  for (const docSnap of allUsers.docs) {
    const uid = docSnap.id;
    if (uid === user.uid) continue;

    const profile = docSnap.data();
    const quizSnap = await getDoc(doc(db, "quizResults", uid));
    if (!quizSnap.exists()) continue;

    const quiz = quizSnap.data();
    if (!quiz.answers || !result.answers) continue;

    const finalScore = calculateMatchScore(result, quiz);
    if (finalScore < 90) continue;

    candidates.push({
      uid,
      profile,
      match: finalScore,
      mbti: quiz.mbti,
      loveStyle: quiz.loveStyle,
      lifestyle: quiz.lifestyle || "(?)",
      colorFoodStyle: quiz.colorFoodStyle || "(?)",
    });
  }

  candidates.sort((a, b) => b.match - a.match);
  matchList.innerHTML = "";

  candidates.slice(0, 5).forEach((pick) => {
    const card = document.createElement("div");
    card.className = "match-card";
    const avatar = normalizeImgurLink(
      pick.profile.avatar || "https://via.placeholder.com/100"
    );
    const name = pick.profile.name || "Không tên";

    card.innerHTML = `
      <img src="${avatar}" alt="${name}" />
      <h4>${name}</h4>
      <p>Điểm phù hợp: ${pick.match}%</p>
      <p>MBTI: ${pick.mbti}</p>
      <p>Love Style: ${pick.loveStyle}</p>
      <p>Lifestyle: ${pick.lifestyle}</p>
      <p>Gu màu/ẩm thực: ${pick.colorFoodStyle}</p>
    `;

    card.onclick = () => {
      window.location.href = `user.html?id=${pick.uid}`;
    };

    matchList.appendChild(card);
  });
});
