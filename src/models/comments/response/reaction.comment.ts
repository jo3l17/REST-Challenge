import { Exclude, Expose } from 'class-transformer';

@Exclude()
class ReactionCommentDto {
  @Expose()
  readonly content: number;

  @Expose()
  readonly likes: number;

  @Expose()
  readonly dislikes: number;
}

export { ReactionCommentDto };
