import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  TableLayoutType, convertInchesToTwip, PageBreak,
} from "docx";
import fs from "fs";

// ── 색상/스타일 상수 ──
const PURPLE = "6366F1";
const DARK = "1E293B";
const GRAY = "64748B";
const LIGHT_BG = "F0F4FF";
const WHITE = "FFFFFF";
const GREEN = "16A34A";
const RED = "DC2626";
const AMBER = "B45309";

const cellBorder = {
  top: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
  left: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
  right: { style: BorderStyle.SINGLE, size: 1, color: "E2E8F0" },
};

// ── 헬퍼 ──
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    children: [new TextRun({ text, bold: true, size: 36, color: PURPLE, font: "맑은 고딕" })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: PURPLE } },
    children: [new TextRun({ text, bold: true, size: 28, color: DARK, font: "맑은 고딕" })],
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text, bold: true, size: 24, color: PURPLE, font: "맑은 고딕" })],
  });
}
function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text, size: 21, color: opts.color || DARK, font: "맑은 고딕", bold: opts.bold, italics: opts.italics })],
  });
}
function pRuns(...runs) {
  return new Paragraph({
    spacing: { after: 120 },
    children: runs.map(r => typeof r === "string"
      ? new TextRun({ text: r, size: 21, color: DARK, font: "맑은 고딕" })
      : new TextRun({ size: 21, color: DARK, font: "맑은 고딕", ...r })
    ),
  });
}
function bullet(text, level = 0) {
  return new Paragraph({
    bullet: { level },
    spacing: { after: 60 },
    children: [new TextRun({ text, size: 21, color: DARK, font: "맑은 고딕" })],
  });
}
function numberedItem(num, text) {
  return pRuns({ text: `${num}. `, bold: true, color: PURPLE }, text);
}
function tip(text) {
  return new Paragraph({
    spacing: { before: 80, after: 120 },
    indent: { left: convertInchesToTwip(0.3) },
    shading: { type: ShadingType.CLEAR, fill: "EEF2FF" },
    children: [new TextRun({ text: `TIP  ${text}`, size: 20, color: "4338CA", font: "맑은 고딕", italics: true })],
  });
}
function warn(text) {
  return new Paragraph({
    spacing: { before: 80, after: 120 },
    indent: { left: convertInchesToTwip(0.3) },
    shading: { type: ShadingType.CLEAR, fill: "FEF2F2" },
    children: [new TextRun({ text: `주의  ${text}`, size: 20, color: RED, font: "맑은 고딕", bold: true })],
  });
}
function codeBlock(lines) {
  return new Paragraph({
    spacing: { before: 100, after: 140 },
    shading: { type: ShadingType.CLEAR, fill: "F1F5F9" },
    indent: { left: convertInchesToTwip(0.2), right: convertInchesToTwip(0.2) },
    children: lines.map((l, i) =>
      new TextRun({ text: l + (i < lines.length - 1 ? "\n" : ""), size: 20, font: "Consolas", color: DARK, break: i > 0 ? 0 : undefined })
    ),
  });
}

function makeHeaderCell(text) {
  return new TableCell({
    shading: { type: ShadingType.CLEAR, fill: "E0E7FF" },
    borders: cellBorder,
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, size: 20, color: DARK, font: "맑은 고딕" })] })],
  });
}
function makeCell(text, opts = {}) {
  return new TableCell({
    borders: cellBorder,
    shading: opts.fill ? { type: ShadingType.CLEAR, fill: opts.fill } : undefined,
    children: [new Paragraph({
      alignment: opts.align || AlignmentType.LEFT,
      children: [new TextRun({ text, size: 20, color: opts.color || DARK, font: "맑은 고딕", bold: opts.bold })],
    })],
  });
}
function makeTable(headers, rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({ children: headers.map(h => makeHeaderCell(h)) }),
      ...rows.map(cells => new TableRow({
        children: cells.map(c => typeof c === "string" ? makeCell(c) : makeCell(c.text, c)),
      })),
    ],
  });
}
function spacer() { return new Paragraph({ spacing: { after: 80 }, children: [] }); }
function hr() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" } },
    children: [],
  });
}

// ══════════════════════════════════════════════
// ── 문서 생성 ──
// ══════════════════════════════════════════════
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "맑은 고딕", size: 21, color: DARK },
      },
    },
  },
  sections: [{
    properties: {
      page: { margin: { top: 1200, bottom: 1200, left: 1200, right: 1200 } },
    },
    children: [
      // ── 표지 ──
      new Paragraph({ spacing: { before: 3000 }, children: [] }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "🏢", size: 80 })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 },
        children: [new TextRun({ text: "4-2 주식회사", bold: true, size: 56, color: PURPLE, font: "맑은 고딕" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 600 },
        children: [new TextRun({ text: "교사용 운영 매뉴얼", size: 36, color: GRAY, font: "맑은 고딕" })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: "교실 주식 시뮬레이션으로 배우는 경제 교육", size: 24, color: GRAY, font: "맑은 고딕", italics: true })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 1200 },
        children: [new TextRun({ text: `${new Date().getFullYear()}년`, size: 22, color: GRAY, font: "맑은 고딕" })],
      }),
      new Paragraph({ children: [new PageBreak()] }),

      // ═══════ 1. 앱 소개 ═══════
      h2("1. 앱 소개"),
      pRuns({ text: "4-2 주식회사", bold: true, color: PURPLE }, "는 초등학교 교실에서 주식 시뮬레이션을 통해 경제 개념을 배우는 교육용 웹 앱입니다."),
      p("각 학생이 자신의 1인 기업(주식회사)을 만들고, 학교생활 성과에 따라 주가가 변동됩니다."),
      p("학생들은 가상 화폐로 친구의 회사에 투자하며 경제 원리를 자연스럽게 학습합니다."),
      spacer(),
      h3("핵심 개념"),
      makeTable(["개념", "설명"], [
        ["주식회사", "학생 1명 = 1개 회사. 회사 이름, 슬로건, 이모지를 직접 정함"],
        ["주가", "학교생활 성과(포인트, 미션, 투표)에 따라 매주 변동"],
        ["현금", "CEO 급여 + 사업 수익 + 행운권으로 얻음. 투자에 사용"],
        ["투자", "다른 친구의 회사 주식을 사고팔 수 있음 (최대 3주)"],
        ["정산", "매주 1회 실행. 포인트/미션/투표 → 주가 반영, 급여 지급"],
      ]),
      hr(),

      // ═══════ 2. 시작하기 ═══════
      h2("2. 시작하기"),
      h3("2-1. 최초 설정"),
      numberedItem(1, "앱에 접속합니다."),
      numberedItem(2, "관리자 > 학생관리 탭으로 이동합니다."),
      numberedItem(3, "일괄 등록 버튼을 클릭합니다."),
      numberedItem(4, "학생 이름을 한 줄에 하나씩 입력하고 일괄 등록하기를 누릅니다."),
      numberedItem(5, '회사 이름은 자동으로 "OOO 주식회사"로 생성됩니다.'),
      numberedItem(6, "학생들에게 회사 이름과 슬로건을 직접 정하게 합니다."),
      tip('"예시 데이터" 버튼으로 8명의 샘플 데이터를 불러와 미리 테스트해볼 수 있습니다.'),
      spacer(),

      h3("2-2. 학생 정보 수정"),
      bullet("학생관리 탭에서 회사 이름, 슬로건, 이모지를 클릭하면 바로 수정 가능"),
      bullet("학생 추가: 개별 추가 버튼 (전학생 등)"),
      bullet("학생 삭제: 해당 학생 옆 휴지통 아이콘"),
      spacer(),

      h3("2-3. 초기 상태"),
      bullet("모든 학생의 시작 주가: 1,000원"),
      bullet("모든 학생의 시작 현금: 10,000원"),
      bullet("주식 보유 한도: 1개 회사당 최대 3주"),
      hr(),

      // ═══════ 3. 주간 운영 흐름 ═══════
      h2("3. 주간 운영 흐름"),
      h3("한 주의 흐름 (권장)"),
      codeBlock([
        "월요일: 미션 설정 + 지난 주 보고서 나눠주기",
        "화~목:  수업 중 포인트 부여 / 행운권 지급",
        "금요일: 미션 등급 입력 → 투표 → 정산 실행",
        "        → 거래 시간 (주식 매매)",
      ]),
      spacer(),

      h3("3-1. 미션 설정 (관리자 > 미션)"),
      numberedItem(1, '이번 주 미션을 입력합니다. (예: "독서록 3편 작성하기")'),
      numberedItem(2, "설정 버튼을 누르면 헤더에 미션이 표시됩니다."),
      numberedItem(3, "금요일까지 각 학생에게 미션 등급(S/A/B/미완수)을 부여합니다."),
      spacer(),
      makeTable(["등급", "주가 반영", "사업 수익 (현금)"], [
        [{ text: "S", bold: true, color: GREEN }, { text: "+500", color: GREEN }, "+300원"],
        [{ text: "A", bold: true, color: GREEN }, { text: "+300", color: GREEN }, "+200원"],
        [{ text: "B", bold: true }, "+100", "+100원"],
        [{ text: "미완수", bold: true, color: RED }, { text: "-100", color: RED }, "0원"],
      ]),
      spacer(),

      h3("3-2. 선생님 포인트 (관리자 > 포인트)"),
      p("수업 태도, 과제, 생활 등을 평가하여 포인트를 줍니다."),
      bullet("+100, +50: 좋은 행동"),
      bullet("-50, -100: 개선 필요"),
      tip("포인트는 정산 시 주가에 직접 반영됩니다."),
      spacer(),

      h3("3-3. 행운권 (관리자 > 행운권)"),
      p("아침활동, 독서록, 돌발미션 등 다양한 사유로 행운권을 지급합니다."),
      p("지급 시 학생이 선택:"),
      bullet("가상 화폐: 행운권 1장 = 100원으로 즉시 현금 전환"),
      bullet("실물 행운권: 실물 행운권으로 받기 (학기말 추첨 등에 사용)"),
      spacer(),
      makeTable(["사유", "행운권 수"], [
        ["아침활동", "1장"],
        ["독서록", "2장"],
        ["돌발미션 (쉬움)", "1장"],
        ["돌발미션 (보통)", "2장"],
        ["돌발미션 (어려움)", "3장"],
        ["돌발미션 (최고난도)", "5장"],
        ["기타 (직접 입력)", "자유 설정"],
      ]),
      spacer(),

      h3("3-4. 친구 평가/투표 (관리자 > 투표)"),
      numberedItem(1, '학생들이 "이번 주 가장 열심히 한 친구"에게 투표합니다.'),
      numberedItem(2, "선생님이 투표 결과를 입력합니다 (+1표 버튼)."),
      p("정산 시 반영:"),
      bullet("상위 30%: +400"),
      bullet("중위: +100"),
      bullet("하위 30%: -100"),
      tip("초기화 버튼으로 매주 투표를 리셋합니다."),
      spacer(),

      h3("3-5. 정산 (관리자 > 정산)"),
      numberedItem(1, "포인트, 미션 등급, 투표가 모두 입력되었는지 확인합니다."),
      numberedItem(2, "정산 미리보기에서 각 학생의 변동 사항을 확인합니다."),
      numberedItem(3, "정산 실행 버튼을 누릅니다."),
      spacer(),
      p("정산 시 일어나는 일:"),
      bullet("포인트 + 미션 + 투표 점수 → 주가에 반영"),
      bullet("새 주가의 10% → CEO 급여 (현금 지급)"),
      bullet("미션 등급에 따른 → 사업 수익 (현금 지급)"),
      bullet("주차가 1 증가"),
      bullet("모든 포인트/미션/투표 초기화"),
      warn("정산은 되돌릴 수 없습니다! 미리보기를 꼭 확인하세요."),
      hr(),

      // ═══════ 4. 거래 ═══════
      h2("4. 거래 (거래소 탭)"),
      p("학생들이 직접 또는 선생님이 대리로 주식을 매매합니다."),
      spacer(),
      h3("매매 방법"),
      numberedItem(1, "매수/매도 선택"),
      numberedItem(2, "투자자 선택 (누가 사는지)"),
      numberedItem(3, "대상 회사 선택 (어느 회사 주식인지)"),
      numberedItem(4, "수량 선택 (1~3주)"),
      numberedItem(5, "매수하기/매도하기 클릭"),
      spacer(),
      h3("규칙"),
      bullet("자기 회사 주식은 살 수 없음"),
      bullet("한 회사당 최대 3주까지 보유 가능"),
      bullet("잔액이 부족하면 매수 불가"),
      bullet("보유하지 않은 주식은 매도 불가"),
      spacer(),
      h3("운영 팁"),
      bullet("금요일 정산 후 10~15분 거래 시간을 줍니다."),
      bullet('학생들이 "왜 이 회사에 투자하는지" 이유를 말하게 하면 교육 효과 UP'),
      bullet("처음엔 선생님이 대리 거래, 익숙해지면 학생 스스로 (태블릿 등)"),
      hr(),

      // ═══════ 5. 관리자 기능 ═══════
      h2("5. 관리자 기능 상세"),

      h3("5-1. 특별 이벤트 (관리자 > 이벤트)"),
      p("깜짝 호재/악재를 발생시켜 포인트를 줍니다."),
      bullet("대상: 전체 또는 특정 학생 선택"),
      bullet("금액: -200 ~ +300"),
      bullet('예시: "청소 우수 보너스 +200!", "지각 -100"'),
      spacer(),

      h3("5-2. 일괄 지급 (관리자 > 일괄지급)"),
      p("전체 학생에게 동일한 현금을 지급하거나 차감합니다."),
      bullet("사용 예시: 기본 용돈 지급, 세금 징수, 특별 보너스"),
      bullet("금액을 선택하거나 직접 입력"),
      bullet("차감 시 잔액 0원 미만으로는 내려가지 않음"),
      spacer(),

      h3("5-3. 시장 조절 (관리자 > 시장조절)"),
      p("전체 주가를 비율(%)로 올리거나 내립니다."),
      bullet("호황: 전체 주가 상승 (예: +10%)"),
      bullet("불황: 전체 주가 하락 (예: -10%)"),
      bullet("미리보기에서 변동 결과를 확인할 수 있음"),
      tip('"오늘 실제로 코스피가 3% 올랐으니, 우리 교실 시장도 호황입니다!"'),
      spacer(),

      h3("5-4. 활동 현황 (관리자 > 활동현황)"),
      p("학생별 활동 데이터를 한눈에 확인합니다."),
      bullet("거래 횟수, 행운권 수, 투자 종목 수, 투자자 수"),
      bullet("주가 상승률 TOP / 총자산 TOP 랭킹"),
      bullet("수업 중 칭찬이나 피드백에 활용"),
      spacer(),

      h3("5-5. 경매 (관리자 > 경매)"),
      p("학기말 주주총회에서 과자 경매를 진행할 수 있습니다."),
      numberedItem(1, "경매 물품을 등록합니다 (이름, 이모지, 시작가)."),
      numberedItem(2, "경매 시작 버튼을 누릅니다."),
      numberedItem(3, "학생 이름을 클릭하면 100원씩 입찰가가 올라갑니다."),
      numberedItem(4, "더 이상 입찰자가 없으면 낙찰 버튼을 누릅니다."),
      numberedItem(5, "낙찰가가 해당 학생의 현금에서 차감됩니다."),
      spacer(),

      h3("5-6. 보고서 (관리자 > 보고서)"),
      p("학생 개인별 주간 보고서를 인쇄할 수 있습니다."),
      bullet("A4 용지에 1명씩 출력"),
      bullet("주가 순위, 자산 현황, CEO 수익, 투자 내역, 주가 추이 포함"),
      bullet('학생이 직접 "소감"을 작성하는 란 포함'),
      bullet("미리보기/인쇄 버튼으로 바로 출력"),
      hr(),

      // ═══════ 6. 화면 설명 ═══════
      h2("6. 화면 설명"),
      h3("대시보드"),
      bullet("상장 기업 수, 평균 주가, 총 거래, 현재 주차 통계"),
      bullet("전체 주가 추이 그래프"),
      bullet("종목별 카드 (클릭하면 상세 정보)"),
      spacer(),
      h3("학생 상세 (종목 카드 클릭)"),
      bullet("현재 주가, 보유 현금, 총 자산, 누적 수익률"),
      bullet("이번 주 변동, CEO 급여, 사업 수익"),
      bullet("주가 추이 차트"),
      bullet("우리 회사 투자자 (누가 나에게 투자했는지)"),
      bullet("보유 주식 (투자 원금/현재 가치/손익)"),
      bullet("최근 거래 내역"),
      spacer(),
      h3("거래소"),
      bullet("주식 매매 폼 (매수/매도)"),
      bullet("거래 기록 (최근 30건)"),
      spacer(),
      h3("순위표"),
      bullet("주가 순위 / 총자산 순위 전환"),
      bullet("1~3위 포디움 + 나머지 리스트"),
      bullet("비교 차트"),
      hr(),

      // ═══════ 7. 수업 운영 팁 ═══════
      h2("7. 수업 운영 팁"),
      h3("첫 주 (도입)"),
      numberedItem(1, '"주식이 뭘까?" 이야기 나누기'),
      numberedItem(2, "각자 회사 이름, 슬로건 정하기"),
      numberedItem(3, "이모지로 회사 로고 만들기"),
      numberedItem(4, "첫 미션 설정 후 1주일 관찰"),
      spacer(),
      h3("2~3주차 (적응)"),
      numberedItem(1, "정산 과정을 학생들과 함께 보기 (빔프로젝터)"),
      numberedItem(2, '"왜 이 친구에게 투표하는지" 발표'),
      numberedItem(3, "거래 시간에 투자 이유 발표하기"),
      numberedItem(4, "보고서 나눠주고 소감 작성"),
      spacer(),
      h3("4주차 이후 (심화)"),
      numberedItem(1, "시장 조절 기능으로 호황/불황 경험"),
      numberedItem(2, '뉴스와 연계 (예: "금리 인상 → 불황")'),
      numberedItem(3, "학생들이 투자 전략 발표하기"),
      numberedItem(4, "반 경제 신문 만들기"),
      spacer(),
      h3("학기말"),
      numberedItem(1, "과자 경매로 보유 현금 활용"),
      numberedItem(2, "최종 순위 시상"),
      numberedItem(3, '"나의 경제 활동 돌아보기" 활동'),
      hr(),

      // ═══════ 8. FAQ ═══════
      h2("8. 자주 묻는 질문 (FAQ)"),
      pRuns({ text: "Q. 데이터가 날아갔어요!", bold: true, color: PURPLE }),
      p("데이터는 Firebase 클라우드에 자동 저장됩니다. 인터넷 연결을 확인해주세요. 새로고침하면 서버에서 최신 데이터를 불러옵니다."),
      spacer(),
      pRuns({ text: "Q. 주가가 너무 높아졌어요/낮아졌어요", bold: true, color: PURPLE }),
      p("시장 조절 기능으로 전체 주가를 비율로 조정할 수 있습니다. 또는 포인트를 조절하여 다음 정산에서 균형을 맞출 수 있습니다."),
      spacer(),
      pRuns({ text: "Q. 잘못 거래했어요", bold: true, color: PURPLE }),
      p("반대 거래를 실행하세요. (매수 실수 → 매도로 되돌리기) 직접 수정 기능은 없으므로, 반대 거래로 원상복구합니다."),
      spacer(),
      pRuns({ text: "Q. 정산을 잘못 실행했어요", bold: true, color: PURPLE }),
      p("정산은 되돌릴 수 없습니다. 다음 주차에 포인트 조정으로 보정해주세요."),
      spacer(),
      pRuns({ text: "Q. 전학생이 왔어요", bold: true, color: PURPLE }),
      p("학생관리 > 개별 추가로 새 학생을 등록합니다. 시작 주가 1,000원, 현금 10,000원으로 시작합니다. 필요하면 일괄지급으로 추가 현금을 줄 수 있습니다."),
      spacer(),
      pRuns({ text: "Q. 학생이 전학갔어요", bold: true, color: PURPLE }),
      p("학생관리에서 해당 학생을 삭제합니다. 해당 학생에게 투자한 다른 학생의 주식은 자동으로 사라지므로, 삭제 전에 관련 학생들의 매도를 먼저 처리하는 것을 권장합니다."),
      spacer(),
      pRuns({ text: "Q. 모바일에서도 사용할 수 있나요?", bold: true, color: PURPLE }),
      p("네! 스마트폰, 태블릿에서도 사용 가능합니다. 모바일에서는 하단 탭바로 메뉴를 이동합니다."),
      hr(),

      // ═══════ 9. 정산 계산식 ═══════
      h2("9. 정산 계산식 상세"),
      codeBlock([
        "새 주가 = MAX(100, 현재 주가 + 선생님 포인트 + 미션 점수 + 투표 점수)",
        "",
        "CEO 급여 = 새 주가 x 10%  (소수점 반올림)",
        "",
        "사업 수익 = 미션 등급별 (S: 300원, A: 200원, B: 100원, 미완수: 0원)",
        "",
        "새 현금 = 현재 현금 + CEO 급여 + 사업 수익",
      ]),
      tip("주가는 최소 100원 이하로 내려가지 않습니다."),
      hr(),

      // ═══════ 10. 교육과정 연계 ═══════
      h2("10. 교육과정 연계"),
      makeTable(["교과", "연계 활동"], [
        ["사회", "경제 개념 (생산, 소비, 투자, 시장), 금융 교육"],
        ["수학", "퍼센트 계산, 손익 계산, 그래프 읽기"],
        ["국어", "회사 소개 글쓰기, 투자 전략 발표, 경제 신문 만들기"],
        ["도덕", "공정한 경쟁, 협력, 정직한 거래"],
        ["창체", "진로 교육 (CEO 체험), 경제 교육"],
      ]),
    ],
  }],
});

const buf = await Packer.toBuffer(doc);
fs.writeFileSync("docs/교사용_매뉴얼.docx", buf);
console.log("docs/교사용_매뉴얼.docx 생성 완료! (" + (buf.length / 1024).toFixed(0) + " KB)");
