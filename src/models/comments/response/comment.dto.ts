import { Exclude, Expose } from 'class-transformer';

@Exclude()
class CommentDto {
  @Expose()
  readonly content: string;

  @Expose()
  readonly published: boolean;
}

export { CommentDto };
