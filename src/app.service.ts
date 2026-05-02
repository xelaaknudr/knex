import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { Post } from './entities/post.entity';
import { Group } from './entities/group.entity';
import { Tag } from './entities/tag.entity';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Profile) private profileRepository: Repository<Profile>,
    @InjectRepository(Post) private postRepository: Repository<Post>,
    @InjectRepository(Group) private groupRepository: Repository<Group>,
    @InjectRepository(Tag) private tagRepository: Repository<Tag>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async seed() {
    // Очистим старые данные для чистоты эксперимента (необязательно, но полезно)
    // Внимание: в реальном проекте так делать нельзя!
    await this.userRepository.query('TRUNCATE TABLE users, profiles, posts, groups, tags, post_tags, group_users CASCADE');

    // 1. Теги
    const tagTech = await this.tagRepository.save({ name: 'Tech' });
    const tagLife = await this.tagRepository.save({ name: 'Life' });

    // 2. Группы
    const groupDevs = await this.groupRepository.save({ name: 'Developers' });
    const groupDesigners = await this.groupRepository.save({ name: 'Designers' }); // В эту группу никого не добавим

    // 3. Профили
    const profileA = this.profileRepository.create({ bio: 'I am User A, I have everything', avatarUrl: 'avatarA.jpg' });
    const orphanProfile = this.profileRepository.create({ bio: 'I am a profile without a user', avatarUrl: 'orphan.jpg' });
    await this.profileRepository.save([profileA, orphanProfile]);

    // 4. Пользователи с разным набором данных
    
    // User A: Есть профиль, есть 2 поста, есть группа
    const userA = this.userRepository.create({
      name: 'User A (Full)',
      email: 'a@example.com',
      profile: profileA,
      groups: [groupDevs],
    });
    await this.userRepository.save(userA);

    await this.postRepository.save([
      { title: 'Post A1', content: 'Old post', author: userA, tags: [tagTech] },
      { title: 'Post A2 (Latest)', content: 'Fresh content', author: userA, tags: [tagTech, tagLife] }
    ]);

    // User B: НЕТ профиля, есть 1 пост, есть группа
    const userB = this.userRepository.create({
      name: 'User B (No Profile)',
      email: 'b@example.com',
      groups: [groupDevs],
    });
    await this.userRepository.save(userB);
    await this.postRepository.save({ title: 'Post B1', content: 'Solo post', author: userB, tags: [tagLife] });

    // User C: НЕТ профиля, НЕТ постов, НЕТ групп
    const userC = this.userRepository.create({
      name: 'User C (Empty)',
      email: 'c@example.com',
    });
    await this.userRepository.save(userC);

    return { 
      message: 'Database seeded with diverse data for JOIN testing!',
      details: {
        users: ['User A (Profile+Posts)', 'User B (Posts only)', 'User C (Nothing)'],
        profiles: ['Profile A (linked)', 'Orphan Profile (not linked)'],
        groups: ['Developers (2 members)', 'Designers (0 members)']
      }
    };
  }

  // --- Эндпоинты остаются те же, но теперь они вернут наглядные результаты ---

  async getInnerJoin() {
    // Вернет только User A, так как только у него есть запись в profiles
    return this.userRepository.query(`
      SELECT u.name as user_name, p.bio 
      FROM users u 
      INNER JOIN profiles p ON u."profileId" = p.id;
    `);
  }

  async getLeftJoin() {
    // Вернет A, B и C. У B и C в колонке bio будет NULL.
    // Полезно: Список ВСЕХ юзеров, даже если они не заполнили профиль.
    return this.userRepository.query(`
      SELECT u.name as user_name, p.bio 
      FROM users u 
      LEFT JOIN profiles p ON u."profileId" = p.id;
    `);
  }

  async getRightJoin() {
    // Вернет User A и "Orphan Profile".
    // У Orphan Profile имя пользователя будет NULL.
    // Полезно: Найти "битые" или осиротевшие данные в правой таблице.
    return this.userRepository.query(`
      SELECT u.name as user_name, p.bio 
      FROM users u 
      RIGHT JOIN profiles p ON u."profileId" = p.id;
    `);
  }

  async getFullJoin() {
    // Вернет A, B, C и Orphan Profile. Полная картина всех данных.
    return this.userRepository.query(`
      SELECT u.name as user_name, p.bio 
      FROM users u 
      FULL OUTER JOIN profiles p ON u."profileId" = p.id;
    `);
  }

  async getCrossJoin() {
    // Перемножит 3 юзера на 2 группы = 6 строк. 
    // Показывает все теоретически возможные комбинации.
    return this.userRepository.query(`
      SELECT u.name, g.name as group_name
      FROM users u 
      CROSS JOIN groups g;
    `);
  }

  async getSelfJoin() {
    // Сравнит юзеров друг с другом.
    return this.userRepository.query(`
      SELECT u1.name as "First", u2.name as "Second"
      FROM users u1 
      INNER JOIN users u2 ON u1.id != u2.id;
    `);
  }

  async getNaturalJoin() {
    // В данном контексте может вернуть пустоту или странный результат, 
    // так как id (единственная общая колонка) у них разный для большинства строк.
    return this.userRepository.query(`
      SELECT * FROM users NATURAL JOIN profiles;
    `);
  }

  async getAntiJoin() {
    // Вернет User B и User C. Те, у кого НЕТ профиля.
    // Полезно: Отправить уведомление "Заполните профиль!".
    return this.userRepository.query(`
      SELECT u.name 
      FROM users u 
      LEFT JOIN profiles p ON u."profileId" = p.id 
      WHERE p.id IS NULL;
    `);
  }

  async getSemiJoin() {
    // Вернет только User A.
    // Полезно: "Дай мне юзеров, у которых ЕСТЬ профиль", но сами данные профиля мне не нужны.
    return this.userRepository.query(`
      SELECT u.name 
      FROM users u 
      WHERE EXISTS (SELECT 1 FROM profiles p WHERE u."profileId" = p.id);
    `);
  }

  async getLateralJoin() {
    // Вытащит для каждого юзера его САМЫЙ ПОСЛЕДНИЙ пост (Post A2 для User A, Post B1 для User B).
    // Обычным джойном вы бы получили все посты (дублирование юзера в списке).
    return this.userRepository.query(`
      SELECT u.name, latest_post.title 
      FROM users u 
      LEFT JOIN LATERAL (
        SELECT p.title 
        FROM posts p 
        WHERE p."authorId" = u.id 
        ORDER BY p.id DESC 
        LIMIT 1
      ) latest_post ON true;
    `);
  }

  async getPartitionJoin() {
    // Покажет всех юзеров и ВСЕ группы, пометив кто где состоит.
    // Вы увидите, что в группе Designers никого нет (is_member = false для всех).
    return this.userRepository.query(`
      SELECT u.name, g.name as target_group, gu."usersId" IS NOT NULL as is_member
      FROM users u
      CROSS JOIN groups g
      LEFT JOIN group_users gu ON gu."usersId" = u.id AND gu."groupsId" = g.id;
    `);
  }
}
