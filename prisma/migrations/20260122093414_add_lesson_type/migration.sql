-- CreateEnum
CREATE TYPE "LessonType" AS ENUM ('video', 'article', 'audio');

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "type" "LessonType" NOT NULL DEFAULT 'video',
ADD COLUMN     "videoProvider" TEXT;
