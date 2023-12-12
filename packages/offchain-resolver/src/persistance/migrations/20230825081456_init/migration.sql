-- CreateTable
CREATE TABLE "ProfileContainer" (
    "id" UUID NOT NULL,
    "nameHash" TEXT NOT NULL,
    "profile" JSONB NOT NULL,
    "ensName" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "ProfileContainer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alias" (
    "id" UUID NOT NULL,
    "profileContainerId" UUID NOT NULL,
    "alias" TEXT NOT NULL,

    CONSTRAINT "Alias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProfileContainer_nameHash_key" ON "ProfileContainer"("nameHash");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileContainer_ensName_key" ON "ProfileContainer"("ensName");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileContainer_address_key" ON "ProfileContainer"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Alias_profileContainerId_key" ON "Alias"("profileContainerId");

-- CreateIndex
CREATE UNIQUE INDEX "Alias_alias_key" ON "Alias"("alias");

-- AddForeignKey
ALTER TABLE "Alias" ADD CONSTRAINT "Alias_profileContainerId_fkey" FOREIGN KEY ("profileContainerId") REFERENCES "ProfileContainer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
