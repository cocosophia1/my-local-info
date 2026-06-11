import { getPostData, getSortedPostsData } from "@/lib/posts";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface BlogPostParams {
  params: Promise<{
    slug: string;
  }>;
}

// 정적 배포(export)를 위해 모든 포스트의 slug를 동적으로 추출하여 paths 구성
export async function generateStaticParams() {
  const posts = getSortedPostsData();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPostPage({ params }: BlogPostParams) {
  const { slug } = await params;
  const post = getPostData(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* 상단 헤더 */}
      <header className="bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md mb-8">
        <div className="max-w-4xl mx-auto px-4 py-8 flex items-center justify-between">
          <a href="/blog/" className="text-white hover:text-sky-100 font-bold transition-all text-sm flex items-center gap-1">
            ← 목록으로
          </a>
          <span className="text-xs bg-white/20 px-3 py-1 rounded-full border border-white/10">
            {post.category || "블로그"}
          </span>
        </div>
      </header>

      {/* 포스트 상세 정보 */}
      <main className="max-w-3xl mx-auto px-4 pb-20">
        <article className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-10">
          <header className="border-b border-slate-100 pb-6 mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-400">
              <span>작성일: {post.date}</span>
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.tags.map((tag) => (
                    <span key={tag} className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </header>

          {/* 마크다운 렌더링 콘텐츠 영역 (Tailwind Typography 적용) */}
          <div className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content}
            </ReactMarkdown>
          </div>
        </article>
      </main>
    </div>
  );
}
