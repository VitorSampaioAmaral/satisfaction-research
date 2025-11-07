-- CreateTable
CREATE TABLE "public"."survey_configs" (
    "id" TEXT NOT NULL,
    "customId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#3b82f6',
    "secondaryColor" TEXT NOT NULL DEFAULT '#8b5cf6',
    "backgroundColor" TEXT NOT NULL DEFAULT '#ffffff',
    "textColor" TEXT NOT NULL DEFAULT '#1f2937',
    "accentColor" TEXT NOT NULL DEFAULT '#10b981',
    "chartType" TEXT NOT NULL DEFAULT 'bar',
    "chartColors" TEXT NOT NULL,
    "showLegend" BOOLEAN NOT NULL DEFAULT true,
    "showGrid" BOOLEAN NOT NULL DEFAULT true,
    "animationEnabled" BOOLEAN NOT NULL DEFAULT true,
    "userPassword" TEXT,
    "adminPassword" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,

    CONSTRAINT "survey_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."custom_questions" (
    "id" SERIAL NOT NULL,
    "configId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."custom_survey_responses" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_survey_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."custom_question_responses" (
    "id" TEXT NOT NULL,
    "surveyResponseId" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "custom_question_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "survey_configs_customId_key" ON "public"."survey_configs"("customId");

-- CreateIndex
CREATE UNIQUE INDEX "custom_questions_configId_order_key" ON "public"."custom_questions"("configId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "custom_question_responses_surveyResponseId_questionId_key" ON "public"."custom_question_responses"("surveyResponseId", "questionId");

-- AddForeignKey
ALTER TABLE "public"."custom_questions" ADD CONSTRAINT "custom_questions_configId_fkey" FOREIGN KEY ("configId") REFERENCES "public"."survey_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."custom_survey_responses" ADD CONSTRAINT "custom_survey_responses_configId_fkey" FOREIGN KEY ("configId") REFERENCES "public"."survey_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."custom_survey_responses" ADD CONSTRAINT "custom_survey_responses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."custom_question_responses" ADD CONSTRAINT "custom_question_responses_surveyResponseId_fkey" FOREIGN KEY ("surveyResponseId") REFERENCES "public"."custom_survey_responses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."custom_question_responses" ADD CONSTRAINT "custom_question_responses_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."custom_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
