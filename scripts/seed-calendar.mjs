import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("캘린더 더미 데이터 생성 중...");

  // 다음 주 월요일 날짜 계산
  const today = new Date();
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7));
  nextMonday.setHours(14, 0, 0, 0);

  // 종료 시간 (2시간 후)
  const endTime = new Date(nextMonday);
  endTime.setHours(16, 0, 0, 0);

  // 캘린더 이벤트 생성
  const event = await prisma.calendarEvent.create({
    data: {
      title: "스타트업 멘토링 데이",
      description:
        "성공한 선배 기업인들과의 1:1 멘토링 시간입니다. 사업 운영, 마케팅, 자금 조달 등 다양한 주제로 상담받으실 수 있습니다.",
      startDate: nextMonday,
      endDate: endTime,
      location: "성북구 중장년 기술창업센터 2층 세미나실",
      category: "멘토링",
      maxParticipants: 20,
      createdBy: "관리자",
    },
  });

  console.log("✅ 캘린더 이벤트 생성 완료:");
  console.log(`   - 제목: ${event.title}`);
  console.log(`   - 일시: ${event.startDate.toLocaleString("ko-KR")}`);
  console.log(`   - 장소: ${event.location}`);
  console.log(`   - 정원: ${event.maxParticipants}명`);

  // 이번 주 금요일 날짜 계산
  const thisFriday = new Date(today);
  thisFriday.setDate(today.getDate() + ((5 + 7 - today.getDay()) % 7));
  thisFriday.setHours(10, 0, 0, 0);

  const fridayEnd = new Date(thisFriday);
  fridayEnd.setHours(12, 0, 0, 0);

  // 두 번째 이벤트 생성
  const event2 = await prisma.calendarEvent.create({
    data: {
      title: "디지털 마케팅 워크샵",
      description:
        "SNS 마케팅, 블로그 운영, 온라인 광고 집행 등 실무에 바로 적용 가능한 디지털 마케팅 전략을 배워보세요.",
      startDate: thisFriday,
      endDate: fridayEnd,
      location: "온라인 (Zoom)",
      category: "교육",
      maxParticipants: 30,
      createdBy: "관리자",
    },
  });

  console.log("\n✅ 두 번째 이벤트 생성 완료:");
  console.log(`   - 제목: ${event2.title}`);
  console.log(`   - 일시: ${event2.startDate.toLocaleString("ko-KR")}`);
  console.log(`   - 장소: ${event2.location}`);
  console.log(`   - 정원: ${event2.maxParticipants}명`);

  // 다음 달 첫째 주 수요일
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);
  nextMonth.setDate(1);
  // 첫 수요일 찾기
  while (nextMonth.getDay() !== 3) {
    nextMonth.setDate(nextMonth.getDate() + 1);
  }
  nextMonth.setHours(15, 0, 0, 0);

  const nextMonthEnd = new Date(nextMonth);
  nextMonthEnd.setHours(17, 0, 0, 0);

  // 세 번째 이벤트 생성
  const event3 = await prisma.calendarEvent.create({
    data: {
      title: "입주기업 네트워킹 데이",
      description:
        "센터 입주기업들 간의 교류와 협업 기회를 만드는 시간입니다. 다과와 함께 편안한 분위기에서 네트워킹하세요.",
      startDate: nextMonth,
      endDate: nextMonthEnd,
      location: "성북구 중장년 기술창업센터 1층 라운지",
      category: "네트워킹",
      maxParticipants: 50,
      createdBy: "관리자",
    },
  });

  console.log("\n✅ 세 번째 이벤트 생성 완료:");
  console.log(`   - 제목: ${event3.title}`);
  console.log(`   - 일시: ${event3.startDate.toLocaleString("ko-KR")}`);
  console.log(`   - 장소: ${event3.location}`);
  console.log(`   - 정원: ${event3.maxParticipants}명`);

  console.log("\n✨ 총 3개의 캘린더 이벤트가 생성되었습니다!");
}

main()
  .catch((e) => {
    console.error("❌ 에러 발생:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
