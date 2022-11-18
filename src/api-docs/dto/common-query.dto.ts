import { IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * @dev DTO for common query params
 */
export class CommonQueryDto {
  @IsNumber()
  @IsOptional()
  limit?: number = 20;

  @IsNumber()
  @IsOptional()
  offset?: number = 0;

  @IsString()
  @IsOptional()
  search?: string;
}
