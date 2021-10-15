import { Comment, Post } from '.prisma/client';
import { Exclude, Expose, Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

@Exclude()
class FetchReportsDto {
  @Expose()
  readonly id: number;

  @Expose()
  readonly title: string;

  @Expose()
  readonly content: string;

  @Expose()
  @IsOptional()
  @Transform(({ value }) => (value === null ? undefined : value))
  readonly post: Post;

  @Expose()
  @IsOptional()
  @Transform(({ value }) => (value === null ? undefined : value))
  readonly comment: Comment;

  @Expose({ name: 'accountId' })
  readonly reporterId: number;

  @Expose()
  @Transform(({ value }) => value?.toISOString())
  readonly createdAt: Date;
}

export { FetchReportsDto };
