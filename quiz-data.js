// File: quiz-data.js

export const quizQuestions = [
  // MBTI (18)
  { text: "Tôi cảm thấy tràn đầy năng lượng sau các cuộc trò chuyện nhóm.", category: "E" },
  { text: "Tôi thường cần thời gian một mình để hồi phục sau khi giao tiếp xã hội.", category: "E", reverse: true },
  { text: "Tôi thích nói ra suy nghĩ thay vì giữ trong lòng.", category: "E" },
  { text: "Tôi thấy mệt mỏi nếu phải tiếp xúc với nhiều người trong thời gian dài.", category: "E", reverse: true },
  { text: "Tôi chú ý đến chi tiết nhỏ trong công việc hàng ngày.", category: "S" },
  { text: "Tôi thích tưởng tượng và suy nghĩ về khả năng trong tương lai hơn là hiện thực.", category: "S", reverse: true },
  { text: "Tôi thường tin vào kinh nghiệm cá nhân hơn là linh cảm.", category: "S" },
  { text: "Tôi thích khám phá ý nghĩa sâu xa ẩn sau sự việc.", category: "S", reverse: true },
  { text: "Khi ra quyết định, tôi đặt cảm xúc lên trên lý trí.", category: "F" },
  { text: "Tôi cho rằng công bằng quan trọng hơn cảm thông.", category: "F", reverse: true },
  { text: "Tôi quan tâm tới cảm xúc của người khác khi tranh luận.", category: "F" },
  { text: "Tôi thấy khó chịu nếu kế hoạch bị thay đổi đột ngột.", category: "P", reverse: true },
  { text: "Tôi thường bắt đầu công việc theo cảm hứng chứ không cần kế hoạch cụ thể.", category: "P" },
  { text: "Tôi thích có lịch trình rõ ràng và kiểm soát được thời gian.", category: "P", reverse: true },
  { text: "Tôi cảm thấy tự do hơn khi không bị bó buộc bởi quy tắc.", category: "P" },
  { text: "Tôi dễ dàng giao tiếp với người lạ trong môi trường mới.", category: "E" },
  { text: "Tôi hay suy nghĩ sâu xa về ý nghĩa của mọi chuyện.", category: "S", reverse: true },
  { text: "Tôi thường ưu tiên cảm xúc hơn là sự hợp lý khi giúp đỡ ai đó.", category: "F" },

  // Love Style (10)
  { text: "Tôi cảm thấy được yêu khi người yêu hành động chăm sóc tôi." },
  { text: "Lời nói yêu thương làm tôi cảm động hơn hành động." },
  { text: "Tôi cần không gian riêng trong tình yêu." },
  { text: "Tôi muốn người yêu đồng hành trong mọi hoạt động hàng ngày." },
  { text: "Sự ổn định quan trọng hơn lãng mạn bất ngờ." },
  { text: "Tôi thích được đối phương chia sẻ cảm xúc chân thành." },
  { text: "Tôi thấy an toàn khi có cam kết rõ ràng trong mối quan hệ." },
  { text: "Tôi dễ tổn thương nếu bị người yêu bỏ bê cảm xúc của tôi." },
  { text: "Tôi tin vào tình yêu định mệnh hơn là nỗ lực vun đắp." },
  { text: "Tôi sẵn sàng tranh luận để giải quyết mâu thuẫn trong tình yêu." },

  // Lifestyle + Màu/Ẩm thực (12)
  { text: "Tôi thường ra ngoài vào thời gian rảnh thay vì ở nhà." },
  { text: "Tôi yêu thích không gian sống hiện đại và tối giản." },
  { text: "Tôi có gu thời trang năng động, nổi bật." },
  { text: "Tôi thích hoạt động thể chất hơn là đọc sách hay xem phim." },
  { text: "Khi tặng quà, tôi chọn món thực tế hơn là mang ý nghĩa tinh thần." },
  { text: "Tôi thích màu sắc tươi sáng và nổi bật (đỏ, cam, vàng...)." },
  { text: "Tôi thích món ăn đậm đà, nhiều vị hơn món nhạt, thanh đạm." },
  { text: "Tôi ăn uống theo cảm hứng chứ không theo kế hoạch." },
  { text: "Đồ uống yêu thích của tôi là cà phê hoặc trà sữa." },
  { text: "Khi đi ăn với người yêu, tôi chọn quán đông vui, sôi động." },
  { text: "Tôi sẵn sàng thử các món ăn lạ, mới mẻ." },
  { text: "Tôi thường lên kế hoạch cụ thể khi đi chơi hay ăn uống." },
];

export function analyzeAnswers(answers) {
  const traits = { E: 0, S: 0, F: 0, P: 0 };
  const loveScores = {
    "Hành động chăm sóc": 0,
    "Lời nói yêu thương": 0,
    "Không gian riêng": 0,
    "Đồng hành liên tục": 0,
    "Ổn định": 0,
    "Chia sẻ cảm xúc": 0,
    "Cam kết": 0,
    "Nhạy cảm": 0,
    "Định mệnh": 0,
    "Tranh luận": 0,
  };

  let lifestyle = 0, colorFood = 0;

  answers.forEach((value, index) => {
    const q = quizQuestions[index];
    const score = Number(value);

    if (index < 18) {
      const realScore = q.reverse ? 6 - score : score;
      traits[q.category] += realScore;
    } else if (index < 28) {
      const text = q.text;
      const matched = Object.keys(loveScores).find(k => text.includes(k));
      if (matched) loveScores[matched] += score;
    } else if (index < 34) {
      lifestyle += score;
    } else {
      colorFood += score;
    }
  });

  const mbti = `${traits.E >= 12 ? "E" : "I"}${traits.S >= 12 ? "S" : "N"}${traits.F >= 12 ? "T" : "F"}${traits.P >= 12 ? "J" : "P"}`;
  const sortedLove = Object.entries(loveScores).sort((a, b) => b[1] - a[1]);
  const loveStyle = sortedLove[0][0];

  return {
    mbti,
    loveStyle,
    lifestyle: lifestyle >= 18 ? "Hiện đại, năng động" : "Truyền thống, nhẹ nhàng",
    colorFoodStyle: colorFood >= 18 ? "Màu nóng, đậm vị" : "Màu lạnh, thanh đạm"
  };
}
