export const SAMPLE_STUDENTS = [
  { id: 1, name: "김도윤", company: "깔끔 주식회사", slogan: "교실 정리의 달인!", emoji: "🧹" },
  { id: 2, name: "이서연", company: "아이디어 랩", slogan: "창의력이 폭발하는 회사", emoji: "💡" },
  { id: 3, name: "박지호", company: "수학왕 컴퍼니", slogan: "문제 해결의 천재들", emoji: "🔢" },
  { id: 4, name: "최유나", company: "책벌레 기업", slogan: "독서로 세상을 바꾸자!", emoji: "📚" },
  { id: 5, name: "정민재", company: "스포츠 히어로즈", slogan: "운동으로 건강한 회사", emoji: "⚽" },
  { id: 6, name: "한수빈", company: "예술의 전당", slogan: "미술과 음악의 천국", emoji: "🎨" },
  { id: 7, name: "오태양", company: "과학 탐험대", slogan: "실험하고 발견하는 회사", emoji: "🔬" },
  { id: 8, name: "윤하은", company: "친절 주식회사", slogan: "따뜻한 말 한마디의 힘", emoji: "💖" },
];

export const DEFAULT_STOCK_PRICE = 1000;
export const DEFAULT_CASH = 10000;
export const MAX_SHARES = 3;
export const GRADES = { S: 500, A: 300, B: 100, "미완수": -100 };
export const SALARY_RATE = 0.1;
export const MISSION_CASH = { S: 300, A: 200, B: 100, "미완수": 0 };
export const TICKET_VALUE = 100;
export const TICKET_REASONS = [
  { id: "morning", label: "아침활동", tickets: 1, emoji: "🌅" },
  { id: "reading", label: "독서록", tickets: 2, emoji: "📖" },
  { id: "mission1", label: "돌발미션 (쉬움)", tickets: 1, emoji: "⭐" },
  { id: "mission2", label: "돌발미션 (보통)", tickets: 2, emoji: "⭐⭐" },
  { id: "mission3", label: "돌발미션 (어려움)", tickets: 3, emoji: "⭐⭐⭐" },
  { id: "mission4", label: "돌발미션 (최고난도)", tickets: 5, emoji: "🌟" },
  { id: "custom", label: "기타 (직접 입력)", tickets: 0, emoji: "🎫" },
];
