import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { ClinicalNotesService } from './clinical-notes.service';
import { CreateClinicalNoteDto } from './dto/create-clinical-note.dto';
import { UpdateClinicalNoteDto } from './dto/update-clinical-note.dto';
import { QueryClinicalNotesDto } from './dto/query-clinical-notes.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiBearerAuth()
@ApiTags('specialist-clinical-notes')
@Controller('api/v1/specialist/clinical-notes')
@Roles(UserRole.specialist)
@UseGuards(RolesGuard)
export class ClinicalNotesController {
  constructor(private readonly clinicalNotesService: ClinicalNotesService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء ملاحظة كلينيكية — لا تظهر للأم إطلاقًا' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateClinicalNoteDto) {
    return this.clinicalNotesService.create(user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'ملاحظاتي عن مريضة معينة' })
  listForPatient(@CurrentUser() user: AuthenticatedUser, @Query() query: QueryClinicalNotesDto) {
    return this.clinicalNotesService.listForPatient(user.userId, query.patientUserId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تعديل ملاحظة (كاتبتها فقط)' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateClinicalNoteDto,
  ) {
    return this.clinicalNotesService.update(user.userId, id, dto);
  }
}
