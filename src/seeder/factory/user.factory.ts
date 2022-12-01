import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { UserModel } from '../../orm/model/user.model';
import { AvatarProvider } from '../../providers/avatar.provider';
import { Role } from '../../user/entities/user.entity';

@Injectable()
export class UserFactory {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly avatarProvider: AvatarProvider,
  ) {}

  generate() {
    return this.entityManager.create(UserModel, {
      roles: [Role.User],
      avatar: this.avatarProvider.generateRandom(),
    });
  }
}
