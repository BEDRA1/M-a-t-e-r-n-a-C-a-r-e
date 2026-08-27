import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Render (وأي PaaS مشابه) يمرّر الطلبات عبر بروكسي عكسي واحد — بدون هذا الإعداد يقرأ Express
  // عنوان IP البروكسي الداخلي نفسه لكل الزوّار، فيرى ThrottlerGuard (المعتمِد على req.ip
  // افتراضيًا) كل مستخدمي الموقع كعميل واحد ويُطبَّق حد التسجيل/الدخول تراكميًا عليهم مجتمعين
  // بدل كل شخص على حدة — هذا هو السبب الجذري الحقيقي لرسالة "تجاوزت الحد المسموح" المتكررة،
  // لا ضيق الحدود نفسها. trust proxy=1 يجعل Express يثق بأول قفزة بروكسي فقط (X-Forwarded-For)
  // ويستخرج عنوان IP الزائر الحقيقي، فيعمل الحد بشكل صحيح لكل مستخدم على حدة كما صُمِّم أصلًا
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.use(
    helmet({
      // 'unsafe-inline' على scriptSrc/styleSrc ضروري لـNext.js (hydration inline + Google
      // Fonts القادمة عبر next/font)؛ هذا CSP يحمي استجابات الـAPI نفسها (JSON عادة، لا HTML)
      // لا صفحات الفرونت إند — تلك محمية بهيدرز منفصلة في next.config.ts
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
          fontSrc: ["'self'", 'fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'images.unsplash.com', 'source.unsplash.com'],
          connectSrc: ["'self'"],
        },
      },
      hsts: { maxAge: 31536000, includeSubDomains: true },
      frameguard: { action: 'deny' },
      noSniff: true,
      xssFilter: true,
    }),
  );

  const frontendUrl = process.env.FRONTEND_URL;
  app.enableCors({
    origin: [
      'http://localhost:3001',
      ...(frontendUrl && frontendUrl !== 'http://localhost:3001' ? [frontendUrl] : []),
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Materna Care API')
    .setDescription('منصة أم وأمان — Phase 1: Auth, Family Linking, Pregnancy, Reminders')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
