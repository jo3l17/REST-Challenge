import { Exclude, Expose } from 'class-transformer';

@Exclude()
class ReactionPostDto {
  @Expose()
  readonly title: number;

  @Expose()
  readonly likes: number;

  @Expose()
  readonly dislikes: number;
}

export { ReactionPostDto };
