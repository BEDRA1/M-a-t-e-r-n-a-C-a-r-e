import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Public } from '../common/decorators/public.decorator';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { QueryArticlesDto } from './dto/query-articles.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuditLog } from '../audit-log/decorators/audit-log.decorator';

@ApiTags('articles')
@Controller('api/v1/articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'قائمة المقالات المنشورة، بفلتر فئة اختياري' })
  list(@Query() query: QueryArticlesDto) {
    return this.articlesService.listPublished(query);
  }

  @Get(':slug')
  @Public()
  @ApiOperation({ summary: 'مقال منشور واحد كامل مع مقالات ذات صلة' })
  getBySlug(@Param('slug') slug: string) {
    return this.articlesService.getBySlug(slug);
  }
}

@ApiBearerAuth()
@ApiTags('admin-articles')
@Controller('api/v1/admin/articles')
export class AdminArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @Roles(UserRole.admin)
  @UseGuards(RolesGuard)
  @AuditLog('create_article', 'article')
  @ApiOperation({ summary: 'إنشاء مقال جديد (غير منشور افتراضيًا)' })
  create(@Body() dto: CreateArticleDto) {
    return this.articlesService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.admin)
  @UseGuards(RolesGuard)
  @AuditLog('update_article', 'article')
  @ApiOperation({ summary: 'تعديل مقال' })
  update(@Param('id') id: string, @Body() dto: UpdateArticleDto) {
    return this.articlesService.update(id, dto);
  }

  @Patch(':id/publish')
  @Roles(UserRole.admin)
  @UseGuards(RolesGuard)
  @AuditLog('publish_article', 'article')
  @ApiOperation({ summary: 'نشر مقال' })
  publish(@Param('id') id: string) {
    return this.articlesService.publish(id);
  }

  @Patch(':id/unpublish')
  @Roles(UserRole.admin)
  @UseGuards(RolesGuard)
  @AuditLog('unpublish_article', 'article')
  @ApiOperation({ summary: 'إلغاء نشر مقال' })
  unpublish(@Param('id') id: string) {
    return this.articlesService.unpublish(id);
  }

  @Delete(':id')
  @Roles(UserRole.admin)
  @UseGuards(RolesGuard)
  @AuditLog('delete_article', 'article')
  @ApiOperation({ summary: 'حذف مقال' })
  remove(@Param('id') id: string) {
    return this.articlesService.remove(id);
  }
}
