import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/exceptions/app.exception';
import { CreateFaqEntryDto } from './dto/create-faq-entry.dto';
import { UpdateFaqEntryDto } from './dto/update-faq-entry.dto';

@Injectable()
export class FaqService {
  constructor(private readonly prisma: PrismaService) {}

  listCategories() {
    return this.prisma.faqCategory.findMany({ orderBy: { displayOrder: 'asc' } });
  }

  async listEntriesForCategory(categoryId: string) {
    const category = await this.prisma.faqCategory.findUnique({ where: { id: categoryId } });
    if (!category) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'الفئة غير موجودة',
        en: 'Category not found',
      });
    }
    return this.prisma.faqEntry.findMany({
      where: { categoryId, isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async getEntryWithRelated(id: string) {
    const entry = await this.prisma.faqEntry.findFirst({ where: { id, isActive: true } });
    if (!entry) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'السؤال غير موجود',
        en: 'Question not found',
      });
    }

    const relatedIds = this.parseRelatedIds(entry.relatedEntryIds);
    const relatedEntries = relatedIds.length
      ? await this.prisma.faqEntry.findMany({
          where: { id: { in: relatedIds }, isActive: true },
          orderBy: { displayOrder: 'asc' },
        })
      : [];

    return { ...entry, relatedEntries };
  }

  listAllForAdmin() {
    return this.prisma.faqEntry.findMany({
      include: { category: { select: { nameAr: true } } },
      orderBy: [{ categoryId: 'asc' }, { displayOrder: 'asc' }],
    });
  }

  async create(dto: CreateFaqEntryDto) {
    const category = await this.prisma.faqCategory.findUnique({ where: { id: dto.categoryId } });
    if (!category) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'الفئة غير موجودة',
        en: 'Category not found',
      });
    }
    return this.prisma.faqEntry.create({
      data: {
        categoryId: dto.categoryId,
        questionAr: dto.questionAr,
        answerAr: dto.answerAr,
        displayOrder: dto.displayOrder ?? 0,
        isActive: dto.isActive ?? true,
        relatedEntryIds: dto.relatedEntryIds ?? undefined,
      },
    });
  }

  async update(id: string, dto: UpdateFaqEntryDto) {
    await this.getEntryOrThrow(id);
    if (dto.categoryId) {
      const category = await this.prisma.faqCategory.findUnique({ where: { id: dto.categoryId } });
      if (!category) {
        throw new AppException(HttpStatus.NOT_FOUND, {
          ar: 'الفئة غير موجودة',
          en: 'Category not found',
        });
      }
    }
    return this.prisma.faqEntry.update({
      where: { id },
      data: {
        categoryId: dto.categoryId,
        questionAr: dto.questionAr,
        answerAr: dto.answerAr,
        displayOrder: dto.displayOrder,
        isActive: dto.isActive,
        relatedEntryIds: dto.relatedEntryIds,
      },
    });
  }

  async remove(id: string) {
    await this.getEntryOrThrow(id);
    await this.prisma.faqEntry.delete({ where: { id } });
    return { success: true };
  }

  private async getEntryOrThrow(id: string) {
    const entry = await this.prisma.faqEntry.findUnique({ where: { id } });
    if (!entry) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'السؤال غير موجود',
        en: 'Question not found',
      });
    }
    return entry;
  }

  private parseRelatedIds(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((v): v is string => typeof v === 'string');
  }
}
