import { Request, Response } from "express";
import { HostelService } from "./hostel.service";

export class HostelController {
  // Dashboard
  static async getDashboard(req: Request, res: Response) {
    try {
      const data = await HostelService.getDashboardMetrics();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Blocks
  static async getBlocks(req: Request, res: Response) {
    try {
      const blocks = await HostelService.getBlocks();
      res.json(blocks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createBlock(req: Request, res: Response) {
    try {
      const block = await HostelService.createBlock(req.body);
      res.status(201).json(block);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deleteBlock(req: Request, res: Response) {
    try {
      const block = await HostelService.deleteBlock(req.params.id);
      res.json(block);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Floors & Rooms
  static async getFloors(req: Request, res: Response) {
    try {
      const floors = await HostelService.getFloorsByBlock(req.params.blockId);
      res.json(floors);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Allocations
  static async getAllocations(req: Request, res: Response) {
    try {
      const allocations = await HostelService.getAllocations();
      res.json(allocations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createAllocation(req: Request, res: Response) {
    try {
      const allocation = await HostelService.allocateRoom(req.body);
      res.status(201).json(allocation);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Mess
  static async getMealSlots(req: Request, res: Response) {
    try {
      const slots = await HostelService.getMealSlots();
      res.json(slots);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getMenuSchedule(req: Request, res: Response) {
    try {
      const schedule = await HostelService.getMenuSchedule();
      res.json(schedule);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateMenuSchedule(req: Request, res: Response) {
    try {
      const updated = await HostelService.updateMenuSchedule(req.params.dateString, req.body);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Outings
  static async getOutingRequests(req: Request, res: Response) {
    try {
      const outings = await HostelService.getOutingRequests();
      res.json(outings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createOutingRequest(req: Request, res: Response) {
    try {
      const outing = await HostelService.createOutingRequest(req.body);
      res.status(201).json(outing);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async approveOuting(req: Request, res: Response) {
    try {
      const { role, action, comments } = req.body;
      const updated = await HostelService.approveOuting(req.params.id, role || "WARDEN", action || "APPROVED", comments);
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Attendance & Logs
  static async getAttendanceLogs(req: Request, res: Response) {
    try {
      const logs = await HostelService.getAttendanceLogs();
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async recordAttendanceEvent(req: Request, res: Response) {
    try {
      const event = await HostelService.recordAttendanceEvent(req.body);
      res.status(201).json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Users (Strictly Student Users)
  static async getUsers(req: Request, res: Response) {
    try {
      const users = await HostelService.getUsers();
      res.json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createStudentUser(req: Request, res: Response) {
    try {
      const result = await HostelService.createStudentUser(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async resetStudentPassword(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { password } = req.body;
      const result = await HostelService.resetStudentPassword(id, password);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async deallocateStudentRoom(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await HostelService.deallocateStudentRoom(id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Billing
  static async getGuestBills(req: Request, res: Response) {
    try {
      const bills = await HostelService.getGuestBills();
      res.json(bills);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createGuestBill(req: Request, res: Response) {
    try {
      const bill = await HostelService.createGuestBill(req.body);
      res.status(201).json(bill);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Leaves & Suspensions
  static async getLeaves(req: Request, res: Response) {
    try {
      const leaves = await HostelService.getLeaves();
      res.json(leaves);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createLeave(req: Request, res: Response) {
    try {
      const leave = await HostelService.createLeave(req.body);
      res.status(201).json(leave);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getSuspensions(req: Request, res: Response) {
    try {
      const suspensions = await HostelService.getSuspensions();
      res.json(suspensions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Devices
  static async getDevices(req: Request, res: Response) {
    try {
      const devices = await HostelService.getDevices();
      res.json(devices);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Violations
  static async getViolations(req: Request, res: Response) {
    try {
      const violations = await HostelService.getViolations();
      res.json(violations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Audit Logs
  static async getAuditLogs(req: Request, res: Response) {
    try {
      const logs = await HostelService.getAuditLogs();
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Student Online Registrations
  static async createRegistration(req: Request, res: Response) {
    try {
      const reg = await HostelService.createRegistration(req.body);
      res.status(201).json({ success: true, data: reg });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getRegistrations(req: Request, res: Response) {
    try {
      const status = req.query.status as string | undefined;
      const registrations = await HostelService.getRegistrations(status);
      res.json(registrations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getPendingRegistrations(req: Request, res: Response) {
    try {
      const registrations = await HostelService.getRegistrations("PENDING_ALLOCATION");
      res.json(registrations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getRegistrationById(req: Request, res: Response) {
    try {
      const reg = await HostelService.getRegistrationById(req.params.id);
      res.json(reg);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  static async allocateRegistration(req: Request, res: Response) {
    try {
      const id = req.params.id || req.body.registrationId || req.body.studentId;
      const result = await HostelService.allocateRegistration(id, req.body);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getRoomAllocations(req: Request, res: Response) {
    try {
      const status = (req.query.status as string) || "ACTIVE";
      const allocations = await HostelService.getRoomAllocations(status);
      res.json(allocations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getRoomAllocationHistory(req: Request, res: Response) {
    try {
      const history = await HostelService.getRoomAllocationHistory(req.query);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getStudentAllocationHistory(req: Request, res: Response) {
    try {
      const history = await HostelService.getStudentAllocationHistory(req.params.studentId);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async rejectRegistration(req: Request, res: Response) {
    try {
      const result = await HostelService.rejectRegistration(req.params.id, req.body.reason);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getRegistrationMeta(req: Request, res: Response) {
    try {
      const meta = await HostelService.getRegistrationMeta();
      res.json({ success: true, ...meta });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // ── Presence, Gate Logs & Violation Endpoints ──
  static async getAllMovementLogs(req: Request, res: Response) {
    try {
      const result = await HostelService.getAllMovementLogs(req.query);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getGateLogById(req: Request, res: Response) {
    try {
      const log = await HostelService.getGateLogById(req.params.id);
      res.json({ success: true, data: log });
    } catch (error: any) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  static async getStudentsStillInHostel(req: Request, res: Response) {
    try {
      const students = await HostelService.getStudentsStillInHostel();
      res.json(students);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getOutingStudentsList(req: Request, res: Response) {
    try {
      const students = await HostelService.getOutingStudentsList();
      res.json(students);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getMovementViolations(req: Request, res: Response) {
    try {
      const result = await HostelService.getMovementViolations(req.query);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getViolationById(req: Request, res: Response) {
    try {
      const violation = await HostelService.getViolationById(req.params.id);
      res.json({ success: true, data: violation });
    } catch (error: any) {
      res.status(404).json({ success: false, error: error.message });
    }
  }

  static async getPresenceAnalytics(req: Request, res: Response) {
    try {
      const analytics = await HostelService.getPresenceAnalytics();
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async recordMovement(req: Request, res: Response) {
    try {
      const log = await HostelService.recordMovement(req.body);
      res.status(201).json({ success: true, data: log });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async reviewViolation(req: Request, res: Response) {
    try {
      const result = await HostelService.reviewViolation(req.params.id, req.body.remarks, req.body.reviewedBy);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async resolveViolation(req: Request, res: Response) {
    try {
      const result = await HostelService.resolveViolation(req.params.id, req.body.actionTaken, req.body.remarks, req.body.resolvedBy);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
