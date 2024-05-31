import { Embedded, Enum } from "@mikro-orm/core";
import {
  Entity,
  MikroORM,
  PrimaryKey,
  Property,
  Embeddable,
} from "@mikro-orm/postgresql";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";

@Embeddable()
class DueDateEmailData {
  @Property()
  dueDate: Date;

  @Property()
  senderEmail: string;

  constructor(args: { dueDate: Date; senderEmail: string }) {
    this.dueDate = args.dueDate;
    this.senderEmail = args.senderEmail;
  }
}

@Embeddable()
class EmailData {
  @Property()
  senderEmail: string;

  constructor(args: { senderEmail: string }) {
    this.senderEmail = args.senderEmail;
  }
}

enum WrapperType {
  DUE_DATE = "DUE_DATE",
  EMAIL = "EMAIL",
}

@Embeddable({ abstract: true, discriminatorColumn: "type" })
abstract class PolyEmailDataWrapper {
  @Enum()
  type: WrapperType;

  constructor(type: WrapperType) {
    this.type = type;
  }
}

@Embeddable()
class DueDateEmailDataWrapper extends PolyEmailDataWrapper {
  @Embedded({ array: true })
  sentEmails: DueDateEmailData[];

  constructor(args: { sentEmails: DueDateEmailData[] }) {
    super(WrapperType.DUE_DATE);
    this.sentEmails = args.sentEmails;
  }
}

@Embeddable()
class EmailDataWrapper extends PolyEmailDataWrapper {
  @Embedded({ array: true })
  sentEmails: EmailData[];

  constructor(args: { sentEmails: EmailData[] }) {
    super(WrapperType.EMAIL);
    this.sentEmails = args.sentEmails;
  }
}

@Entity()
class User {
  @PrimaryKey()
  id!: number;

  @Embedded({ nullable: true, object: true })
  email: DueDateEmailDataWrapper | EmailDataWrapper;

  constructor(id: number, email: DueDateEmailDataWrapper | EmailDataWrapper) {
    this.id = id;
    this.email = email;
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
    entities: [
      User,
      DueDateEmailData,
      EmailData,
      DueDateEmailDataWrapper,
      EmailDataWrapper,
    ],
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
  const user = new User(
    0,
    new DueDateEmailDataWrapper({
      sentEmails: [
        new DueDateEmailData({
          dueDate: new Date(),
          senderEmail: "foo",
        }),
      ],
    })
  );
  await orm.em.persistAndFlush(user);
  orm.em.clear();

  const userQuery = await orm.em.findOneOrFail(User, { id: 0 });

  const dueDate = (userQuery.email as DueDateEmailDataWrapper).sentEmails[0]
    .dueDate;
  console.log(dueDate);
  expect(dueDate).toBeDefined();
});
