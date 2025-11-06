import { Entity, PrimaryKey, Property } from '@mikro-orm/postgresql';
import { IntegerArrayType } from '../IntegerArrayType';

@Entity()
export class EntityWithArray {
  @PrimaryKey({ type: 'uuid', defaultRaw: 'gen_random_uuid()' })
  id!: string;

  @Property({ type: new IntegerArrayType() })
  numbers: number[];

  constructor(numbers: number[]) {
    this.numbers = numbers;
  }
}

