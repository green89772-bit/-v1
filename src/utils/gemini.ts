import { GoogleGenAI } from '@google/genai';
import { ThoughtBreakdownResult } from '../types';

export const DR_HERON_SYSTEM_PROMPT = `你是一本名為《未啟程的遠方》的互動式心理探索電子書引導者「蒼鷺醫生」。
你遵循「交流分析理論（Transactional Analysis, TA）」中的「成人狀態（Adult State）」視角。
你的語氣：沉穩、敏銳、包容，保持臨床心理引導的客觀與深度，嚴禁任何空洞的說教、廉價的鼓勵或濫情的心靈雞湯。
當讀者輸入他們的真實感受或提問時：
1. 敏銳點出其文字背後的防禦機制（如苛刻父母的審判、適應型兒童的當機逃避、聚光燈效應、完美主義防彈衣等）或成人狀態的覺察萌芽。
2. 以 2 至 3 句話給出精準的蒼鷺式反饋。
3. 一律使用標準繁體中文。`;

function getViteEnvKey(): string | undefined {
  const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
  return metaEnv?.VITE_GEMINI_API_KEY || (window as unknown as { GEMINI_API_KEY?: string }).GEMINI_API_KEY;
}

export async function getThoughtBreakdown(negativeThought: string): Promise<ThoughtBreakdownResult> {
  try {
    const response = await fetch('/api/thought-breakdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ negativeThought }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.criticalParent && data.adultFact) {
        return data;
      }
    }
  } catch (err) {
    console.warn('API thought breakdown call fallback:', err);
  }

  // Client-side fallback if API key is available
  try {
    const apiKey = getViteEnvKey();
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `請分析以下負面想法並提供【苛刻父母的審判/扭曲】與【成人的客觀事實】：
"${negativeThought}"
請回傳JSON: {"criticalParent": "...", "adultFact": "..."}`
              }
            ]
          }
        ]
      });
      if (response.text) {
        const cleaned = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        if (parsed.criticalParent && parsed.adultFact) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.warn('Direct Gemini thought breakdown fallback:', e);
  }

  return {
    criticalParent: `這句想法「${negativeThought}」反映出「苛刻父母」無端發動的極端評價，試圖以災難化的結論綁架你目前的平靜。`,
    adultFact: `客觀事實是：你此刻正在進行合理的休整與神經系統調適。完成一次 2 分鐘的實體微任務，代表你具備主動掌控當下的能力。`
  };
}

export async function getHeronCustomInsight(chapterTitle: string, userText: string): Promise<string> {
  try {
    const response = await fetch('/api/heron-response', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chapterTitle, userText }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.feedback) {
        return data.feedback;
      }
    }
  } catch (err) {
    console.warn('API route call fallback:', err);
  }

  // Client-side Gemini fallback
  try {
    const apiKey = getViteEnvKey();
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: `${DR_HERON_SYSTEM_PROMPT}\n\n[讀者在「${chapterTitle}」末尾輸入的真實感受]：\n"${userText}"\n\n請給出蒼鷺醫生的敏銳反饋：` }
            ]
          }
        ]
      });
      if (response.text) {
        return response.text.trim().replace(/^>|\*|"/g, '');
      }
    }
  } catch (e) {
    console.warn('Direct Gemini call fallback:', e);
  }

  return fallbackHeronResponse(chapterTitle, userText);
}

export async function sendHeronChatMessage(chatHistory: { role: 'user' | 'model'; text: string }[], userMessage: string): Promise<string> {
  try {
    const response = await fetch('/api/heron-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatHistory, userMessage }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.reply) {
        return data.reply;
      }
    }
  } catch (err) {
    console.warn('API chat route fallback:', err);
  }

  // Client-side fallback
  try {
    const apiKey = getViteEnvKey();
    if (apiKey) {
      const ai = new GoogleGenAI({ apiKey });
      const contents = [
        { role: 'user', parts: [{ text: DR_HERON_SYSTEM_PROMPT }] },
        { role: 'model', parts: [{ text: '我是蒼鷺醫生，我已經坐在壁爐旁的扶手椅上了。請告訴我你心裡的疑惑或感受。' }] },
        ...chatHistory.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        { role: 'user', parts: [{ text: userMessage }] }
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents
      });
      if (response.text) {
        return response.text.trim();
      }
    }
  } catch (e) {
    console.warn('Direct Gemini chat fallback:', e);
  }

  return "當你把內心的不安化為文字時，防禦城堡的城門就已經開啟了一道縫隙。試著用成人狀態的客觀事實，重新看一看眼前的困局。";
}

function fallbackHeronResponse(chapterTitle: string, userText: string): string {
  if (userText.includes('累') || userText.includes('焦慮') || userText.includes('怕')) {
    return '看清這份情緒疲憊，正是內部成人狀態醒來的訊號。當你不再用強迫式的完美主義綁架自己，心靈才能在坦然中找到真實的起點。';
  }
  if (userText.includes('不知道') || userText.includes('茫然') || userText.includes('迷茫')) {
    return '迷茫並不是失敗，而是舊有的適應模式失效後，大腦在邀請你重新評估人生坐標。慢下來，給真實的自己一個呼吸的空間。';
  }
  return '敢於將真實的困惑攤在陽光下，這本身就是極具力量的成人選擇。看清防禦的邊界，你便握有了重新定義自我的自主權。';
}
