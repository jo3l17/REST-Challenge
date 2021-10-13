import { Exclude, Expose } from 'class-transformer';

@Exclude()
class GobalPostDto {
  @Expose()
  readonly title: string;

  @Expose()
  readonly content: string;
}

export { GobalPostDto };
