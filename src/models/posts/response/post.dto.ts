import { Exclude, Expose } from 'class-transformer';

@Exclude()
class PostDto {
  @Expose()
  readonly title: string;

  @Expose()
  readonly content: string;
}

export { PostDto };
