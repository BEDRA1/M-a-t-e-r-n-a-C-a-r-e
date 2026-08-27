import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AppException } from '../common/exceptions/app.exception';
import { SpecialistPatientsService } from './specialist-patients.service';
import { CreateClinicalNoteDto } from './dto/create-clinical-note.dto';
import { UpdateClinicalNoteDto } from './dto/update-clinical-note.dto';

@Injectable()
export class ClinicalNotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly patientsService: SpecialistPatientsService,
  ) {}

  async create(specialistUserId: string, dto: CreateClinicalNoteDto) {
    const specialist = await this.patientsService.getSpecialistOrThrow(specialistUserId);
    const booking = await this.prisma.booking.findUnique({ where: { id: dto.bookingId } });
    if (!booking) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'الحجز غير موجود',
        en: 'Booking not found',
      });
    }
    // تحقّق صريح أن الحجز فعلًا يخص هذه الأخصائية — لا يُعتمَد على أي شيء يرسله العميل
    if (booking.specialistId !== specialist.id) {
      throw new AppException(HttpStatus.FORBIDDEN, {
        ar: 'لا يمكنك إضافة ملاحظة على حجز ليس لك',
        en: 'You cannot add a note on a booking that is not yours',
      });
    }

    return this.prisma.clinicalNote.create({
      data: {
        bookingId: booking.id,
        specialistId: specialist.id,
        patientUserId: booking.userId,
        noteText: dto.noteText,
        sessionDate: new Date(dto.sessionDate),
      },
    });
  }

  async listForPatient(specialistUserId: string, patientUserId: string) {
    const specialist = await this.patientsService.getSpecialistOrThrow(specialistUserId);
    await this.patientsService.assertCanAccessPatient(specialist.id, patientUserId);
    return this.prisma.clinicalNote.findMany({
      where: { specialistId: specialist.id, patientUserId },
      orderBy: { sessionDate: 'desc' },
    });
  }

  async update(specialistUserId: string, noteId: string, dto: UpdateClinicalNoteDto) {
    const specialist = await this.patientsService.getSpecialistOrThrow(specialistUserId);
    const note = await this.prisma.clinicalNote.findUnique({ where: { id: noteId } });
    if (!note) {
      throw new AppException(HttpStatus.NOT_FOUND, {
        ar: 'الملاحظة غير موجودة',
        en: 'Note not found',
      });
    }
    if (note.specialistId !== specialist.id) {
      throw new AppException(HttpStatus.FORBIDDEN, {
        ar: 'فقط الأخصائية صاحبة الملاحظة يمكنها تعديلها',
        en: 'Only the specialist who wrote this note can edit it',
      });
    }

    return this.prisma.clinicalNote.update({
      where: { id: noteId },
      data: {
        noteText: dto.noteText,
        sessionDate: dto.sessionDate ? new Date(dto.sessionDate) : undefined,
      },
    });
  }
}
