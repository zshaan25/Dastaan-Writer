import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendTestEmailDto {
  @ApiProperty({
    description: 'Target email recipient for the Resend connectivity test',
    example: 'delivered@resend.dev',
  })
  @IsEmail({}, { message: 'A valid email address is required' })
  @IsNotEmpty({ message: 'Recipient email address cannot be empty' })
  to: string;
}
