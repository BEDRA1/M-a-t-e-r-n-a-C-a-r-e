import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServicePricingService {
  constructor(private readonly prisma: PrismaService) {}

  listAll() {
    return this.prisma.servicePricing.findMany({
      orderBy: [{ serviceKind: 'asc' }, { consultationType: 'asc' }],
    });
  }
}
