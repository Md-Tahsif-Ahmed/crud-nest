import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { NotFoundException } from '@nestjs/common';
import { Category } from 'src/category/entities/category.entity';
import { PostCategory } from 'src/category/entities/post-category.entity';
import { QueryRunner, DataSource } from 'typeorm';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostCategory)
    private readonly postCategoryRepository: Repository<PostCategory>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    private readonly dataSource: DataSource,
  ) {}

  async createPost(createPostDto: CreatePostDto): Promise<Post> {
    const { title, content, categories } = createPostDto;

    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const post = this.postRepository.create({ title, content });
      const savedPost = await queryRunner.manager.save(post);
      const postCategories: PostCategory[] = [];
      for (const categoryItem of categories) {
        const category = await this.categoryRepository.findOne({
          where: { id: categoryItem.categoryId },
        });
        if (category) {
          const postCategory = new PostCategory();
          postCategory.post = savedPost;
          postCategory.category = category;
          postCategory.note = categoryItem.note;
          postCategories.push(postCategory);
        }
      }

      if (postCategories.length > 0) {
        await queryRunner.manager.save(PostCategory, postCategories);
      }

      await queryRunner.commitTransaction();

      return savedPost;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updatePost(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    await this.postRepository.update(id, updatePostDto);
    const updatedPost = await this.postRepository.findOne({ where: { id } });

    if (!updatedPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return updatedPost;
  }
}
