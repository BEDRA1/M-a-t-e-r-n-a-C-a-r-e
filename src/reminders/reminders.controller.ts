import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiBearerAuth()
@ApiTags('reminders')
@Controller('api/v1/reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  @ApiOperation({ summary: 'إنشاء تذكير جديد' })
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateReminderDto) {
    return this.remindersService.create(user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'قائمة تذكيرات المستخدم الحالي' })
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.remindersService.findAll(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'تفاصيل تذكير واحد' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.remindersService.findOne(user.userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'تعديل تذكير (بما في ذلك تعليمه كمنجز)' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateReminderDto,
  ) {
    return this.remindersService.update(user.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'حذف تذكير' })
  remove(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.remindersService.remove(user.userId, id);
  }
}
