const fs = require('fs');
const path = require('path');

async function main() {
  const localInfoPath = path.join(__dirname, '..', 'public', 'data', 'local-info.json');
  const postsDir = path.join(__dirname, '..', 'src', 'content', 'posts');

  let localInfo = [];
  try {
    const fileContent = fs.readFileSync(localInfoPath, 'utf-8');
    localInfo = JSON.parse(fileContent);
  } catch (error) {
    console.error('local-info.json을 읽는 중 에러 발생:', error);
    process.exit(1);
  }

  if (localInfo.length === 0) {
    console.log('가져올 공공데이터가 없습니다.');
    return;
  }

  const latestItem = localInfo[localInfo.length - 1];

  // 1단계: 최신 데이터 확인
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  const fileNames = fs.readdirSync(postsDir);
  let alreadyExists = false;
  for (const fileName of fileNames) {
    if (!fileName.endsWith('.md')) continue;
    const filePath = path.join(postsDir, fileName);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    if (fileContent.includes(latestItem.name)) {
      alreadyExists = true;
      break;
    }
  }

  if (alreadyExists) {
    console.log('이미 작성된 글입니다');
    return;
  }

  // 2단계: Gemini AI로 블로그 글 생성
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    console.error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  try {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const promptText = `아래 공공서비스 정보를 바탕으로 블로그 글을 작성해줘.

정보: ${JSON.stringify(latestItem, null, 2)}

아래 형식으로 출력해줘. 반드시 이 형식만 출력하고 다른 텍스트는 없이:
---
title: (친근하고 흥미로운 제목)
date: (오늘 날짜 YYYY-MM-DD)
summary: (한 줄 요약)
category: 정보
tags: [태그1, 태그2, 태그3]
---

(본문: 800자 이상, 친근한 블로그 톤, 추천 이유 3가지 포함, 신청 방법 안내)

마지막 줄에 FILENAME: YYYY-MM-DD-keyword 형식으로 파일명도 출력해줘. 키워드는 영문으로.

오늘 날짜: ${todayStr}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: promptText
              }
            ]
          }
        ]
      })
    });

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API 호출 실패: ${geminiResponse.status} ${geminiResponse.statusText}`);
    }

    const geminiResultJson = await geminiResponse.json();
    let text = geminiResultJson.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('Gemini API 응답에서 텍스트를 찾을 수 없습니다.');
    }

    // 마크다운 코드블록 제거
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```(?:markdown|md)?\n/, '');
      cleanedText = cleanedText.replace(/\n```$/, '');
    }
    cleanedText = cleanedText.trim();

    // FILENAME 라인 분리
    const lines = cleanedText.split('\n');
    const filteredLines = [];
    let extractedFilename = '';

    for (const line of lines) {
      const match = line.match(/FILENAME:\s*([^\s\r\n]+)/i);
      if (match) {
        extractedFilename = match[1].trim();
      } else {
        filteredLines.push(line);
      }
    }

    const blogPostContent = filteredLines.join('\n').trim();

    let filename = '';
    if (extractedFilename) {
      filename = extractedFilename.endsWith('.md') ? extractedFilename : `${extractedFilename}.md`;
    } else {
      filename = `${todayStr}-post.md`;
    }

    // 3단계: 파일 저장
    const targetFilePath = path.join(postsDir, filename);
    fs.writeFileSync(targetFilePath, blogPostContent, 'utf-8');
    console.log(`블로그 글이 생성되었습니다: ${filename}`);
  } catch (error) {
    console.error('블로그 글 생성 중 에러 발생:', error);
    process.exit(1);
  }
}

main();
