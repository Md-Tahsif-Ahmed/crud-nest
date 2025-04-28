import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostService } from './post.service';
import { PostController } from './post.controller';
import { Post } from './entities/post.entity'; // <-- Make sure this path is correct
import { PostCategory } from 'src/category/entities/post-category.entity';
import { Category } from 'src/category/entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, PostCategory, Category])],
  controllers: [PostController],
  providers: [PostService],
})
export class PostModule {}
