-- CreateTable
CREATE TABLE "patient_data_sharing" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "specialist_id" TEXT NOT NULL,
    "share_mood_logs" BOOLEAN NOT NULL DEFAULT false,
    "share_assessments" BOOLEAN NOT NULL DEFAULT false,
    "share_pregnancy_data" BOOLEAN NOT NULL DEFAULT false,
    "share_postpartum_data" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_data_sharing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinical_notes" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "specialist_id" TEXT NOT NULL,
    "patient_user_id" TEXT NOT NULL,
    "note_text" TEXT NOT NULL,
    "session_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinical_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patient_data_sharing_user_id_specialist_id_key" ON "patient_data_sharing"("user_id", "specialist_id");

-- CreateIndex
CREATE INDEX "clinical_notes_specialist_id_patient_user_id_idx" ON "clinical_notes"("specialist_id", "patient_user_id");

-- CreateIndex
CREATE INDEX "clinical_notes_booking_id_idx" ON "clinical_notes"("booking_id");

-- AddForeignKey
ALTER TABLE "patient_data_sharing" ADD CONSTRAINT "patient_data_sharing_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_data_sharing" ADD CONSTRAINT "patient_data_sharing_specialist_id_fkey" FOREIGN KEY ("specialist_id") REFERENCES "specialists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_specialist_id_fkey" FOREIGN KEY ("specialist_id") REFERENCES "specialists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_patient_user_id_fkey" FOREIGN KEY ("patient_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
