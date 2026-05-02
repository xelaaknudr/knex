import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, ManyToMany } from 'typeorm';
import { Profile } from './profile.entity';
import { Post } from './post.entity';
import { Group } from './group.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  // OneToOne с Profile. 
  // @JoinColumn указывает, что именно таблица `users` будет хранить внешний ключ `profileId`.
  // Это логично: пользователь "владеет" профилем.
  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  @JoinColumn()
  profile: Profile;

  // OneToMany с Post. Один пользователь может иметь много постов.
  // Заметьте, что @JoinColumn здесь не нужен (и не может быть использован), 
  // так как массив идентификаторов постов не хранится в таблице users.
  // Вместо этого в таблице posts будет храниться authorId.
  @OneToMany(() => Post, (post) => post.author, { cascade: true })
  posts: Post[];

  // Обратная сторона ManyToMany связи с Group.
  // @JoinTable находится на стороне Group, поэтому здесь его нет.
  @ManyToMany(() => Group, (group) => group.users)
  groups: Group[];
}
