import { Entity, PrimaryGeneratedColumn, Column, OneToOne, Relation } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'profiles' })
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  bio: string;

  @Column({ nullable: false })
  avatarUrl: string;

  // OneToOne указывает, что один профиль принадлежит ровно одному пользователю.
  // Это выгодно для разделения тяжелых или редко используемых данных (как биография)
  // и часто используемых данных (логин, пароль, email), чтобы таблица users была легкой и быстрой.
  @OneToOne(() => User, (user) => user.profile)
  user: Relation<User>;
}
