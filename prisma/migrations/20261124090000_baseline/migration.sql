CREATE TABLE "Product" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "price" DOUBLE PRECISION NOT NULL,
  "category" TEXT NOT NULL,
  "image" TEXT NOT NULL,
  "hoverImage" TEXT,
  "isFeatured" BOOLEAN NOT NULL DEFAULT true,
  "inStock" BOOLEAN NOT NULL DEFAULT true,
  "sizes" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "NewsletterSubscriber" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");
