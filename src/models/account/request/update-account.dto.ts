import { Expose, Exclude } from 'class-transformer'
import { IsBoolean } from 'class-validator'
import { BaseDto } from '../../base.dto'

@Exclude()
export class UpdateAccountDto extends BaseDto {
    @Expose()
    @IsBoolean()
    readonly isEmailPublic: boolean

    @Expose()
    @IsBoolean()
    readonly isNamePublic: boolean
}
