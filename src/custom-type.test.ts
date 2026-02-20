import { Entity, JsonType, MikroORM, Platform, PrimaryKey, Property } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { CalendarDate } from 'calendar-date';

interface MyEvent {
  title: string;
  date: CalendarDate;
}

type MyEventRaw = Omit<MyEvent, 'date'> & { date: string };

class EventType extends JsonType {
  constructor() {
    super();
  }

  convertToJSValue(rawValue: MyEventRaw, platform: Platform): MyEvent {
    // Am i supposed to call that? Doesn't seem to make a difference
    const value = super.convertToJSValue(rawValue, platform) as MyEventRaw;

    if (typeof value === 'string') {
      throw new Error('Invalid value for MyEvent');
    }

    return {
      title: value.title,
      date: CalendarDate.parse(value.date.toString()),
    };
  }
}

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



let orm: MikroORM;

beforeAll(async () => {
  orm = await MikroORM.init({
    dbName: 'mikro-orm-reproduction',
    host: 'localhost',
    port: 5432,
    user: 'admin',
    password: 'admin',
    entities: [EntityWithCustomType],
    metadataProvider: TsMorphMetadataProvider,
    allowGlobalContext: true,
  });
  await orm.schema.refreshDatabase();
});

afterAll(async () => {
  await orm.close(true);
});

test('Custom Type', async () => {

  const event: MyEvent = {
    title: 'Test Event',
    date: new CalendarDate(2024, 6, 1),
  }
  // Setup
  const entityWithArray = new EntityWithCustomType('1', event);
  orm.em.persist(entityWithArray);
  await orm.em.flush();
  orm.em.clear();


  // Test
  const partialEntity = await orm.em.findOneOrFail(EntityWithCustomType, '1', {fields: ['id']});
  expect(partialEntity).toBeDefined();

  const populatedEntity = await orm.em.findOneOrFail(EntityWithCustomType, '1', {populate: ['event']});
  expect(populatedEntity).toBeDefined();
  expect(populatedEntity.event.date).toEqual(new CalendarDate(2024, 6, 1));

});



