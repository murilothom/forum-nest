import { Student } from '@/domain/forum/enterprise/entities/student'
import { DomainEvents } from '@/core/events/domaint-events'
import { StudentsRepository } from '@/domain/forum/application/repositories/students-repository'

export class InMemoryStudentsRepository implements StudentsRepository {
  public items: Student[] = []

  constructor() {}

  async create(student: Student): Promise<void> {
    this.items.push(student)

    DomainEvents.dispatchEventsForAggregate(student.id)
  }

  async findByEmail(email: string): Promise<Student | null> {
    const item = this.items.find((item) => item.email === email)

    if (!item) {
      return null
    }

    return item
  }
}
