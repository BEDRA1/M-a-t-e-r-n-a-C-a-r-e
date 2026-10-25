import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';
import { QueryUsersDto } from './dto/query-users.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';

@ApiBearerAuth()
@ApiTags('users')
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.admin)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'قائمة كل المستخدمين مع عدد حجوزاتهم (الإدارة فقط)، بفلتر role اختياري' })
  listAll(@Query() query: QueryUsersDto) {
    return this.usersService.listAll(query.role);
  }
}
