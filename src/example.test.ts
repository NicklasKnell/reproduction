import {
  Collection,
  Entity,
  ManyToMany,
  MikroORM,
  PrimaryKey,
  Property,
} from "@mikro-orm/postgresql";

// Works if it is just named 'Label'
@Entity()
class UserLabel {
  @PrimaryKey()
  id!: number;

  @Property()
  name: string;

  @ManyToMany(() => User, (user) => user.labels)
  users = new Collection<User>(this);

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}

@Entity()
class User {
  @PrimaryKey()
  id!: number;

  @Property()
  name: string;

  @ManyToMany(() => UserLabel, "users", {
    owner: true,
  })
  labels = new Collection<UserLabel>(this);

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
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
    entities: [User, UserLabel],
    debug: ["query", "query-params"],
    allowGlobalContext: true, // only for testing
  });
  await orm.schema.refreshDatabase();
});

afterAll(async () => {
  await orm.close(true);
});

test("basic CRUD example", async () => {
  const user1 = orm.em.create(User, {
    id: 1,
    name: "User 1",
  });

  const user2 = orm.em.create(User, {
    id: 2,
    name: "User 2",
  });

  orm.em.create(User, {
    id: 3,
    name: "User 3",
  });

  const label1 = orm.em.create(UserLabel, {
    id: 1,
    name: "Label 1",
  });

  const label2 = orm.em.create(UserLabel, {
    id: 2,
    name: "Label 2",
  });

  user1.labels.add(label1, label2);

  user2.labels.add(label1);

  await orm.em.flush();
  orm.em.clear();

  // const user = await orm.em.find(User, {
  //   labels: { $some: { id: 1 } },
  // });

  await orm.em.count(User, {
    labels: { $some: { id: 1 } },
  });
});
