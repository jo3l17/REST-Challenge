import { PostLike } from '.prisma/client';
import { Exclude, Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';

@Exclude()
class FetchActionCommentDto {
  @Expose()
  @IsOptional()
  readonly likes: number;

  @Expose()
  @IsOptional()
  readonly dislikes: number;

  @Expose()
  readonly likedBy: PostLike[];
}

export { FetchActionCommentDto };
