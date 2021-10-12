import { Exclude, Expose, Transform } from 'class-transformer'
import { role } from '../../../utils/jwt.util'

@Exclude()
export class UserMiddlewareDto {
  @Expose()
  readonly id: number

  @Expose()
  readonly name: string

  @Expose()
  readonly email: string

  @Expose()
  readonly role: role

  @Expose()
  @Transform(({ value }) => value?.toISOString())
  readonly verifiedAt: Date | null

  @Expose()
  readonly accountId?: number | null
}
