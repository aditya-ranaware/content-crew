import { Briefcase, Landmark, PenLine, Search, ShieldCheck, SpellCheck, TrendingUp, Trophy } from "lucide-react";

export const STAGES = [
  { key: "Researcher", job: "Searches the web and reads the sources", icon: Search },
  { key: "SEO Strategist", job: "Picks keywords, a title and a meta description", icon: TrendingUp },
  { key: "Writer", job: "Drafts the article from the research", icon: PenLine },
  { key: "Fact-Checker", job: "Checks every name, number and date", icon: ShieldCheck },
  { key: "Editor", job: "Applies the fixes and polishes the text", icon: SpellCheck },
];

export const TONES = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "funny", label: "Funny" },
  { value: "inspirational", label: "Inspiring" },
];

export const LENGTHS = [
  { value: 500, label: "Short", hint: "about 500 words" },
  { value: 800, label: "Standard", hint: "about 800 words" },
  { value: 1200, label: "Long", hint: "about 1,200 words" },
  { value: 1600, label: "In-depth", hint: "about 1,600 words" },
];

export const EXAMPLES = [
  "India vs West Indies T20I series 2026 result and key moments",
  "How small businesses can use AI for customer support",
  "A beginner's guide to investing in index funds",
];

export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिन्दी (Hindi)" },
  { value: "mr", label: "मराठी (Marathi)" },
];

export const EXAMPLE_CARDS = [
  { icon: Trophy, title: "Sports recap", text: "Results and key moments from a recent series", topics: { en: "India vs West Indies T20I series 2026 result and key moments", hi: "भारत बनाम वेस्टइंडीज टी20 सीरीज 2026 के नतीजे और अहम पल", mr: "भारत विरुद्ध वेस्ट इंडिज टी20 मालिका 2026 चे निकाल आणि महत्त्वाचे क्षण" } },
  { icon: Briefcase, title: "Business explainer", text: "How a trend affects small businesses", topics: { en: "How small businesses can use AI for customer support", hi: "छोटे व्यवसाय ग्राहक सेवा में AI का उपयोग कैसे कर सकते हैं", mr: "लहान व्यवसाय ग्राहक सेवेत AI चा वापर कसा करू शकतात" } },
  { icon: Landmark, title: "Beginner's guide", text: "A clear primer for first-time readers", topics: { en: "A beginner's guide to investing in index funds", hi: "इंडेक्स फंड में निवेश के लिए शुरुआती गाइड", mr: "इंडेक्स फंडमध्ये गुंतवणुकीसाठी नवशिक्यांसाठी मार्गदर्शक" } },
];
