import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { BaseDto } from '../../base.dto';

@Exclude()
class UpdatePostDto extends BaseDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  readonly title: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  readonly content: string;

  @Expose()
  @IsNotEmpty()
  @IsBoolean()
  @IsOptional()
  readonly published: boolean;
}

export { UpdatePostDto };
