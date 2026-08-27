import { Module } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { WeeklyMealsController } from './weekly-meals.controller';
import { MealOrdersController } from './meal-orders.controller';

@Module({
  controllers: [WeeklyMealsController, MealOrdersController],
  providers: [NutritionService],
})
export class NutritionModule {}
