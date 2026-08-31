import { HttpStatus, Injectable } from '@nestjs/common';
import { AssessmentDomainName, UrgentHelpStatus, UrgentHelpTriggerSource } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/exceptions/app.exception';
import { SubmitAssessmentDto } from './dto/submit-assessment.dto';
import {
  ASSESSMENT_DISCLAIMER_AR,
  classifyEpds,
  classifyGad7,
  classifyPtsd,
  PTSD_SAFETY_THRESHOLD,
} from './lib/classify';

@Injectable()
export class AssessmentsService {
  constructor(private readonly prisma: PrismaService) {}

  /** المقياسان المعياريان فقط (GAD-7/EPDS) — المحاور القديمة (legacy) لا تُعرض للاختيار بعد الآن */
  listDomains() {
    return this.prisma.assessmentDomain.findMany({
      where: { isLegacy: false },
      orderBy: { name: 'asc' },
    });
  }

  async getQuestionsByDomain(domainId: string) {
    const domain = await this.prisma.assessmentDomain.findUnique({ where: { id: domainId } });
    if (!domain) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'المقياس غير موجود',
        en: 'Scale not found',
      });
    }

    const questions = await this.prisma.assessmentQuestion.findMany({
      where: { domainId },
      orderBy: { order: 'asc' },
    });

    return { domain, questions, disclaimerText: ASSESSMENT_DISCLAIMER_AR };
  }

  async submit(userId: string, dto: SubmitAssessmentDto) {
    const domain = await this.prisma.assessmentDomain.findUnique({
      where: { id: dto.domainId },
    });
    if (!domain) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'المقياس غير موجود',
        en: 'Scale not found',
      });
    }
    if (domain.isLegacy) {
      throw new AppException(HttpStatus.BAD_REQUEST, {
        ar: 'هذا المقياس لم يعد متاحًا لإجراء تقييمات جديدة',
        en: 'This assessment scale is no longer available for new submissions',
      });
    }

    const questions = await this.prisma.assessmentQuestion.findMany({
      where: { domainId: dto.domainId },
    });
    const questionsById = new Map(questions.map((q) => [q.id, q]));
    const answeredQuestionIds = new Set(dto.answers.map((a) => a.questionId));

    const hasInvalidQuestion = dto.answers.some((a) => !questionsById.has(a.questionId));
    if (hasInvalidQuestion) {
      throw new AppException(HttpStatus.BAD_REQUEST, {
        ar: 'إحدى الإجابات تشير إلى بند لا ينتمي لهذا المقياس',
        en: 'One of the answers references a question outside this scale',
      });
    }

    const isComplete =
      answeredQuestionIds.size === questionsById.size &&
      [...questionsById.keys()].every((id) => answeredQuestionIds.has(id));
    if (!isComplete) {
      throw new AppException(HttpStatus.BAD_REQUEST, {
        ar: 'يجب الإجابة على جميع بنود المقياس',
        en: 'You must answer all items in this scale',
      });
    }

    // القيمة المُرسَلة من العميل هي فهرس الخيار كما ظهر لها (0 وحتى عدد الخيارات-1) لا
    // الدرجة السريرية — البنود المعكوسة (reverseScored) تُحوَّل هنا عبر (أقصى قيمة ممكنة
    // لهذا البند تحديدًا - القيمة الخام)، وليس ثابتًا عامًا واحدًا: مقياسا GAD-7/EPDS بهما
    // 4 خيارات (أقصى قيمة 3) بينما مقياس الصدمة له 5 خيارات (أقصى قيمة 4). لا يُرمَّز أي
    // رقم بند بعينه في هذا المنطق إطلاقًا؛ العلامة تُقرأ من قاعدة البيانات حصرًا.
    let totalScore = 0;
    let criticalItemTriggered = false;
    const answersData = dto.answers.map((a) => {
      const question = questionsById.get(a.questionId)!;
      const optionsCount = Array.isArray(question.optionsJson) ? question.optionsJson.length : 4;
      const maxOptionValue = optionsCount - 1;
      const scoredValue = question.reverseScored ? maxOptionValue - a.value : a.value;
      totalScore += scoredValue;
      if (question.isCritical && scoredValue > 0) {
        criticalItemTriggered = true;
      }
      return { questionId: a.questionId, rawValue: a.value, scoredValue };
    });

    let classification;
    if (domain.name === AssessmentDomainName.gad7) {
      classification = classifyGad7(totalScore);
    } else if (domain.name === AssessmentDomainName.epds) {
      classification = classifyEpds(totalScore);
    } else {
      classification = classifyPtsd(totalScore);
    }

    // بروتوكول سلامة مقياس الصدمة التالية للولادة: لا بند حرج فردي كما في EPDS، بل عتبة
    // مجموع كلي (>85 من 112) — مستقل تمامًا عن criticalItemTriggered أعلاه
    const scoreThresholdTriggered =
      domain.name === AssessmentDomainName.ptsd && totalScore > PTSD_SAFETY_THRESHOLD;
    const requiresUrgentHelp = criticalItemTriggered || scoreThresholdTriggered;

    return this.prisma.$transaction(async (tx) => {
      const result = await tx.assessmentResult.create({
        data: {
          userId,
          domainId: dto.domainId,
          totalScore,
          classification,
          answers: answersData,
        },
      });

      // بروتوكول السلامة: إما بند حرج فردي (البند العاشر من EPDS) بدرجة محسوبة > 0، أو
      // تجاوز عتبة المجموع الكلي (مقياس الصدمة التالية للولادة) — كلاهما ينشئ
      // urgent_help_request تلقائيًا في نفس الـtransaction، بمصدر مختلف يعكس السبب الفعلي
      const urgentHelpRequest = requiresUrgentHelp
        ? await tx.urgentHelpRequest.create({
            data: {
              userId,
              triggerSource: scoreThresholdTriggered
                ? UrgentHelpTriggerSource.assessment_score_threshold
                : UrgentHelpTriggerSource.epds_critical_item,
              assessmentResultId: result.id,
              status: UrgentHelpStatus.open,
            },
          })
        : null;

      return {
        ...result,
        domain,
        disclaimerText: ASSESSMENT_DISCLAIMER_AR,
        requiresUrgentHelp,
        urgentHelpRequest,
      };
    });
  }

  async getHistory(userId: string, domainId?: string) {
    return this.prisma.assessmentResult.findMany({
      where: { userId, ...(domainId ? { domainId } : {}) },
      include: { domain: true },
      orderBy: { takenAt: 'desc' },
    });
  }
}
