import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController, AdminArticlesController } from './articles.controller';

@Module({
  controllers: [ArticlesController, AdminArticlesController],
  providers: [ArticlesService],
})
export class ArticlesModule {}
