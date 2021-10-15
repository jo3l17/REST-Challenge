import { Exclude, Expose } from 'class-transformer';

@Exclude()
class GlobalCommentDto {
  @Expose({ name: 'id' })
  readonly commentId: string;

  @Expose()
  readonly content: string;
}

export { GlobalCommentDto };
