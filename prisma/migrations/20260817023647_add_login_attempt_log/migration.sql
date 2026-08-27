-- CreateTable
CREATE TABLE "login_attempt_logs" (
    "id" TEXT NOT NULL,
    "phone_hash" TEXT NOT NULL,
    "ip" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_attempt_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "login_attempt_logs_phone_hash_idx" ON "login_attempt_logs"("phone_hash");

-- CreateIndex
CREATE INDEX "login_attempt_logs_created_at_idx" ON "login_attempt_logs"("created_at");
