import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Category } from './category.entity';
import { Post } from 'src/post/entities/post.entity';

@Entity()
export class PostCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Post, (post) => post.postCategories)
  post: Post;

  @ManyToOne(() => Category, (category) => category.postCategories)
  category: Category;

  @Column({ nullable: true })
  note: string;
}
