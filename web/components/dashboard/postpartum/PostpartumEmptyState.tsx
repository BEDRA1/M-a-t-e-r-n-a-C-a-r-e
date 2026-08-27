import {
  CalendarClock,
  Smile,
  Lightbulb,
  Wind,
  Info,
  ClipboardCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { FeatureCard } from "@/components/dashboard/coming-soon/FeatureCard";
import { ComingSoonNotice } from "@/components/dashboard/coming-soon/ComingSoonNotice";
import { PostpartumCounterIllustration } from "@/components/dashboard/illustrations/PostpartumCounterIllustration";

const features = [
  {
    icon: CalendarClock,
    title: "عدّاد أيام النفاس",
    text: "تابعي أيامك الأربعين تلقائيًا، من يوم الولادة حتى اكتمال فترة التعافي، بمؤشر بصري واضح لموقعك في الرحلة.",
  },
  {
    icon: Smile,
    title: "متابعة يومية للمزاج",
    text: "تسجيل يومي بسيط لحالتك النفسية، يساعدك على ملاحظة التغيرات التي تمر بها بدل أن تمر دون انتباه.",
  },
  {
    icon: Lightbulb,
    title: "نصائح يومية مخصصة",
    text: "نصيحة مختلفة كل يوم مصمَّمة لمرحلة النفاس تحديدًا، من الراحة الجسدية إلى التأقلم مع الأمومة الجديدة.",
  },
  {
    icon: Wind,
    title: "تمارين تنفس واسترخاء",
    text: "تمارين قصيرة لا تحتاج مجهودًا بدنيًا، يمكن ممارستها أثناء إرضاع الطفل أو أثناء راحته.",
  },
  {
    icon: ClipboardCheck,
    title: "فحص أسبوعي بسيط",
    text: "استبيان قصير أسبوعيًا يقيس حالتك النفسية بمقياس مبسّط، ليكون مرجعًا لك ولأي استشارة تحتاجينها لاحقًا.",
  },
];

export function PostpartumEmptyState() {
  return (
    <div>
      <section className="grid items-center gap-8 md:grid-cols-[1.3fr_1fr] md:gap-10">
        <div>
          <Badge tone="primary">مرافقة ما بعد الولادة</Badge>
          <h1 className="mt-4 text-2xl font-extrabold text-foreground sm:text-3xl">
            النفاس
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            الأربعون يومًا الأولى بعد الولادة من أكثر المراحل تحوّلًا في حياة
            الأم، جسديًا ونفسيًا. صممنا هذا القسم ليرافقك يومًا بيوم خلال هذه
            الفترة الحسّاسة، حتى لا تمريها وحدك.
          </p>
        </div>
        <PostpartumCounterIllustration className="mx-auto size-40 sm:size-48" />
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">
          ماذا نقدم
        </h2>
        <div className="mt-5 grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-start gap-3.5 rounded-[var(--radius-card)] border border-accent-100 bg-accent-50/50 p-6 shadow-[var(--shadow-soft)]">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-accent-100 text-accent-700">
            <Info className="size-5" strokeWidth={2} />
          </span>
          <div>
            <p className="font-bold text-foreground">
              Baby Blues أم اكتئاب ما بعد الولادة؟
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              من الطبيعي أن تشعري بتقلبات مزاجية أو بكاء دون سبب واضح خلال
              الأسبوعين الأولين بعد الولادة، وهذا يزول تلقائيًا غالبًا. لكن
              إن استمرت هذه المشاعر أكثر من أسبوعين، أو ترافقت مع فقدان
              الأمل أو صعوبة في التعلق بطفلك، فقد يكون الأمر اكتئاب ما بعد
              الولادة الذي يستحق دعمًا متخصصًا، ولستِ وحدك في هذا.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-bold text-foreground sm:text-xl">
          الفائدة
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          أول أربعين يومًا من أصعب فترات الأمومة على الجسد والنفس معًا،
          وغالبًا ما تُترك الأم لتتدبر أمرها بمفردها بعد خروجها من المستشفى.
          متابعة منتظمة ولو بسيطة تساعد على اكتشاف علامات التعب النفسي
          مبكرًا، قبل أن تتفاقم، وتمنحك إحساسًا بأنك مُرافَقة لا متروكة.
        </p>
      </section>

      <ComingSoonNotice actionLabel="متابعة النفاس اليومية" />
    </div>
  );
}
