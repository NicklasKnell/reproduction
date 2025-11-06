import { Entity, OneToOne, PrimaryKey } from '@mikro-orm/postgresql';
import { EntityWithArray } from './EntityWithArray';

@Entity()
export class ParentEntity {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @OneToOne()
  relatedEntity: EntityWithArray;

  constructor(relatedEntity: EntityWithArray) {
    this.relatedEntity = relatedEntity;
  }
}

