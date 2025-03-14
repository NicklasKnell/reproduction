import { Embedded, Enum } from "@mikro-orm/core";
import {
  Entity,
  MikroORM,
  PrimaryKey,
  Property,
  Embeddable,
} from "@mikro-orm/postgresql";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";

enum ChangeType {
  BOOLEAN = "BOOLEAN",
  STRING = "STRING",
}

@Embeddable({ abstract: true, discriminatorColumn: "type" })
abstract class AbstractChangeType {
  @Enum()
  type: ChangeType;

  constructor(type: ChangeType) {
    this.type = type;
  }
}

@Embeddable({ discriminatorValue: ChangeType.BOOLEAN })
class ChangeBooleanValue extends AbstractChangeType {
  @Property()
  oldValue: boolean | null;

  @Property()
  newValue: boolean | null;

  constructor(args: { oldValue: boolean | null; newValue: boolean | null }) {
    super(ChangeType.BOOLEAN);
    this.oldValue = args.oldValue;
    this.newValue = args.newValue;
  }
}

@Embeddable({ discriminatorValue: ChangeType.STRING })
class ChangeStringValue extends AbstractChangeType {
  @Property()
  oldValue: string | null;

  @Property()
  newValue: string | null;

  constructor(args: { oldValue: string | null; newValue: string | null }) {
    super(ChangeType.STRING);
    this.oldValue = args.oldValue;
    this.newValue = args.newValue;
  }
}

@Entity()
class Change {
  @PrimaryKey()
  id: number;

  @Property()
  name: string;

  @Embedded({ object: true })
  value: ChangeBooleanValue | ChangeStringValue;

  constructor(
    id: number,
    name: string,
    value: ChangeBooleanValue | ChangeStringValue
  ) {
    this.id = id;
    this.name = name;
    this.value = value;
  }
}

let orm: MikroORM;

beforeAll(async () => {
  orm = await MikroORM.init({
    dbName: "mikro-orm-reproduction",
    host: "localhost",
    port: 5432,
    user: "admin",
    password: "admin",
    entities: [Change, ChangeBooleanValue, ChangeStringValue],
    debug: ["query", "query-params"],
    allowGlobalContext: true, // only for testing
    metadataProvider: TsMorphMetadataProvider,
  });
  await orm.schema.refreshDatabase();
});

afterAll(async () => {
  await orm.close(true);
});

test("embedded", async () => {
  const change = new Change(
    0,
    "fullName",
    new ChangeStringValue({
      oldValue: "John",
      newValue: "John Doe",
    })
  );
  await orm.em.persistAndFlush(change);
  orm.em.clear();

  const selectedChange = await orm.em.findOneOrFail(Change, { id: 0 });

  expect(selectedChange.value.oldValue).toBe("John");
  expect(selectedChange.value.newValue).toBe("John Doe");
});
