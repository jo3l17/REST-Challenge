import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AccountDto {
  @Expose()
  readonly id: number;

  @Expose()
  readonly isEmailPublic: boolean;

  @Expose()
  readonly isNamePublic: boolean;

  @Expose()
  readonly userId: number;
}
