-- CreateTable
CREATE TABLE "orb_employee" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT,
    "description" TEXT,
    "phone" TEXT,
    "mobile" TEXT,
    "address" TEXT,
    "hireDate" TIMESTAMP(3),
    "fireDate" TIMESTAMP(3),
    "birthDate" TIMESTAMP(3),
    "photoUrl" TEXT,
    "isActivated" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orb_employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orb_permission" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isWrite" BOOLEAN NOT NULL DEFAULT false,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orb_permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orb_employee_permission_map" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL,
    "grantedById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orb_employee_permission_map_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orb_employee_email_key" ON "orb_employee"("email");

-- AddForeignKey
ALTER TABLE "orb_employee_permission_map" ADD CONSTRAINT "orb_employee_permission_map_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "orb_employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orb_employee_permission_map" ADD CONSTRAINT "orb_employee_permission_map_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "orb_permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orb_employee_permission_map" ADD CONSTRAINT "orb_employee_permission_map_grantedById_fkey" FOREIGN KEY ("grantedById") REFERENCES "orb_employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
