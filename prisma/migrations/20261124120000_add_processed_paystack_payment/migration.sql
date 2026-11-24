CREATE TABLE "ProcessedPaystackPayment" (
  "reference" TEXT NOT NULL,
  "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProcessedPaystackPayment_pkey" PRIMARY KEY ("reference")
);
