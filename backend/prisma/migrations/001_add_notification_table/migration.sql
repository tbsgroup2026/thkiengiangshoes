-- CreateTable Notification
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'INFO',
    "targetUser" TEXT NOT NULL DEFAULT 'ALL',
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex on targetUser
CREATE INDEX "Notification_targetUser_idx" ON "Notification"("targetUser");

-- CreateIndex on type
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex on createdAt
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");
