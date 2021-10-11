import { Exclude, Expose, Transform } from 'class-transformer'

@Exclude()
export class UserDto {
  @Expose()
  readonly id: string

  @Expose()
  readonly name: string

  @Expose()
  readonly email: string

  @Expose()
  readonly role: string

  @Expose()
  readonly password: string

  @Expose()
  @Transform(({ value }) => value?.toISOString())
  readonly verifiedAt: Date

  @Expose()
  @Transform(({ value }) => value?.toISOString())
  readonly createdAt: Date
}
