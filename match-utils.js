// match-utils.js - Tính điểm phù hợp giữa 2 người dùng

export const MBTI_COMPAT = {
  INFP: ["ENFJ", "INFJ"],
  ENFJ: ["INFP", "ISFP"],
  ISFP: ["ESFJ", "ENFJ"],
  ESFJ: ["ISFP", "INFP"],
  ISTJ: ["ESFP", "ESTP"],
  ENFP: ["INFJ", "INTP"],
  INFJ: ["ENFP", "INFP"],
  INTP: ["ENFP", "ENTJ"],
};

export const LOVE_COMPAT = {
  "Hành động chăm sóc": ["Lời nói yêu thương", "Sự ổn định"],
  "Lời nói yêu thương": ["Chia sẻ cảm xúc", "Cử chỉ bất ngờ"],
  "Tranh luận thẳng thắn": ["Im lặng để bình tĩnh"],
};

export function isCompatibleMBTI(a, b) {
  return MBTI_COMPAT[a]?.includes(b);
}

export function isCompatibleLove(a, b) {
  return LOVE_COMPAT[a]?.includes(b);
}

export function calculateMatchScore(currentUser, otherUser) {
  if (!currentUser.answers || !otherUser.answers) return 0;

  let score = 0;
  const maxScore = currentUser.answers.length * 5;

  for (let i = 0; i < currentUser.answers.length; i++) {
    const diff = Math.abs(currentUser.answers[i] - otherUser.answers[i]);
    score += 5 - diff; // Điểm càng cao nếu câu trả lời càng giống
  }

  const basePercent = Math.round((score / maxScore) * 100);
  const mbtiBonus = isCompatibleMBTI(currentUser.mbti, otherUser.mbti) ? 10 : 0;
  const loveBonus =
    currentUser.loveStyle === otherUser.loveStyle ||
    isCompatibleLove(currentUser.loveStyle, otherUser.loveStyle)
      ? 5
      : 0;

  return basePercent + mbtiBonus + loveBonus;
}
