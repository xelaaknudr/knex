import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';
import { Tag } from './tag.entity';

@Entity({ name: 'posts' })
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  content: string;

  // ManyToOne указывает, что много постов могут принадлежать одному пользователю.
  // Это классическая связь для большинства систем (пользователь -> статьи, заказы, комментарии).
  // TypeORM автоматически создаст колонку authorId в таблице posts.
  @ManyToOne(() => User, (user) => user.posts)
  author: User;

  // ManyToMany с тегами. Один пост может иметь много тегов, а один тег может быть у множества постов.
  // Выгода: нормализация базы данных. Мы не храним массив строк в посте,
  // мы можем легко искать все посты по одному тегу, переименовывать теги без обновления постов.
  // @JoinTable указывает TypeORM создать промежуточную таблицу (junction table) `posts_tags`.
  @ManyToMany(() => Tag, (tag) => tag.posts)
  @JoinTable({ name: 'post_tags' })
  tags: Tag[];
}
