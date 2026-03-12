-- AlterTable: Workspace에 url, viewports 컬럼 추가
ALTER TABLE "Workspace" ADD COLUMN "url" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Workspace" ADD COLUMN "viewports" JSONB NOT NULL DEFAULT '[]';

-- MigrateData: Room의 url, viewports를 Workspace로 복사
UPDATE "Workspace" w
SET "url" = r."url", "viewports" = r."viewports"
FROM "Room" r
WHERE r."workspaceId" = w."id";

-- DropTable: Room 테이블 삭제
DROP TABLE "Room";
