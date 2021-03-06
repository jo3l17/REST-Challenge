import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';
import { BaseDto } from '../../base.dto';

@Exclude()
class CreateReportDto extends BaseDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @Expose()
  @IsNotEmpty()
  @IsString()
  readonly content: string;
}

export { CreateReportDto };
