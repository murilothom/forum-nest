import { Student } from '../../enterprise/entities/student'

export abstract class StudentsRepository {
  abstract create(student: Student): Promise<void>
  abstract findByEmail(id: string): Promise<Student | null>
}
