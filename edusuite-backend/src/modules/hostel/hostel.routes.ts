import { Router } from "express";
import { HostelController } from "./hostel.controller";

const router = Router();

// Dashboard
router.get("/dashboard", HostelController.getDashboard);

// Blocks
router.get("/blocks", HostelController.getBlocks);
router.post("/blocks", HostelController.createBlock);
router.delete("/blocks/:id", HostelController.deleteBlock);

// Floors & Rooms
router.get("/blocks/:blockId/floors", HostelController.getFloors);

// Allocations & Room Assignment Flow
router.get("/allocations", HostelController.getAllocations);
router.post("/allocations", HostelController.createAllocation);
router.get("/allocations/:studentId", HostelController.getStudentAllocationHistory);
router.get("/room-allocation/pending", HostelController.getPendingRegistrations);
router.post("/room-allocation", HostelController.allocateRegistration);
router.get("/room-allocation/:studentId", HostelController.getStudentAllocationHistory);

// Users (Strictly Student Users)
router.get("/users", HostelController.getUsers);
router.get("/users/students", HostelController.getUsers);
router.post("/users", HostelController.createStudentUser);
router.post("/users/:id/reset-password", HostelController.resetStudentPassword);
router.post("/users/:id/deallocate-room", HostelController.deallocateStudentRoom);

// Guest Billing
router.get("/bills", HostelController.getGuestBills);
router.post("/bills", HostelController.createGuestBill);

// Leaves & Suspensions
router.get("/leaves", HostelController.getLeaves);
router.post("/leaves", HostelController.createLeave);
router.get("/suspensions", HostelController.getSuspensions);

// Devices
router.get("/devices", HostelController.getDevices);

// Presence, Gate Logs & Violations
router.get("/gate-logs", HostelController.getAllMovementLogs);
router.get("/gate-logs/:id", HostelController.getGateLogById);
router.post("/gate-logs", HostelController.recordMovement);

router.get("/violations", HostelController.getMovementViolations);
router.get("/violations/:id", HostelController.getViolationById);
router.patch("/violations/:id/review", HostelController.reviewViolation);
router.patch("/violations/:id/resolve", HostelController.resolveViolation);

// Student Registrations & Online Application Flow
router.get("/registrations", HostelController.getRegistrations);
router.get("/registrations/pending", HostelController.getPendingRegistrations);
router.get("/registrations/:id", HostelController.getRegistrationById);
router.post("/registrations", HostelController.createRegistration);
router.post("/registrations/:id/allocate", HostelController.allocateRegistration);
router.patch("/registrations/:id/status", HostelController.rejectRegistration);

export default router;
