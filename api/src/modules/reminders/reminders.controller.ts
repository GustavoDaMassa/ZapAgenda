import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { Reminder } from './entities/reminder.entity';
import { RemindersService } from './reminders.service';

@ApiTags('reminders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('appointments/:appointmentId/reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get()
  @ApiOperation({ summary: 'List reminders for an appointment' })
  @ApiResponse({ status: 200, description: 'Returns all reminders' })
  findAll(@Param('appointmentId') appointmentId: string): Promise<Reminder[]> {
    return this.remindersService.findByAppointment(appointmentId);
  }

  @Post()
  @ApiOperation({ summary: 'Add a reminder to an appointment' })
  @ApiResponse({ status: 201, description: 'Reminder created' })
  create(
    @Param('appointmentId') appointmentId: string,
    @Body() dto: CreateReminderDto,
  ): Promise<Reminder> {
    return this.remindersService.create(appointmentId, dto);
  }

  @Delete(':reminderId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a reminder' })
  @ApiResponse({ status: 204, description: 'Reminder deleted' })
  @ApiResponse({ status: 404, description: 'Reminder not found' })
  remove(
    @Param('appointmentId') appointmentId: string,
    @Param('reminderId') reminderId: string,
  ): Promise<void> {
    return this.remindersService.remove(appointmentId, reminderId);
  }
}
