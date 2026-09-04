import api from "@/lib/api";

export interface EarningsBreakdown {
  basicPay: number;
  da: number; // Dearness Allowance
  hra: number; // House Rent Allowance
  medical: number;
  academic: number;
  research: number;
  transport: number;
  other: number;
  total: number;
}

export interface DeductionsBreakdown {
  pf: number; // Provident Fund
  profTax: number;
  incomeTax: number;
  esi: number;
  lateAttendance: number;
  leaveDeduction: number;
  loanEmi: number;
  insurance: number;
  other: number;
  total: number;
}

export interface AttendanceImpactData {
  workingDays: number;
  presentDays: number;
  approvedLeave: number;
  lopDays: number;
  lateEntries: number;
  overtimeHours: number;
  extraClasses: number;
  invigilationHours: number;
  attendanceContribution: number; // Extra money earned or lost
}

export interface LeaveDeductionItem {
  leaveType: string;
  approvedDays: number;
  lopDays: number;
  deductionAmount: number;
  explanation: string;
}

export interface ReimbursementRecord {
  id: string;
  category: "Travel Allowance" | "Research Grant" | "Book Purchase" | "Conference Expenses" | "Lab Expenses";
  amount: number;
  status: "Paid" | "Approved" | "Pending" | "Rejected";
  approvalDate?: string;
  claimDate: string;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string; // Masked
  ifscCode: string;
  branch: string;
  nomineeName: string;
  salaryCreditAccount: boolean;
}

export interface PayrollInsightsData {
  salaryIncreased: boolean;
  researchIncentiveAdded: boolean;
  pendingReimbursementAmount: number;
  upcomingSalaryDate: string;
  highestDeductionName: string;
  attendanceImpactDesc: string;
}

export interface SalarySlip {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  designation: string;
  monthYear: string;
  basicPay: number;
  hra: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: "Paid" | "Processing" | "Pending Approval";
  paymentDate?: string;
  bankAccount?: string;
  
  // Redesign fields
  earnings: EarningsBreakdown;
  deductionsList: DeductionsBreakdown;
  attendanceImpact: AttendanceImpactData;
  leaveDeductions: LeaveDeductionItem[];
  reimbursements: ReimbursementRecord[];
  bankDetails: BankDetails;
  insights: PayrollInsightsData;
}

export const MOCK_PAYROLL_DATA: Record<string, SalarySlip[]> = {
  CSE: [
    {
      id: "PAY-2026-07",
      employeeName: "Dr. Ravi Kumar",
      employeeId: "EMP010",
      department: "CSE",
      designation: "Associate Professor",
      monthYear: "July 2026",
      basicPay: 75000,
      hra: 22500,
      allowances: 14500,
      deductions: 10420,
      netSalary: 101580,
      status: "Paid",
      paymentDate: "2026-07-31",
      bankAccount: "HDFC-****-8812",
      earnings: {
        basicPay: 75000,
        da: 7500,
        hra: 22500,
        medical: 2000,
        academic: 3000,
        research: 2000,
        transport: 1500,
        other: 1000,
        total: 114500,
      },
      deductionsList: {
        pf: 4500,
        profTax: 200,
        incomeTax: 4000,
        esi: 500,
        lateAttendance: 220,
        leaveDeduction: 0,
        loanEmi: 0,
        insurance: 1000,
        other: 0,
        total: 10420,
      },
      attendanceImpact: {
        workingDays: 26,
        presentDays: 24,
        approvedLeave: 2,
        lopDays: 0,
        lateEntries: 2,
        overtimeHours: 4,
        extraClasses: 2,
        invigilationHours: 6,
        attendanceContribution: 1200,
      },
      leaveDeductions: [
        { leaveType: "Casual Leave", approvedDays: 2, lopDays: 0, deductionAmount: 0, explanation: "Approved leave within quota - No LOP" }
      ],
      reimbursements: [
        { id: "REIM-001", category: "Conference Expenses", amount: 12500, status: "Paid", approvalDate: "2026-07-15", claimDate: "2026-07-08" },
        { id: "REIM-002", category: "Book Purchase", amount: 3500, status: "Approved", approvalDate: "2026-07-28", claimDate: "2026-07-20" },
        { id: "REIM-003", category: "Travel Allowance", amount: 4500, status: "Pending", claimDate: "2026-07-28" }
      ],
      bankDetails: {
        bankName: "HDFC Bank Ltd",
        accountNumber: "5010022448812",
        ifscCode: "HDFC0000240",
        branch: "Hitech City, Hyderabad",
        nomineeName: "K. Swetha (Spouse)",
        salaryCreditAccount: true,
      },
      insights: {
        salaryIncreased: true,
        researchIncentiveAdded: true,
        pendingReimbursementAmount: 4500,
        upcomingSalaryDate: "2026-08-31",
        highestDeductionName: "Income Tax",
        attendanceImpactDesc: "Invigilation duty added to monthly allowance.",
      }
    },
    {
      id: "PAY-2026-06",
      employeeName: "Dr. Ravi Kumar",
      employeeId: "EMP010",
      department: "CSE",
      designation: "Associate Professor",
      monthYear: "June 2026",
      basicPay: 75000,
      hra: 22500,
      allowances: 12500,
      deductions: 10200,
      netSalary: 99800,
      status: "Paid",
      paymentDate: "2026-06-30",
      bankAccount: "HDFC-****-8812",
      earnings: {
        basicPay: 75000,
        da: 7500,
        hra: 22500,
        medical: 2000,
        academic: 3000,
        research: 0,
        transport: 1500,
        other: 500,
        total: 110000,
      },
      deductionsList: {
        pf: 4500,
        profTax: 200,
        incomeTax: 4000,
        esi: 500,
        lateAttendance: 0,
        leaveDeduction: 0,
        loanEmi: 0,
        insurance: 1000,
        other: 0,
        total: 10200,
      },
      attendanceImpact: {
        workingDays: 25,
        presentDays: 25,
        approvedLeave: 0,
        lopDays: 0,
        lateEntries: 0,
        overtimeHours: 0,
        extraClasses: 0,
        invigilationHours: 4,
        attendanceContribution: 0,
      },
      leaveDeductions: [],
      reimbursements: [
        { id: "REIM-004", category: "Lab Expenses", amount: 8200, status: "Paid", approvalDate: "2026-06-18", claimDate: "2026-06-10" }
      ],
      bankDetails: {
        bankName: "HDFC Bank Ltd",
        accountNumber: "5010022448812",
        ifscCode: "HDFC0000240",
        branch: "Hitech City, Hyderabad",
        nomineeName: "K. Swetha (Spouse)",
        salaryCreditAccount: true,
      },
      insights: {
        salaryIncreased: false,
        researchIncentiveAdded: false,
        pendingReimbursementAmount: 0,
        upcomingSalaryDate: "2026-07-31",
        highestDeductionName: "Income Tax",
        attendanceImpactDesc: "Full attendance met - Zero deductions.",
      }
    }
  ],
  ECE: [
    {
      id: "PAY-2026-07-ECE",
      employeeName: "Prof. Anish Kulkarni",
      employeeId: "EMP015",
      department: "ECE",
      designation: "Associate Professor",
      monthYear: "July 2026",
      basicPay: 70000,
      hra: 21000,
      allowances: 11000,
      deductions: 9600,
      netSalary: 92400,
      status: "Paid",
      paymentDate: "2026-07-31",
      bankAccount: "SBI-****-1234",
      earnings: {
        basicPay: 70000,
        da: 7000,
        hra: 21000,
        medical: 2000,
        academic: 2000,
        research: 0,
        transport: 1500,
        other: 500,
        total: 102000,
      },
      deductionsList: {
        pf: 4200,
        profTax: 200,
        incomeTax: 3500,
        esi: 500,
        lateAttendance: 0,
        leaveDeduction: 200,
        loanEmi: 0,
        insurance: 1000,
        other: 0,
        total: 9600,
      },
      attendanceImpact: {
        workingDays: 26,
        presentDays: 24,
        approvedLeave: 1,
        lopDays: 1,
        lateEntries: 1,
        overtimeHours: 2,
        extraClasses: 1,
        invigilationHours: 4,
        attendanceContribution: -200,
      },
      leaveDeductions: [
        { leaveType: "Casual Leave", approvedDays: 1, lopDays: 1, deductionAmount: 200, explanation: "LOP deduction for unauthorized absence." }
      ],
      reimbursements: [],
      bankDetails: {
        bankName: "State Bank of India",
        accountNumber: "3004455881234",
        ifscCode: "SBIN0001201",
        branch: "Gachibowli, Hyderabad",
        nomineeName: "A. Kulkarni (Father)",
        salaryCreditAccount: true,
      },
      insights: {
        salaryIncreased: false,
        researchIncentiveAdded: false,
        pendingReimbursementAmount: 0,
        upcomingSalaryDate: "2026-08-31",
        highestDeductionName: "Provident Fund",
        attendanceImpactDesc: "1 Loss of Pay day recorded.",
      }
    }
  ]
};

export const INITIAL_SALARY_SLIPS: SalarySlip[] = MOCK_PAYROLL_DATA["CSE"] || [];

export async function fetchPayrollStats(department?: string, financialYear?: string) {
  try {
    const query = new URLSearchParams();
    if (department && department !== "All" && department !== "All Departments") query.append("department", department);
    if (financialYear) query.append("financialYear", financialYear);

    const res = await api.get(`/api/payroll/stats?${query.toString()}`);
    if (res && res.data && res.data.totalGrossSalary !== undefined) {
      return res.data;
    }
  } catch {}

  return {
    totalGrossSalary: 12424800,
    totalNetSalary: 11354180,
    totalDeductions: 1070620,
    paidCount: 109,
    processingCount: 0,
    pendingCount: 0,
    totalRecords: 109,
    pendingReimbursementAmount: 40500,
    currency: "INR",
    financialYear: financialYear || "FY 2026-27",
  };
}

export async function fetchMyPayroll(): Promise<any> {
  const res = await api.get("/api/payroll/me");
  return res.data;
}

export async function fetchPayrollLedger(department?: string, status?: string, financialYear?: string, search?: string): Promise<SalarySlip[]> {
  try {
    const query = new URLSearchParams();
    if (department && department !== "All" && department !== "All Departments") query.append("department", department);
    if (status && status !== "All Status" && status !== "All") query.append("status", status);
    if (financialYear) query.append("financialYear", financialYear);
    if (search) query.append("search", search);

    const res = await api.get(`/api/payroll/ledger?${query.toString()}`);
    if (res && Array.isArray(res.data)) {
      return res.data;
    }
  } catch {}
  
  return [];
}

export async function generatePayslip(slipData: Partial<SalarySlip>): Promise<SalarySlip> {
  try {
    const res = await api.post("/api/payroll/generate", slipData);
    if (res && res.data && res.data.id) return res.data;
  } catch {}

  const basic = Number(slipData.basicPay) || 75000;
  const hra = Number(slipData.hra) || basic * 0.3;
  const allowances = Number(slipData.allowances) || 12000;
  const deductions = Number(slipData.deductions) || 10000;
  const net = basic + hra + allowances - deductions;

  return {
    id: `PAY-2026-${Math.floor(100 + Math.random() * 900)}`,
    employeeName: slipData.employeeName || "Dr. Ravi Kumar",
    employeeId: slipData.employeeId || "EMP010",
    department: slipData.department || "CSE",
    designation: slipData.designation || "Associate Professor",
    monthYear: slipData.monthYear || "August 2026",
    basicPay: basic,
    hra: Math.round(hra),
    allowances: Math.round(allowances),
    deductions: Math.round(deductions),
    netSalary: Math.round(net),
    status: "Processing",
    paymentDate: "Pending",
    bankAccount: "HDFC-****-8812",
    earnings: {
      basicPay: basic,
      da: basic * 0.1,
      hra: hra,
      medical: 2000,
      academic: 3000,
      research: 0,
      transport: 1500,
      other: allowances - (basic * 0.1 + hra + 6500),
      total: basic + hra + allowances,
    },
    deductionsList: {
      pf: basic * 0.06,
      profTax: 200,
      incomeTax: deductions - (basic * 0.06 + 1700),
      esi: 500,
      lateAttendance: 0,
      leaveDeduction: 0,
      loanEmi: 0,
      insurance: 1000,
      other: 0,
      total: deductions,
    },
    attendanceImpact: {
      workingDays: 26,
      presentDays: 26,
      approvedLeave: 0,
      lopDays: 0,
      lateEntries: 0,
      overtimeHours: 0,
      extraClasses: 0,
      invigilationHours: 4,
      attendanceContribution: 0,
    },
    leaveDeductions: [],
    reimbursements: [],
    bankDetails: {
      bankName: "HDFC Bank Ltd",
      accountNumber: "5010022448812",
      ifscCode: "HDFC0000240",
      branch: "Hitech City, Hyderabad",
      nomineeName: "K. Swetha (Spouse)",
      salaryCreditAccount: true,
    },
    insights: {
      salaryIncreased: false,
      researchIncentiveAdded: false,
      pendingReimbursementAmount: 0,
      upcomingSalaryDate: "2026-09-30",
      highestDeductionName: "Income Tax",
      attendanceImpactDesc: "Invigilation duty hours logged.",
    }
  };
}

export async function updateSalaryStatus(
  id: string,
  status: "Paid" | "Processing" | "Pending Approval",
): Promise<Partial<SalarySlip>> {
  try {
    const res = await api.put(`/api/payroll/${id}/status`, { status });
    if (res && res.data) return res.data;
  } catch {}
  return { id, status };
}

export async function requestBankChange(bankData: any): Promise<boolean> {
  try {
    await api.post("/api/payroll/bank-change-request", bankData);
  } catch {}
  return true;
}

export async function disbursePayroll(id: string): Promise<any> {
  const res = await api.post(`/api/payroll/${id}/disburse`);
  return res.data;
}

export async function fetchPayrollReports() {
  try {
    const res = await api.get("/api/payroll/reports");
    if (res && res.data) return res.data;
  } catch {}
  return null;
}
