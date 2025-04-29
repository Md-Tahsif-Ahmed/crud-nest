import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { Post } from './entities/post.entity';
import { NotFoundException } from '@nestjs/common';
import { Category } from 'src/category/entities/category.entity';
import { PostCategory } from 'src/category/entities/post-category.entity';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(PostCategory)
    private readonly postCategoryRepository: Repository<PostCategory>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async createPost(createPostDto: CreatePostDto): Promise<Post> {
    const { title, content, categories } = createPostDto;
    const savedPost = await this.postRepository.manager.transaction(
      async (manager) => {
        const post = this.postRepository.create({ title, content });
        const savedPost = await manager.save(post);
        const postCategories = await Promise.all(
          categories.map(async (categoryItem) => {
            const category = await this.categoryRepository.findOne({
              where: { id: categoryItem.categoryId },
            });
            if (category) {
              const postCategory = new PostCategory();
              postCategory.post = savedPost;
              postCategory.category = category;
              postCategory.note = categoryItem.note;
              return postCategory;
            }
            return null;
          }),
        );

        const validPostCategories = postCategories.filter((pc) => pc !== null);
        if (validPostCategories.length > 0) {
          await manager.save(PostCategory, validPostCategories);
        }
        return savedPost;
      },
    );
    return savedPost;
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
