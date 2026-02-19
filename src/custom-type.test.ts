import { MikroORM } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { EntityWithCustomType } from './entities/EntityWithCustomType';
import { CalendarDate } from 'calendar-date';
import { MyEvent } from './types/MyEvent';

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
  await orm.em.persistAndFlush(entityWithArray);
  orm.em.clear();


  // Test
  const partialEntity = await orm.em.findOneOrFail(EntityWithCustomType, '1', {fields: ['id']});
  expect(partialEntity).toBeDefined();

  const populatedEntity = await orm.em.findOneOrFail(EntityWithCustomType, '1', {populate: ['event']});
  expect(populatedEntity).toBeDefined();
  expect(populatedEntity.event.date).toEqual(new CalendarDate(2024, 6, 1));

});



