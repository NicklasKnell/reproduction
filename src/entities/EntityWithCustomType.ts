import { Entity, PrimaryKey, Property } from '@mikro-orm/postgresql';
import { EventType } from '../EventType';
import { MyEvent } from '../types/MyEvent';

@Entity()
export class EntityWithCustomType {
  @PrimaryKey({ type: 'string'})
  id: string;

  @Property({ type: new EventType() })
  event: MyEvent;

  constructor(id: string, event: MyEvent) {
    this.id = id;
    this.event = event;
  }
}

