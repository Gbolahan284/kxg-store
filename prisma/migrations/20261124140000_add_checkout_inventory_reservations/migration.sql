CREATE TABLE "PendingPaystackCheckout" (
  "reference" TEXT NOT NULL,
  "items" JSONB NOT NULL,
  "amountKobo" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PendingPaystackCheckout_pkey" PRIMARY KEY ("reference")
);

CREATE INDEX "PendingPaystackCheckout_status_expiresAt_idx"
  ON "PendingPaystackCheckout"("status", "expiresAt");
