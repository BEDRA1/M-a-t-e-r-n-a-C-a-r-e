"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircleQuestion, Send } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { MotherBubble, DoulaBubble } from "./ChatBubble";
import { TypingIndicator } from "./TypingIndicator";
import { CategoryButtons } from "./CategoryButtons";
import { QuestionButtons } from "./QuestionButtons";
import { AnswerMessage } from "./AnswerMessage";
import { DoulaRobotIllustration } from "./DoulaRobotIllustration";
import { getDoulaResponse } from "@/lib/doula-responses";

type ChatItem =
  | { kind: "doula-text"; id: string; text: string }
  | { kind: "categories"; id: string }
  | { kind: "questions"; id: string; categoryId: string }
  | { kind: "mother-question"; id: string; text: string }
  | { kind: "typing"; id: string }
  | { kind: "answer"; id: string; entryId: string }
  | { kind: "free-text-answer"; id: string; response: string };

const ANSWER_DELAY_MS = 600;
/** طلب صريح: "بعد ثانية" — أبطأ عمدًا من ردود الأسئلة الجاهزة (600ms) لإعطاء إحساس
 * "تفكير" حقيقي بما أن السؤال هنا حر غير معروف مسبقًا */
const FREE_TEXT_ANSWER_DELAY_MS = 1000;

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `chat-${idCounter}`;
}

export function DoulaChatContent() {
  const [items, setItems] = useState<ChatItem[]>(() => [
    {
      kind: "doula-text",
      id: nextId(),
      text: "مرحبًا، أنا الدولا الرقمية لتطبيق Materna Care. أجيبك هنا عن أكثر الأسئلة الشائعة في رحلتك من الحمل إلى ما بعد الولادة، بإجابات جاهزة ومختصرة. اختاري الموضوع الذي يهمك:",
    },
    { kind: "categories", id: nextId() },
  ]);
  const [freeText, setFreeText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [items]);

  const scrollToChat = () => {
    chatPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const selectCategory = (categoryId: string) => {
    setItems((prev) => [...prev, { kind: "questions", id: nextId(), categoryId }]);
  };

  const selectQuestion = (entryId: string, questionAr: string) => {
    const typingId = nextId();
    setItems((prev) => [
      ...prev,
      { kind: "mother-question", id: nextId(), text: questionAr },
      { kind: "typing", id: typingId },
    ]);
    setTimeout(() => {
      setItems((prev) => [
        ...prev.filter((item) => item.id !== typingId),
        { kind: "answer", id: nextId(), entryId },
      ]);
    }, ANSWER_DELAY_MS);
  };

  const showCategories = () => {
    setItems((prev) => [
      ...prev,
      { kind: "doula-text", id: nextId(), text: "تفضّلي، أي موضوع آخر تودين السؤال عنه؟" },
      { kind: "categories", id: nextId() },
    ]);
  };

  const submitFreeText = () => {
    const text = freeText.trim();
    if (!text) return;
    setFreeText("");
    const typingId = nextId();
    const response = getDoulaResponse(text);
    setItems((prev) => [
      ...prev,
      { kind: "mother-question", id: nextId(), text },
      { kind: "typing", id: typingId },
    ]);
    setTimeout(() => {
      setItems((prev) => [
        ...prev.filter((item) => item.id !== typingId),
        { kind: "free-text-answer", id: nextId(), response },
      ]);
    }, FREE_TEXT_ANSWER_DELAY_MS);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-hidden rounded-[var(--radius-card)] bg-gradient-doula p-6 text-white shadow-[var(--shadow-soft)] sm:p-8">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:text-start">
          <DoulaRobotIllustration className="size-24 shrink-0 sm:size-32" />
          <div>
            <span className="inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
              مساعِدة الأسئلة الشائعة
            </span>
            <h1 className="mt-3 text-2xl font-extrabold sm:text-3xl">الدولا الرقمية</h1>
            <p className="mt-2 text-sm leading-relaxed text-white/90 sm:text-base">
              مساعدتك الذكية المتاحة على مدار الساعة — إجابات جاهزة عن أكثر الأسئلة شيوعًا في رحلتك، بلا ذكاء اصطناعي
              حقيقي، محتوى ثابت مُعَدّ مسبقًا
            </p>
            <Button
              variant="ghost"
              onClick={scrollToChat}
              className="mt-4 bg-white text-doula-700 shadow-md hover:bg-white/90"
            >
              ابدئي المحادثة الآن
            </Button>
          </div>
        </div>
      </div>

      <div
        ref={chatPanelRef}
        className="flex scroll-mt-6 flex-col rounded-[var(--radius-card)] border border-black/5 bg-surface shadow-[var(--shadow-soft)]"
      >
        <div ref={scrollRef} className="flex max-h-[65vh] min-h-[50vh] flex-col gap-3 overflow-y-auto p-4 sm:p-6">
          {items.map((item) => {
            switch (item.kind) {
              case "doula-text":
                return <DoulaBubble key={item.id}>{item.text}</DoulaBubble>;
              case "categories":
                return <CategoryButtons key={item.id} onSelect={selectCategory} />;
              case "questions":
                return <QuestionButtons key={item.id} categoryId={item.categoryId} onSelect={selectQuestion} />;
              case "mother-question":
                return <MotherBubble key={item.id}>{item.text}</MotherBubble>;
              case "typing":
                return <TypingIndicator key={item.id} />;
              case "answer":
                return (
                  <AnswerMessage
                    key={item.id}
                    entryId={item.entryId}
                    onSelectRelated={selectQuestion}
                    onShowCategories={showCategories}
                  />
                );
              case "free-text-answer":
                return (
                  <div key={item.id} className="flex flex-col gap-2">
                    <DoulaBubble>{item.response}</DoulaBubble>
                    <div className="flex justify-end">
                      <Link href="/dashboard/consultations">
                        <Button size="sm">احجزي استشارة الآن</Button>
                      </Link>
                    </div>
                  </div>
                );
              default:
                return null;
            }
          })}
        </div>

        <div className="flex flex-col gap-3 border-t border-black/5 p-4 sm:p-6">
          <Alert tone="info">
            هذه إجابات عامة لأسئلة شائعة، ولا تغني عن استشارة طبيبك أو أخصائيتك.
          </Alert>
          <Link href="/dashboard/consultations">
            <Button variant="outline" className="w-full">
              <MessageCircleQuestion className="size-4" strokeWidth={2} />
              لم أجد إجابتي — أريد استشارة
            </Button>
          </Link>

          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              submitFreeText();
            }}
          >
            <input
              type="text"
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="اكتبي رسالتك هنا..."
              className="min-w-0 flex-1 rounded-full border border-black/10 bg-surface px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-300"
            />
            <Button type="submit" size="sm" disabled={!freeText.trim()} className="shrink-0">
              <Send className="size-4" strokeWidth={2} />
              إرسال
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
