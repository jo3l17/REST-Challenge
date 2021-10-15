import { Role } from '.prisma/client';
import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class UserMiddlewareDto {
  @Expose()
  readonly id: number;

  @Expose()
  readonly name: string;

  @Expose()
  readonly email: string;

  @Expose()
  readonly role: Role;

  @Expose()
  @Transform(({ value }) => value?.toISOString())
  readonly verifiedAt: Date | null;

  @Expose()
  readonly accountId?: number | null;
}
