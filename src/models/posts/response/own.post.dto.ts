import { PostLike } from '.prisma/client';
import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
class OwnPostDto {
  @Expose({ name: 'id' })
  readonly postId: number;

  @Expose()
  readonly title: string;

  @Expose()
  readonly content: string;

  @Expose()
  readonly published: string;

  @Expose()
  readonly likes: number;

  @Expose()
  readonly dislikes: number;

  @Expose()
  @Transform(({ value }) => value?.toISOString())
  readonly likedBy: PostLike[];

  @Expose()
  @Transform(({ value }) => value?.toISOString())
  readonly createdAt: Date;

  @Expose()
  @Transform(({ value }) => value?.toISOString())
  readonly updateAt: Date;
}

export { OwnPostDto };
