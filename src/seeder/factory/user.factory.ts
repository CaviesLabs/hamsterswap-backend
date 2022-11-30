import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { UserModel } from '../../orm/model/user.model';
import { Role } from '../../user/entities/user.entity';

@Injectable()
export class UserFactory {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {}

  generate() {
    return this.entityManager.create(UserModel, {
      roles: [Role.User],
    });
  }
}
