import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { FaqService } from './faq.service';
import { CreateFaqEntryDto } from './dto/create-faq-entry.dto';
import { UpdateFaqEntryDto } from './dto/update-faq-entry.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuditLog } from '../audit-log/decorators/audit-log.decorator';

@ApiBearerAuth()
@ApiTags('faq')
@Controller('api/v1/faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get('categories')
  @ApiOperation({ summary: 'فئات الدولا الرقمية مرتبة للعرض' })
  listCategories() {
    return this.faqService.listCategories();
  }

  @Get('categories/:id/entries')
  @ApiOperation({ summary: 'أسئلة فئة معينة (النشطة فقط)' })
  listEntriesForCategory(@Param('id') id: string) {
    return this.faqService.listEntriesForCategory(id);
  }

  @Get('entries/:id')
  @ApiOperation({ summary: 'سؤال واحد مع إجابته وأسئلة المتابعة المقترحة' })
  getEntry(@Param('id') id: string) {
    return this.faqService.getEntryWithRelated(id);
  }
}

@ApiBearerAuth()
@ApiTags('admin-faq')
@Controller('api/v1/admin/faq/entries')
export class AdminFaqController {
  constructor(private readonly faqService: FaqService) {}

  @Get()
  @Roles(UserRole.admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'كل أسئلة الدولا الرقمية (نشطة وغير نشطة) — للأدمن' })
  listAll() {
    return this.faqService.listAllForAdmin();
  }

  @Post()
  @Roles(UserRole.admin)
  @UseGuards(RolesGuard)
  @AuditLog('create_faq_entry', 'faq_entry')
  @ApiOperation({ summary: 'إضافة سؤال جديد' })
  create(@Body() dto: CreateFaqEntryDto) {
    return this.faqService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.admin)
  @UseGuards(RolesGuard)
  @AuditLog('update_faq_entry', 'faq_entry')
  @ApiOperation({ summary: 'تعديل سؤال' })
  update(@Param('id') id: string, @Body() dto: UpdateFaqEntryDto) {
    return this.faqService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.admin)
  @UseGuards(RolesGuard)
  @AuditLog('delete_faq_entry', 'faq_entry')
  @ApiOperation({ summary: 'حذف سؤال' })
  remove(@Param('id') id: string) {
    return this.faqService.remove(id);
  }
}
