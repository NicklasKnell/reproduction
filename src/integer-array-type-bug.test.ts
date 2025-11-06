import { MikroORM } from '@mikro-orm/postgresql';
import { TsMorphMetadataProvider } from '@mikro-orm/reflection';
import { EntityWithArray } from './entities/EntityWithArray';
import { ParentEntity } from './entities/ParentEntity';

let orm: MikroORM;

beforeAll(async () => {
  orm = await MikroORM.init({
    dbName: 'mikro-orm-reproduction',
    host: 'localhost',
    port: 5432,
    user: 'admin',
    password: 'admin',
    entities: [EntityWithArray, ParentEntity],
    metadataProvider: TsMorphMetadataProvider,
    allowGlobalContext: true,
  });
  await orm.schema.refreshDatabase();
});

afterAll(async () => {
  await orm.close(true);
});

test('IntegerArrayType should work with getReference + populate', async () => {
  // Setup
  const entityWithArray = new EntityWithArray([10, 20, 30]);
  const parentEntity = new ParentEntity(entityWithArray);
  await orm.em.persistAndFlush([entityWithArray, parentEntity]);
  const parentId = parentEntity.id;
  orm.em.clear();

  // This pattern should work but currently fails due to bug
  // Bug: PostgreSQL array string '{10,20,30}' is not converted to JavaScript array
  const parentRef = orm.em.getReference(ParentEntity, parentId);
  await orm.em.populate(parentRef, ['relatedEntity']);

  // This should work but currently throws: "Could not convert database value '{10,20,30}' of type 'string' to type IntegerArrayType"
  expect(parentRef.relatedEntity.numbers).toEqual([10, 20, 30]);
});

test('IntegerArrayType works with findOneOrFail', async () => {
  // Setup
  const entityWithArray = new EntityWithArray([10, 20, 30]);
  const parentEntity = new ParentEntity(entityWithArray);
  await orm.em.persistAndFlush([entityWithArray, parentEntity]);
  const parentId = parentEntity.id;
  orm.em.clear();

  // This pattern works correctly
  const parentLoaded = await orm.em.findOneOrFail(
    ParentEntity,
    { id: parentId },
    { populate: ['relatedEntity'] }
  );

  expect(parentLoaded.relatedEntity.numbers).toEqual([10, 20, 30]);
});

