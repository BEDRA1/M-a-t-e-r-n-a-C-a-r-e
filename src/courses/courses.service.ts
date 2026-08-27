import { HttpStatus, Injectable } from '@nestjs/common';
import { ConsultationType, ServiceKind, SpecialistStatus, SpecialistTrack, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/exceptions/app.exception';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(specialistUserId: string, dto: CreateCourseDto) {
    const specialist = await this.getApprovedSpecialistOrThrow(specialistUserId);
    // السعر ثابت حسب نوع الدورة (حضوري/عن بُعد) ويُقرأ دومًا من service_pricing —
    // لا يُقبل أي سعر يحدده الأخصائي بنفسه (نفس فلسفة "الخادم يحسب السعر دائمًا"
    // المطبَّقة في meal-orders وproduct-orders وsubscriptions)
    const price = await this.getServicePrice(ServiceKind.course, dto.type);

    return this.prisma.course.create({
      data: {
        specialistId: specialist.id,
        title: dto.title,
        description: dto.description,
        type: dto.type,
        capacity: dto.type === ConsultationType.in_person ? dto.capacity : null,
        startDate: new Date(dto.startDate),
        durationText: dto.durationText,
        durationDays: dto.durationDays,
        price,
        contentUrl: dto.type === ConsultationType.remote ? dto.contentUrl : null,
        wilaya: dto.type === ConsultationType.in_person ? dto.wilaya : null,
      },
    });
  }

  listAll(filters: { type?: ConsultationType; upcomingOnly?: boolean; track?: SpecialistTrack }) {
    return this.prisma.course.findMany({
      where: {
        ...(filters.type ? { type: filters.type } : {}),
        ...(filters.upcomingOnly ? { startDate: { gte: new Date() } } : {}),
        ...(filters.track ? { specialist: { track: filters.track } } : {}),
      },
      include: { specialist: { select: { id: true, fullName: true, specialty: true, track: true } } },
      orderBy: { startDate: 'asc' },
    });
  }

  private async getServicePrice(serviceKind: ServiceKind, consultationType: ConsultationType): Promise<number> {
    const pricing = await this.prisma.servicePricing.findUnique({
      where: { serviceKind_consultationType: { serviceKind, consultationType } },
    });
    if (!pricing) {
      throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, {
        ar: 'تعذّر تحديد سعر هذه الخدمة، يرجى المحاولة لاحقًا',
        en: 'Could not determine the price for this service',
      });
    }
    return pricing.price;
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: { specialist: { select: { id: true, fullName: true, specialty: true, track: true } } },
    });
    if (!course) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'الدورة غير موجودة',
        en: 'Course not found',
      });
    }
    return course;
  }

  async update(specialistUserId: string, courseId: string, dto: UpdateCourseDto) {
    const course = await this.getOwnedCourseOrThrow(specialistUserId, courseId);
    const type = dto.type ?? course.type;
    // إن تغيّر نوع الدورة، يُعاد احتساب السعر الثابت المطابق للنوع الجديد من service_pricing
    const price = type === course.type ? course.price : await this.getServicePrice(ServiceKind.course, type);

    return this.prisma.course.update({
      where: { id: course.id },
      data: {
        title: dto.title ?? course.title,
        description: dto.description ?? course.description,
        type,
        capacity: type === ConsultationType.in_person ? (dto.capacity ?? course.capacity) : null,
        startDate: dto.startDate ? new Date(dto.startDate) : course.startDate,
        durationText: dto.durationText ?? course.durationText,
        durationDays: dto.durationDays ?? course.durationDays,
        price,
        contentUrl: type === ConsultationType.remote ? (dto.contentUrl ?? course.contentUrl) : null,
        wilaya: type === ConsultationType.in_person ? (dto.wilaya ?? course.wilaya) : null,
      },
    });
  }

  async enroll(userId: string, courseId: string) {
    const course = await this.findOne(courseId);

    const existing = await this.prisma.courseEnrollment.findUnique({
      where: { courseId_userId: { courseId: course.id, userId } },
    });
    if (existing) {
      throw new AppException(HttpStatus.CONFLICT, {
        ar: 'أنت مسجّل بالفعل في هذه الدورة',
        en: 'You are already enrolled in this course',
      });
    }

    // مرشّح لخصم course credit — نفس فلسفة booking credits في bookings.service.ts:
    // قراءة هنا مجرد اختيار مرشّح، لا قرار نهائي، والحسم الحقيقي يحدث ذريًا داخل الـtransaction
    const now = new Date();
    const candidateSubscription = await this.prisma.userSubscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.active,
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        courseCreditsRemaining: { gt: 0 },
      },
      orderBy: { createdAt: 'desc' },
    });

    try {
      return await this.prisma.$transaction(async (tx) => {
        // فحص السعة الذري: يعمل فقط للدورات الحضورية المحدودة (capacity != null)؛
        // الدورات عن بُعد تُحدَّث للعدّاد الإحصائي فقط دون أي شرط سعة
        if (course.capacity !== null) {
          const capacityResult = await tx.course.updateMany({
            where: { id: course.id, enrolledCount: { lt: course.capacity } },
            data: { enrolledCount: { increment: 1 } },
          });
          if (capacityResult.count === 0) {
            throw new AppException(HttpStatus.CONFLICT, {
              ar: 'اكتملت سعة هذه الدورة',
              en: 'This course is fully booked',
            });
          }
        } else {
          await tx.course.update({ where: { id: course.id }, data: { enrolledCount: { increment: 1 } } });
        }

        let isFree = false;
        if (candidateSubscription) {
          const creditResult = await tx.userSubscription.updateMany({
            where: { id: candidateSubscription.id, courseCreditsRemaining: { gt: 0 } },
            data: { courseCreditsRemaining: { decrement: 1 } },
          });
          isFree = creditResult.count > 0;
        }

        return tx.courseEnrollment.create({
          data: { courseId: course.id, userId, isFree },
        });
      });
    } catch (error) {
      // شبكة الأمان الحقيقية تحت التزامن: لو مرّ طلبان بفحص عدم-التسجيل-المسبق معًا، القيد
      // الفريد على (course_id, user_id) يرفض الثاني حتمًا هنا (P2002) — تمامًا كما مع الحجوزات
      if (this.isUniqueConstraintError(error)) {
        throw new AppException(HttpStatus.CONFLICT, {
          ar: 'أنت مسجّل بالفعل في هذه الدورة',
          en: 'You are already enrolled in this course',
        });
      }
      throw error;
    }
  }

  async listEnrollments(specialistUserId: string, courseId: string) {
    const course = await this.getOwnedCourseOrThrow(specialistUserId, courseId);
    return this.prisma.courseEnrollment.findMany({
      where: { courseId: course.id },
      include: { user: { select: { id: true, phone: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  listMine(userId: string) {
    return this.prisma.courseEnrollment.findMany({
      where: { userId },
      include: { course: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async issueCertificate(specialistUserId: string, courseId: string, enrollmentId: string) {
    const course = await this.getOwnedCourseOrThrow(specialistUserId, courseId);
    const enrollment = await this.prisma.courseEnrollment.findUnique({ where: { id: enrollmentId } });
    if (!enrollment || enrollment.courseId !== course.id) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'التسجيل غير موجود',
        en: 'Enrollment not found',
      });
    }
    if (enrollment.certificateIssued) {
      throw new AppException(HttpStatus.CONFLICT, {
        ar: 'تم إصدار الشهادة مسبقًا لهذا التسجيل',
        en: 'Certificate already issued for this enrollment',
      });
    }

    const completionDate = new Date(course.startDate.getTime() + course.durationDays * MS_PER_DAY);
    if (Date.now() < completionDate.getTime()) {
      throw new AppException(HttpStatus.BAD_REQUEST, {
        ar: 'لا يمكن إصدار الشهادة قبل اكتمال الدورة',
        en: 'Cannot issue a certificate before the course is completed',
      });
    }

    return this.prisma.courseEnrollment.update({
      where: { id: enrollment.id },
      data: { certificateIssued: true, certificateIssuedAt: new Date() },
    });
  }

  private async getApprovedSpecialistOrThrow(userId: string) {
    const specialist = await this.prisma.specialist.findUnique({ where: { userId } });
    if (!specialist || specialist.status !== SpecialistStatus.approved) {
      throw new AppException(HttpStatus.FORBIDDEN, {
        ar: 'يجب أن يكون لديك ملف أخصائي معتمد لإنشاء دورة',
        en: 'You must have an approved specialist profile to create a course',
      });
    }
    return specialist;
  }

  private async getOwnedCourseOrThrow(specialistUserId: string, courseId: string) {
    const specialist = await this.prisma.specialist.findUnique({ where: { userId: specialistUserId } });
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course || !specialist || course.specialistId !== specialist.id) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'الدورة غير موجودة',
        en: 'Course not found',
      });
    }
    return course;
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: string }).code === 'P2002'
    );
  }
}
