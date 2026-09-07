-- =============================================================================
-- PostgreSQL Schema for College Hostel Management System (pgAdmin 4)
-- Database Name: hostell
-- =============================================================================

-- 1. Create Enums (if applicable) or Tables
CREATE TABLE IF NOT EXISTS "HostelBlock" (
    "id" TEXT PRIMARY KEY,
    "blockName" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Boys Hostel',
    "totalCapacity" INTEGER NOT NULL DEFAULT 60,
    "occupied" INTEGER NOT NULL DEFAULT 0,
    "maintenance" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "HostelFloor" (
    "id" TEXT PRIMARY KEY,
    "floorNumber" INTEGER NOT NULL,
    "floorName" TEXT NOT NULL,
    "blockId" TEXT NOT NULL REFERENCES "HostelBlock"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "HostelRoom" (
    "id" TEXT PRIMARY KEY,
    "roomNumber" TEXT NOT NULL,
    "floorId" TEXT NOT NULL REFERENCES "HostelFloor"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL DEFAULT 'AC Double Sharing',
    "capacity" INTEGER NOT NULL DEFAULT 2,
    "occupied" INTEGER NOT NULL DEFAULT 0,
    "pricePerSem" DOUBLE PRECISION NOT NULL DEFAULT 85000,
    "isUnderMaintenance" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "HostelBed" (
    "id" TEXT PRIMARY KEY,
    "bedNumber" TEXT NOT NULL,
    "roomId" TEXT NOT NULL REFERENCES "HostelRoom"("id") ON DELETE CASCADE,
    "isOccupied" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Online Hostel Registration Queue Table
CREATE TABLE IF NOT EXISTS "HostelRegistration" (
    "id" TEXT PRIMARY KEY,
    "fullName" TEXT NOT NULL,
    "registrationNumber" TEXT NOT NULL UNIQUE,
    "dateOfBirth" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "bloodGroup" TEXT,
    "profilePhoto" TEXT,
    "permanentAddress" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    
    -- Contact Details
    "mobileNumber" TEXT NOT NULL,
    "alternateNumber" TEXT,
    "email" TEXT NOT NULL,
    "parentName" TEXT NOT NULL,
    "parentContact" TEXT NOT NULL,
    "parentEmail" TEXT NOT NULL,
    "guardianName" TEXT,
    "guardianMobileNumber" TEXT,
    "guardianEmail" TEXT,
    "emergencyContact" TEXT NOT NULL,
    
    -- Academic Details
    "course" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "yearOfStudy" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    
    -- Medical Disclosures
    "medicalConditions" TEXT,
    "allergies" TEXT,
    "medications" TEXT,
    
    -- Room Preferences & Verification
    "roomTypePreference" TEXT,
    "preferredBlock" TEXT,
    "agreeTerms" BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- Allocation Status Tracking
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "allocatedBlockId" TEXT,
    "allocatedBlockName" TEXT,
    "allocatedFloorId" TEXT,
    "allocatedFloorName" TEXT,
    "allocatedRoomId" TEXT,
    "allocatedRoomNumber" TEXT,
    "allocatedBedId" TEXT,
    "allocatedBedNumber" TEXT,
    "allocatedAt" TIMESTAMP(3),
    "allocatedBy" TEXT,
    "rejectionReason" TEXT,
    
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Initial Sample Blocks for Immediate Testing
INSERT INTO "HostelBlock" ("id", "blockName", "type", "totalCapacity", "occupied", "maintenance", "createdAt", "updatedAt")
VALUES 
('B-1', 'Boys Hostel (Block B)', 'Boys Hostel', 120, 48, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('G-1', 'Girls Hostel (Block G)', 'Girls Hostel', 100, 36, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- 4. Initial Sample Floors
INSERT INTO "HostelFloor" ("id", "floorNumber", "floorName", "blockId", "createdAt", "updatedAt")
VALUES 
('F-1', 1, 'Floor 1 (Ground)', 'B-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('F-2', 2, 'Floor 2', 'B-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('F-G1', 1, 'Floor 1', 'G-1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- 5. Initial Sample Rooms
INSERT INTO "HostelRoom" ("id", "roomNumber", "floorId", "type", "capacity", "occupied", "pricePerSem", "isUnderMaintenance", "createdAt", "updatedAt")
VALUES 
('R-101', '101', 'F-1', 'AC Double Sharing', 2, 1, 85000, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('R-102', '102', 'F-1', 'AC Double Sharing', 2, 0, 85000, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('R-201', '201', 'F-2', 'AC Single Deluxe', 1, 0, 110000, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
