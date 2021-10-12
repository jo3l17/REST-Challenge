import { Exclude, Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';

@Exclude()
class ActionPostDto {
  @Expose()
  @IsOptional()
  readonly likes: number;

  @Expose()
  @IsOptional()
  readonly dislikes: number;
}

export { ActionPostDto };
