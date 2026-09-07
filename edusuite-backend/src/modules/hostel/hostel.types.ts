export interface HostelDashboardMetrics {
  students: {
    total: number;
    active: number;
    onLeave: number;
    suspended: number;
  };
  rooms: {
    total: number;
    occupied: number;
    vacant: number;
    maintenance: number;
    occupancyRate: string;
    vacancyRate: string;
  };
  outing: {
    pending: number;
    approved: number;
    activeOut: number;
  };
  attendance: {
    inside: number;
    outside: number;
  };
  violations: {
    today: number;
    unresolved: number;
  };
  blocksSummary: {
    id: string;
    name: string;
    code: string;
    type: string;
    letter: string;
    totalCapacity: number;
    occupied: number;
    vacant: number;
    maintenance: number;
    vacancyRate: string;
    isRedRate: boolean;
  }[];
}

export interface CreateBlockDTO {
  blockName: string;
  type: "Boys Hostel" | "Girls Hostel";
  totalCapacity: number;
}

export interface CreateAllocationDTO {
  studentName: string;
  rollNumber: string;
  blockId: string;
  floorId: string;
  roomId: string;
  bedId: string;
  allocatedBy?: string;
}

export interface CreateOutingDTO {
  studentName: string;
  studentId: string;
  destination?: string;
  fromDate: string;
  toDate: string;
  reason: string;
}

export interface ScanAttendanceDTO {
  studentName: string;
  userId: string;
  blockName?: string;
  floorName?: string;
  roomNumber?: string;
  deviceName?: string;
  eventType: "CHECK-IN" | "CHECK-OUT";
  method: "Fingerprint" | "RFID" | "Face" | "Manual";
}

export interface CreateGuestBillDTO {
  guestName: string;
  contactNumber: string;
  purpose: string;
  fromDate: string;
  toDate: string;
  roomCharges: number;
  messCharges: number;
  extraCharges?: number;
}

export interface CreateLeaveDTO {
  studentName: string;
  studentId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface CreateRegistrationDTO {
  fullName: string;
  registrationNumber: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup?: string;
  profilePhoto?: string;
  permanentAddress: string;
  city: string;
  district?: string;
  state: string;
  pincode: string;
  mobileNumber: string;
  alternateNumber?: string;
  email: string;
  parentName: string;
  parentContact: string;
  parentEmail?: string;
  guardianName?: string;
  guardianMobileNumber?: string;
  guardianEmail?: string;
  emergencyContact: string;
  college?: string;
  course: string;
  department: string;
  yearOfStudy: string;
  semester: string;
  section?: string;
  admissionNumber?: string;
  medicalConditions?: string;
  allergies?: string;
  emergencyMedicalInfo?: string;
  specialRequirements?: string;
  medications?: string;
  hostelRequired?: boolean;
  preferredBlock?: string;
  roomTypePreference?: string;
  specialAccommodationReq?: string;
  preferredRoomId?: string;
  agreeTerms?: boolean;
}

export interface AllocateRegistrationDTO {
  blockId: string;
  floorId: string;
  roomId: string;
  bedId: string;
  blockName?: string;
  floorName?: string;
  roomNumber?: string;
  bedNumber?: string;
  allocatedBy?: string;
}
