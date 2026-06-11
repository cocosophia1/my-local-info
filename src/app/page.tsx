import fs from "fs";
import path from "path";

// 정보 타입 정의
interface LocalInfoItem {
  id: string;
  name: string;
  category: "행사" | "혜택";
  dateText: string;
  location: string;
  target: string;
  summary: string;
  link: string;
}

export default async function Home() {
  // public/data/local-info.json 파일 읽기
  const filePath = path.join(process.cwd(), "public", "data", "local-info.json");
  const fileData = fs.readFileSync(filePath, "utf-8");
  const items: LocalInfoItem[] = JSON.parse(fileData);

  // 행사와 혜택 분류하기
  const events = items.filter((item) => item.category === "행사");
  const benefits = items.filter((item) => item.category === "혜택");

  // 마지막 업데이트 시간 (오늘 날짜 기준 표시)
  const today = new Date();
  const lastUpdated = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* 상단 헤더 */}
      <header className="bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              🏙️ 성남시 생활 정보
            </h1>
            <p className="mt-2 text-sky-100 text-sm sm:text-base font-medium">
              우리 동네의 유용한 행사, 축제 소식과 놓치기 쉬운 지원금/혜택을 한눈에 확인해보세요!
            </p>
          </div>
          <a
            href="/blog/"
            className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-xl border border-white/20 transition-all text-sm sm:text-base flex items-center gap-1"
          >
            ✍️ 동네 블로그 보러가기
          </a>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-12">
        {/* 이번 달 행사/축제 섹션 */}
        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-blue-200 pb-2">
            <span className="text-2xl">🎉</span>
            <h2 className="text-2xl font-bold text-slate-800">이번 달 행사 / 축제</h2>
            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {events.length}건
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6">
                  {/* 카드 카테고리 태그 */}
                  <span className="inline-block bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-lg mb-3">
                    {event.category}
                  </span>
                  {/* 제목 */}
                  <h3 className="text-lg font-bold text-slate-900 mb-2 hover:text-blue-600 transition-colors">
                    {event.name}
                  </h3>
                  {/* 상세 요약 */}
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    {event.summary}
                  </p>

                  {/* 세부 정보 목록 */}
                  <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                    <div className="flex items-start gap-1.5">
                      <span className="text-blue-600 font-semibold">📅 기간:</span>
                      <span>{event.dateText}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-blue-600 font-semibold">📍 장소:</span>
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-blue-600 font-semibold">👥 대상:</span>
                      <span>{event.target}</span>
                    </div>
                  </div>
                </div>

                {/* 상세 보기 버튼 */}
                <div className="px-6 pb-6 pt-2">
                  <a
                    href="/blog/"
                    className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2 px-4 rounded-xl transition-colors duration-200"
                  >
                    자세히 보기
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 지원금/혜택 정보 섹션 */}
        <section>
          <div className="flex items-center gap-2 mb-6 border-b border-indigo-200 pb-2">
            <span className="text-2xl">💰</span>
            <h2 className="text-2xl font-bold text-slate-800">지원금 / 혜택 정보</h2>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {benefits.length}건
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-300 transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                <div className="p-6">
                  {/* 카드 카테고리 태그 */}
                  <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-lg mb-3">
                    {benefit.category}
                  </span>
                  {/* 제목 */}
                  <h3 className="text-lg font-bold text-slate-900 mb-2 hover:text-indigo-600 transition-colors">
                    {benefit.name}
                  </h3>
                  {/* 상세 요약 */}
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    {benefit.summary}
                  </p>

                  {/* 세부 정보 목록 */}
                  <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                    <div className="flex items-start gap-1.5">
                      <span className="text-indigo-600 font-semibold">📅 신청:</span>
                      <span>{benefit.dateText}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-indigo-600 font-semibold">📍 방법:</span>
                      <span>{benefit.location}</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="text-indigo-600 font-semibold">👥 대상:</span>
                      <span>{benefit.target}</span>
                    </div>
                  </div>
                </div>

                {/* 상세 보기 버튼 */}
                <div className="px-6 pb-6 pt-2">
                  <a
                    href="/blog/"
                    className="block text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm py-2 px-4 rounded-xl transition-colors duration-200"
                  >
                    자세히 보기
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 하단 푸터 */}
      <footer className="bg-slate-100 border-t border-slate-200 text-slate-500 text-xs sm:text-sm mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left space-y-1">
            <p className="font-semibold text-slate-700">🏙️ 우리 동네 생활 정보 서비스</p>
            <p>데이터 출처: 공공데이터포털 (data.go.kr)</p>
          </div>
          <div className="text-center sm:text-right">
            <p>마지막 업데이트 날짜: {lastUpdated}</p>
            <p className="mt-1 text-[11px] text-slate-400">© 2026 my-local-info. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
