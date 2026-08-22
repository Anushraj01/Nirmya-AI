import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './context/AuthContext';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface Assessment {
  possibleConditions: { name: string; likelihood: string }[];
  urgency: 'emergency' | 'urgent' | 'routine';
  recommendedSpecialist: string;
  redFlags: string[];
  disclaimer: string;
}

interface BotReply {
  type: 'question' | 'assessment' | 'emergency';
  message: string;
  quickReplies?: string[];
  assessment?: Assessment;
}

const urgencyColor: Record<string, string> = {
  emergency: '#D85A30', // Warm Coral - Emergency
  urgent: '#E0A100',
  routine: '#0F6E56'    // Primary Teal
};

const symptomChatApiUrl = `http://${window.location.hostname}:5000/api/symptom-chat`;

export default function SymptomChat() {
  const { accessToken } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: "Hi, I'm Niramya's symptom assistant. What symptom is bothering you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const starterPrompts = ['I feel pain inside my body', 'I feel dizzy and weak', 'I have trouble breathing'];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const updated: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(updated);
    setInput('');
    setQuickReplies([]);
    setLoading(true);

    try {
      const { data } = await axios.post<BotReply>(symptomChatApiUrl, { messages: updated }, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      });
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
      if (data.quickReplies) setQuickReplies(data.quickReplies);
      if (data.assessment) setAssessment(data.assessment);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F7FBFA]">
      <header className="bg-[#0F6E56] px-5 py-6 text-white shadow-sm sm:px-8 sm:py-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#E1F5EE]">Nirmya AI care guide</p>
          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Tell us what you are feeling</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/85 sm:text-base">
            You do not need to know the medical name. Describe the feeling in your own words, even if you are unsure where it is coming from.
          </p>
          <p className="mt-3 text-xs text-white/70">AI guidance only. It is not a diagnosis or a replacement for emergency care.</p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6 sm:px-8 sm:py-8">
        <section className="mb-6 rounded-3xl border border-[#BFE8DB] bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-semibold text-[#1E5B8C] sm:text-xl">Not sure how to explain it?</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#5F5E5A]">
            Start with what you notice: where you feel it, what it feels like, when it started, or what makes it better or worse.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {starterPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => send(prompt)}
                disabled={loading}
                className="rounded-full border border-[#0F6E56] bg-[#F7FBFA] px-3 py-2 text-left text-sm text-[#0F6E56] transition hover:bg-[#E1F5EE] disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </section>

        <div className="flex-1 space-y-4 overflow-y-auto rounded-3xl border border-[#E1F5EE] bg-white p-4 shadow-sm sm:p-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[88%] px-4 py-3 rounded-2xl text-sm leading-relaxed sm:max-w-[75%] sm:text-base ${
                m.role === 'user'
                  ? 'bg-[#1E5B8C] text-white rounded-br-sm'
                  : 'bg-[#E1F5EE] text-[#0F3D31] rounded-bl-sm'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#E1F5EE] px-4 py-3 rounded-2xl rounded-bl-sm text-sm text-[#0F6E56]">
              typing…
            </div>
          </div>
        )}

        {assessment && (
          <div
            className="rounded-2xl border p-4 space-y-2 bg-white"
            style={{ borderColor: urgencyColor[assessment.urgency] }}
          >
            <p className="text-sm font-semibold" style={{ color: urgencyColor[assessment.urgency] }}>
              {assessment.urgency.toUpperCase()} · Suggested: {assessment.recommendedSpecialist}
            </p>
            {assessment.possibleConditions.length > 0 && (
              <ul className="text-sm list-disc list-inside text-[#0F3D31]">
                {assessment.possibleConditions.map((c, i) => (
                  <li key={i}>{c.name} ({c.likelihood} likelihood)</li>
                ))}
              </ul>
            )}
            <p className="text-xs text-gray-500">{assessment.disclaimer}</p>
            <button className="mt-2 bg-[#0F6E56] text-white text-sm px-4 py-2 rounded-lg hover:opacity-90">
              Book {assessment.recommendedSpecialist}
            </button>
          </div>
        )}

          <div ref={endRef} />
        </div>

      {quickReplies.length > 0 && (
        <div className="flex w-full flex-wrap gap-2 py-4">
          {quickReplies.map((q, i) => (
            <button
              key={i}
              onClick={() => send(q)}
              className="text-sm px-3 py-1.5 rounded-full border border-[#0F6E56] text-[#0F6E56] hover:bg-[#E1F5EE]"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={e => { e.preventDefault(); send(input); }}
        className="mt-4 flex w-full gap-2 rounded-3xl border border-[#BFE8DB] bg-white p-3 shadow-sm sm:p-4"
      >
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Write it the way you would tell a doctor..."
          className="min-w-0 flex-1 rounded-2xl border border-[#E1F5EE] bg-[#F7FBFA] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#0F6E56] sm:text-base"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-[#0F6E56] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0b4f3f] disabled:opacity-50 sm:px-7 sm:text-base"
        >
          Send
        </button>
      </form>
      </main>
    </div>
  );
}
