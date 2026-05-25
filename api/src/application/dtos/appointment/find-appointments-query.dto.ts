import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsUUID } from 'class-validator';

export class FindAppointmentsQueryDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  start?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  end?: Date;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
