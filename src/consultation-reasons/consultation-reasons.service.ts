import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConsultationReasonsService {
  constructor(private readonly prisma: PrismaService) {}

  listActive() {
    return this.prisma.consultationReason.findMany({
      where: { isActive: true },
      orderBy: { reasonText: 'asc' },
    });
  }
}
