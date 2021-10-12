import { Exclude, Expose } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { BaseDto } from '../../base.dto';

@Exclude()
class CreateCommentDto extends BaseDto {
  @Expose()
  @IsNotEmpty()
  @IsString()
  readonly content: string;

  @Expose()
  @IsNotEmpty()
  @IsBoolean()
  readonly published: boolean;
}

export { CreateCommentDto };
