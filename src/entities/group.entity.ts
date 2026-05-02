import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'groups' })
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // ManyToMany с Пользователями. Группа состоит из множества пользователей, пользователь может быть в разных группах.
  // Это также создает промежуточную таблицу `groups_users`.
  // Выгода: масштабируемость и гибкость. При добавлении пользователя в группу мы просто добавляем одну строку в таблицу-связку,
  // вместо того чтобы изменять и переиндексировать массивы внутри самих пользователей или групп.
  @ManyToMany(() => User, (user) => user.groups)
  @JoinTable({ name: 'group_users' })
  users: User[];
}
