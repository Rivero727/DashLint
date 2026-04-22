-- CreateTable
CREATE TABLE "submissions" (
    "submit_id" SERIAL NOT NULL,
    "submit_name" VARCHAR(150) NOT NULL,
    "client_name" VARCHAR(100) NOT NULL,
    "company_name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("submit_id")
);

-- CreateTable
CREATE TABLE "submissions_files" (
    "file_id" SERIAL NOT NULL,
    "file_name" VARCHAR(150) NOT NULL,
    "file_path" VARCHAR(350) NOT NULL,
    "file_size" INTEGER,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submit_id" INTEGER NOT NULL,

    CONSTRAINT "submissions_files_pkey" PRIMARY KEY ("file_id")
);

-- CreateIndex
CREATE INDEX "submissions_user_id_idx" ON "submissions"("user_id");

-- CreateIndex
CREATE INDEX "submissions_files_submit_id_idx" ON "submissions_files"("submit_id");

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions_files" ADD CONSTRAINT "submissions_files_submit_id_fkey" FOREIGN KEY ("submit_id") REFERENCES "submissions"("submit_id") ON DELETE CASCADE ON UPDATE CASCADE;
