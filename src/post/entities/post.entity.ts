import { PostCategory } from 'src/category/entities/post-category.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @OneToMany(() => PostCategory, (postCategory) => postCategory.post)
  postCategories: PostCategory[];
}
