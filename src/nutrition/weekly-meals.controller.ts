import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NutritionService } from './nutrition.service';

@ApiBearerAuth()
@ApiTags('weekly-meals')
@Controller('api/v1/weekly-meals')
export class WeeklyMealsController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Get('current-week')
  @ApiOperation({ summary: 'وجبات الأسبوع الحالي مرتبة حسب اليوم ثم النوع (غداء قبل عشاء)' })
  getCurrentWeek() {
    return this.nutritionService.getCurrentWeekMeals();
  }
}
