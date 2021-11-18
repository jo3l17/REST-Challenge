import { Exclude, Expose } from 'class-transformer';

@Exclude()
class GobalPostDto {
  @Expose({ name: 'id' })
  readonly postId: number;

  @Expose()
  readonly title: string;

  @Expose()
  readonly content: string;
}

export { GobalPostDto };
