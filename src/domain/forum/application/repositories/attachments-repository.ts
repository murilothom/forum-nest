import { Attachment } from '@/domain/forum/enterprise/entities/attachment'

export abstract class AttachmentsRepository {
  abstract create(answer: Attachment): Promise<void>
}
