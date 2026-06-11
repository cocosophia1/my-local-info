const fs = require('fs');
const path = require('path');

async function main() {
  const filePath = path.join(__dirname, '..', 'public', 'data', 'local-info.json');
  let existingData = [];
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    existingData = JSON.parse(fileContent);
  } catch (error) {
    console.error('기존 데이터를 읽는 중 에러 발생:', error);
    process.exit(1);
  }

  const publicDataApiKey = process.env.PUBLIC_DATA_API_KEY;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!publicDataApiKey) {
    console.error('PUBLIC_DATA_API_KEY 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }
  if (!geminiApiKey) {
    console.error('GEMINI_API_KEY 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  try {
    // 1단계: 공공데이터포털 API에서 데이터 가져오기
    const url = 'https://api.odcloud.kr/api/gov24/v3/serviceList?page=1&perPage=20&returnType=JSON';
    const response = await fetch(url, {
      headers: {
        'Authorization': `Infuser ${publicDataApiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`공공데이터 API 호출 실패: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const data = result.data || [];

    if (data.length === 0) {
      console.log('가져온 공공데이터가 없습니다.');
      return;
    }

    // 필터링
    let filtered = data.filter(item => {
      const name = item['서비스명'] || '';
      const summary = item['서비스목적요약'] || '';
      const target = item['지원대상'] || '';
      const agency = item['소관기관명'] || '';
      return name.includes('성남') || summary.includes('성남') || target.includes('성남') || agency.includes('성남');
    });

    if (filtered.length === 0) {
      filtered = data.filter(item => {
        const name = item['서비스명'] || '';
        const summary = item['서비스목적요약'] || '';
        const target = item['지원대상'] || '';
        const agency = item['소관기관명'] || '';
        return name.includes('경기') || summary.includes('경기') || target.includes('경기') || agency.includes('경기');
      });
    }

    if (filtered.length === 0) {
      filtered = data;
    }

    // 2단계: 기존 데이터와 비교
    const existingNames = new Set(existingData.map(item => item.name));
    const uniqueFiltered = filtered.filter(item => {
      const name = item['서비스명'] || '';
      return name && !existingNames.has(name);
    });

    if (uniqueFiltered.length === 0) {
      console.log('새로운 데이터가 없습니다');
      return;
    }

    // 새 항목 1개만 가공
    const targetItem = uniqueFiltered[0];

    // 3단계: Gemini AI로 새 항목 1개만 가공
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const promptText = `아래 공공데이터 1건을 분석해서 JSON 객체로 변환해줘. 형식:
{id: 숫자, name: 서비스명, category: '행사' 또는 '혜택', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD', location: 장소 또는 기관명, target: 지원대상, summary: 한줄요약, link: 상세URL}
category는 내용을 보고 행사/축제면 '행사', 지원금/서비스면 '혜택'으로 판단해.
startDate가 없으면 오늘 날짜, endDate가 없으면 '상시'로 넣어.
반드시 JSON 객체만 출력해. 다른 텍스트 없이.

오늘 날짜: ${todayStr}

공공데이터:
${JSON.stringify(targetItem, null, 2)}`;

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
    text = text.trim();
    if (text.startsWith('```')) {
      text = text.replace(/^```(?:json)?\n/, '');
      text = text.replace(/\n```$/, '');
    }
    text = text.trim();

    const geminiItem = JSON.parse(text);

    // 4단계: 기존 데이터에 추가
    const startDate = geminiItem.startDate || todayStr;
    const endDate = geminiItem.endDate || '상시';
    const dateText = startDate === endDate || endDate === '상시'
      ? (endDate === '상시' ? `${startDate} ~ 상시` : startDate)
      : `${startDate} ~ ${endDate}`;

    const newItem = {
      id: String(geminiItem.id),
      name: geminiItem.name,
      category: geminiItem.category,
      dateText: dateText,
      location: geminiItem.location,
      target: geminiItem.target,
      summary: geminiItem.summary,
      link: geminiItem.link
    };

    existingData.push(newItem);

    // 저장
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2), 'utf-8');
    console.log(`새로운 항목이 추가되었습니다: ${newItem.name}`);
  } catch (error) {
    console.error('에러 발생:', error);
    process.exit(1);
  }
}

main();
