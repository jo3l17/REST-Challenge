import { Role } from '.prisma/client';
import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class UserDto {
  @Expose()
  readonly id: number;

  @Expose()
  readonly name: string;

  @Expose()
  readonly email: string;

  @Expose()
  readonly temporalEmail: string | null;

  @Expose()
  readonly role: Role;

  @Expose()
  readonly password: string;

  @Expose()
  @Transform(({ value }) => value?.toISOString())
  readonly verifiedAt: Date | null;

  @Expose()
  readonly accountId?: number;
}
