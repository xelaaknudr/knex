import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Post } from './post.entity';

@Entity({ name: 'tags' })
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  // Обратная сторона ManyToMany связи.
  // Заметьте, что @JoinTable здесь не нужен, он должен быть только на одной стороне (обычно там, где связь логически "создается", например в Посте).
  @ManyToMany(() => Post, (post) => post.tags)
  posts: Post[];
}
