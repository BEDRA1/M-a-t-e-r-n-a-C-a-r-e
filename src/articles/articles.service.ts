import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/exceptions/app.exception';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticlesDto } from './dto/query-articles.dto';

const RELATED_ARTICLES_LIMIT = 3;

@Injectable()
export class ArticlesService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublished(query: QueryArticlesDto) {
    const where = {
      isPublished: true,
      ...(query.category ? { category: query.category } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        take: query.limit,
        skip: query.offset,
      }),
      this.prisma.article.count({ where }),
    ]);

    return { items, total };
  }

  async getBySlug(slug: string) {
    const article = await this.prisma.article.findFirst({
      where: { slug, isPublished: true },
    });
    if (!article) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'المقال غير موجود',
        en: 'Article not found',
      });
    }

    // مقالات ذات صلة تُحسب هنا وتُضاف لنفس استجابة المقال — بدل مسار API إضافي غير
    // مطلوب صراحة، فتُحمَّل صفحة المقال ببيانات "مقالات ذات صلة" بطلب واحد فقط
    const relatedArticles = await this.prisma.article.findMany({
      where: {
        category: article.category,
        isPublished: true,
        id: { not: article.id },
      },
      orderBy: { publishedAt: 'desc' },
      take: RELATED_ARTICLES_LIMIT,
    });

    return { ...article, relatedArticles };
  }

  async create(dto: CreateArticleDto) {
    await this.assertSlugAvailable(dto.slug);
    return this.prisma.article.create({
      data: {
        titleAr: dto.titleAr,
        slug: dto.slug,
        excerptAr: dto.excerptAr,
        contentAr: dto.contentAr,
        coverImageUrl: dto.coverImageUrl,
        category: dto.category,
        authorName: dto.authorName,
        readTimeMinutes: dto.readTimeMinutes,
      },
    });
  }

  async update(id: string, dto: UpdateArticleDto) {
    await this.getArticleOrThrow(id);
    if (dto.slug) {
      await this.assertSlugAvailable(dto.slug, id);
    }
    return this.prisma.article.update({
      where: { id },
      data: {
        titleAr: dto.titleAr,
        slug: dto.slug,
        excerptAr: dto.excerptAr,
        contentAr: dto.contentAr,
        coverImageUrl: dto.coverImageUrl,
        category: dto.category,
        authorName: dto.authorName,
        readTimeMinutes: dto.readTimeMinutes,
      },
    });
  }

  async publish(id: string) {
    await this.getArticleOrThrow(id);
    return this.prisma.article.update({
      where: { id },
      data: { isPublished: true, publishedAt: new Date() },
    });
  }

  async unpublish(id: string) {
    await this.getArticleOrThrow(id);
    return this.prisma.article.update({
      where: { id },
      data: { isPublished: false },
    });
  }

  async remove(id: string) {
    await this.getArticleOrThrow(id);
    await this.prisma.article.delete({ where: { id } });
    return { success: true };
  }

  private async getArticleOrThrow(id: string) {
    const article = await this.prisma.article.findUnique({ where: { id } });
    if (!article) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'المقال غير موجود',
        en: 'Article not found',
      });
    }
    return article;
  }

  private async assertSlugAvailable(slug: string, excludeId?: string) {
    const existing = await this.prisma.article.findUnique({ where: { slug } });
    if (existing && existing.id !== excludeId) {
      throw new AppException(HttpStatus.CONFLICT, {
        ar: 'هذا الرابط (slug) مستخدم بالفعل لمقال آخر',
        en: 'This slug is already in use',
      });
    }
  }
}
