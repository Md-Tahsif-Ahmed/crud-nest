import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { PostCategory } from './post-category.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => PostCategory, (postCategory) => postCategory.category)
  postCategories: PostCategory[];
}
