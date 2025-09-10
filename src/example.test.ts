import {
  Embeddable,
  Embedded,
  Entity,
  MikroORM,
  OneToOne,
  PrimaryKey,
  Property,
} from "@mikro-orm/postgresql";
import { TsMorphMetadataProvider } from "@mikro-orm/reflection";

@Embeddable()
class StudentInfo {
  @Property()
  firstName: string;

  @Property()
  lastName: string;

  constructor(firstName: string, lastName: string) {
    this.firstName = firstName;
    this.lastName = lastName;
  }
}

@Entity()
class Student {
  @PrimaryKey()
  id: number;

  @Property()
  name: string;

  @Embedded({ object: true, nullable: true })
  info: StudentInfo | null = null;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}

@Entity()
class StudentExtended {
  @PrimaryKey()
  id: number;

  @OneToOne()
  student: Student;

  constructor(id: number, student: Student) {
    this.id = id;
    this.student = student;
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
    entities: [StudentExtended, StudentInfo, Student],
    metadataProvider: TsMorphMetadataProvider,
    debug: ["query", "query-params"],
    allowGlobalContext: true, // only for testing
  });
  await orm.schema.refreshDatabase();
});

afterAll(async () => {
  await orm.close(true);
});

test("basic CRUD example", async () => {
  const newStudent1 = new Student(1, "Foo");
  const newStudent2 = new Student(2, "Bar");
  const newStudentExtended1 = new StudentExtended(1, newStudent1);
  const newStudentExtended2 = new StudentExtended(2, newStudent2);
  newStudent2.info = new StudentInfo("John", "Doe");
  orm.em.persist([
    newStudent1,
    newStudent2,
    newStudentExtended1,
    newStudentExtended2,
  ]);
  await orm.em.flush();
  orm.em.clear();

  const student = await orm.em.findOneOrFail(
    StudentExtended,
    {
      student: { info: null },
    },
    // Without this populate, the query is correct.
    { populate: ["student"] }
  );

  expect(student.student).toBeDefined();
});
