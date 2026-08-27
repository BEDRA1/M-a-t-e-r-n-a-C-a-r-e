import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { DataSharingService } from './data-sharing.service';
import { UpdateDataSharingDto } from './dto/update-data-sharing.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';

@ApiBearerAuth()
@ApiTags('data-sharing')
@Controller('api/v1/data-sharing')
@Roles(UserRole.mother, UserRole.spouse)
@UseGuards(RolesGuard)
export class DataSharingController {
  constructor(private readonly dataSharingService: DataSharingService) {}

  @Get(':specialistId')
  @ApiOperation({ summary: 'إعدادات مشاركة بياناتي مع أخصائية معينة' })
  get(@CurrentUser() user: AuthenticatedUser, @Param('specialistId') specialistId: string) {
    return this.dataSharingService.get(user.userId, specialistId);
  }

  @Patch(':specialistId')
  @ApiOperation({ summary: 'تحديث ما أشاركه من بياناتي مع أخصائية معينة' })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('specialistId') specialistId: string,
    @Body() dto: UpdateDataSharingDto,
  ) {
    return this.dataSharingService.update(user.userId, specialistId, dto);
  }
}
