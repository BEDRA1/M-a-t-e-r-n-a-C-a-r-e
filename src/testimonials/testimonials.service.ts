import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/exceptions/app.exception';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';

@Injectable()
export class TestimonialsService {
  constructor(private readonly prisma: PrismaService) {}

  // isApproved يُفرض هنا دومًا false ويُتجاهل أي مدخل من العميل بهذا الخصوص —
  // لا يظهر أي رأي جديد للعامة قبل مراجعة الإدارة
  create(userId: string, dto: CreateTestimonialDto) {
    return this.prisma.testimonial.create({
      data: {
        userId,
        content: dto.content,
        rating: dto.rating,
        displayName: dto.displayName,
        isApproved: false,
      },
    });
  }

  listApproved() {
    return this.prisma.testimonial.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, content: true, rating: true, displayName: true, createdAt: true },
    });
  }

  listAllForAdmin() {
    return this.prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { phone: true, wilaya: true } } },
    });
  }

  approve(id: string) {
    return this.setApproval(id, true);
  }

  reject(id: string) {
    return this.setApproval(id, false);
  }

  private async setApproval(id: string, isApproved: boolean) {
    const testimonial = await this.prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'الرأي غير موجود',
        en: 'Testimonial not found',
      });
    }
    return this.prisma.testimonial.update({ where: { id }, data: { isApproved } });
  }
}
