import { getSortedPostsData } from "@/lib/posts";

export default async function BlogPage() {
  const posts = getSortedPostsData();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* 헤더 */}
      <header className="bg-gradient-to-r from-blue-600 to-sky-500 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              ✍️ 우리 동네 블로그
            </h1>
            <p className="mt-2 text-sky-100 text-sm sm:text-base font-medium">
              유용한 소식과 꿀팁을 매일 읽기 쉽게 정리하여 전해드려요.
            </p>
          </div>
          <a
            href="/"
            className="bg-white/20 hover:bg-white/30 text-white font-bold py-2 px-4 rounded-xl border border-white/20 transition-all"
          >
            🏠 홈으로
          </a>
        </div>
      </header>

      {/* 메인 리스트 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {posts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-4xl block mb-4">📭</span>
            <p className="text-slate-500 font-medium">아직 등록된 블로그 글이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all duration-200"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                    {post.category || "일반"}
                  </span>
                  <span className="text-xs text-slate-400">{post.date}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2 hover:text-blue-600 transition-colors">
                  <a href={`/blog/${post.slug}/`}>{post.title}</a>
                </h2>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  {post.summary}
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="text-right">
                  <a
                    href={`/blog/${post.slug}/`}
                    className="inline-block text-blue-600 hover:text-blue-700 text-sm font-semibold transition-colors"
                  >
                    글 읽기 →
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
