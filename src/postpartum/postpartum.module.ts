import { Module } from '@nestjs/common';
import { PostpartumService } from './postpartum.service';
import { PostpartumController } from './postpartum.controller';
import { MoodModule } from '../mood/mood.module';

@Module({
  imports: [MoodModule],
  controllers: [PostpartumController],
  providers: [PostpartumService],
})
export class PostpartumModule {}
