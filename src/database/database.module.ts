import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Profile } from '../entities/profile.entity';
import { Post } from '../entities/post.entity';
import { Group } from '../entities/group.entity';
import { Tag } from '../entities/tag.entity';

@Module({
	imports: [
		TypeOrmModule.forRootAsync({
			useFactory: (configService: ConfigService) => ({
				logging: true,
				type: 'postgres',
				host: configService.getOrThrow('PG_HOST'),
				port: configService.getOrThrow('PG_PORT'),
				database: configService.getOrThrow('PG_DB'),
				username: configService.getOrThrow('PG_USER'),
				password: configService.getOrThrow('PG_PASSWORD'),
				autoLoadEntities:
					configService.getOrThrow('PG_AUTOLOAD') === 'true',
				entities: [User, Profile, Post, Group, Tag],
				synchronize: true, // Добавляем synchronize для автоматического создания таблиц (только для тестов/дева!)
			}),
			inject: [ConfigService],
		}),
	],
})
export class DatabaseModule {
	static forFeature(models: Parameters<typeof TypeOrmModule.forFeature>[0], connectionName?: string) {
		return TypeOrmModule.forFeature(models, connectionName);
	}
}
