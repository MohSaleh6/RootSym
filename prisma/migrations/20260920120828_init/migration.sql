-- CreateEnum
CREATE TYPE "EnrollmentType" AS ENUM ('INDIVIDUAL', 'COMPANY');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('PENDING', 'AWAITING_REVIEW', 'PAID', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('STRIPE', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('SCHEDULED', 'OPEN', 'FULL', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "tagline" TEXT NOT NULL,
    "taglineAr" TEXT,
    "summary" TEXT NOT NULL,
    "summaryAr" TEXT,
    "description" TEXT NOT NULL,
    "descriptionAr" TEXT,
    "imageUrl" TEXT,
    "durationHours" INTEGER NOT NULL DEFAULT 8,
    "deliveryMode" TEXT NOT NULL DEFAULT 'Live on Microsoft Teams',
    "level" TEXT NOT NULL DEFAULT 'All levels',
    "languageOfDelivery" TEXT NOT NULL DEFAULT 'English & Arabic',
    "priceIndividual" INTEGER NOT NULL,
    "priceCompany" INTEGER NOT NULL,
    "maxAttendees" INTEGER NOT NULL DEFAULT 15,
    "outcomes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "outcomesAr" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "audience" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "audienceAr" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "tools" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "modules" JSONB NOT NULL DEFAULT '[]',
    "faqs" JSONB NOT NULL DEFAULT '[]',
    "teamsLink" TEXT,
    "accentColor" TEXT NOT NULL DEFAULT '#2E86AB',
    "icon" TEXT NOT NULL DEFAULT 'target',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseSession" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Amman',
    "teamsLink" TEXT,
    "seatsTotal" INTEGER NOT NULL DEFAULT 15,
    "status" "SessionStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "sessionId" TEXT,
    "type" "EnrollmentType" NOT NULL DEFAULT 'INDIVIDUAL',
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "organisation" TEXT,
    "jobTitle" TEXT,
    "attendees" INTEGER NOT NULL DEFAULT 1,
    "attendeeList" JSONB NOT NULL DEFAULT '[]',
    "message" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'JOD',
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'STRIPE',
    "stripeSessionId" TEXT,
    "stripePaymentId" TEXT,
    "transferReference" TEXT,
    "adminNotes" TEXT,
    "accessToken" TEXT NOT NULL,
    "accessOpenedAt" TIMESTAMP(3),
    "accessRevoked" BOOLEAN NOT NULL DEFAULT false,
    "accessResetCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "organisation" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "handled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- CreateIndex
CREATE INDEX "Course_published_sortOrder_idx" ON "Course"("published", "sortOrder");

-- CreateIndex
CREATE INDEX "CourseSession_courseId_startsAt_idx" ON "CourseSession"("courseId", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_reference_key" ON "Enrollment"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_stripeSessionId_key" ON "Enrollment"("stripeSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_accessToken_key" ON "Enrollment"("accessToken");

-- CreateIndex
CREATE INDEX "Enrollment_status_createdAt_idx" ON "Enrollment"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Enrollment_courseId_idx" ON "Enrollment"("courseId");

-- CreateIndex
CREATE INDEX "ContactMessage_handled_createdAt_idx" ON "ContactMessage"("handled", "createdAt");

-- AddForeignKey
ALTER TABLE "CourseSession" ADD CONSTRAINT "CourseSession_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "CourseSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
