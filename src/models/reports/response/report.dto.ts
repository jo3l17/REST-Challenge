import { ReportType } from '.prisma/client';
import { Exclude, Expose, Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

@Exclude()
class PostReportDto {
  @Expose()
  @IsOptional()
  @Transform(({ value }) => (value === null ? undefined : value))
  readonly postId: number;

  @Expose()
  @IsOptional()
  @Transform(({ value }) => (value === null ? undefined : value))
  readonly commentId: number;

  @Expose()
  readonly type: ReportType;

  @Expose()
  readonly title: string;

  @Expose()
  readonly content: string;

  @Expose()
  readonly accountId: number;

  @Expose()
  @Transform(({ value }) => value?.toISOString())
  readonly createdAt: Date;
}

export { PostReportDto };
