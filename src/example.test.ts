import {
  AbstractSqlConnection,
  Embeddable,
  Embedded,
  Entity,
  Enum,
  MikroORM,
  PostgreSqlDriver,
  PrimaryKey,
  Property,
} from "@mikro-orm/postgresql";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";

enum ChangeType {
  BOOLEAN = "BOOLEAN",
  STRING = "STRING",
}

@Embeddable({ abstract: true, discriminatorColumn: "type" })
abstract class AbstractChangeEntry {
  @Enum()
  type: ChangeType;

  constructor(type: ChangeType) {
    this.type = type;
  }
}

@Embeddable()
export class BooleanChangeEntry extends AbstractChangeEntry {
  @Property()
  value: boolean | null;

  constructor({ value }: { value: boolean | null }) {
    super(ChangeType.BOOLEAN);
    this.value = value;
  }
}

@Embeddable()
export class StringChangeEntry extends AbstractChangeEntry {
  @Property()
  value: string | null;

  constructor({ value }: { value: string | null }) {
    super(ChangeType.STRING);
    this.value = value;
  }
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
  @Embedded({ object: true, array: true })
  entries: BooleanChangeEntry[];

  constructor({ entries }: { entries: Omit<BooleanChangeEntry, "type">[] }) {
    super(ChangeType.BOOLEAN);
    this.entries = entries.map((entry) => new BooleanChangeEntry(entry));
  }
}

@Embeddable({ discriminatorValue: ChangeType.STRING })
class ChangeStringValue extends AbstractChangeType {
  @Embedded({ object: true, array: true })
  entries: StringChangeEntry[];

  constructor({ entries }: { entries: Omit<StringChangeEntry, "type">[] }) {
    super(ChangeType.STRING);
    this.entries = entries.map((entry) => new StringChangeEntry(entry));
  }
}

@Entity()
class ChangeOwner {
  @PrimaryKey()
  id: number;

  @Embedded({ object: true, array: true })
  fields: (ChangeBooleanValue | ChangeStringValue)[];

  constructor(id: number, fields: (ChangeBooleanValue | ChangeStringValue)[]) {
    this.id = id;
    this.fields = fields;
  }
}

let orm: MikroORM;

beforeAll(async () => {
  orm = await MikroORM.init({
    driver: PostgreSqlDriver,
    metadataProvider: TsMorphMetadataProvider,
    dbName: "mikro-orm-reproduction",
    host: "localhost",
    port: 5432,
    user: "admin",
    password: "admin",
    entities: [
      ChangeOwner,
      ChangeBooleanValue,
      ChangeStringValue,
      BooleanChangeEntry,
      StringChangeEntry,
    ],
    debug: ["query", "query-params"],
    allowGlobalContext: true, // only for testing
  });
  await orm.schema.refreshDatabase();
});

afterAll(async () => {
  await orm.close(true);
});

test("basic CRUD example", async () => {
  const changeOwner = new ChangeOwner(1, [
    new ChangeBooleanValue({ entries: [{ value: true }] }),
    // new ChangeStringValue({ entries: [{ value: "hello" }] }),
  ]);

  orm.em.create(ChangeOwner, changeOwner);
  await orm.em.flush();
  orm.em.clear();

  const persistedChangeOwner = await orm.em.findOne(ChangeOwner, 1);
  const conn = orm.em.getConnection() as AbstractSqlConnection;
  const knex = conn.getKnex();

  const res = await knex.select("*").from("change_owner").where({ id: 1 });

  console.dir(persistedChangeOwner, { depth: null });
  console.dir(res, { depth: null });
});
