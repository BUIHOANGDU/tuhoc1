// love-quiz.js - Bộ 40 câu hỏi + hiệu ứng + lưu tiến độ + thanh tiến trình
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import { quizQuestions, analyzeAnswers } from "./quiz-data.js";

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

window.onload = () => {
  const quizContainer = document.getElementById("quiz");
  let currentIndex = 0;
  let answers = [];

  const STORAGE_KEY = "quizProgress";
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (saved && Array.isArray(saved.answers)) {
    answers = saved.answers;
    currentIndex = saved.currentIndex || 0;
  }

  const defaultScale = [
    "Hoàn toàn đồng ý",
    "Đồng ý",
    "Trung lập",
    "Không đồng ý",
    "Hoàn toàn không đồng ý",
  ];

  function saveProgress() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ currentIndex, answers })
    );
  }

  function updateProgressBar() {
    const progress = Math.round((currentIndex / quizQuestions.length) * 100);
    document.getElementById("progress").style.width = progress + "%";
  }

  function renderQuestion() {
    const q = quizQuestions[currentIndex];
    const scale = q.scale || defaultScale;
    const currentAnswer = answers[currentIndex];

    quizContainer.classList.remove("fade-in");
    void quizContainer.offsetWidth;
    quizContainer.classList.add("fade-in");

    quizContainer.innerHTML = `
      <div class="question">
        <p><strong>Câu ${currentIndex + 1} / ${quizQuestions.length}:</strong> ${q.text}</p>
        <div class="options">
          ${[1, 2, 3, 4, 5]
            .map(
              (val) => `
              <label>
                <input type="radio" name="option" value="${val}" ${
                currentAnswer === val ? "checked" : ""
              } />
                ${val} - ${scale[val - 1]}
              </label>
            `
            )
            .join("")}
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: 20px;">
          <button id="backBtn" ${currentIndex === 0 ? "disabled" : ""}>⬅ Quay lại</button>
          <button id="nextBtn">Tiếp theo ➡</button>
        </div>
      </div>
    `;

    document.getElementById("nextBtn").onclick = nextQuestion;
    document.getElementById("backBtn").onclick = previousQuestion;
    updateProgressBar();
  }

  function nextQuestion() {
    const selected = document.querySelector("input[name='option']:checked");
    if (!selected) {
      alert("Vui lòng chọn một mức độ!");
      return;
    }
    answers[currentIndex] = Number(selected.value);
    currentIndex++;
    saveProgress();
    if (currentIndex < quizQuestions.length) {
      renderQuestion();
    } else {
      submitQuiz();
    }
  }

  function previousQuestion() {
    if (currentIndex > 0) {
      currentIndex--;
      saveProgress();
      renderQuestion();
    }
  }

  function submitQuiz() {
    onAuthStateChanged(auth, async (user) => {
      if (!user) return (window.location.href = "index.html");
      const result = analyzeAnswers(answers);
      try {
        await setDoc(doc(db, "quizResults", user.uid), {
          answers,
          mbti: result.mbti,
          loveStyle: result.loveStyle,
          lifestyle: result.lifestyle,
          colorFoodStyle: result.colorFoodStyle,
          timestamp: Date.now(),
        });
        localStorage.removeItem(STORAGE_KEY);
        alert("🎉 Đã hoàn thành! Chuyển đến kết quả");
        window.location.href = "quiz-result.html";
      } catch (err) {
        alert("Lỗi khi lưu kết quả: " + err.message);
      }
    });
  }

  renderQuestion();
};
