import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const DR_HERON_SYSTEM = `你是一本名為《未啟程的遠方》的互動式心理探索電子書引導者「蒼鷺醫生」。
你遵循「交流分析理論（Transactional Analysis, TA）」中的「成人狀態（Adult State）」視角。
你的語氣：沉穩、敏銳、包容，保持臨床心理引導的客觀與深度，嚴禁任何空洞的說教、廉價的鼓勵或濫情的心靈雞湯。
當讀者輸入他們的真實感受或提問時：
1. 敏銳點出其文字背後的防禦機制（如苛刻父母的審判、適應型兒童的當機逃避、聚光燈效應、完美主義防彈衣等）或成人狀態的覺察萌芽。
2. 以 2 至 3 句話給出精準、具備心理洞察的蒼鷺式反饋。
3. 一律使用標準繁體中文。`;

app.post('/api/heron-response', async (req: Request, res: Response) => {
  try {
    const { chapterTitle, userText } = req.body;
    if (!userText) {
      return res.status(400).json({ error: 'Missing user text' });
    }

    if (!ai) {
      return res.json({
        feedback: "看清這份情緒與防禦，正是內部成人狀態醒來的訊號。當你不再用強迫式的完美主義綁架自己，心靈才能在坦然中找到真實的起點。"
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${DR_HERON_SYSTEM}\n\n[讀者在「${chapterTitle || '未啟程的遠方'}」末尾輸入的真實感受]：\n"${userText}"\n\n請給出蒼鷺醫生的敏銳反饋（2-3句，不帶雞湯，標準繁體中文）：` }
          ]
        }
      ]
    });

    const text = response.text ? response.text.trim().replace(/^>|\*|"/g, '') : "看清動機與防禦，是邁向成人狀態的第一步。";
    return res.json({ feedback: text });
  } catch (err) {
    console.error('Heron response error:', err);
    return res.json({
      feedback: "當你把內心的不安化為文字時，防禦城堡的城門就已經開啟了一道縫隙。試著用成人狀態的客觀事實，重新看一看眼前的困局。"
    });
  }
});

app.post('/api/heron-chat', async (req: Request, res: Response) => {
  try {
    const { chatHistory, userMessage } = req.body;
    if (!userMessage) {
      return res.status(400).json({ error: 'Missing user message' });
    }

    if (!ai) {
      return res.json({
        reply: "我是蒼鷺醫生。此刻壁爐裡的火光正暖，請隨時告訴我你心裡的焦慮或疑惑，我們一起從成人狀態來梳理它。"
      });
    }

    const formattedHistory = (chatHistory || []).map((msg: { role: string; text: string }) => ({
      role: msg.role === 'heron' ? 'model' : 'user',
      parts: [{ text: msg.text }]
    }));

    const contents = [
      { role: 'user', parts: [{ text: DR_HERON_SYSTEM }] },
      { role: 'model', parts: [{ text: '我是蒼鷺醫生，我已經坐在壁爐旁的扶手椅上了。請告訴我你心裡的疑惑或感受。' }] },
      ...formattedHistory,
      { role: 'user', parts: [{ text: userMessage }] }
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents
    });

    const reply = response.text ? response.text.trim() : "請繼續，我正聽著。";
    return res.json({ reply });
  } catch (err) {
    console.error('Heron chat error:', err);
    return res.json({
      reply: "請記住，無論焦慮何時襲來，你隨時都能回到這個內在壁爐旁，用成人的清醒與寬容重新安頓自己。"
    });
  }
});

app.post('/api/thought-breakdown', async (req: Request, res: Response) => {
  try {
    const { negativeThought } = req.body;
    if (!negativeThought) {
      return res.status(400).json({ error: 'Missing negative thought' });
    }

    if (!ai) {
      return res.json(getFallbackBreakdown(negativeThought));
    }

    const prompt = `你是一位專業的 TA 交流分析（Transactional Analysis）與認知行為（CBT）心理專家「蒼鷺醫生」。
使用者輸入了一句在當機/焦慮/待業期折磨他的負面想法：
"${negativeThought}"

請針對這句話進行雙欄認知重構分析：
1. 【苛刻父母的審判與扭曲】 (criticalParent)：指出這句話裡誇大、災難化、全或無思維或過度自我苛責的盲點（2-3句）。
2. 【成人的客觀事實與定錨】 (adultFact)：將這句話轉化為一句客觀、冷靜、有力量、符合現況事實的成人宣告（2-3句）。

請務必以 valid JSON 格式回答，格式如下：
{
  "criticalParent": "...",
  "adultFact": "..."
}
只輸出 JSON，不要有任何 Markdown codeblock 標記。`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    const rawText = response.text ? response.text.trim() : '';
    const cleanedJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

    try {
      const parsed = JSON.parse(cleanedJson);
      if (parsed.criticalParent && parsed.adultFact) {
        return res.json(parsed);
      }
    } catch {
      // Fallback if JSON parse fails
    }

    return res.json(getFallbackBreakdown(negativeThought));
  } catch (err) {
    console.error('Thought breakdown error:', err);
    return res.json(getFallbackBreakdown(req.body.negativeThought || ''));
  }
});

function getFallbackBreakdown(thought: string) {
  return {
    criticalParent: `這句話隱含了「苛刻父母」過度誇大的審判：把暫時的當機或休整，直接判定為終身的失敗，忽略了客觀現實中的積累與調適期。`,
    adultFact: `客觀事實是：你現在處於暫時的神經與生涯修復期。允許自己停下來喘口氣，並不代表放棄進步；你此刻正透過微小調整重新建構掌控感。`
  };
}

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
