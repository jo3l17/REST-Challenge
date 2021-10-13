import { Exclude, Expose } from 'class-transformer';

@Exclude()
class GlobalCommentDto {
  @Expose()
  readonly content: string;
}

export { GlobalCommentDto };
