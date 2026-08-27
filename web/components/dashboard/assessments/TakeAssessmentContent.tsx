"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { PageSpinner } from "@/components/ui/Spinner";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/cn";
import { ApiError } from "@/lib/api-client";
import { ASSESSMENT_DISCLAIMER_AR } from "@/lib/assessment-disclaimer";
import { useAssessmentQuestions, useSubmitAssessment } from "@/lib/hooks/useAssessments";
import { SafetyScreen } from "./SafetyScreen";
import { AssessmentResultView } from "./AssessmentResultView";

export function TakeAssessmentContent({ domainId }: { domainId: string }) {
  const data = useAssessmentQuestions(domainId);
  const submitAssessment = useSubmitAssessment();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [validationError, setValidationError] = useState<string | null>(null);

  if (data.isLoading) {
    return <PageSpinner />;
  }

  if (data.isError || !data.data) {
    return (
      <Alert tone="error">
        {data.error instanceof ApiError ? data.error.message : "تعذّر تحميل هذا المقياس"}
      </Alert>
    );
  }

  const { domain, questions } = data.data;

  if (submitAssessment.isSuccess) {
    const result = submitAssessment.data;
    return result.requiresUrgentHelp ? <SafetyScreen /> : <AssessmentResultView result={result} />;
  }

  const answeredCount = Object.keys(answers).length;
  const isComplete = answeredCount === questions.length;

  const handleSubmit = () => {
    if (!isComplete) {
      setValidationError("يجب الإجابة على جميع البنود قبل الإرسال");
      return;
    }
    setValidationError(null);
    submitAssessment.mutate({
      domainId,
      answers: questions.map((q) => ({ questionId: q.id, value: answers[q.id] })),
    });
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">{domain.nameAr}</h1>
        {domain.instructionsAr && (
          <p className="mt-2 text-sm font-medium leading-relaxed text-primary-700">{domain.instructionsAr}</p>
        )}
        <p className="mt-3 text-xs leading-relaxed text-muted">{ASSESSMENT_DISCLAIMER_AR}</p>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-muted">
          <span>
            أجبتِ على {answeredCount} من {questions.length}
          </span>
          <span>{Math.round((answeredCount / questions.length) * 100)}٪</span>
        </div>
        <div className="mt-1.5">
          <ProgressBar percent={(answeredCount / questions.length) * 100} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {questions.map((question, index) => (
          <Card key={question.id}>
            <p className="font-semibold text-foreground">
              {index + 1}. {question.questionTextAr}
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {(question.optionsJson ?? []).map((optionText, optionIndex) => {
                const selected = answers[question.id] === optionIndex;
                return (
                  <button
                    key={optionIndex}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: optionIndex }))}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-xl border-2 px-4 py-3.5 text-start text-sm transition-[border-color,background-color,transform] active:scale-[0.99]",
                      selected
                        ? "border-primary-400 bg-primary-50 text-foreground"
                        : "border-black/10 bg-surface text-foreground/80 hover:border-primary-200",
                    )}
                  >
                    <span className="min-w-0 flex-1 break-words">{optionText}</span>
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                        selected ? "border-primary-500 bg-primary-500 text-white" : "border-black/20 bg-transparent",
                      )}
                      aria-hidden="true"
                    >
                      {selected && <Check className="size-3.5" strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {validationError && <Alert tone="error">{validationError}</Alert>}
      {submitAssessment.isError && (
        <Alert tone="error">
          {submitAssessment.error instanceof ApiError ? submitAssessment.error.message : "تعذّر إرسال التقييم"}
        </Alert>
      )}

      <Button
        size="lg"
        disabled={!isComplete}
        loading={submitAssessment.isPending}
        onClick={handleSubmit}
        className="w-full justify-center"
      >
        إرسال التقييم
      </Button>
    </div>
  );
}
