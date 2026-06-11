import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface PostData {
  slug: string;
  title: string;
  date: string;
  summary: string;
  category: string;
  tags: string[];
  content: string;
}

const postsDirectory = path.join(process.cwd(), "src", "content", "posts");

// 날짜 포맷 함수 (Date 객체 또는 다양한 입력을 YYYY-MM-DD 형태로 변환)
function formatDate(dateInput: any): string {
  if (!dateInput) return "";
  
  if (dateInput instanceof Date) {
    const year = dateInput.getFullYear();
    const month = String(dateInput.getMonth() + 1).padStart(2, "0");
    const day = String(dateInput.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  if (typeof dateInput === "string") {
    // 이미 YYYY-MM-DD 형식인지 확인 후, 혹시 Date 파싱 가능한 문자열이면 변환 시도
    const dateObj = new Date(dateInput);
    if (!isNaN(dateObj.getTime())) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
    return dateInput.split("T")[0]; // ISO 문자열 대응
  }

  return String(dateInput);
}

export function getSortedPostsData(): PostData[] {
  // 폴더가 없으면 빈 배열 반환
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf-8");

      const matterResult = matter(fileContents);
      const data = matterResult.data;

      return {
        slug,
        title: data.title || "",
        date: formatDate(data.date),
        summary: data.summary || "",
        category: data.category || "",
        tags: Array.isArray(data.tags) ? data.tags : [],
        content: matterResult.content,
      };
    });

  // 날짜 순 정렬 (최신순)
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostData(slug: string): PostData | null {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf-8");
  const matterResult = matter(fileContents);
  const data = matterResult.data;

  return {
    slug,
    title: data.title || "",
    date: formatDate(data.date),
    summary: data.summary || "",
    category: data.category || "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    content: matterResult.content,
  };
}
