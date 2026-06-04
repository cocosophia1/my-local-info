import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";

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

// 1. 빌드 시 생성할 모든 상세 페이지 경로(ID)를 알려주는 함수 (정적 빌드 필수 요건)
export async function generateStaticParams() {
  const filePath = path.join(process.cwd(), "public", "data", "local-info.json");
  const fileData = fs.readFileSync(filePath, "utf-8");
  const items: LocalInfoItem[] = JSON.parse(fileData);

  return items.map((item) => ({
    id: item.id,
  }));
}

// 2. 개별 상세 페이지를 그리는 컴포넌트
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DetailPage({ params }: PageProps) {
  const { id } = await params;

  // JSON 파일에서 데이터 로드
  const filePath = path.join(process.cwd(), "public", "data", "local-info.json");
  const fileData = fs.readFileSync(filePath, "utf-8");
  const items: LocalInfoItem[] = JSON.parse(fileData);

  // 현재 ID에 매칭되는 데이터 탐색
  const item = items.find((x) => x.id === id);

  // 데이터가 없는 경우 404 에러 페이지 출력
  if (!item) {
    notFound();
  }

  const isEvent = item.category === "행사";
  
  // 카테고리에 맞는 전용 색상 테마 분기
  const themeColor = isEvent ? "blue" : "indigo";
  const bgBadgeClass = isEvent ? "bg-blue-100 text-blue-700" : "bg-indigo-100 text-indigo-700";
  const borderClass = isEvent ? "border-blue-500" : "border-indigo-500";
  const textHighlightClass = isEvent ? "text-blue-600" : "text-indigo-600";
  const buttonClass = isEvent 
    ? "bg-blue-600 hover:bg-blue-700 text-white" 
    : "bg-indigo-600 hover:bg-indigo-700 text-white";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* 뒤로 가기 링크 */}
        <Link
          href="/"
          className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-6"
        >
          ← 목록으로 돌아가기
        </Link>

        {/* 메인 상세 정보 카드 */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {/* 상단 띠 컬러 장식 */}
          <div className={`h-3 w-full ${isEvent ? "bg-blue-500" : "bg-indigo-500"}`} />

          <div className="p-8 sm:p-10">
            {/* 카테고리 태그 */}
            <span className={`inline-block ${bgBadgeClass} text-xs font-bold px-3 py-1 rounded-lg mb-4`}>
              {item.category}
            </span>

            {/* 타이틀 */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-6 leading-tight">
              {item.name}
            </h1>

            {/* 정보 그리드 */}
            <div className="grid grid-cols-1 gap-4 mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-sm">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <span className={`w-24 font-bold ${textHighlightClass}`}>📅 {isEvent ? "행사 기간" : "신청 기간"}</span>
                <span className="text-slate-700 font-medium">{item.dateText}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 border-t border-slate-200/60 pt-3">
                <span className={`w-24 font-bold ${textHighlightClass}`}>📍 {isEvent ? "행사 장소" : "신청 방법"}</span>
                <span className="text-slate-700 font-medium">{item.location}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 border-t border-slate-200/60 pt-3">
                <span className={`w-24 font-bold ${textHighlightClass}`}>👥 지원 대상</span>
                <span className="text-slate-700 font-medium">{item.target}</span>
              </div>
            </div>

            {/* 상세 설명 */}
            <div className="mb-10">
              <h2 className="text-lg font-bold text-slate-900 mb-3">상세 내용</h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-line bg-white p-1">
                {item.summary}
              </p>
            </div>

            {/* 하단 링크 버튼 */}
            <div className="border-t border-slate-100 pt-8 flex justify-center sm:justify-end">
              <a
                href={item.link}
                className={`w-full sm:w-auto text-center font-bold px-8 py-3.5 rounded-2xl transition-all duration-200 flex items-center justify-center gap-1 shadow-sm ${buttonClass}`}
              >
                자세히 보기 <span className="text-base">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
