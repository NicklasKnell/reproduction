import {
  Collection,
  Embeddable,
  Embedded,
  Entity,
  ManyToOne,
  MikroORM,
  OneToMany,
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
class Course {
  @PrimaryKey()
  id: number;

  @Property()
  name: string;

  @OneToMany({ mappedBy: "course" })
  students = new Collection<Student>(this);

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
}

@Entity()
class Student {
  @PrimaryKey()
  id: number;

  @Property()
  name: string;

  @ManyToOne()
  course: Course;

  @Embedded({ object: true, nullable: true })
  info: StudentInfo | null = null;

  constructor(id: number, name: string, course: Course) {
    this.id = id;
    this.name = name;
    this.course = course;
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
    entities: [StudentInfo, Student, Course],
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
  const course1 = new Course(1, "Math");
  const newStudent1 = new Student(1, "Foo", course1);
  const newStudent2 = new Student(2, "Bar", course1);
  newStudent2.info = new StudentInfo("John", "Doe");
  orm.em.persist(newStudent1);
  orm.em.persist(newStudent2);
  await orm.em.flush();
  orm.em.clear();

  const student = await orm.em.findOneOrFail(Student, { info: null });
  expect(student.name).toBe("Foo");

  const courseWithSomeStudentNoInfo = await orm.em.find(Course, {
    students: { $some: { info: null } },
  });
  expect(courseWithSomeStudentNoInfo.length).toBe(1);
});
