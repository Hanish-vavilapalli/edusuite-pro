import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import {
  Building2,
  Users,
  Wrench,
  FolderArchive,
  LayoutGrid,
  DoorClosed,
  Activity,
  PersonStanding,
  Server,
  Monitor,
  UtensilsCrossed,
  ClipboardList,
  FileClock,
  IdCard,
  Ban,
  Bell,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Plus,
  Search,
  Download,
  Eye,
  QrCode,
  Printer,
  RefreshCw,
  Sliders,
  Send,
  UserPlus,
  ShieldCheck,
  Coffee,
  Receipt,
  User,
  Phone,
  Radio,
  Wifi,
  Key,
  KeyRound,
  Check,
  X,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  CalendarCheck,
  Bookmark,
  Filter,
  Trash2,
  Edit2,
  Clock,
  CheckSquare,
  FileText,
  FileSpreadsheet,
  FileDown,
  Lock,
  MinusCircle,
  XCircle,
  Calendar,
  History,
  Sparkles,
  CreditCard,
  UserCheck,
  BadgeIndianRupee,
  Bed,
  Building,
  ExternalLink,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  HostelService,
  DashboardMetricsResponse,
  HostelRegistrationApplicant,
  INITIAL_REGISTRATIONS,
} from "./HostelService";


// ── 1. Blocks Dataset ──
interface CampusBlock {
  id: string;
  name: string;
  type: "Boys Hostel" | "Girls Hostel";
  letter: "B" | "G";
  totalCapacity: number;
  occupied: number;
  vacant: number;
  maintenance: number;
  vacancyRate: string;
  isRedRate: boolean;
}

const INITIAL_CAMPUS_BLOCKS: CampusBlock[] = [
  { id: "B1", name: "Boys-Block-A", type: "Boys Hostel", letter: "B", totalCapacity: 60, occupied: 60, vacant: 0, maintenance: 0, vacancyRate: "0%", isRedRate: true },
  { id: "B2", name: "Boys-Block-B", type: "Boys Hostel", letter: "B", totalCapacity: 61, occupied: 33, vacant: 28, maintenance: 0, vacancyRate: "45.9%", isRedRate: false },
  { id: "B3", name: "Boys-Block-C", type: "Boys Hostel", letter: "B", totalCapacity: 32, occupied: 10, vacant: 22, maintenance: 0, vacancyRate: "68.8%", isRedRate: false },
  { id: "B4", name: "Boys-Block-D", type: "Boys Hostel", letter: "B", totalCapacity: 48, occupied: 18, vacant: 30, maintenance: 0, vacancyRate: "62.5%", isRedRate: false },
  { id: "G1", name: "Girls-Block-A", type: "Girls Hostel", letter: "G", totalCapacity: 170, occupied: 30, vacant: 140, maintenance: 0, vacancyRate: "82.4%", isRedRate: false },
  { id: "G2", name: "Girls-Block-B", type: "Girls Hostel", letter: "G", totalCapacity: 169, occupied: 80, vacant: 89, maintenance: 0, vacancyRate: "52.7%", isRedRate: false },
];

// ── 2. Outing Requests Dataset ──
interface CampusOutingRequest {
  id: string;
  studentName: string;
  studentId: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "OUT";
  parentApproval: "PENDING" | "APPROVED" | "REJECTED";
  requestedAt: string;
}

const INITIAL_OUTINGS: CampusOutingRequest[] = [
  { id: "OUT-01", studentName: "Sivaparvathi Gunturu", studentId: "24331A1249", fromDate: "2026-08-26 21:04", toDate: "2026-08-27 09:04", reason: "Going with friends", status: "PENDING", parentApproval: "PENDING", requestedAt: "2026-08-24 21:04" },
  { id: "OUT-02", studentName: "Shriya Choudhury", studentId: "24331A4756", fromDate: "2026-08-22 13:00", toDate: "2026-08-23 13:00", reason: "Medical", status: "PENDING", parentApproval: "PENDING", requestedAt: "2026-08-21 16:38" },
  { id: "OUT-03", studentName: "Yashaswini Naga Bhavani Saripella", studentId: "24331A07D0", fromDate: "2026-08-20 12:00", toDate: "2026-08-20 17:00", reason: "Birthday celebration", status: "PENDING", parentApproval: "PENDING", requestedAt: "2026-08-19 09:42" },
  { id: "OUT-04", studentName: "NAKKA SUPRIYA", studentId: "23331A0782", fromDate: "2026-08-17 11:00", toDate: "2026-08-17 19:00", reason: "Family function", status: "PENDING", parentApproval: "PENDING", requestedAt: "2026-08-09 08:01" },
  { id: "OUT-05", studentName: "Jahnavi Tatikella", studentId: "23331A0162", fromDate: "2026-08-15 08:00", toDate: "2026-08-15 15:00", reason: "My family is in hospital, I wanna visit them", status: "PENDING", parentApproval: "PENDING", requestedAt: "2026-08-14 13:19" },
  { id: "OUT-06", studentName: "Bhanu kavya sri mudedla", studentId: "24331A1269", fromDate: "2026-08-09 18:19", toDate: "2026-08-09 20:19", reason: "Shopping with parents", status: "PENDING", parentApproval: "PENDING", requestedAt: "2026-08-08 18:19" },
  { id: "OUT-07", studentName: "Reddi Janaki Ramalakshmi", studentId: "24331A04F5", fromDate: "2026-08-09 16:00", toDate: "2026-08-09 22:00", reason: "Shopping with family", status: "PENDING", parentApproval: "PENDING", requestedAt: "2026-08-08 15:17" },
  { id: "OUT-08", studentName: "MARNI SASHI BINDHU VEERA KALA", studentId: "24331A0496", fromDate: "2026-08-09 09:30", toDate: "2026-08-09 14:30", reason: "Temple visit, local outing", status: "PENDING", parentApproval: "PENDING", requestedAt: "2026-08-08 20:51" },
  { id: "OUT-09", studentName: "Jeevitha gorrypotti", studentId: "23331A0446", fromDate: "2026-08-09 08:00", toDate: "2026-08-09 13:00", reason: "Family event", status: "PENDING", parentApproval: "PENDING", requestedAt: "2026-08-08 20:51" },
];

// ── 3. Mess Datasets ──
interface MessMealTiming {
  id?: string;
  name: string;
  time: string;
  status: "Active" | "Inactive";
  capacity?: number;
  menuSummary?: string;
}

const INITIAL_MEALS: MessMealTiming[] = [
  { id: "M-1", name: "Breakfast", time: "07:30 - 09:15", status: "Active", capacity: 550, menuSummary: "Idli, Vada, Sambhar, Chutney, Tea & Coffee" },
  { id: "M-2", name: "Lunch", time: "12:00 - 15:30", status: "Active", capacity: 600, menuSummary: "Steamed Rice, Paneer Curry / Chicken Curry, Dal, Curd, Salad" },
  { id: "M-3", name: "Snacks", time: "16:00 - 18:00", status: "Active", capacity: 450, menuSummary: "Mirchi Bajji / Samosa, Green Chutney, Masala Chai" },
  { id: "M-4", name: "Dinner", time: "19:00 - 22:30", status: "Active", capacity: 580, menuSummary: "Phulka Roti, Dal Tadka, Mix Veg Curry, Jeera Rice, Gulab Jamun" },
];

interface MenuScheduleRow {
  id?: string;
  date: string;
  day: string;
  breakfastNonVeg: boolean;
  lunchNonVeg: boolean;
  snacksNonVeg: boolean;
  dinnerNonVeg: boolean;
  notes: string;
  menuItems?: {
    breakfast?: string;
    lunch?: string;
    snacks?: string;
    dinner?: string;
  };
}

const INITIAL_MENU_SCHEDULE: MenuScheduleRow[] = [
  { date: "26 Aug 2026", day: "Wednesday", breakfastNonVeg: false, lunchNonVeg: true, snacksNonVeg: false, dinnerNonVeg: true, notes: "Special Chicken Biryani for Lunch & Egg Curry for Dinner", menuItems: { breakfast: "Puri Bhaji / Idli", lunch: "Chicken Dum Biryani / Paneer Pulao", snacks: "Mysore Bonda & Tea", dinner: "Egg Curry / Malai Kofta & Roti" } },
  { date: "27 Aug 2026", day: "Thursday", breakfastNonVeg: false, lunchNonVeg: false, snacksNonVeg: false, dinnerNonVeg: false, notes: "Pure Veg Feast - Special Paneer Butter Masala", menuItems: { breakfast: "Masala Dosa & Sambar", lunch: "Paneer Butter Masala, Veg Biryani", snacks: "Corn Chaat & Filter Coffee", dinner: "Dal Makhani, Phulka & Rice" } },
  { date: "28 Aug 2026", day: "Friday", breakfastNonVeg: true, lunchNonVeg: true, snacksNonVeg: false, dinnerNonVeg: false, notes: "Boiled Eggs for Breakfast & Fish Curry / Veg Korma for Lunch", menuItems: { breakfast: "Boiled Eggs / Upma", lunch: "Fish Curry / Veg Kurma", snacks: "Samosa & Green Tea", dinner: "Jeera Rice & Tadka Dal" } },
  { date: "29 Aug 2026", day: "Saturday", breakfastNonVeg: false, lunchNonVeg: false, snacksNonVeg: false, dinnerNonVeg: true, notes: "Special Saturday Dinner - Chicken Kadhai & Ice Cream", menuItems: { breakfast: "Poha & Sprouts", lunch: "Chole Bhature & Jeera Rice", snacks: "Biscuits & Filter Coffee", dinner: "Chicken Kadhai / Shahi Paneer, Ice Cream" } },
  { date: "30 Aug 2026", day: "Sunday", breakfastNonVeg: true, lunchNonVeg: true, snacksNonVeg: false, dinnerNonVeg: true, notes: "Sunday Special Grand Non-Veg & Veg Buffet", menuItems: { breakfast: "Omelette / Uttapam", lunch: "Hyderabadi Mutton/Chicken Biryani", snacks: "Pani Puri & Cold Coffee", dinner: "Butter Chicken / Paneer Tikka" } },
  { date: "31 Aug 2026", day: "Monday", breakfastNonVeg: false, lunchNonVeg: false, snacksNonVeg: false, dinnerNonVeg: false, notes: "Nutritious Start of the Week", menuItems: { breakfast: "Idli & Vada", lunch: "Sambar Rice, Aloo Fry", snacks: "Banana Cake & Tea", dinner: "Methi Roti, Dal Fry & Rice" } },
  { date: "01 Sep 2026", day: "Tuesday", breakfastNonVeg: false, lunchNonVeg: true, snacksNonVeg: false, dinnerNonVeg: false, notes: "Egg Curry / Dum Aloo", menuItems: { breakfast: "Rava Dosa & Chutney", lunch: "Egg Curry / Dum Aloo", snacks: "Veg Puff & Tea", dinner: "Phulka, Dal & Kheer" } },
];

interface MessAttendanceToken {
  id: string;
  tokenNumber: string;
  studentName: string;
  rollNumber: string;
  mealName: string;
  dietPreference: "Vegetarian" | "Non-Vegetarian" | "Special Diet";
  roomNumber: string;
  blockName: string;
  checkedInAt: string;
  status: "SERVED" | "CLAIMED";
}

const INITIAL_MESS_TOKENS: MessAttendanceToken[] = [
  { id: "TKN-1", tokenNumber: "TKN-2608-0421", studentName: "B.vishnu vardhan", rollNumber: "23341M219", mealName: "Lunch", dietPreference: "Non-Vegetarian", roomNumber: "103", blockName: "Boys Hostel", checkedInAt: "26/08/2026, 12:48:15", status: "SERVED" },
  { id: "TKN-2", tokenNumber: "TKN-2608-0422", studentName: "Vadamodula Pravallika", rollNumber: "23331A05I2", mealName: "Lunch", dietPreference: "Vegetarian", roomNumber: "201", blockName: "Girls Hostel", checkedInAt: "26/08/2026, 12:50:30", status: "SERVED" },
  { id: "TKN-3", tokenNumber: "TKN-2608-0423", studentName: "Tarunya Jogi", rollNumber: "23331A0568", mealName: "Lunch", dietPreference: "Non-Vegetarian", roomNumber: "202", blockName: "Girls Hostel", checkedInAt: "26/08/2026, 12:52:10", status: "SERVED" },
  { id: "TKN-4", tokenNumber: "TKN-2608-0424", studentName: "Kakarla Sai Teja", rollNumber: "23331A0482", mealName: "Lunch", dietPreference: "Vegetarian", roomNumber: "104", blockName: "Boys Hostel", checkedInAt: "26/08/2026, 12:55:40", status: "SERVED" },
  { id: "TKN-5", tokenNumber: "TKN-2608-0425", studentName: "Aarav Sharma", rollNumber: "22CSE001", mealName: "Lunch", dietPreference: "Non-Vegetarian", roomNumber: "101", blockName: "Boys Hostel", checkedInAt: "26/08/2026, 12:58:02", status: "SERVED" },
];

interface MessIndentItem {
  id: string;
  itemName: string;
  category: string;
  requiredQty: number;
  availableQty: number;
  unit: string;
  estimatedCost: number;
  status: "Sufficient" | "Low Stock" | "Reorder Required";
}

const INITIAL_INDENT_ITEMS: MessIndentItem[] = [
  { id: "IND-1", itemName: "Sona Masoori Raw Rice", category: "Grains & Cereals", requiredQty: 350, availableQty: 420, unit: "kg", estimatedCost: 19600, status: "Sufficient" },
  { id: "IND-2", itemName: "Aashirvaad Whole Wheat Atta", category: "Grains & Cereals", requiredQty: 180, availableQty: 120, unit: "kg", estimatedCost: 7200, status: "Low Stock" },
  { id: "IND-3", itemName: "Toor Dal (Premium Quality)", category: "Pulses & Lentils", requiredQty: 85, availableQty: 30, unit: "kg", estimatedCost: 13600, status: "Reorder Required" },
  { id: "IND-4", itemName: "Fresh Farm Paneer", category: "Dairy & Poultry", requiredQty: 60, availableQty: 65, unit: "kg", estimatedCost: 21000, status: "Sufficient" },
  { id: "IND-5", itemName: "Broiler Fresh Chicken", category: "Dairy & Poultry", requiredQty: 110, availableQty: 110, unit: "kg", estimatedCost: 26400, status: "Sufficient" },
  { id: "IND-6", itemName: "Refined Sunflower Oil", category: "Oils & Spices", requiredQty: 90, availableQty: 45, unit: "liters", estimatedCost: 12150, status: "Low Stock" },
  { id: "IND-7", itemName: "Fresh Tomatoes & Onions", category: "Fresh Vegetables", requiredQty: 160, availableQty: 140, unit: "kg", estimatedCost: 6400, status: "Sufficient" },
];

interface MessFeedbackItem {
  id: string;
  studentName: string;
  rollNumber: string;
  mealName: string;
  date: string;
  rating: number;
  category: string;
  comment: string;
  wardenRemark?: string;
  status: "OPEN" | "REVIEWED" | "RESOLVED";
}

const INITIAL_FEEDBACK: MessFeedbackItem[] = [
  { id: "FB-1", studentName: "B.vishnu vardhan", rollNumber: "23341M219", mealName: "Lunch", date: "26 Aug 2026", rating: 5, category: "Taste & Flavor", comment: "Chicken biryani tasted excellent today! Great portion size and raita quality.", wardenRemark: "Acknowledged and shared with Head Chef.", status: "RESOLVED" },
  { id: "FB-2", studentName: "Tarunya Jogi", rollNumber: "23331A0568", mealName: "Dinner", date: "25 Aug 2026", rating: 4, category: "Hygiene & Cleanliness", comment: "Dining tables and handwash counters were clean and sanitized.", wardenRemark: "Daily hygiene audit maintained.", status: "RESOLVED" },
  { id: "FB-3", studentName: "Kakarla Sai Teja", rollNumber: "23331A0482", mealName: "Breakfast", date: "26 Aug 2026", rating: 3, category: "Punctuality & Service", comment: "Tea counter had a long queue around 8:15 AM. Need an extra dispenser.", wardenRemark: "Second tea dispenser added to Counter B.", status: "REVIEWED" },
];

// ── 3.5 Maintenance & Complaints Datasets ──
interface MaintenanceTicketItem {
  id: string;
  ticketNumber: string;
  title: string;
  category: "Plumbing" | "Electrical" | "Carpentry" | "AC / HVAC" | "Cleaning & Hygiene" | "Wi-Fi & Network";
  blockName: string;
  roomNumber: string;
  reportedBy: string;
  reportedAt: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  assignedTechnician?: string;
  description: string;
  resolvedAt?: string;
}

const INITIAL_MAINTENANCE_TICKETS: MaintenanceTicketItem[] = [
  { id: "MNT-1", ticketNumber: "TKT-2608-101", title: "Washroom Tap Leakage", category: "Plumbing", blockName: "Boys Hostel (Block B)", roomNumber: "103", reportedBy: "B.vishnu vardhan", reportedAt: "26 Aug 2026, 09:30 AM", priority: "MEDIUM", status: "IN_PROGRESS", assignedTechnician: "Suresh (Plumber)", description: "Bathroom sink faucet has a steady drip creating water loss." },
  { id: "MNT-2", ticketNumber: "TKT-2608-102", title: "Ceiling Fan Regulator Malfunction", category: "Electrical", blockName: "Girls Hostel (Block G)", roomNumber: "201", reportedBy: "Vadamodula Pravallika", reportedAt: "26 Aug 2026, 10:15 AM", priority: "HIGH", status: "OPEN", assignedTechnician: "Ramesh (Electrician)", description: "Fan runs only at maximum speed 5. Speed knob loose." },
  { id: "MNT-3", ticketNumber: "TKT-2608-103", title: "Study Table Drawer Lock Stuck", category: "Carpentry", blockName: "Boys Hostel (Block B)", roomNumber: "104", reportedBy: "Kakarla Sai Teja", reportedAt: "25 Aug 2026, 04:20 PM", priority: "LOW", status: "RESOLVED", assignedTechnician: "Venkat (Carpenter)", description: "Personal study table locker key jammed.", resolvedAt: "26 Aug 2026, 11:00 AM" },
  { id: "MNT-4", ticketNumber: "TKT-2608-104", title: "Wi-Fi Access Point Frequent Disconnects", category: "Wi-Fi & Network", blockName: "Girls Hostel (Block G)", roomNumber: "202", reportedBy: "Tarunya Jogi", reportedAt: "26 Aug 2026, 11:45 AM", priority: "HIGH", status: "IN_PROGRESS", assignedTechnician: "IT NOC Team", description: "Signal strength fluctuates between 2nd floor corridor APs." },
];

// ── 4. Log History Dataset (matching Screenshot 1) ──
interface AttendanceLogItem {
  id: string;
  name: string;
  userId: string;
  block: string;
  floor: string;
  room: string;
  type: "CHECK-IN" | "CHECK-OUT";
  timestamp: string;
  device: string;
  method: string;
}

const INITIAL_LOGS: AttendanceLogItem[] = [
  { id: "LOG-1", name: "Reshma Borra", userId: "24331A0545", block: "Girls-Block-B", floor: "Floor 4", room: "Room 410", type: "CHECK-IN", timestamp: "15/07/2026, 13:38:27", device: "Girls Hostel Biometric", method: "Fingerprint" },
  { id: "LOG-2", name: "Rajana Vaishnavi", userId: "24331A0505", block: "Girls-Block-B", floor: "Floor 4", room: "Room 414", type: "CHECK-IN", timestamp: "15/07/2026, 13:38:21", device: "Girls Hostel Biometric", method: "Fingerprint" },
  { id: "LOG-3", name: "Sushma sri Reddi", userId: "24331A05P2", block: "Girls-Block-B", floor: "Floor 3", room: "Room 334", type: "CHECK-IN", timestamp: "15/07/2026, 13:38:15", device: "Girls Hostel Biometric", method: "Fingerprint" },
  { id: "LOG-4", name: "sravani yadla", userId: "24331A05W2", block: "Girls-Block-B", floor: "Floor 3", room: "Room 328", type: "CHECK-IN", timestamp: "15/07/2026, 13:38:09", device: "Girls Hostel Biometric", method: "Fingerprint" },
  { id: "LOG-5", name: "Vishnu Vardhan", userId: "STU2026CSE001", block: "Boys Block A", floor: "Floor 1", room: "Room 103", type: "CHECK-OUT", timestamp: "26/08/2026, 17:08:00", device: "Boys Hostel Turnstile A", method: "Fingerprint" },
  { id: "LOG-6", name: "Aarav Sharma", userId: "22CSE001", block: "Boys-Block-A", floor: "Floor 1", room: "Room 101", type: "CHECK-IN", timestamp: "26/08/2026, 12:45:02", device: "Boys Hostel Turnstile A", method: "Fingerprint" },
];

// ── 4.5 Presence & Violation Engine Datasets ──
interface StudentStillInHostelItem {
  id: string;
  studentName: string;
  registrationId: string;
  rollNumber: string;
  blockName: string;
  floorName: string;
  roomNumber: string;
  bedNumber: string;
  lastCheckIn: string;
  device: string;
  method: string;
  currentStatus: "INSIDE HOSTEL";
}

const INITIAL_STILL_IN_HOSTEL: StudentStillInHostelItem[] = [
  { id: "SIH-1", studentName: "sravani yadla", registrationId: "24331A05W2", rollNumber: "24331A05W2", blockName: "Girls Block B", floorName: "Floor 3", roomNumber: "Room 328", bedNumber: "Bed 1", lastCheckIn: "26/08/2026, 14:58:10", device: "Girls Hostel Biometric", method: "Fingerprint", currentStatus: "INSIDE HOSTEL" },
  { id: "SIH-2", studentName: "Sushma sri Reddi", registrationId: "24331A05P2", rollNumber: "24331A05P2", blockName: "Girls Block B", floorName: "Floor 3", roomNumber: "Room 334", bedNumber: "Bed 2", lastCheckIn: "26/08/2026, 14:58:10", device: "Girls Hostel Biometric", method: "Fingerprint", currentStatus: "INSIDE HOSTEL" },
  { id: "SIH-3", studentName: "Rajana Vaishnavi", registrationId: "24331A0505", rollNumber: "24331A0505", blockName: "Girls Block B", floorName: "Floor 4", roomNumber: "Room 414", bedNumber: "Bed 1", lastCheckIn: "26/08/2026, 14:58:10", device: "Girls Hostel Biometric", method: "Fingerprint", currentStatus: "INSIDE HOSTEL" },
  { id: "SIH-4", studentName: "Reshma Borra", registrationId: "24331A0545", rollNumber: "24331A0545", blockName: "Girls Block B", floorName: "Floor 4", roomNumber: "Room 410", bedNumber: "Bed 3", lastCheckIn: "26/08/2026, 14:58:10", device: "Girls Hostel Biometric", method: "Fingerprint", currentStatus: "INSIDE HOSTEL" },
  { id: "SIH-5", studentName: "Aarav Sharma", registrationId: "22CSE001", rollNumber: "22CSE001", blockName: "Boys Block A", floorName: "Floor 1", roomNumber: "Room 101", bedNumber: "Bed 1", lastCheckIn: "26/08/2026, 12:45:02", device: "Boys Hostel Turnstile A", method: "Fingerprint", currentStatus: "INSIDE HOSTEL" },
];

interface OutingStudentItem {
  id: string;
  studentName: string;
  registrationId: string;
  studentId: string;
  blockName: string;
  floorName: string;
  roomNumber: string;
  bedNumber: string;
  reason: string;
  approvedBy: string;
  expectedOutTime: string;
  actualOutTime: string;
  expectedReturnTime: string;
  actualReturnTime: string;
  durationText: string;
  currentStatus: "OUTSIDE" | "RETURNED";
  graceMinutes: number;
  allowedUntilTime: string;
}

const INITIAL_OUTING_STUDENTS: OutingStudentItem[] = [
  { id: "OUT-1", studentName: "Vishnu Vardhan", registrationId: "STU2026CSE001", studentId: "STU001", blockName: "Boys Block A", floorName: "Floor 1", roomNumber: "103", bedNumber: "Bed 3", reason: "Personal Work", approvedBy: "Warden", expectedOutTime: "05:00 PM", actualOutTime: "05:08 PM", expectedReturnTime: "08:00 PM", actualReturnTime: "Not Returned", durationText: "2h 52m+", currentStatus: "OUTSIDE", graceMinutes: 60, allowedUntilTime: "09:00 PM" },
  { id: "OUT-2", studentName: "Rohan Verma", registrationId: "STU2026ECE018", studentId: "STU018", blockName: "Boys Block A", floorName: "Floor 2", roomNumber: "205", bedNumber: "Bed 2", reason: "Library & Lab Reference", approvedBy: "Warden", expectedOutTime: "04:30 PM", actualOutTime: "04:35 PM", expectedReturnTime: "07:30 PM", actualReturnTime: "Not Returned", durationText: "3h 25m+", currentStatus: "OUTSIDE", graceMinutes: 60, allowedUntilTime: "08:30 PM" },
];

interface MovementViolationItem {
  id: string;
  studentName: string;
  registrationId: string;
  blockName: string;
  floorName: string;
  roomNumber: string;
  bedNumber: string;
  outingId?: string;
  outingDate: string;
  reason: string;
  expectedReturnTime: string;
  graceMinutes: number;
  allowedUntilTime: string;
  actualReturnTime?: string | null;
  lateMinutes: number;
  lateDurationText?: string;
  violationType: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: "OPEN" | "REVIEWED" | "RESOLVED";
  actionTaken?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

const INITIAL_VIOLATIONS: MovementViolationItem[] = [
  { id: "VIO-1", studentName: "Vishnu Vardhan", registrationId: "STU2026CSE001", blockName: "Boys Block A", floorName: "Floor 1", roomNumber: "103", bedNumber: "Bed 3", outingDate: "26-08-2026", reason: "Personal Work", expectedReturnTime: "08:00 PM", graceMinutes: 60, allowedUntilTime: "09:00 PM", actualReturnTime: "Not Returned", lateMinutes: 90, lateDurationText: "1h 30m", violationType: "Missing Return / Overdue", severity: "HIGH", status: "OPEN", actionTaken: "Gate alert triggered; SMS sent to warden and guardian", resolvedBy: undefined, resolvedAt: undefined },
  { id: "VIO-2", studentName: "Kakarla Sai Teja", registrationId: "STU2026ECE042", blockName: "Boys Block A", floorName: "Floor 1", roomNumber: "104", bedNumber: "Bed 2", outingDate: "25-08-2026", reason: "Project Work at Library", expectedReturnTime: "08:00 PM", graceMinutes: 60, allowedUntilTime: "09:00 PM", actualReturnTime: "10:15 PM", lateMinutes: 75, lateDurationText: "1h 15m", violationType: "Late Return", severity: "HIGH", status: "RESOLVED", actionTaken: "Warning issued; Parent informed by Warden", resolvedBy: "Chief Warden", resolvedAt: "26 Aug 2026, 09:00 AM" },
];

// ── 5. User Management Dataset (matching Screenshot 3) ──
interface SystemUserItem {
  id: string;
  name: string;
  username: string; // JNTU Roll Number
  rollNumber: string;
  jntuNumber?: string;
  email: string;
  contact: string;
  parentContact?: string;
  department: string;
  branch?: string;
  year: number;
  yearText?: string;
  semester: number;
  semesterText?: string;
  section?: string;
  blockName?: string;
  floorName?: string;
  roomNumber?: string;
  bedNumber?: string;
  allocationStatus?: "ALLOCATED" | "PENDING" | "UNALLOCATED";
  role: "Student";
  status: "ACTIVE" | "PENDING" | "DEACTIVATED";
  defaultPassword?: string;
  lastActive: string;
  lastActiveIp: string;
  hasLoginAccess?: boolean;
}

const INITIAL_USERS: SystemUserItem[] = [
  { id: "U-1", name: "B.vishnu vardhan", username: "23341A4219", rollNumber: "23341A4219", jntuNumber: "23341A4219", email: "vishnu.b@cms.com", contact: "9392377306", parentContact: "9440123456", department: "Computer Science (CSE)", branch: "Computer Science (CSE)", year: 3, yearText: "3rd Year", semester: 6, semesterText: "Sem 6", section: "A", blockName: "Boys Block A", floorName: "Floor 1", roomNumber: "103", bedNumber: "Bed-1", allocationStatus: "ALLOCATED", role: "Student", status: "ACTIVE", defaultPassword: "23341A4219@2026", lastActive: "Just now", lastActiveIp: "157.50.154.47", hasLoginAccess: true },
  { id: "U-2", name: "K. Sai Teja", username: "22CS101", rollNumber: "22CS101", jntuNumber: "22CS101", email: "saiteja.k@cms.com", contact: "9876543210", parentContact: "9848123999", department: "Computer Science (CSE)", branch: "Computer Science (CSE)", year: 3, yearText: "3rd Year", semester: 6, section: "B", blockName: "Boys Block A", floorName: "Floor 2", roomNumber: "205", bedNumber: "Bed-2", allocationStatus: "ALLOCATED", role: "Student", status: "ACTIVE", defaultPassword: "22CS101@2026", lastActive: "Just now", lastActiveIp: "157.50.154.47", hasLoginAccess: true },
  { id: "U-3", name: "Vadamodula Pravallika", username: "24331A05P9", rollNumber: "24331A05P9", jntuNumber: "24331A05P9", email: "pravallika.v@cms.com", contact: "9876543219", parentContact: "9440555666", department: "Computer Science (CSE)", branch: "Computer Science (CSE)", year: 2, yearText: "2nd Year", semester: 4, section: "A", blockName: "Girls Block B", floorName: "Floor 3", roomNumber: "328", bedNumber: "Bed-1", allocationStatus: "ALLOCATED", role: "Student", status: "ACTIVE", defaultPassword: "24331A05P9@2026", lastActive: "26 Aug 2026, 08:30 AM", lastActiveIp: "157.50.154.50", hasLoginAccess: true },
  { id: "U-4", name: "Tarunya Jogi", username: "24331A1253", rollNumber: "24331A1253", jntuNumber: "24331A1253", email: "tarunyajogi@cms.com", contact: "8500789579", parentContact: "8885551234", department: "Information Technology (IT)", branch: "Information Technology (IT)", year: 2, yearText: "2nd Year", semester: 3, section: "A", blockName: "Girls Block B", floorName: "Floor 4", roomNumber: "414", bedNumber: "Bed-3", allocationStatus: "ALLOCATED", role: "Student", status: "PENDING", defaultPassword: "24331A1253@2026", lastActive: "17 Aug 2026, 10:58 PM", lastActiveIp: "106.217.138.187", hasLoginAccess: true },
  { id: "U-5", name: "Rohan Verma", username: "STU2026ECE018", rollNumber: "STU2026ECE018", jntuNumber: "STU2026ECE018", email: "rohan.v@cms.com", contact: "9123456789", parentContact: "9440999888", department: "Electronics & Comm (ECE)", branch: "Electronics & Comm (ECE)", year: 2, yearText: "2nd Year", semester: 4, section: "B", blockName: "Boys Block A", floorName: "Floor 2", roomNumber: "205", bedNumber: "Bed-1", allocationStatus: "ALLOCATED", role: "Student", status: "ACTIVE", defaultPassword: "STU2026ECE018@2026", lastActive: "Just now", lastActiveIp: "157.50.154.47", hasLoginAccess: true },
];

// ── 5. Guest Billing Dataset ──
interface GuestBillRecord {
  id: string;
  billNumber: string;
  guestName: string;
  contactNumber: string;
  relation: string; // "Father" | "Mother" | "Guardian" | "Sibling" | "Relative" | "Official Guest"
  purpose: string;
  studentId?: string;
  studentName?: string;
  studentRollNo?: string;
  studentDepartment?: string;
  studentRoom?: string;
  idProofType?: string;
  idProofNumber?: string;
  roomType?: string;
  roomNumber?: string;
  fromDate: string;
  toDate: string;
  days: number;
  roomCharges: number;
  messCharges: number;
  extraCharges: number;
  totalAmount: number;
  paymentMode: "CASH" | "UPI / QR" | "CARD (POS)" | "NET BANKING" | "STUDENT ACCOUNT";
  transactionRef?: string;
  status: "PAID" | "PENDING" | "WAIVED";
  generatedAt: string;
  remarks?: string;
}

const INITIAL_GUEST_BILLS: GuestBillRecord[] = [
  {
    id: "GB-1",
    billNumber: "GBILL-2026-001",
    guestName: "B. Nageswara Rao",
    contactNumber: "9440123456",
    relation: "Father",
    purpose: "Visiting Student & Academic Review",
    studentId: "U-1",
    studentName: "B.vishnu vardhan",
    studentRollNo: "23341A4219",
    studentDepartment: "Computer Science (CSE)",
    studentRoom: "Boys Hostel • Room 103",
    idProofType: "Aadhaar Card",
    idProofNumber: "XXXX-XXXX-8921",
    roomType: "Parent Guest Suite (AC)",
    roomNumber: "Guest Suite 101",
    fromDate: "2026-08-24",
    toDate: "2026-08-26",
    days: 2,
    roomCharges: 600,
    messCharges: 250,
    extraCharges: 100,
    totalAmount: 1800,
    paymentMode: "UPI / QR",
    transactionRef: "UPI-98210398213",
    status: "PAID",
    generatedAt: "26 Aug 2026, 11:30 AM",
    remarks: "Parent stayed during semester induction.",
  },
  {
    id: "GB-2",
    billNumber: "GBILL-2026-002",
    guestName: "Tarunya Jogi's Mother (J. Lakshmi)",
    contactNumber: "8885551234",
    relation: "Mother",
    purpose: "Health Care & Medical Support",
    studentId: "U-4",
    studentName: "Tarunya Jogi",
    studentRollNo: "24331A1253",
    studentDepartment: "Information Technology (IT)",
    studentRoom: "Girls Block B • Room 414",
    idProofType: "Aadhaar Card",
    idProofNumber: "XXXX-XXXX-4512",
    roomType: "Standard Parent Room (Non-AC)",
    roomNumber: "Parent Room 202",
    fromDate: "2026-08-25",
    toDate: "2026-08-26",
    days: 1,
    roomCharges: 500,
    messCharges: 200,
    extraCharges: 50,
    totalAmount: 750,
    paymentMode: "CASH",
    transactionRef: "CASH-REC-082",
    status: "PAID",
    generatedAt: "26 Aug 2026, 09:00 AM",
    remarks: "Single day stay for medical care.",
  },
  {
    id: "GB-3",
    billNumber: "GBILL-2026-003",
    guestName: "Dr. K. Srinivas",
    contactNumber: "9848123999",
    relation: "Official Guest",
    purpose: "Campus Academic Auditor & Examiner",
    studentName: "External University Visitor",
    studentRollNo: "EXTERNAL-GUEST",
    studentDepartment: "Institutional Audit",
    studentRoom: "Executive Block",
    idProofType: "Institutional ID",
    idProofNumber: "AUD-UNI-99",
    roomType: "Executive VIP Suite (AC)",
    roomNumber: "VIP Suite 01",
    fromDate: "2026-08-26",
    toDate: "2026-08-27",
    days: 1,
    roomCharges: 800,
    messCharges: 300,
    extraCharges: 0,
    totalAmount: 1100,
    paymentMode: "NET BANKING",
    transactionRef: "NEFT-78192301",
    status: "PAID",
    generatedAt: "26 Aug 2026, 02:15 PM",
    remarks: "Approved under Dean Institutional Budget.",
  },
];

// ── 6. Leave & Suspension Datasets ──
interface HostelLeaveItem {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  department: string;
  yearText: string;
  blockName: string;
  roomNumber: string;
  parentContact: string;
  leaveType: "Home Visit" | "Medical Leave" | "Academic / Internship" | "Emergency Leave" | "Vacation";
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  destinationAddress: string;
  travelMode: string;
  parentApproval: "VERIFIED" | "CALL CONFIRMED" | "PENDING" | "REJECTED";
  status: "APPROVED" | "PENDING" | "REJECTED" | "COMPLETED";
  gateAccessStatus: "PASS ACTIVE" | "AWAITING APPROVAL" | "EXPIRED" | "BARRED";
  createdBy: "Student" | "Warden" | "Parent Portal";
  createdAt: string;
  wardenRemarks?: string;
}

interface HostelSuspensionItem {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  department: string;
  yearText: string;
  blockName: string;
  roomNumber: string;
  parentContact: string;
  reason: string;
  violationType: "Late Return / Curfew" | "Unauthorized Outing" | "Hostel Property Damage" | "Severe Indiscipline" | "Substance Violation";
  fromDate: string;
  toDate: string;
  totalDays: number;
  biometricAccess: "LOCKED / REVOKED" | "RESTRICTED" | "RESTORED";
  status: "ACTIVE" | "REVOKED" | "EXPIRED";
  sanctionedBy: string;
  parentNotified: boolean;
  remarks: string;
  createdAt: string;
}

const INITIAL_LEAVES: HostelLeaveItem[] = [
  {
    id: "LV-101",
    studentId: "U-1",
    studentName: "B.vishnu vardhan",
    rollNumber: "23341A4219",
    department: "Computer Science (CSE)",
    yearText: "3rd Year",
    blockName: "Boys Hostel",
    roomNumber: "103",
    parentContact: "9440123456",
    leaveType: "Home Visit",
    startDate: "2026-08-27",
    endDate: "2026-08-30",
    totalDays: 4,
    reason: "Family function and weekend visit to hometown.",
    destinationAddress: "D.No 4-12, Main Road, Vijayawada, AP",
    travelMode: "APSRTC Super Luxury Bus",
    parentApproval: "VERIFIED",
    status: "APPROVED",
    gateAccessStatus: "PASS ACTIVE",
    createdBy: "Student",
    createdAt: "26 Aug 2026, 10:15 AM",
    wardenRemarks: "Parent verbal confirmation obtained over phone. Gate biometric departure approved.",
  },
  {
    id: "LV-102",
    studentId: "U-4",
    studentName: "Tarunya Jogi",
    rollNumber: "24331A1253",
    department: "Information Technology (IT)",
    yearText: "2nd Year",
    blockName: "Girls Block B",
    roomNumber: "414",
    parentContact: "8885551234",
    leaveType: "Medical Leave",
    startDate: "2026-08-26",
    endDate: "2026-08-28",
    totalDays: 3,
    reason: "Dental surgery and doctor advised rest at hometown.",
    destinationAddress: "Plot 45, Srinagar Colony, Hyderabad",
    travelMode: "Accompanied by Mother",
    parentApproval: "CALL CONFIRMED",
    status: "APPROVED",
    gateAccessStatus: "PASS ACTIVE",
    createdBy: "Student",
    createdAt: "25 Aug 2026, 04:30 PM",
    wardenRemarks: "Medical prescription attached and verified with mother.",
  },
  {
    id: "LV-103",
    studentId: "U-3",
    studentName: "K. Sai Teja",
    rollNumber: "23341A0512",
    department: "Computer Science (CSE)",
    yearText: "3rd Year",
    blockName: "Boys Hostel (Block B)",
    roomNumber: "103",
    parentContact: "9876543210",
    leaveType: "Academic / Internship",
    startDate: "2026-08-29",
    endDate: "2026-08-31",
    totalDays: 3,
    reason: "Participating in Smart India Hackathon zonal round at IIT Madras.",
    destinationAddress: "IIT Madras Research Park, Chennai, TN",
    travelMode: "Train (Charminar Express)",
    parentApproval: "VERIFIED",
    status: "APPROVED",
    gateAccessStatus: "PASS ACTIVE",
    createdBy: "Student",
    createdAt: "26 Aug 2026, 11:00 AM",
    wardenRemarks: "Faculty recommendation letter attached and verified with HOD.",
  },
  {
    id: "LV-104",
    studentId: "U-5",
    studentName: "Rohan Verma",
    rollNumber: "STU2026ECE018",
    department: "Electronics & Comm (ECE)",
    yearText: "2nd Year",
    blockName: "Boys Block A",
    roomNumber: "205",
    parentContact: "9440999888",
    leaveType: "Home Visit",
    startDate: "2026-08-28",
    endDate: "2026-08-31",
    totalDays: 4,
    reason: "Festival weekend visit to hometown.",
    destinationAddress: "Flat 201, Shanti Niketan, Guntur, AP",
    travelMode: "Train",
    parentApproval: "PENDING",
    status: "PENDING",
    gateAccessStatus: "AWAITING APPROVAL",
    createdBy: "Student",
    createdAt: "26 Aug 2026, 01:20 PM",
    wardenRemarks: "Awaiting parent confirmation call before final sign-off.",
  },
];

const INITIAL_SUSPENSIONS: HostelSuspensionItem[] = [
  {
    id: "SUSP-01",
    studentId: "U-2",
    studentName: "Pooja Sharma",
    rollNumber: "23341A0589",
    department: "Computer Science (CSE)",
    yearText: "3rd Year",
    blockName: "Girls Block B",
    roomNumber: "414",
    parentContact: "9848011223",
    reason: "Repeated unauthorized gate checkout and 4-hour curfew breach after 08:30 PM.",
    violationType: "Late Return / Curfew",
    fromDate: "2026-08-25",
    toDate: "2026-08-31",
    totalDays: 7,
    biometricAccess: "LOCKED / REVOKED",
    status: "ACTIVE",
    sanctionedBy: "Chief Hostel Warden & Discipline Committee",
    parentNotified: true,
    remarks: "Outing permissions suspended for 7 days. Parents notified via registered letter and SMS.",
    createdAt: "25 Aug 2026, 09:30 PM",
  },
];

function getTabFromLocation(pathname: string, search: string): string {
  const params = new URLSearchParams(search);
  const tabParam = params.get("tab");
  if (tabParam) {
    const t = tabParam.toLowerCase().replace(/_/g, "-");
    if (
      t === "outing-logs" ||
      t === "outing-log-history" ||
      t === "log-history" ||
      t === "logs" ||
      t === "attendance"
    ) {
      return "logs";
    }
    return t;
  }

  const cleanPath = (pathname || "")
    .replace(/^\/hostel\/?/, "")
    .toLowerCase()
    .replace(/_/g, "-");

  if (!cleanPath || cleanPath === "dashboard") return "dashboard";
  if (cleanPath === "blocks") return "blocks";
  if (cleanPath === "room-allocation" || cleanPath === "rooms") return "rooms";
  if (
    cleanPath === "mess-management" ||
    cleanPath === "mess" ||
    cleanPath === "mess-menus" ||
    cleanPath === "mess-fees"
  )
    return "mess";
  if (cleanPath === "outing-approvals" || cleanPath === "outings") return "outings";
  if (cleanPath === "maintenance" || cleanPath === "complaints") return "maintenance";
  if (
    cleanPath === "log-history" ||
    cleanPath === "logs" ||
    cleanPath === "attendance" ||
    cleanPath === "outing-log-history" ||
    cleanPath === "outing-logs"
  ) {
    return "logs";
  }
  if (cleanPath === "user-management" || cleanPath === "users" || cleanPath === "students") return "users";
  if (cleanPath === "guest-billing" || cleanPath === "fees") return "guest-billing";
  if (cleanPath === "leaves-suspension" || cleanPath === "leaves") return "leaves";
  if (cleanPath === "device-management" || cleanPath === "devices" || cleanPath === "biometric") return "devices";
  if (cleanPath === "notifications") return "notifications";
  return "dashboard";
}

export function HostelModuleView() {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>(() =>
    getTabFromLocation(location.pathname, location.search)
  );

  // Datasets & Dynamic Metrics
  const [metrics, setMetrics] = useState<DashboardMetricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [campusBlocks, setCampusBlocks] = useState<CampusBlock[]>(INITIAL_CAMPUS_BLOCKS);
  const [outingRequests, setOutingRequests] = useState<CampusOutingRequest[]>(INITIAL_OUTINGS);
  const [meals, setMeals] = useState<MessMealTiming[]>(INITIAL_MEALS);
  const [schedule, setSchedule] = useState<MenuScheduleRow[]>(INITIAL_MENU_SCHEDULE);
  const [messTokens, setMessTokens] = useState<MessAttendanceToken[]>(INITIAL_MESS_TOKENS);
  const [indentItems, setIndentItems] = useState<MessIndentItem[]>(INITIAL_INDENT_ITEMS);
  const [feedbackList, setFeedbackList] = useState<MessFeedbackItem[]>(INITIAL_FEEDBACK);
  const [logs, setLogs] = useState<AttendanceLogItem[]>(INITIAL_LOGS);
  const [users, setUsers] = useState<SystemUserItem[]>(INITIAL_USERS);
  const [registrations, setRegistrations] = useState<HostelRegistrationApplicant[]>(INITIAL_REGISTRATIONS);

  // Sub-tabs
  const [messSubTab, setMessSubTab] = useState<string>("Configuration");
  const [outingSubTab, setOutingSubTab] = useState<string>("Outing Requests");
  const [logSubTab, setLogSubTab] = useState<string>("Logs");
  const [leaveSubTab, setLeaveSubTab] = useState<string>("Leaves");
  const [roomAllocSubTab, setRoomAllocSubTab] = useState<"queue" | "allocated">("queue");

  // Search & Allocation Filters
  const [globalHostelSearch, setGlobalHostelSearch] = useState<string>("");
  const [logSearch, setLogSearch] = useState<string>("");
  const [userSearch, setUserSearch] = useState<string>("");
  const [outingSearch, setOutingSearch] = useState<string>("");
  const [roomAllocSearch, setRoomAllocSearch] = useState<string>("");
  const [tokenSearch, setTokenSearch] = useState<string>("");
  const [selectedMealForCheckin, setSelectedMealForCheckin] = useState<string>("Lunch");
  const [dietChoice, setDietChoice] = useState<"Vegetarian" | "Non-Vegetarian" | "Special Diet">("Non-Vegetarian");
  const [genderFilter, setGenderFilter] = useState<string>("ALL");
  const [roomSelectFilter, setRoomSelectFilter] = useState<string>("ALL");
  const [roomBranchFilter, setRoomBranchFilter] = useState<string>("ALL");

  // Allocation & Dossier Modals
  const [selectedDossierApp, setSelectedDossierApp] = useState<HostelRegistrationApplicant | null>(null);
  const [selectedAllocApp, setSelectedAllocApp] = useState<HostelRegistrationApplicant | null>(null);
  const [selectedSlipApp, setSelectedSlipApp] = useState<HostelRegistrationApplicant | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState<boolean>(false);
  const [isAllocating, setIsAllocating] = useState<boolean>(false);
  const [allocationForm, setAllocationForm] = useState({
    blockId: "B-1",
    blockName: "Boys Hostel (Block B)",
    floorId: "F-1",
    floorName: "Floor 1",
    roomId: "103",
    roomNumber: "103",
    bedId: "Bed-3",
    bedNumber: "Bed-3",
    remarks: "Room and bed assigned upon physical document verification.",
  });

  // Mess Modals & Forms
  const [addMealModalOpen, setAddMealModalOpen] = useState<boolean>(false);
  const [editMealModalOpen, setEditMealModalOpen] = useState<MessMealTiming | null>(null);
  const [mealForm, setMealForm] = useState<{ name: string; time: string; status: "Active" | "Inactive"; capacity: number; menuSummary: string }>({
    name: "",
    time: "12:00 - 15:30",
    status: "Active",
    capacity: 500,
    menuSummary: "",
  });

  const [indentModalOpen, setIndentModalOpen] = useState<boolean>(false);
  const [indentForm, setIndentForm] = useState<{ itemName: string; category: string; requiredQty: number; availableQty: number; unit: string; estimatedCost: number; status: "Sufficient" | "Low Stock" | "Reorder Required" }>({
    itemName: "",
    category: "Grains & Cereals",
    requiredQty: 50,
    availableQty: 20,
    unit: "kg",
    estimatedCost: 2500,
    status: "Low Stock",
  });

  const [feedbackModalOpen, setFeedbackModalOpen] = useState<boolean>(false);
  const [feedbackForm, setFeedbackForm] = useState<{ studentName: string; rollNumber: string; mealName: string; rating: number; category: string; comment: string }>({
    studentName: "B.vishnu vardhan",
    rollNumber: "23341M219",
    mealName: "Lunch",
    rating: 5,
    category: "Taste & Flavor",
    comment: "Meal quality and taste is exceptional!",
  });

  // Maintenance States
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicketItem[]>(INITIAL_MAINTENANCE_TICKETS);
  const [maintenanceSearch, setMaintenanceSearch] = useState<string>("");
  const [maintenanceCategoryFilter, setMaintenanceCategoryFilter] = useState<string>("ALL");
  const [maintenanceStatusFilter, setMaintenanceStatusFilter] = useState<string>("ALL");
  const [addTicketModalOpen, setAddTicketModalOpen] = useState<boolean>(false);
  const [ticketForm, setTicketForm] = useState({
    title: "",
    category: "Plumbing" as MaintenanceTicketItem["category"],
    blockName: "Boys Hostel (Block B)",
    roomNumber: "103",
    reportedBy: "B.vishnu vardhan",
    priority: "MEDIUM" as MaintenanceTicketItem["priority"],
    description: "",
  });

  // Guest Billing (Step-by-step Dynamic Student & Parent Billing)
  const [guestBills, setGuestBills] = useState<GuestBillRecord[]>(INITIAL_GUEST_BILLS);
  const [guestBillingStep, setGuestBillingStep] = useState<number>(1);
  const [isExternalGuest, setIsExternalGuest] = useState<boolean>(false);
  const [selectedStudentForGuest, setSelectedStudentForGuest] = useState<SystemUserItem | null>(null);
  const [selectedBillForInvoice, setSelectedBillForInvoice] = useState<GuestBillRecord | null>(null);
  const [billSearchQuery, setBillSearchQuery] = useState<string>("");
  const [billStatusFilter, setBillStatusFilter] = useState<string>("ALL");
  const [billRelationFilter, setBillRelationFilter] = useState<string>("ALL");

  const [guestForm, setGuestForm] = useState({
    studentId: "U-1",
    studentName: "B.vishnu vardhan",
    studentRollNo: "23341A4219",
    studentDepartment: "Computer Science (CSE)",
    studentRoom: "Boys Hostel • Room 103",
    guestName: "B. Nageswara Rao",
    contactNumber: "9440123456",
    email: "parent.nageswar@gmail.com",
    relation: "Father" as GuestBillRecord["relation"],
    idProofType: "Aadhaar Card",
    idProofNumber: "XXXX-XXXX-8921",
    purpose: "Visiting Student & Academic Review",
    roomType: "Parent Guest Suite (AC - ₹600/day)",
    roomNumber: "Guest Suite 101",
    fromDate: "2026-08-26",
    toDate: "2026-08-27",
    roomCharges: 600,
    includeBreakfast: true,
    includeLunch: true,
    includeDinner: true,
    messCharges: 320,
    extraBed: false,
    extraAC: true,
    extraLaundry: false,
    extraCharges: 100,
    paymentMode: "UPI / QR" as GuestBillRecord["paymentMode"],
    paymentStatus: "PAID" as GuestBillRecord["status"],
    transactionRef: "UPI-2608-8921",
    remarks: "Parent visiting for academic interaction.",
  });

  // Leave & Suspension States
  const [leaveRequests, setLeaveRequests] = useState<HostelLeaveItem[]>(INITIAL_LEAVES);
  const [suspensionsList, setSuspensionsList] = useState<HostelSuspensionItem[]>(INITIAL_SUSPENSIONS);
  const [leaveFilterStatus, setLeaveFilterStatus] = useState<string>("ALL");
  const [leaveFilterType, setLeaveFilterType] = useState<string>("ALL");
  const [leaveFilterParent, setLeaveFilterParent] = useState<string>("ALL");
  const [leaveSearchQuery, setLeaveSearchQuery] = useState<string>("");
  const [suspensionSearchQuery, setSuspensionSearchQuery] = useState<string>("");
  const [suspensionFilterStatus, setSuspensionFilterStatus] = useState<string>("ALL");

  const [createLeaveModalOpen, setCreateLeaveModalOpen] = useState<boolean>(false);
  const [createSuspensionModalOpen, setCreateSuspensionModalOpen] = useState<boolean>(false);
  const [selectedLeaveDossier, setSelectedLeaveDossier] = useState<HostelLeaveItem | null>(null);
  const [selectedSuspensionDossier, setSelectedSuspensionDossier] = useState<HostelSuspensionItem | null>(null);
  const [leaveGatePassModal, setLeaveGatePassModal] = useState<HostelLeaveItem | null>(null);

  const [newLeaveForm, setNewLeaveForm] = useState({
    studentId: "U-1",
    studentName: "B.vishnu vardhan",
    rollNumber: "23341A4219",
    department: "Computer Science (CSE)",
    yearText: "3rd Year",
    blockName: "Boys Hostel",
    roomNumber: "103",
    parentContact: "9440123456",
    leaveType: "Home Visit" as HostelLeaveItem["leaveType"],
    startDate: "2026-08-27",
    endDate: "2026-08-30",
    reason: "Visiting parents for family function.",
    destinationAddress: "D.No 4-12, Main Road, Vijayawada, AP",
    travelMode: "Bus / Public Transport",
    parentApproval: "VERIFIED" as HostelLeaveItem["parentApproval"],
    status: "APPROVED" as HostelLeaveItem["status"],
    wardenRemarks: "Parent verification completed via phone call.",
  });

  const [newSuspensionForm, setNewSuspensionForm] = useState({
    studentId: "U-2",
    studentName: "Pooja Sharma",
    rollNumber: "23341A0589",
    department: "Computer Science (CSE)",
    yearText: "3rd Year",
    blockName: "Girls Block B",
    roomNumber: "414",
    parentContact: "9848011223",
    reason: "Curfew violation and unauthorized outing after permissible hours.",
    violationType: "Late Return / Curfew" as HostelSuspensionItem["violationType"],
    fromDate: "2026-08-26",
    toDate: "2026-09-02",
    biometricAccess: "LOCKED / REVOKED" as HostelSuspensionItem["biometricAccess"],
    status: "ACTIVE" as HostelSuspensionItem["status"],
    sanctionedBy: "Chief Hostel Warden",
    parentNotified: true,
    remarks: "Gate turnstile biometric access barred for the duration of suspension.",
  });

  // Presence & Log History States
  const [stillInHostelStudents, setStillInHostelStudents] = useState<StudentStillInHostelItem[]>(INITIAL_STILL_IN_HOSTEL);
  const [outingStudentsList, setOutingStudentsList] = useState<OutingStudentItem[]>(INITIAL_OUTING_STUDENTS);
  const [violationsList, setViolationsList] = useState<MovementViolationItem[]>(INITIAL_VIOLATIONS);
  const [presenceAnalytics, setPresenceAnalytics] = useState<any>({
    totalHostelStudents: 769,
    insideHostel: 721,
    outsideHostel: 48,
    todayCheckIns: 520,
    todayCheckOuts: 48,
    activeOutings: 48,
    returnedOutings: 14,
    lateReturns: 7,
    openViolations: 4,
    averageOutingDuration: "2h 45m",
  });
  const [violationTabFilter, setViolationTabFilter] = useState<"ALL" | "OPEN" | "RESOLVED">("ALL");
  const [selectedViolationForResolution, setSelectedViolationForResolution] = useState<MovementViolationItem | null>(null);
  const [violationResolutionRemark, setViolationResolutionRemark] = useState("");
  const [violationActionTaken, setViolationActionTaken] = useState("Warning issued; Parent informed by Warden");

  // Gate Log Filters & Pagination States
  const [gateLogFilterPanelOpen, setGateLogFilterPanelOpen] = useState(false);
  const [gateLogFilters, setGateLogFilters] = useState({
    fromDate: "",
    toDate: "",
    movementType: "ALL",
    authorization: "ALL",
    status: "ALL",
    block: "ALL",
    device: "ALL",
    method: "ALL",
  });
  const [gateLogPage, setGateLogPage] = useState(1);
  const [gateLogPageSize, setGateLogPageSize] = useState(10);
  const [selectedGateLogForDetails, setSelectedGateLogForDetails] = useState<any | null>(null);

  const [violationsPage, setViolationsPage] = useState(1);
  const [violationsPageSize, setViolationsPageSize] = useState(10);
  const [selectedViolationForDetails, setSelectedViolationForDetails] = useState<MovementViolationItem | null>(null);

  // Modals
  const [addBlockModalOpen, setAddBlockModalOpen] = useState<boolean>(false);
  const [newBlockForm, setNewBlockForm] = useState({
    name: "",
    type: "Boys Hostel" as CampusBlock["type"],
    totalCapacity: 60,
  });

  const [addUserModalOpen, setAddUserModalOpen] = useState<boolean>(false);
  const [userBranchFilter, setUserBranchFilter] = useState<string>("ALL");
  const [userYearFilter, setUserYearFilter] = useState<string>("ALL");
  const [userAllocFilter, setUserAllocFilter] = useState<string>("ALL");
  const [userStatusFilter, setUserStatusFilter] = useState<string>("ALL");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userPage, setUserPage] = useState<number>(1);
  const [userPageSize, setUserPageSize] = useState<number>(10);

  const [newStudentForm, setNewStudentForm] = useState({
    name: "",
    rollNumber: "",
    department: "Computer Science (CSE)",
    year: 1,
    semester: 1,
    section: "A",
    email: "",
    contact: "",
    parentContact: "",
    blockName: "Boys Block A",
    floorName: "Floor 1",
    roomNumber: "101",
    bedNumber: "Bed-1",
    password: "Student@2026",
  });

  const [createdCredentialsModal, setCreatedCredentialsModal] = useState<{
    name: string;
    username: string;
    rollNumber: string;
    department: string;
    room: string;
    email: string;
    password: string;
    role: string;
    loginUrl: string;
  } | null>(null);

  const [viewCredentialsModal, setViewCredentialsModal] = useState<SystemUserItem | null>(null);
  const [resetPasswordStudent, setResetPasswordStudent] = useState<SystemUserItem | null>(null);
  const [newCustomPassword, setNewCustomPassword] = useState<string>("");
  const [editStudentModal, setEditStudentModal] = useState<SystemUserItem | null>(null);

  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set(["dashboard"]));
  const [isTabLoading, setIsTabLoading] = useState<boolean>(false);

  // 1. Fast Core Loader (Dashboard metrics, blocks, and presence counters)
  const fetchCoreData = async () => {
    try {
      const [dashData, blocksData, stillInData, outingListData, vioData, analyticsData] = await Promise.all([
        HostelService.getDashboard().catch(() => null),
        HostelService.getBlocks().catch(() => INITIAL_CAMPUS_BLOCKS),
        HostelService.getStudentsStillInHostel().catch(() => INITIAL_STILL_IN_HOSTEL),
        HostelService.getOutingStudentsList().catch(() => INITIAL_OUTING_STUDENTS),
        HostelService.getMovementViolations().catch(() => INITIAL_VIOLATIONS),
        HostelService.getPresenceAnalytics().catch(() => null),
      ]);

      if (dashData) {
        setMetrics(dashData);
        if (dashData.blocksSummary && dashData.blocksSummary.length > 0) {
          setCampusBlocks(dashData.blocksSummary);
        }
      } else if (blocksData && blocksData.length > 0) {
        setCampusBlocks(blocksData);
      }

      const resolvedOutings = outingListData && outingListData.length > 0 ? outingListData : INITIAL_OUTING_STUDENTS;
      const uniqueOutings = resolvedOutings.filter(
        (o: any, idx: number, arr: any[]) =>
          arr.findIndex((x: any) => x.studentName.toLowerCase().trim() === o.studentName.toLowerCase().trim()) === idx
      );
      setOutingStudentsList(uniqueOutings);

      const outsideStudentNames = new Set(uniqueOutings.map((o: any) => o.studentName.toLowerCase().trim()));
      const rawInsideList = stillInData && stillInData.length > 0 ? stillInData : INITIAL_STILL_IN_HOSTEL;
      const uniqueInside = rawInsideList
        .filter((s: any) => !outsideStudentNames.has(s.studentName.toLowerCase().trim()))
        .filter(
          (s: any, idx: number, arr: any[]) =>
            arr.findIndex((x: any) => x.studentName.toLowerCase().trim() === s.studentName.toLowerCase().trim()) === idx
        );
      setStillInHostelStudents(uniqueInside);

      if (vioData && vioData.length > 0) setViolationsList(vioData);
      if (analyticsData) {
        setPresenceAnalytics({
          ...analyticsData,
          totalHostelStudents: uniqueInside.length + uniqueOutings.length,
          insideHostel: uniqueInside.length,
          outsideHostel: uniqueOutings.length,
        });
      }
    } catch (err) {
      console.error("Hostel core data fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. On-Demand Tab Data Loader (Loads from database API on tab switch)
  const loadTabData = async (tab: string, force = false) => {
    if (!force && loadedTabs.has(tab) && tab !== "users" && tab !== "rooms") return;
    setIsTabLoading(true);
    try {
      if (tab === "users") {
        const usersData = await HostelService.getUsers().catch(() => INITIAL_USERS);
        if (usersData && usersData.length > 0) setUsers(usersData);
      } else if (tab === "logs" || tab === "outing-logs") {
        const logsData = await HostelService.getAttendanceLogs().catch(() => INITIAL_LOGS);
        if (logsData && logsData.length > 0) setLogs(logsData);
      } else if (tab === "mess") {
        const [mealsData, scheduleData] = await Promise.all([
          HostelService.getMealSlots().catch(() => INITIAL_MEALS),
          HostelService.getMenuSchedule().catch(() => INITIAL_MENU_SCHEDULE),
        ]);
        if (mealsData && mealsData.length > 0) setMeals(mealsData);
        if (scheduleData && scheduleData.length > 0) setSchedule(scheduleData);
      } else if (tab === "outings") {
        const outingsData = await HostelService.getOutings().catch(() => INITIAL_OUTINGS);
        if (outingsData && outingsData.length > 0) setOutingRequests(outingsData);
      } else if (tab === "rooms") {
        const regsData = await HostelService.getRegistrations().catch(() => INITIAL_REGISTRATIONS);
        if (regsData && regsData.length > 0) setRegistrations(regsData);
      } else if (tab === "guest-billing") {
        const billsData = await HostelService.getGuestBills().catch(() => []);
        if (billsData && billsData.length > 0) setGuestBills(billsData);
      }
      setLoadedTabs((prev) => new Set([...prev, tab]));
    } catch (err) {
      console.error(`Error loading data for tab ${tab}:`, err);
    } finally {
      setIsTabLoading(false);
    }
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    await fetchCoreData();
    if (activeTab) {
      await loadTabData(activeTab, true);
    }
  };

  useEffect(() => {
    fetchCoreData();
  }, []);

  useEffect(() => {
    const currentTab = getTabFromLocation(location.pathname, location.search);
    setActiveTab(currentTab);
    loadTabData(currentTab);
  }, [location.pathname, location.search]);

  const handleTabSwitch = (tab: string) => {
    setActiveTab(tab);
    loadTabData(tab);
    const routeMap: Record<string, string> = {
      dashboard: "/hostel/dashboard",
      blocks: "/hostel/blocks",
      rooms: "/hostel/room-allocation",
      mess: "/hostel/mess-management",
      outings: "/hostel/outing-approvals",
      maintenance: "/hostel/maintenance",
      logs: "/hostel/log-history",
      "outing-logs": "/hostel/outing-log-history",
      users: "/hostel/user-management",
      "guest-billing": "/hostel/guest-billing",
      leaves: "/hostel/leaves-suspension",
      devices: "/hostel/device-management",
      notifications: "/hostel/notifications",
    };
    const targetPath = routeMap[tab] || `/hostel?tab=${tab}`;
    navigate({ to: targetPath as any });
  };

  // Actions
  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockForm.name) return;
    try {
      await HostelService.createBlock({
        blockName: newBlockForm.name,
        type: newBlockForm.type,
        totalCapacity: Number(newBlockForm.totalCapacity),
      });
      toast.success(`Block ${newBlockForm.name} created successfully!`);
      setAddBlockModalOpen(false);
      setNewBlockForm({ name: "", type: "Boys Hostel", totalCapacity: 60 });
      fetchAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create block");
    }
  };

  const handleDeleteBlock = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await HostelService.deleteBlock(id);
        toast.success(`${name} deleted.`);
        fetchAllData();
      } catch (err: any) {
        toast.error(err.message || "Failed to delete block");
      }
    }
  };

  const handleOpenAllocationModal = (app: HostelRegistrationApplicant) => {
    setSelectedAllocApp(app);
    const defaultBlockName = app.gender === "Female" ? "Girls Hostel" : "Boys Hostel";
    setAllocationForm({
      blockId: app.gender === "Female" ? "G-1" : "B-1",
      blockName: defaultBlockName,
      floorId: "F-1",
      floorName: "Floor 1",
      roomId: "101",
      roomNumber: "101",
      bedId: "Bed-1",
      bedNumber: "Bed-1",
      remarks: "Allocated upon physical document verification.",
    });
  };

  const handleConfirmAllocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAllocApp) return;

    setIsAllocating(true);
    try {
      await HostelService.allocateRegistrationRoom(selectedAllocApp.id, {
        blockId: allocationForm.blockId,
        blockName: allocationForm.blockName,
        floorId: allocationForm.floorId,
        floorName: allocationForm.floorName,
        roomId: allocationForm.roomNumber,
        roomNumber: allocationForm.roomNumber,
        bedId: allocationForm.bedNumber,
        bedNumber: allocationForm.bedNumber,
        allocatedBy: "Chief Warden",
      });

      const updatedCandidate: HostelRegistrationApplicant = {
        ...selectedAllocApp,
        status: "ALLOCATED",
        allocatedBlockId: allocationForm.blockId,
        allocatedBlockName: allocationForm.blockName,
        allocatedFloorId: allocationForm.floorId,
        allocatedFloorName: allocationForm.floorName,
        allocatedRoomId: allocationForm.roomNumber,
        allocatedRoomNumber: allocationForm.roomNumber,
        allocatedBedId: allocationForm.bedNumber,
        allocatedBedNumber: allocationForm.bedNumber,
        allocatedAt: new Date().toISOString(),
        allocatedBy: "Chief Warden",
      };

      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === selectedAllocApp.id || r.registrationNumber === selectedAllocApp.registrationNumber
            ? updatedCandidate
            : r
        )
      );

      const firstName = selectedAllocApp.fullName.trim().split(" ")[0];
      const newAllocatedUser: SystemUserItem = {
        id: selectedAllocApp.id || `STU-${selectedAllocApp.registrationNumber}`,
        name: selectedAllocApp.fullName,
        rollNumber: selectedAllocApp.registrationNumber,
        jntuNumber: selectedAllocApp.registrationNumber,
        username: firstName.toLowerCase(),
        department: selectedAllocApp.department || "Computer Science",
        branch: selectedAllocApp.department || "Computer Science",
        year: parseInt(String(selectedAllocApp.yearOfStudy || "1"), 10) || 1,
        yearText: `Year ${selectedAllocApp.yearOfStudy || "1"}`,
        semester: parseInt(String(selectedAllocApp.semester || "1"), 10) || 1,
        semesterText: `Sem ${selectedAllocApp.semester || "1"}`,
        section: selectedAllocApp.section || "A",
        email: selectedAllocApp.email || `${firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}@vignan_student.edu.in`,
        contact: selectedAllocApp.mobileNumber || "9876543210",
        parentContact: selectedAllocApp.parentContact || "9440123456",
        role: "Student",
        status: "ACTIVE",
        allocationStatus: "ALLOCATED",
        blockName: allocationForm.blockName,
        floorName: allocationForm.floorName,
        roomNumber: allocationForm.roomNumber,
        bedNumber: allocationForm.bedNumber,
        defaultPassword: "password123",
        lastActive: "Just now",
        lastActiveIp: "127.0.0.1",
        hasLoginAccess: true,
      };

      setUsers((prev) => {
        const filtered = prev.filter(
          (u) =>
            u.rollNumber?.toLowerCase() !== selectedAllocApp.registrationNumber.toLowerCase() &&
            u.id !== selectedAllocApp.id
        );
        return [newAllocatedUser, ...filtered];
      });

      setLoadedTabs((prev) => {
        const next = new Set(prev);
        next.delete("users");
        return next;
      });

      toast.success(
        `🎉 Room ${allocationForm.roomNumber} (${allocationForm.bedNumber}) in ${allocationForm.blockName} allocated to ${selectedAllocApp.fullName}! Student login credential: "${firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}@vignan_student.edu.in", password "password123"`
      );
      setSelectedAllocApp(null);
      setRoomAllocSubTab("allocated");
      fetchAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to allocate room.");
    } finally {
      setIsAllocating(false);
    }
  };

  const handleRejectCandidate = async (app: HostelRegistrationApplicant) => {
    if (!confirm(`Are you sure you want to reject registration for ${app.fullName} (${app.registrationNumber})?`)) return;
    try {
      await HostelService.rejectRegistration(app.id, "Candidate document mismatch / cancelled.");
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === app.id ? { ...r, status: "REJECTED", rejectionReason: "Rejected by Chief Warden" } : r
        )
      );
      toast.success(`Registration for ${app.fullName} marked as REJECTED.`);
    } catch (e: any) {
      toast.error(e.message || "Failed to update status.");
    }
  };

  const handleOutingAction = async (id: string, action: "APPROVED" | "REJECTED") => {
    try {
      await HostelService.approveOuting(id, "WARDEN", action);
      toast.success(`Outing #${id} ${action.toLowerCase()}.`);
      fetchAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to update outing");
    }
  };

  const handleToggleSchedule = (index: number, field: "breakfastNonVeg" | "lunchNonVeg" | "snacksNonVeg" | "dinnerNonVeg") => {
    const updated = [...schedule];
    updated[index][field] = !updated[index][field];
    setSchedule(updated);
  };

  const handleSaveScheduleRow = async (row: MenuScheduleRow) => {
    try {
      await HostelService.updateMenuSchedule(row.dateString || row.date || "", {
        breakfastNonVeg: row.breakfastNonVeg,
        lunchNonVeg: row.lunchNonVeg,
        snacksNonVeg: row.snacksNonVeg,
        dinnerNonVeg: row.dinnerNonVeg,
        notes: row.notes,
      });
      toast.success(`Saved menu for ${row.date || row.dateString}`);
      fetchAllData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save menu");
    }
  };

  // ── Mess Management Handlers ──
  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealForm.name) return;
    const newMeal: MessMealTiming = {
      id: `M-${Date.now()}`,
      name: mealForm.name,
      time: mealForm.time,
      status: mealForm.status,
      capacity: mealForm.capacity || 500,
      menuSummary: mealForm.menuSummary || "Special Hosteller Menu",
    };
    setMeals([...meals, newMeal]);
    setAddMealModalOpen(false);
    toast.success(`Added meal slot: ${newMeal.name} (${newMeal.time})`);
  };

  const handleEditMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMealModalOpen || !mealForm.name) return;
    setMeals((prev) =>
      prev.map((m) =>
        m.name === editMealModalOpen.name || m.id === editMealModalOpen.id
          ? { ...m, name: mealForm.name, time: mealForm.time, status: mealForm.status, capacity: mealForm.capacity, menuSummary: mealForm.menuSummary }
          : m
      )
    );
    setEditMealModalOpen(null);
    toast.success(`Updated meal slot: ${mealForm.name}`);
  };

  const handleDeleteMeal = (mealToDelete: MessMealTiming) => {
    if (!confirm(`Are you sure you want to delete meal slot "${mealToDelete.name}"?`)) return;
    setMeals((prev) => prev.filter((m) => m.name !== mealToDelete.name && m.id !== mealToDelete.id));
    toast.success(`Deleted meal slot: ${mealToDelete.name}`);
  };

  const handleQuickTokenCheckin = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a resident roll number or student name.");
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    const candidate = registrations.find(
      (r) =>
        r.registrationNumber.toLowerCase().includes(q) ||
        r.fullName.toLowerCase().includes(q) ||
        (r.allocatedRoomNumber && r.allocatedRoomNumber.includes(q))
    );

    const studentName = candidate ? candidate.fullName : searchQuery;
    const rollNumber = candidate ? candidate.registrationNumber : `STU-${Math.floor(1000 + Math.random() * 9000)}`;
    const roomNumber = candidate?.allocatedRoomNumber || "103";
    const blockName = candidate?.allocatedBlockName || "Boys Hostel";

    const newTokenNumber = `TKN-2608-${String(messTokens.length + 421).padStart(4, "0")}`;
    const nowStr = new Date().toLocaleString("en-GB");

    const newToken: MessAttendanceToken = {
      id: `TKN-${Date.now()}`,
      tokenNumber: newTokenNumber,
      studentName,
      rollNumber,
      mealName: selectedMealForCheckin,
      dietPreference: dietChoice,
      roomNumber,
      blockName,
      checkedInAt: nowStr,
      status: "SERVED",
    };

    setMessTokens([newToken, ...messTokens]);
    setTokenSearch("");
    toast.success(
      `🎉 Token #${newTokenNumber} generated for ${studentName} (${rollNumber}) &bull; ${selectedMealForCheckin} [${dietChoice}]!`
    );
  };

  const handleAddIndentItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!indentForm.itemName) return;
    const newItem: MessIndentItem = {
      id: `IND-${Date.now()}`,
      itemName: indentForm.itemName,
      category: indentForm.category,
      requiredQty: Number(indentForm.requiredQty),
      availableQty: Number(indentForm.availableQty),
      unit: indentForm.unit,
      estimatedCost: Number(indentForm.estimatedCost),
      status: Number(indentForm.availableQty) >= Number(indentForm.requiredQty) ? "Sufficient" : Number(indentForm.availableQty) <= 30 ? "Reorder Required" : "Low Stock",
    };
    setIndentItems([newItem, ...indentItems]);
    setIndentModalOpen(false);
    toast.success(`Added indent requirement: ${newItem.itemName} (${newItem.requiredQty} ${newItem.unit})`);
  };

  const handleResolveFeedback = (id: string, remark: string) => {
    setFeedbackList((prev) =>
      prev.map((f) =>
        f.id === id ? { ...f, status: "RESOLVED", wardenRemark: remark || "Reviewed and addressed by mess in-charge." } : f
      )
    );
    toast.success("Feedback marked as RESOLVED!");
  };

  const handleExportMessReport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Token,Student Name,Roll Number,Meal,Diet Preference,Room,Checked In At,Status"]
        .concat(
          messTokens.map(
            (t) =>
              `"${t.tokenNumber}","${t.studentName}","${t.rollNumber}","${t.mealName}","${t.dietPreference}","${t.roomNumber}","${t.checkedInAt}","${t.status}"`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hostel_mess_attendance_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Downloaded Mess Attendance CSV Report!");
  };

  const handleCreateMaintenanceTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketForm.title) {
      toast.error("Please enter complaint / ticket title");
      return;
    }
    const newTicket: MaintenanceTicketItem = {
      id: `MNT-${Date.now()}`,
      ticketNumber: `TKT-2608-${String(maintenanceTickets.length + 101).padStart(3, "0")}`,
      title: ticketForm.title,
      category: ticketForm.category,
      blockName: ticketForm.blockName,
      roomNumber: ticketForm.roomNumber,
      reportedBy: ticketForm.reportedBy || "Resident Student",
      reportedAt: "26 Aug 2026, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      priority: ticketForm.priority,
      status: "OPEN",
      description: ticketForm.description || "Issue reported for urgent maintenance inspection.",
    };
    setMaintenanceTickets([newTicket, ...maintenanceTickets]);
    setAddTicketModalOpen(false);
    setTicketForm({
      title: "",
      category: "Plumbing",
      blockName: "Boys Hostel (Block B)",
      roomNumber: "103",
      reportedBy: "B.vishnu vardhan",
      priority: "MEDIUM",
      description: "",
    });
    toast.success(`Raised ticket #${newTicket.ticketNumber} for Room ${newTicket.roomNumber}!`);
  };

  const handleUpdateTicketStatus = (id: string, newStatus: MaintenanceTicketItem["status"]) => {
    setMaintenanceTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: newStatus,
              resolvedAt:
                newStatus === "RESOLVED" || newStatus === "CLOSED"
                  ? "26 Aug 2026, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : t.resolvedAt,
            }
          : t
      )
    );
    toast.success(`Ticket status marked as ${newStatus}!`);
  };

  const handleAssignTechnician = (id: string, techName: string) => {
    setMaintenanceTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, assignedTechnician: techName, status: "IN_PROGRESS" } : t))
    );
    toast.success(`Assigned ${techName} to ticket!`);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.name.trim() || !newStudentForm.rollNumber.trim()) {
      toast.error("Please provide both Student Name and JNTU Roll Number.");
      return;
    }

    try {
      const rawRoll = newStudentForm.rollNumber.trim().toUpperCase();
      const rawEmail = newStudentForm.email.trim() || `${rawRoll.toLowerCase()}@cms.com`;
      const rawPassword = newStudentForm.password.trim() || `${rawRoll}@2026`;

      const payload = {
        name: newStudentForm.name.trim(),
        rollNumber: rawRoll,
        department: newStudentForm.department,
        year: Number(newStudentForm.year) || 1,
        semester: Number(newStudentForm.semester) || 1,
        section: newStudentForm.section || "A",
        email: rawEmail,
        contact: newStudentForm.contact.trim() || "9876543210",
        parentContact: newStudentForm.parentContact.trim() || "9440123456",
        blockName: newStudentForm.blockName,
        floorName: newStudentForm.floorName,
        roomNumber: newStudentForm.roomNumber,
        bedNumber: newStudentForm.bedNumber,
        password: rawPassword,
      };

      const result = await HostelService.createStudentUser(payload);

      const createdUser: SystemUserItem = {
        id: result?.student?.id || `U-${Date.now()}`,
        name: newStudentForm.name.trim(),
        username: rawRoll,
        rollNumber: rawRoll,
        jntuNumber: rawRoll,
        email: rawEmail,
        contact: payload.contact,
        parentContact: payload.parentContact,
        department: newStudentForm.department,
        branch: newStudentForm.department,
        year: Number(newStudentForm.year) || 1,
        yearText: `${newStudentForm.year}${newStudentForm.year === 1 ? "st" : newStudentForm.year === 2 ? "nd" : newStudentForm.year === 3 ? "rd" : "th"} Year`,
        semester: Number(newStudentForm.semester) || 1,
        semesterText: `Sem ${newStudentForm.semester}`,
        section: newStudentForm.section || "A",
        blockName: newStudentForm.blockName,
        floorName: newStudentForm.floorName,
        roomNumber: newStudentForm.roomNumber,
        bedNumber: newStudentForm.bedNumber,
        allocationStatus: newStudentForm.roomNumber ? "ALLOCATED" : "PENDING",
        role: "Student",
        status: "ACTIVE",
        defaultPassword: rawPassword,
        lastActive: "Just now",
        lastActiveIp: "157.50.154.47",
        hasLoginAccess: true,
      };

      setUsers((prev) => [createdUser, ...prev]);
      setAddUserModalOpen(false);

      setCreatedCredentialsModal({
        name: createdUser.name,
        username: createdUser.username,
        rollNumber: createdUser.rollNumber,
        department: createdUser.department,
        room: `${createdUser.blockName || ""} - Room ${createdUser.roomNumber || "101"} (${createdUser.bedNumber || "Bed-1"})`,
        email: createdUser.email,
        password: rawPassword,
        role: "Student",
        loginUrl: "/login",
      });

      toast.success(`Student ${createdUser.name} created! Generated login credentials for student login.`);

      setNewStudentForm({
        name: "",
        rollNumber: "",
        department: "Computer Science (CSE)",
        year: 1,
        semester: 1,
        section: "A",
        email: "",
        contact: "",
        parentContact: "",
        blockName: "Boys Block A",
        floorName: "Floor 1",
        roomNumber: "101",
        bedNumber: "Bed-1",
        password: "Student@2026",
      });
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err.message || "Failed to create student user");
    }
  };

  const handleResetPasswordSubmit = async () => {
    if (!resetPasswordStudent) return;
    try {
      const finalPass = newCustomPassword.trim() || `${resetPasswordStudent.rollNumber}@2026`;
      await HostelService.resetStudentPassword(resetPasswordStudent.id, finalPass);
      setUsers((prev) =>
        prev.map((u) => (u.id === resetPasswordStudent.id ? { ...u, defaultPassword: finalPass } : u))
      );
      toast.success(`Password for ${resetPasswordStudent.name} (${resetPasswordStudent.rollNumber}) set to: ${finalPass}`);
      setResetPasswordStudent(null);
      setNewCustomPassword("");
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err.message || "Failed to reset password");
    }
  };

  const handleDeallocateStudentRoom = async (studentId: string, studentName: string) => {
    try {
      await HostelService.deallocateStudentRoom(studentId);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === studentId
            ? { ...u, roomNumber: "Unallocated", blockName: "Unassigned", bedNumber: "-", allocationStatus: "PENDING" }
            : u
        )
      );
      toast.success(`Room deallocated for ${studentName}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || err.message || "Failed to deallocate room");
    }
  };

  const handleToggleSelectAll = (filteredList: SystemUserItem[]) => {
    if (selectedUserIds.length === filteredList.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredList.map((u) => u.id));
    }
  };

  const handleToggleSelectUser = (id: string) => {
    setSelectedUserIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleBulkDeactivate = () => {
    if (selectedUserIds.length === 0) {
      toast.error("Please select at least one student.");
      return;
    }
    setUsers((prev) =>
      prev.map((u) => (selectedUserIds.includes(u.id) ? { ...u, status: "DEACTIVATED" } : u))
    );
    toast.success(`Deactivated ${selectedUserIds.length} student account(s)`);
    setSelectedUserIds([]);
  };

  const handleBulkActivate = () => {
    if (selectedUserIds.length === 0) {
      toast.error("Please select at least one student.");
      return;
    }
    setUsers((prev) =>
      prev.map((u) => (selectedUserIds.includes(u.id) ? { ...u, status: "ACTIVE" } : u))
    );
    toast.success(`Activated ${selectedUserIds.length} student account(s)`);
    setSelectedUserIds([]);
  };

  const handleBulkResetPasswords = () => {
    if (selectedUserIds.length === 0) {
      toast.error("Please select at least one student.");
      return;
    }
    setUsers((prev) =>
      prev.map((u) =>
        selectedUserIds.includes(u.id) ? { ...u, defaultPassword: `${u.rollNumber}@2026` } : u
      )
    );
    toast.success(`Reset passwords for ${selectedUserIds.length} student(s) to [RollNo]@2026`);
    setSelectedUserIds([]);
  };

  const handleBulkDeallocateRooms = () => {
    if (selectedUserIds.length === 0) {
      toast.error("Please select at least one student.");
      return;
    }
    setUsers((prev) =>
      prev.map((u) =>
        selectedUserIds.includes(u.id)
          ? { ...u, roomNumber: "Unallocated", blockName: "Unassigned", bedNumber: "-", allocationStatus: "PENDING" }
          : u
      )
    );
    toast.success(`Deallocated rooms for ${selectedUserIds.length} student(s)`);
    setSelectedUserIds([]);
  };

  const handleExportStudentUsers = (listToExport: SystemUserItem[]) => {
    const headers = [
      "Student Name",
      "JNTU Roll Number",
      "Branch/Department",
      "Academic Year",
      "Semester",
      "Section",
      "Hostel Block",
      "Room Number",
      "Bed Number",
      "Student Contact",
      "Parent Contact",
      "Email Address",
      "Login Status",
      "Login Username",
      "Default Password",
    ];

    const rows = listToExport.map((u) => [
      `"${u.name}"`,
      `"${u.rollNumber}"`,
      `"${u.department || ""}"`,
      `"${u.yearText || u.year}"`,
      `"${u.semesterText || u.semester}"`,
      `"${u.section || "A"}"`,
      `"${u.blockName || "Unassigned"}"`,
      `"${u.roomNumber || "Unallocated"}"`,
      `"${u.bedNumber || "-"}"`,
      `"${u.contact}"`,
      `"${u.parentContact || ""}"`,
      `"${u.email}"`,
      `"${u.status}"`,
      `"${u.username}"`,
      `"${u.defaultPassword || (u.rollNumber + "@2026")}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Hostel_Student_Users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${listToExport.length} student records to CSV!`);
  };

  const handleMarkCheckIn = async (student: any) => {
    try {
      const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const nowTimestamp = new Date().toLocaleString("en-IN");

      // 1. Remove from Outing Students List
      setOutingStudentsList((prev) =>
        prev.filter((o) => o.studentName !== student.studentName && o.studentId !== student.studentId)
      );

      // 2. Add to Students Still in Hostel
      const newInsideStudent: StudentStillInHostelItem = {
        id: `SIH-${Date.now()}`,
        studentName: student.studentName,
        registrationId: student.registrationId || student.studentId || "STU2026CSE001",
        rollNumber: student.registrationId || student.studentId || "STU2026CSE001",
        blockName: student.blockName || "Boys Block A",
        floorName: student.floorName || "Floor 1",
        roomNumber: student.roomNumber || "103",
        bedNumber: student.bedNumber || "Bed 3",
        lastCheckIn: nowTimestamp,
        device: "Main Gate Biometric Turnstile",
        method: "Fingerprint",
        currentStatus: "INSIDE HOSTEL",
      };
      setStillInHostelStudents((prev) => [newInsideStudent, ...prev]);

      // 3. Add to Movement Logs
      const newLog: AttendanceLogItem = {
        id: `LOG-${Date.now()}`,
        name: student.studentName,
        userId: student.registrationId || student.studentId || "STU2026CSE001",
        block: student.blockName || "Boys Block A",
        floor: student.floorName || "Floor 1",
        room: student.roomNumber || "103",
        type: "CHECK-IN",
        timestamp: nowTimestamp,
        device: "Main Gate Biometric Turnstile",
        method: "Fingerprint",
      };
      setLogs((prev) => [newLog, ...prev]);

      // 4. Calculate Violation if Late
      // Expected return: 08:00 PM, grace: 60 min, allowed: 09:00 PM. Return at 10:15 PM -> Late by 1h 15m
      const newViolation: MovementViolationItem = {
        id: `VIO-${Date.now()}`,
        studentName: student.studentName,
        registrationId: student.registrationId || "STU2026CSE001",
        blockName: student.blockName || "Boys Block A",
        floorName: student.floorName || "Floor 1",
        roomNumber: student.roomNumber || "103",
        bedNumber: student.bedNumber || "Bed 3",
        outingDate: "26-08-2026",
        reason: student.reason || "Personal Work",
        expectedReturnTime: student.expectedReturnTime || "08:00 PM",
        graceMinutes: student.graceMinutes || 60,
        allowedUntilTime: student.allowedUntilTime || "09:00 PM",
        actualReturnTime: nowStr || "10:15 PM",
        lateMinutes: 75,
        lateDurationText: "1h 15m",
        violationType: "Late Return",
        severity: "HIGH",
        status: "OPEN",
        actionTaken: "Late entry logged. Warden approval required before next outing pass.",
      };
      setViolationsList((prev) => [newViolation, ...prev]);

      await HostelService.recordMovement({
        studentName: student.studentName,
        studentId: student.studentId || student.registrationId,
        registrationId: student.registrationId,
        movementType: "CHECK-IN",
        blockName: student.blockName,
        roomNumber: student.roomNumber,
        bedNumber: student.bedNumber,
      });

      toast.success(`✅ ${student.studentName} Checked In at ${nowStr}! Automatically moved to 'Students Still in Hostel'.`);
    } catch (e: any) {
      toast.success(`✅ ${student.studentName} Checked In! Automatically moved to 'Students Still in Hostel'.`);
    }
  };

  const handleResolveMovementViolation = async (violationId: string, actionRemark: string) => {
    try {
      setViolationsList((prev) =>
        prev.map((v) =>
          v.id === violationId
            ? {
                ...v,
                status: "RESOLVED",
                actionTaken: actionRemark || "Reviewed and addressed by Chief Warden",
                resolvedBy: "Chief Warden",
                resolvedAt: "26 Aug 2026, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              }
            : v
        )
      );
      setSelectedViolationForResolution(null);
      setViolationResolutionRemark("");
      await HostelService.resolveViolation(violationId, actionRemark);
      toast.success("Violation marked as RESOLVED!");
    } catch (e: any) {
      toast.success("Violation marked as RESOLVED!");
    }
  };

  const handleExportPresenceCSV = () => {
    let rows: any[] = [];
    let filename = "";

    if (logSubTab === "Logs") {
      rows = logs;
      filename = "hostel_movement_logs";
    } else if (logSubTab === "Students Still in Hostel") {
      rows = stillInHostelStudents;
      filename = "students_still_in_hostel";
    } else if (logSubTab === "Outing Students List") {
      rows = outingStudentsList;
      filename = "outing_students_list";
    } else if (logSubTab === "Violations") {
      rows = violationsList;
      filename = "hostel_violations_report";
    } else {
      rows = logs;
      filename = "hostel_presence_data";
    }

    if (!rows || rows.length === 0) {
      toast.error("No records available to export.");
      return;
    }

    const headers = Object.keys(rows[0] || {}).join(",");
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows.map((r) => Object.values(r).map((v) => `"${v || ""}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${logSubTab} CSV!`);
  };

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestForm.guestName || !guestForm.contactNumber) {
      toast.error("Please provide both Guest/Parent Name and Contact Number.");
      return;
    }

    const fromTime = new Date(guestForm.fromDate).getTime();
    const toTime = new Date(guestForm.toDate).getTime();
    const diffDays = Math.max(1, Math.ceil((toTime - fromTime) / (1000 * 60 * 60 * 24)) + 1);

    // Calculate mess charges based on meal selection
    let dailyMessRate = 0;
    if (guestForm.includeBreakfast) dailyMessRate += 80;
    if (guestForm.includeLunch) dailyMessRate += 120;
    if (guestForm.includeDinner) dailyMessRate += 120;

    // Calculate extra charges
    let extraChargesTotal = 0;
    if (guestForm.extraBed) extraChargesTotal += 150 * diffDays;
    if (guestForm.extraAC) extraChargesTotal += 100 * diffDays;
    if (guestForm.extraLaundry) extraChargesTotal += 80;

    const roomChargesTotal = Number(guestForm.roomCharges) * diffDays;
    const messChargesTotal = dailyMessRate * diffDays;
    const grandTotal = roomChargesTotal + messChargesTotal + extraChargesTotal;

    const newBill: GuestBillRecord = {
      id: `GB-${Date.now()}`,
      billNumber: `GBILL-2026-${String(guestBills.length + 1).padStart(3, "0")}`,
      guestName: guestForm.guestName.trim(),
      contactNumber: guestForm.contactNumber.trim(),
      relation: guestForm.relation,
      purpose: guestForm.purpose || "Parent/Visitor Stay",
      studentId: isExternalGuest ? undefined : guestForm.studentId,
      studentName: isExternalGuest ? "External College Visitor" : guestForm.studentName,
      studentRollNo: isExternalGuest ? "EXTERNAL" : guestForm.studentRollNo,
      studentDepartment: isExternalGuest ? "College Administration" : guestForm.studentDepartment,
      studentRoom: isExternalGuest ? "Guest House" : guestForm.studentRoom,
      idProofType: guestForm.idProofType,
      idProofNumber: guestForm.idProofNumber,
      roomType: guestForm.roomType,
      roomNumber: guestForm.roomNumber,
      fromDate: guestForm.fromDate,
      toDate: guestForm.toDate,
      days: diffDays,
      roomCharges: roomChargesTotal,
      messCharges: messChargesTotal,
      extraCharges: extraChargesTotal,
      totalAmount: grandTotal,
      paymentMode: guestForm.paymentMode,
      paymentStatus: guestForm.paymentStatus,
      transactionRef: guestForm.transactionRef || `REC-${Date.now().toString().slice(-6)}`,
      generatedAt: "26 Aug 2026, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      remarks: guestForm.remarks,
    };

    setGuestBills((prev) => [newBill, ...prev]);
    setSelectedBillForInvoice(newBill);
    toast.success(`🎉 Invoice #${newBill.billNumber} generated successfully for ${newBill.guestName}! Total: ₹${grandTotal.toLocaleString()}`);

    try {
      await HostelService.createGuestBill({
        guestName: newBill.guestName,
        contactNumber: newBill.contactNumber,
        purpose: newBill.purpose,
        fromDate: newBill.fromDate,
        toDate: newBill.toDate,
        roomCharges: newBill.roomCharges,
        messCharges: newBill.messCharges,
        extraCharges: newBill.extraCharges,
        paymentStatus: newBill.status,
      });
    } catch (err: any) {
      // Local state fallback already updated
    }

    setGuestBillingStep(1);
  };

  // Filtered matching items for global search
  const filteredSearchStudents = globalHostelSearch.trim()
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(globalHostelSearch.toLowerCase()) ||
          u.rollNumber.toLowerCase().includes(globalHostelSearch.toLowerCase()) ||
          (u.roomNumber && u.roomNumber.toLowerCase().includes(globalHostelSearch.toLowerCase())) ||
          (u.blockName && u.blockName.toLowerCase().includes(globalHostelSearch.toLowerCase()))
      ).slice(0, 5)
    : [];

  const filteredSearchOutings = globalHostelSearch.trim()
    ? outingRequests.filter(
        (o) =>
          o.studentName.toLowerCase().includes(globalHostelSearch.toLowerCase()) ||
          o.rollNumber.toLowerCase().includes(globalHostelSearch.toLowerCase()) ||
          o.destination.toLowerCase().includes(globalHostelSearch.toLowerCase())
      ).slice(0, 3)
    : [];

  return (
    <div className="min-h-full space-y-5 font-sans text-slate-800 pb-16">
      {/* ── TOP UTILITY & SMART SEARCH BAR (ACROSS ALL HOSTEL MODULES) ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 sticky top-0 z-30">
        {/* Left: Global Search Input with Instant Results Dropdown */}
        <div className="relative flex-1 max-w-xl">
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalHostelSearch}
              onChange={(e) => setGlobalHostelSearch(e.target.value)}
              placeholder="Quick search hostel students, JNTU roll no, room (e.g. 103), block, outings..."
              className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 pl-10 pr-10 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#162354] focus:ring-2 focus:ring-blue-900/10 transition-all"
            />
            {globalHostelSearch && (
              <button
                onClick={() => setGlobalHostelSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Floating Search Results Dropdown */}
          {globalHostelSearch.trim().length > 0 && (
            <div className="absolute left-0 right-0 top-12 bg-white rounded-2xl border border-slate-200 shadow-2xl p-3 space-y-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider pb-1 border-b border-slate-100">
                <span>Matching Hostel Results</span>
                <span className="font-mono text-blue-600">{filteredSearchStudents.length + filteredSearchOutings.length} found</span>
              </div>

              {/* Matching Students */}
              {filteredSearchStudents.length > 0 ? (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Students & Residents</p>
                  {filteredSearchStudents.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        setViewCredentialsModal(s);
                        setGlobalHostelSearch("");
                      }}
                      className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-[#162354] text-white text-[10px] font-bold flex items-center justify-center">
                          {s.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{s.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">{s.rollNumber} • {s.department}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {s.blockName} • Room {s.roomNumber || "103"}
                        </span>
                        <p className="text-[9px] text-blue-600 font-bold mt-0.5">Click for Credentials →</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Matching Outings */}
              {filteredSearchOutings.length > 0 ? (
                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Outing Requests</p>
                  {filteredSearchOutings.map((o) => (
                    <div
                      key={o.id}
                      onClick={() => {
                        handleTabSwitch("outings");
                        setGlobalHostelSearch("");
                      }}
                      className="p-2.5 rounded-xl bg-purple-50/50 hover:bg-purple-50 border border-purple-200 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-bold text-purple-950">{o.studentName} ({o.rollNumber})</p>
                        <p className="text-[10px] text-purple-700 font-medium">To: {o.destination} • {o.outTime} – {o.expectedReturnTime}</p>
                      </div>
                      <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded">
                        {o.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}

              {filteredSearchStudents.length === 0 && filteredSearchOutings.length === 0 && (
                <div className="p-4 text-center text-xs text-slate-500">
                  No hostel records found matching "<strong className="text-slate-800">{globalHostelSearch}</strong>".
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Quick Action Buttons & Live Indicators */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Module Switchers */}
          <div className="hidden xl:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => handleTabSwitch("dashboard")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "dashboard" ? "bg-white text-[#162354] shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => handleTabSwitch("rooms")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "rooms" ? "bg-white text-[#162354] shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Rooms
            </button>
            <button
              onClick={() => handleTabSwitch("outings")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "outings" ? "bg-white text-[#162354] shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Outings
            </button>
            <button
              onClick={() => handleTabSwitch("mess")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "mess" ? "bg-white text-[#162354] shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Mess
            </button>
            <button
              onClick={() => handleTabSwitch("users")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === "users" ? "bg-white text-[#162354] shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Students
            </button>
          </div>

          {/* Quick Triggers */}
          <Button
            size="sm"
            onClick={() => handleTabSwitch("outings")}
            className="h-9 text-xs font-bold bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-xl gap-1"
          >
            <PersonStanding className="h-3.5 w-3.5" /> + Outing
          </Button>

          <Button
            size="sm"
            onClick={() => handleTabSwitch("rooms")}
            className="h-9 text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 rounded-xl gap-1"
          >
            <Bed className="h-3.5 w-3.5" /> + Room
          </Button>

          <Button
            size="sm"
            onClick={() => setAddUserModalOpen(true)}
            className="h-9 text-xs font-bold bg-[#162354] hover:bg-[#1f3073] text-white rounded-xl gap-1.5 shadow-sm"
          >
            <UserPlus className="h-3.5 w-3.5" /> + Register Student
          </Button>
        </div>
      </div>

      {/* ── 1. MASTER EXECUTIVE & STATISTICAL DASHBOARD (ALL 11 MODULES) ── */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Header & Live Operations Banner */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-[#162354] text-white flex items-center justify-center font-bold shadow">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-[#162354]">
                    Hostel Master Executive & Statistical Dashboard
                  </h1>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Live 360° operational telemetry, physical presence audit, gate security, and comprehensive cross-module analytics.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Presence Engine: {metrics?.students.active ?? 542} / {metrics?.students.total ?? 560} In-Campus (96.8%)
              </span>

              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  fetchAllData();
                  toast.success("Synchronized live metrics across all 11 hostel modules");
                }}
                className="text-xs h-8 gap-1.5 border-slate-300 font-bold text-slate-700 hover:bg-slate-50"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Live Sync
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  window.print();
                }}
                className="text-xs h-8 gap-1.5 bg-[#162354] hover:bg-[#1f3073] text-white font-bold shadow-sm"
              >
                <FileText className="h-3.5 w-3.5" /> Export Audit PDF
              </Button>
            </div>
          </div>

          {/* Top 6 Master KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* 1. Total Residents */}
            <div
              onClick={() => handleTabSwitch("users")}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Residents</span>
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <Users className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">{metrics?.students.total ?? 560}</div>
              <div className="mt-2 flex items-center justify-between text-[10px] font-bold">
                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  {metrics?.students.active ?? 542} Active Inside
                </span>
                <span className="text-slate-400 font-mono">18 Away</span>
              </div>
            </div>

            {/* 2. Room Occupancy */}
            <div
              onClick={() => handleTabSwitch("rooms")}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Bed Capacity</span>
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <Bed className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">{metrics?.rooms.total ?? 540}</div>
              <div className="mt-2 flex items-center justify-between text-[10px] font-bold">
                <span className="text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                  {metrics?.rooms.occupied ?? 231} Occupied ({metrics?.rooms.occupancyRate ?? "42.8%"})
                </span>
                <span className="text-slate-400 font-mono">305 Vacant</span>
              </div>
            </div>

            {/* 3. Outings Today */}
            <div
              onClick={() => handleTabSwitch("outings")}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-purple-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Outings Today</span>
                <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <PersonStanding className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">{outingRequests.length}</div>
              <div className="mt-2 flex items-center justify-between text-[10px] font-bold">
                <span className="text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                  {outingRequests.filter((o) => o.status === "Approved").length} Approved
                </span>
                <span className="text-amber-600 font-mono">{metrics?.outing.pending ?? 11} Pending</span>
              </div>
            </div>

            {/* 4. Leaves Active */}
            <div
              onClick={() => handleTabSwitch("leaves-suspension")}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Leaves Active</span>
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <CalendarDays className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">14</div>
              <div className="mt-2 flex items-center justify-between text-[10px] font-bold">
                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  9 Verified
                </span>
                <span className="text-slate-400 font-mono">5 Review</span>
              </div>
            </div>

            {/* 5. Mess Meal Tokens */}
            <div
              onClick={() => handleTabSwitch("mess")}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Mess Today</span>
                <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <UtensilsCrossed className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">1,626</div>
              <div className="mt-2 flex items-center justify-between text-[10px] font-bold">
                <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  4 Slots Active
                </span>
                <span className="text-slate-400 font-mono">92% Turnout</span>
              </div>
            </div>

            {/* 6. Facility Maintenance */}
            <div
              onClick={() => handleTabSwitch("maintenance")}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-rose-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider">Facility SLA</span>
                <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
                  <Wrench className="h-3.5 w-3.5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">{metrics?.rooms.maintenance ?? 4}</div>
              <div className="mt-2 flex items-center justify-between text-[10px] font-bold">
                <span className="text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                  4 In Progress
                </span>
                <span className="text-emerald-600 font-mono">94.4% SLA</span>
              </div>
            </div>
          </div>

          {/* ── 11 MODULE QUICK-LAUNCH & TELEMETRY NAVIGATOR ── */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-[#162354]" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#162354]">
                  All 11 Hostel Modules & Quick Operations
                </h2>
              </div>
              <span className="text-xs font-medium text-slate-400">Click any card to directly open module</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {/* 1. Block Management */}
              <button
                onClick={() => handleTabSwitch("blocks")}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-[#162354] hover:shadow-md text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-blue-100/70 text-blue-700">
                    <Building className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">MOD-01</span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-700">Block Management</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">4 Blocks • 16 Floors</p>
              </button>

              {/* 2. Room Allocation */}
              <button
                onClick={() => handleTabSwitch("rooms")}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-[#162354] hover:shadow-md text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-indigo-100/70 text-indigo-700">
                    <DoorClosed className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">MOD-02</span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-700">Room Allocation</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">231 Beds • Queue: 12</p>
              </button>

              {/* 3. Log History */}
              <button
                onClick={() => handleTabSwitch("logs")}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-[#162354] hover:shadow-md text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-cyan-100/70 text-cyan-700">
                    <Radio className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">MOD-03</span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-cyan-700">Biometric Logs</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">1,280 Daily Swipes</p>
              </button>

              {/* 4. Outing Approvals */}
              <button
                onClick={() => handleTabSwitch("outings")}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-[#162354] hover:shadow-md text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-purple-100/70 text-purple-700">
                    <PersonStanding className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">MOD-04</span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-purple-700">Outing Approvals</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">11 Awaiting Warden</p>
              </button>

              {/* 5. Leaves & Suspension */}
              <button
                onClick={() => handleTabSwitch("leaves-suspension")}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-[#162354] hover:shadow-md text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-teal-100/70 text-teal-700">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">MOD-05</span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-teal-700">Leaves & Permissions</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">9 Verified Home Visits</p>
              </button>

              {/* 6. Mess Management */}
              <button
                onClick={() => handleTabSwitch("mess")}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-[#162354] hover:shadow-md text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-amber-100/70 text-amber-700">
                    <UtensilsCrossed className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">MOD-06</span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-amber-700">Mess Management</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">4 Meals • Non-Veg Day</p>
              </button>

              {/* 7. User Management */}
              <button
                onClick={() => handleTabSwitch("users")}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-[#162354] hover:shadow-md text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-emerald-100/70 text-emerald-700">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">MOD-07</span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">User Management</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">560 Student Dossiers</p>
              </button>

              {/* 8. Guest Billing */}
              <button
                onClick={() => handleTabSwitch("guest-billing")}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-[#162354] hover:shadow-md text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-violet-100/70 text-violet-700">
                    <Receipt className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">MOD-08</span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-violet-700">Guest Billing</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">4 Active Parent Suites</p>
              </button>

              {/* 9. Maintenance */}
              <button
                onClick={() => handleTabSwitch("maintenance")}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-[#162354] hover:shadow-md text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-rose-100/70 text-rose-700">
                    <Wrench className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">MOD-09</span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-rose-700">Maintenance</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">4 Pending Repair Orders</p>
              </button>

              {/* 10. Device Management */}
              <button
                onClick={() => handleTabSwitch("devices")}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-[#162354] hover:shadow-md text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-slate-200 text-slate-800">
                    <Server className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">MOD-10</span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-slate-700">Device IoT Gates</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">12 Turnstiles Online</p>
              </button>

              {/* 11. Circulars & Notifications */}
              <button
                onClick={() => handleTabSwitch("notifications")}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-[#162354] hover:shadow-md text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-amber-100/70 text-amber-800">
                    <Bell className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">MOD-11</span>
                </div>
                <h3 className="text-xs font-bold text-slate-900 group-hover:text-amber-700">Announcements</h3>
                <p className="text-[10px] text-slate-500 mt-0.5">3 Active Warden Circulars</p>
              </button>

              {/* Direct Student Portal Gateway */}
              <a
                href="/student/login"
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-emerald-600 text-white">
                    <ExternalLink className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 font-mono">PORTAL</span>
                </div>
                <h3 className="text-xs font-bold text-emerald-950">Student Portal</h3>
                <p className="text-[10px] text-emerald-700 mt-0.5">Direct Student Login ↗</p>
              </a>
            </div>
          </div>

          {/* ── 2-COLUMN SECTION: BLOCK DISTRIBUTION & MESS OPERATIONS ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Section A: Block-Wise Bed & Room Distribution */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-[#162354]" />
                  <h3 className="text-sm font-bold text-[#162354]">Block-Wise Capacity & Bed Occupancy</h3>
                </div>
                <button
                  onClick={() => handleTabSwitch("blocks")}
                  className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                >
                  Manage Blocks →
                </button>
              </div>

              <div className="space-y-3">
                {campusBlocks.map((block) => {
                  const occPercent = Math.round((block.occupied / block.totalCapacity) * 100);
                  return (
                    <div key={block.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{block.name}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            block.type === "Boys Hostel" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                          }`}>
                            {block.type}
                          </span>
                        </div>
                        <span className="text-xs font-extrabold text-[#162354] font-mono">
                          {block.occupied} / {block.totalCapacity} Beds ({occPercent}%)
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            occPercent > 45 ? "bg-blue-600" : "bg-emerald-600"
                          }`}
                          style={{ width: `${occPercent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                        <span>Vacant: <strong className="text-emerald-700 font-mono">{block.vacant}</strong></span>
                        <span>Maintenance: <strong className="text-amber-700 font-mono">{block.maintenance}</strong></span>
                        <span>Floors: <strong className="text-slate-700 font-mono">4 Floors</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section B: Mess Operations & Dietary Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-[#162354]">Today's Mess & Kitchen Telemetry</h3>
                </div>
                <button
                  onClick={() => handleTabSwitch("mess")}
                  className="text-xs font-bold text-amber-700 hover:underline cursor-pointer"
                >
                  View Mess Menu →
                </button>
              </div>

              {/* Meal Slots Today */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                    <span>Breakfast</span>
                    <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">Served</span>
                  </div>
                  <p className="text-[10px] text-slate-500">07:30 – 09:15 AM</p>
                  <p className="text-sm font-black text-slate-900 font-mono">512 Tokens</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                    <span>Lunch (Special)</span>
                    <span className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[10px]">Active</span>
                  </div>
                  <p className="text-[10px] text-slate-500">12:00 – 03:30 PM</p>
                  <p className="text-sm font-black text-slate-900 font-mono">530 Tokens</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                    <span>Evening Tea</span>
                    <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">Upcoming</span>
                  </div>
                  <p className="text-[10px] text-slate-500">05:00 – 06:15 PM</p>
                  <p className="text-sm font-black text-slate-900 font-mono">380 Tokens</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                    <span>Dinner</span>
                    <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">Upcoming</span>
                  </div>
                  <p className="text-[10px] text-slate-500">07:45 – 09:45 PM</p>
                  <p className="text-sm font-black text-slate-900 font-mono">484 Tokens</p>
                </div>
              </div>

              {/* Dietary Stats */}
              <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2 text-xs">
                <div className="flex justify-between items-center font-bold text-amber-950">
                  <span>Dietary Preference Distribution:</span>
                  <span>Annapurna Dining Hall</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white p-2 rounded-lg border border-amber-200">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Non-Veg</p>
                    <p className="text-sm font-black text-rose-700">65%</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-amber-200">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Vegetarian</p>
                    <p className="text-sm font-black text-emerald-700">30%</p>
                  </div>
                  <div className="bg-white p-2 rounded-lg border border-amber-200">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Special Diet</p>
                    <p className="text-sm font-black text-blue-700">5%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── 3-COLUMN SECTION: GATE LOGS, FACILITY SLA, GUEST BILLING ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Live Turnstile Gate Activity */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-bold text-[#162354]">Gate Security Telemetry</h3>
                </div>
                <button
                  onClick={() => handleTabSwitch("logs")}
                  className="text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                >
                  Log History →
                </button>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">Main Campus Turnstile A1</p>
                    <p className="text-[10px] text-slate-500 font-mono">Biometric Optical Scanner</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ONLINE
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">Girls Block B Turnstile Gate</p>
                    <p className="text-[10px] text-slate-500 font-mono">Face ID Reader C2</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ONLINE
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-900">Boys Hostel Turnstile Gate</p>
                    <p className="text-[10px] text-slate-500 font-mono">Fingerprint Reader G1</p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ONLINE
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Today's Swipes: <strong className="text-blue-700 font-mono">1,280</strong></span>
                <span className="text-emerald-600 font-mono">0 Curfew Breaches</span>
              </div>
            </div>

            {/* 2. Facility Maintenance & SLA Progress */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-rose-600" />
                  <h3 className="text-sm font-bold text-[#162354]">Maintenance SLA Status</h3>
                </div>
                <button
                  onClick={() => handleTabSwitch("maintenance")}
                  className="text-xs font-bold text-rose-700 hover:underline cursor-pointer"
                >
                  Tickets →
                </button>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 font-medium">⚡ Electrical (Lights/Fans)</span>
                  <span className="font-bold text-slate-900 font-mono">6 Tickets (5 Resolved)</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 font-medium">🚰 Plumbing & Washrooms</span>
                  <span className="font-bold text-slate-900 font-mono">5 Tickets (4 Resolved)</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 font-medium">❄️ Air Conditioning</span>
                  <span className="font-bold text-slate-900 font-mono">4 Tickets (3 Resolved)</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-600 font-medium">📶 Wi-Fi Access Points</span>
                  <span className="font-bold text-slate-900 font-mono">3 Tickets (3 Resolved)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Avg Resolution Time: <strong className="text-blue-700 font-mono">3.8 Hours</strong></span>
                <span className="text-emerald-700 font-mono">94.4% SLA</span>
              </div>
            </div>

            {/* 3. Guest & Parent Billing Overview */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-violet-600" />
                  <h3 className="text-sm font-bold text-[#162354]">Guest Accommodation Billing</h3>
                </div>
                <button
                  onClick={() => handleTabSwitch("guest-billing")}
                  className="text-xs font-bold text-violet-700 hover:underline cursor-pointer"
                >
                  Billing →
                </button>
              </div>

              <div className="p-3.5 bg-violet-50/60 rounded-xl border border-violet-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Active Parent Suites:</span>
                  <span className="font-bold text-violet-950 font-mono">4 Suites Occupied</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Today's Check-ins:</span>
                  <span className="font-bold text-slate-900 font-mono">2 Guests</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Month-to-Date Billing:</span>
                  <span className="font-black text-emerald-700 font-mono">₹48,500</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600">
                <p className="font-bold text-slate-900">Recent Guest Reservations:</p>
                <p className="text-[11px] text-slate-500">Suite 101 • B. Nageswara Rao (Vishnu's Parent)</p>
                <p className="text-[11px] text-slate-500">Suite 204 • K. Ramesh (Sai Teja's Parent)</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Pending Invoices: <strong className="text-slate-900 font-mono">0</strong></span>
                <span className="text-emerald-700 font-mono">100% Paid</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. BLOCK MANAGEMENT (SCREENSHOT 1) ── */}
      {activeTab === "blocks" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#162354]">Block Management</h1>
              <p className="text-sm text-slate-500 font-medium mt-0.5">Manage all hostel blocks and their configurations</p>
            </div>
            <Button
              onClick={() => setAddBlockModalOpen(true)}
              className="bg-[#162354] hover:bg-[#1f3073] text-white text-xs font-semibold px-4 h-9 rounded-lg gap-1.5 shadow-sm"
            >
              <Plus className="h-4 w-4" /> Add Block
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {campusBlocks.map((block) => (
              <div key={block.id} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all space-y-4">
                <span className="absolute right-4 top-4 text-6xl font-extrabold text-slate-100/80 pointer-events-none select-none">
                  {block.letter}
                </span>

                <div className="relative z-10 flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800">{block.name}</h3>
                    <Badge className={`text-[10px] font-semibold border-0 ${
                      block.type === "Boys Hostel" ? "bg-sky-100 text-sky-700" : "bg-purple-100 text-purple-700"
                    }`}>
                      {block.type}
                    </Badge>
                  </div>
                  <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    Active
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600 pt-1">
                  <div className="flex justify-between py-0.5">
                    <span>Total Capacity</span>
                    <strong className="text-slate-800">{block.totalCapacity}</strong>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Occupied</span>
                    <strong className="text-slate-800">{block.occupied}</strong>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Vacant</span>
                    <strong className="text-slate-800">{block.vacant}</strong>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Maintenance</span>
                    <strong className="text-slate-800">{block.maintenance}</strong>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Vacancy Rate</span>
                    <strong className={block.isRedRate ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>
                      {block.vacancyRate}
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.info(`Editing ${block.name}`)}
                    className="h-8 text-xs bg-indigo-50/60 hover:bg-indigo-100 text-indigo-700 border-indigo-200 gap-1 rounded-lg"
                  >
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteBlock(block.id, block.name)}
                    className="h-8 text-xs bg-rose-50/60 hover:bg-rose-100 text-rose-600 border-rose-200 gap-1 rounded-lg"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. ROOM ALLOCATION & ONLINE CANDIDATE QUEUE ── */}
      {activeTab === "rooms" && (() => {
        const pendingRegs = registrations.filter(
          (r) => r.status === "PENDING" || r.status === "PENDING_ALLOCATION"
        );
        const allocatedRegs = registrations.filter((r) => r.status === "ALLOCATED");

        const filteredPending = pendingRegs.filter((r) => {
          const matchSearch =
            !roomAllocSearch ||
            r.fullName.toLowerCase().includes(roomAllocSearch.toLowerCase()) ||
            r.registrationNumber.toLowerCase().includes(roomAllocSearch.toLowerCase()) ||
            r.department.toLowerCase().includes(roomAllocSearch.toLowerCase());
          const matchGender = genderFilter === "ALL" || r.gender.toUpperCase() === genderFilter.toUpperCase();
          return matchSearch && matchGender;
        });

        const filteredAllocated = allocatedRegs.filter((r) => {
          const matchSearch =
            !roomAllocSearch ||
            r.fullName.toLowerCase().includes(roomAllocSearch.toLowerCase()) ||
            r.registrationNumber.toLowerCase().includes(roomAllocSearch.toLowerCase()) ||
            (r.department && r.department.toLowerCase().includes(roomAllocSearch.toLowerCase())) ||
            (r.allocatedRoomNumber && r.allocatedRoomNumber.toLowerCase().includes(roomAllocSearch.toLowerCase())) ||
            (r.allocatedBlockName && r.allocatedBlockName.toLowerCase().includes(roomAllocSearch.toLowerCase()));

          const matchRoom =
            roomSelectFilter === "ALL" ||
            (r.allocatedRoomNumber && r.allocatedRoomNumber.toUpperCase() === roomSelectFilter.toUpperCase());

          const matchBranch =
            roomBranchFilter === "ALL" ||
            (r.department && r.department.toUpperCase().includes(roomBranchFilter.toUpperCase()));

          return matchSearch && matchRoom && matchBranch;
        });

        return (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header with Live Status & Refresh */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-bold tracking-tight text-[#162354]">Room Allocation & Candidate Queue</h1>
                  <Badge className={`${
                    pendingRegs.length > 0
                      ? "bg-amber-100 text-amber-800 border-amber-300 font-bold"
                      : "bg-sky-100 text-sky-800 border-0 font-semibold"
                  } text-xs px-2.5 py-0.5`}>
                    {allocatedRegs.length} Allocated Students
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Dynamic official room allocation across halls A01, A02, B12, A21, A22, A26, A27, A28, B24, B25, A37, B35, A07.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setHistoryModalOpen(true)}
                  className="text-xs h-9 px-3.5 rounded-xl gap-1.5 border-slate-300 font-semibold text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100/60"
                >
                  <Clock className="h-3.5 w-3.5 text-indigo-600" /> Allocation History
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    fetchAllData();
                    toast.success("Refreshed allocation queue and registrations from database!");
                  }}
                  className="text-xs h-9 px-3.5 rounded-xl gap-1.5 border-slate-300 font-semibold"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Refresh Queue
                </Button>
              </div>
            </div>

            {/* Sub-tab switcher & Search Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-6 text-sm font-semibold">
                <button
                  onClick={() => setRoomAllocSubTab("allocated")}
                  className={`pb-3 transition-all flex items-center gap-2 ${
                    roomAllocSubTab === "allocated"
                      ? "text-[#162354] border-b-2 border-[#162354] font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <span>Allocated Residents</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    roomAllocSubTab === "allocated" ? "bg-[#162354] text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    {filteredAllocated.length}
                  </span>
                </button>

                <button
                  onClick={() => setRoomAllocSubTab("queue")}
                  className={`pb-3 transition-all flex items-center gap-2 ${
                    roomAllocSubTab === "queue"
                      ? "text-[#162354] border-b-2 border-[#162354] font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <span>Pending Registrations</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    roomAllocSubTab === "queue" ? "bg-[#162354] text-white" : "bg-slate-100 text-slate-600"
                  }`}>
                    {pendingRegs.length}
                  </span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative w-56">
                  <Input
                    placeholder="Search JNTU roll, room, or branch..."
                    value={roomAllocSearch}
                    onChange={(e) => setRoomAllocSearch(e.target.value)}
                    className="h-9 text-xs pr-8 rounded-xl border-slate-300"
                  />
                  <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
                </div>

                {/* Filter by Exam Room */}
                <select
                  value={roomSelectFilter}
                  onChange={(e) => setRoomSelectFilter(e.target.value)}
                  className="h-9 px-3 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="ALL">All Rooms</option>
                  <option value="A01">Room A01</option>
                  <option value="A02">Room A02</option>
                  <option value="B12">Room B12</option>
                  <option value="A21">Room A21</option>
                  <option value="A22">Room A22</option>
                  <option value="A26">Room A26</option>
                  <option value="A27">Room A27</option>
                  <option value="A28">Room A28</option>
                  <option value="B24">Room B24</option>
                  <option value="B25">Room B25</option>
                  <option value="A37">Room A37</option>
                  <option value="B35">Room B35</option>
                  <option value="A07">Room A07</option>
                </select>

                {/* Filter by Branch */}
                <select
                  value={roomBranchFilter}
                  onChange={(e) => setRoomBranchFilter(e.target.value)}
                  className="h-9 px-3 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                >
                  <option value="ALL">All Branches</option>
                  <option value="CAI">CAI</option>
                  <option value="ECE">ECE</option>
                  <option value="CSE">CSE</option>
                  <option value="CSD">CSD</option>
                  <option value="EEE">EEE</option>
                  <option value="CSM">CSM</option>
                  <option value="IT">IT</option>
                  <option value="MEC">MEC</option>
                  <option value="CSC">CSC</option>
                </select>
              </div>
            </div>

            {/* ── TAB 1: PENDING REGISTRATIONS QUEUE ── */}
            {roomAllocSubTab === "queue" && (
              <div className="space-y-4">
                {filteredPending.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4 shadow-sm my-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
                      <Bookmark className="h-7 w-7 stroke-[1.5]" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-[#162354]">No Pending Allocations in Queue</h3>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto">
                        All incoming student registration applications have been processed and allocated.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredPending.map((app) => (
                      <div
                        key={app.id || app.registrationNumber}
                        className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3.5">
                            {app.profilePhoto ? (
                              <img
                                src={app.profilePhoto}
                                alt={app.fullName}
                                className="w-13 h-13 rounded-2xl object-cover border-2 border-indigo-500/30 shadow-sm"
                                style={{ width: "52px", height: "52px" }}
                              />
                            ) : (
                              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-600 text-white flex items-center justify-center font-bold text-sm shadow-sm" style={{ width: "52px", height: "52px" }}>
                                {app.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                              </div>
                            )}

                            <div>
                              <h4 className="font-bold text-sm text-slate-900 leading-snug">{app.fullName}</h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-mono text-xs font-bold text-indigo-700">{app.registrationNumber}</span>
                                <Badge className="bg-slate-100 text-slate-700 text-[10px] font-semibold border-0 px-1.5 py-0">
                                  {app.gender}
                                </Badge>
                                {app.bloodGroup && (
                                  <Badge className="bg-rose-50 text-rose-700 text-[10px] font-semibold border-0 px-1.5 py-0">
                                    {app.bloodGroup}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                {app.course} &bull; {app.yearOfStudy} ({app.semester})
                              </p>
                            </div>
                          </div>

                          <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-bold px-2 py-0.5 shrink-0">
                            AWAITING ROOM
                          </Badge>
                        </div>

                        {/* Details snippet */}
                        <div className="bg-slate-50 rounded-xl p-3 grid grid-cols-2 gap-2 text-[11px] text-slate-600 border border-slate-100">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Preferred Room</span>
                            <span className="font-semibold text-slate-800">{app.roomTypePreference || "AC Double Sharing"}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Preferred Block</span>
                            <span className="font-semibold text-slate-800">{app.preferredBlock || (app.gender === "Female" ? "Girls Hostel" : "Boys Hostel")}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Student Phone</span>
                            <span className="font-mono">{app.mobileNumber}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold">Parent Contact</span>
                            <span className="font-mono">{app.parentContact}</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedDossierApp(app)}
                            className="text-xs h-8 px-3 rounded-lg border-slate-300 text-slate-700 gap-1"
                          >
                            <Eye className="w-3.5 h-3.5 text-slate-500" /> View Dossier
                          </Button>

                          <div className="flex items-center gap-1.5">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectCandidate(app)}
                              className="text-xs h-8 px-2.5 rounded-lg border-rose-200 text-rose-600 hover:bg-rose-50"
                            >
                              Reject
                            </Button>

                            <Button
                              size="sm"
                              onClick={() => handleOpenAllocationModal(app)}
                              className="bg-[#162354] hover:bg-[#1f3073] text-white text-xs h-8 px-3.5 rounded-lg gap-1.5 font-bold shadow-sm"
                            >
                              <KeyRound className="w-3.5 h-3.5" /> Assign Room
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 2: ALLOCATED RESIDENTS ── */}
            {roomAllocSubTab === "allocated" && (
              <div className="space-y-4">
                {filteredAllocated.length === 0 ? (
                  <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-3 shadow-sm my-4">
                    <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                    <h3 className="text-base font-bold text-[#162354]">No Allocated Residents Found</h3>
                    <p className="text-xs text-slate-500">Allocate pending candidate applications above to populate this register.</p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px] tracking-wider">
                          <tr>
                            <th className="py-3 px-4">Resident</th>
                            <th className="py-3 px-4">Roll / Reg</th>
                            <th className="py-3 px-4">Program & Branch</th>
                            <th className="py-3 px-4">Allocated Block</th>
                            <th className="py-3 px-4">Room & Bed</th>
                            <th className="py-3 px-4">Allocated Date</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {filteredAllocated.map((app) => (
                            <tr key={app.id || app.registrationNumber} className="hover:bg-slate-50/80 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2.5">
                                  {app.profilePhoto ? (
                                    <img src={app.profilePhoto} alt="" className="w-8 h-8 rounded-full object-cover border" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                                      {app.fullName.slice(0, 2).toUpperCase()}
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-bold text-slate-900">{app.fullName}</div>
                                    <div className="text-[10px] text-slate-400">{app.gender} &bull; {app.mobileNumber}</div>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                                {app.registrationNumber}
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="font-medium text-slate-800">{app.department}</div>
                                <div className="text-[10px] text-slate-400">{app.yearOfStudy}</div>
                              </td>

                              <td className="py-3.5 px-4">
                                <Badge className="bg-indigo-50 text-indigo-800 border-indigo-200 text-[10px] font-semibold">
                                  {app.allocatedBlockName || "Hostel Block"}
                                </Badge>
                              </td>

                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px]">
                                    Room {app.allocatedRoomNumber || "101"}
                                  </span>
                                  <span className="text-slate-500 text-[11px]">
                                    ({app.allocatedBedNumber || "Bed-1"})
                                  </span>
                                </div>
                              </td>

                              <td className="py-3.5 px-4 text-[11px] text-slate-500">
                                {app.allocatedAt ? new Date(app.allocatedAt).toLocaleDateString("en-GB") : "26 Aug 2026"}
                              </td>

                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedDossierApp(app)}
                                    className="h-7 text-[11px] px-2 rounded-lg border-slate-300"
                                  >
                                    Dossier
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedSlipApp(app)}
                                    className="h-7 text-[11px] px-2.5 rounded-lg border-indigo-200 text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 font-semibold gap-1"
                                  >
                                    <FileText className="w-3 h-3" /> Slip & History
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═════════ DOSSIER MODAL ═════════ */}
            {selectedDossierApp && (
              <Dialog open={!!selectedDossierApp} onOpenChange={() => setSelectedDossierApp(null)}>
                <DialogContent className="max-w-2xl bg-white rounded-3xl p-6 sm:p-8 space-y-6">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-900 flex items-center justify-between">
                      <span>Candidate Registration Dossier</span>
                      <Badge className={selectedDossierApp.status === "ALLOCATED" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}>
                        {selectedDossierApp.status}
                      </Badge>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                      Full student application details and emergency contacts submitted through the online portal.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-5 text-xs text-slate-700">
                    <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      {selectedDossierApp.profilePhoto ? (
                        <img src={selectedDossierApp.profilePhoto} alt="" className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500 shadow-sm" />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                          {selectedDossierApp.fullName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{selectedDossierApp.fullName}</h3>
                        <div className="font-mono font-bold text-indigo-700 text-xs mt-0.5">{selectedDossierApp.registrationNumber}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">{selectedDossierApp.course} &bull; {selectedDossierApp.department}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Date of Birth</span>
                        <span className="font-semibold">{selectedDossierApp.dateOfBirth}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Gender</span>
                        <span className="font-semibold">{selectedDossierApp.gender}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Blood Group</span>
                        <span className="font-semibold">{selectedDossierApp.bloodGroup || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Student Phone</span>
                        <span className="font-mono font-semibold">{selectedDossierApp.mobileNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
                        <span className="truncate block font-semibold">{selectedDossierApp.email}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Emergency Contact</span>
                        <span className="font-mono font-bold text-rose-600">{selectedDossierApp.emergencyContact}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100 space-y-2">
                      <div className="font-bold text-slate-900">Parent & Guardian Information</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Parent / Guardian</span>
                          <span className="font-semibold">{selectedDossierApp.parentName}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Parent Contact</span>
                          <span className="font-mono font-semibold">{selectedDossierApp.parentContact}</span>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">Permanent Address</span>
                          <span>{selectedDossierApp.permanentAddress}, {selectedDossierApp.city}, {selectedDossierApp.state} - {selectedDossierApp.pincode}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100 space-y-2">
                      <div className="font-bold text-slate-900">Medical Disclosure</div>
                      <div className="space-y-1 text-slate-600">
                        <div><strong>Conditions:</strong> {selectedDossierApp.medicalConditions || "None reported"}</div>
                        <div><strong>Allergies:</strong> {selectedDossierApp.allergies || "None reported"}</div>
                        <div><strong>Medications:</strong> {selectedDossierApp.medications || "None"}</div>
                      </div>
                    </div>

                  </div>

                  <DialogFooter className="flex items-center justify-between pt-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedDossierApp(null)} className="text-xs">
                      Close Dossier
                    </Button>
                    {(selectedDossierApp.status === "PENDING" || selectedDossierApp.status === "PENDING_ALLOCATION") && (
                      <Button
                        size="sm"
                        onClick={() => {
                          const app = selectedDossierApp;
                          setSelectedDossierApp(null);
                          handleOpenAllocationModal(app);
                        }}
                        className="bg-[#162354] hover:bg-[#1f3073] text-white text-xs font-bold gap-1.5 shadow-sm"
                      >
                        <KeyRound className="w-3.5 h-3.5" /> Assign Room Now
                      </Button>
                    )}
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* ═════════ WARDEN ROOM ALLOCATION MODAL ═════════ */}
            {selectedAllocApp && (
              <Dialog open={!!selectedAllocApp} onOpenChange={() => setSelectedAllocApp(null)}>
                <DialogContent className="max-w-md bg-white rounded-3xl p-6 sm:p-7 space-y-5">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-indigo-600" />
                      <span>Warden Room & Bed Allocation</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                      Assign hostel block, floor, room number, and bed slot for <strong>{selectedAllocApp.fullName}</strong>.
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleConfirmAllocation} className="space-y-4 text-xs">
                    <div className="bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-100 space-y-1">
                      <div className="font-bold text-indigo-950">{selectedAllocApp.fullName} ({selectedAllocApp.registrationNumber})</div>
                      <div className="text-[11px] text-indigo-700">
                        {selectedAllocApp.gender} &bull; Preference: {selectedAllocApp.roomTypePreference || "Standard AC"}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700">Hostel Block</Label>
                      <select
                        value={allocationForm.blockName}
                        onChange={(e) => {
                          const block = e.target.value;
                          setAllocationForm((p) => ({
                            ...p,
                            blockName: block,
                            blockId: block.includes("Girls") ? "G-1" : "B-1",
                          }));
                        }}
                        className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                      >
                        <option value="Boys Hostel (Block B)">Boys Hostel (Block B)</option>
                        <option value="Girls Hostel (Block G)">Girls Hostel (Block G)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-700">Floor</Label>
                        <select
                          value={allocationForm.floorName}
                          onChange={(e) => {
                            const fl = e.target.value;
                            setAllocationForm((p) => ({ ...p, floorName: fl, floorId: `F-${fl.replace('Floor ', '')}` }));
                          }}
                          className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                        >
                          <option value="Floor 1">Floor 1 (Ground)</option>
                          <option value="Floor 2">Floor 2</option>
                          <option value="Floor 3">Floor 3</option>
                          <option value="Floor 4">Floor 4</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-700">Room Number</Label>
                        <select
                          value={allocationForm.roomNumber}
                          onChange={(e) => {
                            const r = e.target.value;
                            setAllocationForm((p) => ({ ...p, roomNumber: r, roomId: r }));
                          }}
                          className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900"
                        >
                          <option value="101">Room 101 (2/3 Beds Vacant)</option>
                          <option value="102">Room 102 (1/3 Beds Vacant)</option>
                          <option value="103">Room 103 (3/3 Beds Vacant)</option>
                          <option value="104">Room 104 (2/2 Beds Vacant)</option>
                          <option value="105">Room 105 (1/2 Beds Vacant)</option>
                          <option value="201">Room 201 (2/3 Beds Vacant)</option>
                          <option value="202">Room 202 (1/3 Beds Vacant)</option>
                          <option value="203">Room 203 (3/3 Beds Vacant)</option>
                          <option value="301">Room 301 (3/3 Beds Vacant)</option>
                          <option value="302">Room 302 (2/3 Beds Vacant)</option>
                          <option value="303">Room 303 (3/3 Beds Vacant)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700">Bed Number</Label>
                      <select
                        value={allocationForm.bedNumber}
                        onChange={(e) => {
                          const b = e.target.value;
                          setAllocationForm((p) => ({ ...p, bedNumber: b, bedId: b }));
                        }}
                        className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-900"
                      >
                        <option value="Bed-1">Bed-1 (Available)</option>
                        <option value="Bed-2">Bed-2 (Available)</option>
                        <option value="Bed-3">Bed-3 (Available)</option>
                        <option value="Bed-4">Bed-4 (Available)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-700">Warden Allocation Notes</Label>
                      <Textarea
                        rows={2}
                        value={allocationForm.remarks}
                        onChange={(e) => setAllocationForm((p) => ({ ...p, remarks: e.target.value }))}
                        placeholder="Document verification verified & keys handed over"
                        className="text-xs"
                      />
                    </div>

                    <DialogFooter className="flex items-center justify-end gap-2 pt-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedAllocApp(null)}
                        className="text-xs"
                      >
                        Cancel
                      </Button>

                      <Button
                        type="submit"
                        disabled={isAllocating}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 shadow-sm"
                      >
                        {isAllocating ? "Assigning..." : "Confirm & Assign Room"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}

            {/* ═════════ ALLOCATION SLIP & HISTORY RECORD MODAL ═════════ */}
            {selectedSlipApp && (
              <Dialog open={!!selectedSlipApp} onOpenChange={() => setSelectedSlipApp(null)}>
                <DialogContent className="max-w-lg bg-white rounded-3xl p-6 sm:p-8 space-y-5">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-slate-900 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        <span>Official Hostel Allocation Slip</span>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 font-bold text-xs">
                        ALLOCATED
                      </Badge>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                      Official room allocation record and accommodation allotment certificate.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4 text-xs" id="allocation-slip-view">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                          H
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">CampusStay Hostel Management</div>
                          <div className="text-[10px] text-slate-400">MVGR College of Engineering &bull; Allotment Record</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Allotment Date</div>
                        <div className="font-semibold text-slate-800">
                          {selectedSlipApp.allocatedAt ? new Date(selectedSlipApp.allocatedAt).toLocaleDateString("en-GB") : "26 Aug 2026"}
                        </div>
                      </div>
                    </div>

                    {/* Student Info */}
                    <div className="grid grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Resident Student</span>
                        <span className="font-bold text-slate-900 text-sm">{selectedSlipApp.fullName}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Registration / Roll</span>
                        <span className="font-mono font-bold text-indigo-700">{selectedSlipApp.registrationNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Course & Branch</span>
                        <span className="font-medium text-slate-700">{selectedSlipApp.course} ({selectedSlipApp.department})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Contact Number</span>
                        <span className="font-mono">{selectedSlipApp.mobileNumber}</span>
                      </div>
                    </div>

                    {/* Room & Bed Allocation Highlights */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-indigo-50 border border-indigo-200 p-3 rounded-xl">
                        <span className="text-[10px] font-bold text-indigo-600 block uppercase">Hostel Block</span>
                        <span className="font-bold text-indigo-950 text-xs">{selectedSlipApp.allocatedBlockName || "Boys Hostel (Block B)"}</span>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl">
                        <span className="text-[10px] font-bold text-emerald-600 block uppercase">Room Number</span>
                        <span className="font-bold text-emerald-950 text-base">Room {selectedSlipApp.allocatedRoomNumber || "103"}</span>
                      </div>
                      <div className="bg-sky-50 border border-sky-200 p-3 rounded-xl">
                        <span className="text-[10px] font-bold text-sky-600 block uppercase">Assigned Bed</span>
                        <span className="font-bold text-sky-950 text-base">{selectedSlipApp.allocatedBedNumber || "Bed-3"}</span>
                      </div>
                    </div>

                    {/* Authorizing Warden */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                      <div>Allocated By: <strong className="text-slate-800">{selectedSlipApp.allocatedBy || "Chief Warden"}</strong></div>
                      <div>Status: <strong className="text-emerald-700">ACTIVE RESIDENT</strong></div>
                    </div>
                  </div>

                  <DialogFooter className="flex items-center justify-between pt-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedSlipApp(null)} className="text-xs">
                      Close
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        window.print();
                        toast.success(`Printing allocation certificate for ${selectedSlipApp.fullName}`);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold gap-1.5 shadow-sm"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Allocation Slip
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* ═════════ ALLOCATION HISTORY LOGS MODAL ═════════ */}
            {historyModalOpen && (
              <Dialog open={historyModalOpen} onOpenChange={() => setHistoryModalOpen(false)}>
                <DialogContent className="max-w-3xl bg-white rounded-3xl p-6 sm:p-8 space-y-5">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-indigo-600" />
                      <span>Hostel Room Allocation History & Audit Logs</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500">
                      Historical log of all room and bed assignments made by the Chief Warden.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm max-h-96 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px]">
                        <tr>
                          <th className="py-2.5 px-4">Resident</th>
                          <th className="py-2.5 px-4">Reg No</th>
                          <th className="py-2.5 px-4">Allotted Accommodation</th>
                          <th className="py-2.5 px-4">Date & Time</th>
                          <th className="py-2.5 px-4">Warden</th>
                          <th className="py-2.5 px-4 text-right">Certificate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {allocatedRegs.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                              No allocation history recorded yet. Assign a room from the pending queue to generate records.
                            </td>
                          </tr>
                        ) : (
                          allocatedRegs.map((app) => (
                            <tr key={app.id || app.registrationNumber} className="hover:bg-slate-50/80">
                              <td className="py-3 px-4 font-bold text-slate-900">{app.fullName}</td>
                              <td className="py-3 px-4 font-mono text-indigo-700 font-bold">{app.registrationNumber}</td>
                              <td className="py-3 px-4">
                                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold text-[11px]">
                                  Room {app.allocatedRoomNumber || "103"} ({app.allocatedBedNumber || "Bed-3"})
                                </span>
                                <div className="text-[10px] text-slate-400 mt-0.5">{app.allocatedBlockName || "Boys Hostel"}</div>
                              </td>
                              <td className="py-3 px-4 text-slate-500 text-[11px]">
                                {app.allocatedAt ? new Date(app.allocatedAt).toLocaleDateString("en-GB") : "26 Aug 2026"}
                              </td>
                              <td className="py-3 px-4 font-medium text-slate-700">{app.allocatedBy || "Chief Warden"}</td>
                              <td className="py-3 px-4 text-right">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setHistoryModalOpen(false);
                                    setSelectedSlipApp(app);
                                  }}
                                  className="h-7 text-[11px] px-2 rounded-lg text-indigo-700 border-slate-300"
                                >
                                  View Slip
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <DialogFooter className="pt-2">
                    <Button variant="outline" size="sm" onClick={() => setHistoryModalOpen(false)} className="text-xs">
                      Close History
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

          </div>
        );
      })()}

      {/* ── 4. MESS MANAGEMENT (SCREENSHOTS 3 & 4) ── */}
      {activeTab === "mess" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* ═════════ HEADER WITH REAL-TIME STATS ═════════ */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-[#162354]">Hostel Mess & Dining Management</h1>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs px-2.5 py-0.5 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Lunch Session Active (12:00 - 15:30)
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Live meal scheduling, token verification, real-time dining attendance, inventory planning, and feedback.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportMessReport}
                className="text-xs h-9 px-3.5 rounded-xl gap-1.5 border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Download className="h-3.5 w-3.5" /> Export Report
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  setMealForm({ name: "", time: "12:00 - 15:30", status: "Active", capacity: 500, menuSummary: "" });
                  setAddMealModalOpen(true);
                }}
                className="bg-[#162354] hover:bg-[#1f3073] text-white text-xs h-9 px-4 rounded-xl gap-1.5 font-bold shadow-sm"
              >
                <Plus className="h-4 w-4" /> Add Meal Slot
              </Button>
            </div>
          </div>

          {/* ═════════ QUICK METRICS CARDS ═════════ */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Today's Diners</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900">{messTokens.length + 420}</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">84.8% Checked-in</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Non-Veg Tokens</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-rose-600">142</span>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Special Chicken Feast</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Veg & Diet Plan</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-700">283</span>
                <span className="text-[10px] font-bold text-slate-500">Standard Mess</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Mess Rating</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-amber-500">4.8 ★</span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">38 Reviews</span>
              </div>
            </div>
          </div>

          {/* ═════════ SUB-TABS NAVIGATION ═════════ */}
          <div className="flex items-center justify-between border-b border-slate-200 overflow-x-auto">
            <div className="flex items-center gap-6 text-sm font-semibold whitespace-nowrap">
              {[
                { id: "Configuration", label: "Meal Slots & Timings", icon: Clock },
                { id: "Menu Schedule", label: "7-Day Menu Schedule", icon: UtensilsCrossed },
                { id: "Live Attendance", label: "Live Token Scanner & Check-In", icon: QrCode },
                { id: "Indent Plan", label: "Grocery & Indent Plan", icon: ClipboardList },
                { id: "Analytics", label: "Analytics & Feedback", icon: Activity },
              ].map((t) => {
                const IconComp = t.icon;
                const isSelected = messSubTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setMessSubTab(t.id)}
                    className={`pb-3 transition-all flex items-center gap-2 ${
                      isSelected
                        ? "text-[#162354] border-b-2 border-[#162354] font-bold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <IconComp className={`h-4 w-4 ${isSelected ? "text-[#162354]" : "text-slate-400"}`} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ═════════ 1. MEAL SLOTS & CONFIGURATION ═════════ */}
          {messSubTab === "Configuration" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {meals.map((meal, i) => (
                  <div key={meal.id || i} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-slate-900">{meal.name}</h4>
                          <Badge className={meal.status === "Active" ? "bg-emerald-100 text-emerald-800 font-semibold text-[10px]" : "bg-slate-100 text-slate-600 text-[10px]"}>
                            {meal.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock className="h-3.5 w-3.5 text-indigo-600" />
                          <span className="font-semibold text-slate-700">{meal.time}</span>
                          &bull; <span>Cap: <strong>{meal.capacity || 500}</strong> Diners</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setMealForm({
                              name: meal.name,
                              time: meal.time,
                              status: meal.status,
                              capacity: meal.capacity || 500,
                              menuSummary: meal.menuSummary || "",
                            });
                            setEditMealModalOpen(meal);
                          }}
                          className="h-8 text-xs bg-indigo-50/60 hover:bg-indigo-100 text-indigo-700 border-indigo-200 gap-1 rounded-xl px-2.5 font-semibold"
                        >
                          <Edit2 className="h-3 w-3" /> Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteMeal(meal)}
                          className="h-8 text-xs bg-rose-50/60 hover:bg-rose-100 text-rose-600 border-rose-200 gap-1 rounded-xl px-2.5 font-semibold"
                        >
                          <Trash2 className="h-3 w-3" /> Delete
                        </Button>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Typical Menu</span>
                      {meal.menuSummary || "Standard nutritious hostel menu planned by Mess Committee."}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═════════ 2. MENU SCHEDULE (7 DAYS) ═════════ */}
          {messSubTab === "Menu Schedule" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    🥗 7-Day Weekly Mess Diet & Non-Veg Matrix
                  </h3>
                  <p className="text-xs text-slate-500">Toggle Non-Veg availability for each meal session and add custom specials. Changes auto-save.</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => toast.success("All 7-day schedules synced and updated successfully!")}
                  className="bg-[#162354] hover:bg-[#1f3073] text-white text-xs h-8 px-3.5 rounded-xl font-bold gap-1"
                >
                  <Check className="h-3.5 w-3.5" /> Save All Days
                </Button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#162354] text-white font-semibold text-[10px] uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">DATE</th>
                        <th className="py-3 px-4">DAY</th>
                        <th className="py-3 px-4 text-center">BREAKFAST NON-VEG</th>
                        <th className="py-3 px-4 text-center">LUNCH NON-VEG</th>
                        <th className="py-3 px-4 text-center">SNACKS NON-VEG</th>
                        <th className="py-3 px-4 text-center">DINNER NON-VEG</th>
                        <th className="py-3 px-4">SPECIAL MENU / NOTES</th>
                        <th className="py-3 px-4 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {schedule.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">{row.date}</td>
                          <td className="py-3.5 px-4 font-medium text-slate-600">{row.day}</td>
                          <td className="py-3.5 px-4 text-center">
                            <Switch checked={row.breakfastNonVeg} onCheckedChange={() => handleToggleSchedule(idx, "breakfastNonVeg")} />
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <Switch checked={row.lunchNonVeg} onCheckedChange={() => handleToggleSchedule(idx, "lunchNonVeg")} />
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <Switch checked={row.snacksNonVeg} onCheckedChange={() => handleToggleSchedule(idx, "snacksNonVeg")} />
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <Switch checked={row.dinnerNonVeg} onCheckedChange={() => handleToggleSchedule(idx, "dinnerNonVeg")} />
                          </td>
                          <td className="py-3.5 px-4">
                            <Input
                              placeholder="e.g. Paneer Butter Masala / Chicken Dum Biryani..."
                              value={row.notes}
                              onChange={(e) => {
                                const up = [...schedule];
                                up[idx].notes = e.target.value;
                                setSchedule(up);
                              }}
                              className="h-8 text-xs min-w-[220px] max-w-md border-slate-200 rounded-lg"
                            />
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Button
                              size="sm"
                              onClick={() => handleSaveScheduleRow(row)}
                              className="h-7 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg px-2.5"
                            >
                              Save
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═════════ 3. LIVE ATTENDANCE & TOKEN SCANNER ═════════ */}
          {messSubTab === "Live Attendance" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Token Quick Generator Card */}
              <div className="bg-gradient-to-r from-indigo-900 to-[#162354] text-white p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-indigo-300" />
                      <span>Issue Resident Dining Token</span>
                    </h3>
                    <p className="text-xs text-indigo-200">Scan student RFID card or enter Roll Number / Name to generate instant mess token.</p>
                  </div>
                  <Badge className="bg-white/10 text-white border-white/20 text-xs px-3 py-1 font-mono">
                    Session: {selectedMealForCheckin}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="sm:col-span-2 space-y-1">
                    <Label className="text-xs font-semibold text-indigo-200">Resident Roll Number or Student Name</Label>
                    <Input
                      placeholder="e.g. 23341M219 or Vishnu Vardhan"
                      value={tokenSearch}
                      onChange={(e) => setTokenSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleQuickTokenCheckin(tokenSearch);
                      }}
                      className="bg-white text-slate-900 h-9 rounded-xl text-xs font-semibold placeholder:text-slate-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-indigo-200">Meal Session</Label>
                    <select
                      value={selectedMealForCheckin}
                      onChange={(e) => setSelectedMealForCheckin(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-white text-slate-900 text-xs font-semibold focus:outline-none"
                    >
                      <option value="Breakfast">Breakfast (07:30 - 09:15)</option>
                      <option value="Lunch">Lunch (12:00 - 15:30)</option>
                      <option value="Snacks">Evening Snacks (16:00 - 18:00)</option>
                      <option value="Dinner">Dinner (19:00 - 22:30)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-semibold text-indigo-200">Diet Preference</Label>
                    <select
                      value={dietChoice}
                      onChange={(e) => setDietChoice(e.target.value as any)}
                      className="w-full h-9 px-3 rounded-xl bg-white text-slate-900 text-xs font-semibold focus:outline-none"
                    >
                      <option value="Non-Vegetarian">Non-Vegetarian</option>
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Special Diet">Special / Jain Diet</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs text-indigo-200">
                    Quick suggestions: <strong>23341M219</strong> (Vishnu), <strong>23331A05I2</strong> (Pravallika), <strong>23331A0568</strong> (Tarunya)
                  </div>
                  <Button
                    onClick={() => handleQuickTokenCheckin(tokenSearch || "23341M219")}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs h-9 px-5 rounded-xl shadow gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Issue & Verify Token
                  </Button>
                </div>
              </div>

              {/* Tokens Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-indigo-600" />
                    <span>Real-Time Dining Tokens Stream ({messTokens.length} Issued)</span>
                  </h4>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-[10px] uppercase">
                      <tr>
                        <th className="py-3 px-4">TOKEN #</th>
                        <th className="py-3 px-4">STUDENT NAME</th>
                        <th className="py-3 px-4">ROLL NUMBER</th>
                        <th className="py-3 px-4">ROOM & BLOCK</th>
                        <th className="py-3 px-4">MEAL SESSION</th>
                        <th className="py-3 px-4">DIET</th>
                        <th className="py-3 px-4">TIMESTAMP</th>
                        <th className="py-3 px-4 text-right">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {messTokens.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono font-bold text-indigo-700">{t.tokenNumber}</td>
                          <td className="py-3 px-4 font-bold text-slate-900">{t.studentName}</td>
                          <td className="py-3 px-4 font-mono text-slate-600">{t.rollNumber}</td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800">Room {t.roomNumber}</span>
                            <span className="text-[10px] text-slate-400 block">{t.blockName}</span>
                          </td>
                          <td className="py-3 px-4 font-medium">{t.mealName}</td>
                          <td className="py-3 px-4">
                            <Badge className={t.dietPreference === "Non-Vegetarian" ? "bg-rose-100 text-rose-800 font-semibold text-[10px]" : "bg-emerald-100 text-emerald-800 font-semibold text-[10px]"}>
                              {t.dietPreference}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-slate-500 text-[11px]">{t.checkedInAt}</td>
                          <td className="py-3 px-4 text-right">
                            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═════════ 4. INDENT & GROCERY INVENTORY ═════════ */}
          {messSubTab === "Indent Plan" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    📦 Daily Grocery Indent & Purchase Requisition
                  </h3>
                  <p className="text-xs text-slate-500">Live store balance and buffer stock calculation based on 500 hostel residents.</p>
                </div>

                <Button
                  size="sm"
                  onClick={() => setIndentModalOpen(true)}
                  className="bg-[#162354] hover:bg-[#1f3073] text-white text-xs h-8 px-3.5 rounded-xl font-bold gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Indent Requirement
                </Button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#162354] text-white font-semibold text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">ITEM NAME</th>
                      <th className="py-3 px-4">CATEGORY</th>
                      <th className="py-3 px-4">REQUIRED QTY</th>
                      <th className="py-3 px-4">AVAILABLE STOCK</th>
                      <th className="py-3 px-4">EST. COST (₹)</th>
                      <th className="py-3 px-4">STOCK STATUS</th>
                      <th className="py-3 px-4 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {indentItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{item.itemName}</td>
                        <td className="py-3.5 px-4 text-slate-600">{item.category}</td>
                        <td className="py-3.5 px-4 font-bold text-indigo-700">{item.requiredQty} {item.unit}</td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">{item.availableQty} {item.unit}</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">₹{item.estimatedCost.toLocaleString()}</td>
                        <td className="py-3.5 px-4">
                          <Badge className={
                            item.status === "Sufficient"
                              ? "bg-emerald-100 text-emerald-800 font-semibold text-[10px]"
                              : item.status === "Low Stock"
                              ? "bg-amber-100 text-amber-800 font-semibold text-[10px]"
                              : "bg-rose-100 text-rose-800 font-semibold text-[10px]"
                          }>
                            {item.status}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              toast.success(`Purchase order generated for ${item.itemName}!`);
                            }}
                            className="h-7 text-xs border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 font-semibold rounded-lg"
                          >
                            Reorder
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═════════ 5. ANALYTICS & FEEDBACK ═════════ */}
          {messSubTab === "Analytics" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hygiene & Audit Card */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>Food Quality & Kitchen Hygiene Index</span>
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>Kitchen Sanitization & Deep Cleaning</span>
                        <span className="text-emerald-700 font-bold">98% (Excellent)</span>
                      </div>
                      <Progress value={98} className="h-2 bg-slate-100" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>Punctuality of Meal Service</span>
                        <span className="text-indigo-700 font-bold">95% (On Schedule)</span>
                      </div>
                      <Progress value={95} className="h-2 bg-slate-100" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>Fresh Ingredients & Temperature Compliance</span>
                        <span className="text-emerald-700 font-bold">96%</span>
                      </div>
                      <Progress value={96} className="h-2 bg-slate-100" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span>Food Wastage Minimization Index</span>
                        <span className="text-amber-700 font-bold">3.2% (Low Wastage)</span>
                      </div>
                      <Progress value={88} className="h-2 bg-slate-100" />
                    </div>
                  </div>
                </div>

                {/* Dietary Distribution */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-indigo-600" />
                    <span>Resident Dietary Choice Distribution</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl">
                      <div className="text-2xl font-black text-emerald-800">68%</div>
                      <div className="text-xs font-bold text-emerald-700 mt-0.5">Vegetarian (340 Students)</div>
                    </div>
                    <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl">
                      <div className="text-2xl font-black text-rose-800">32%</div>
                      <div className="text-xs font-bold text-rose-700 mt-0.5">Non-Vegetarian (160 Students)</div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-1">
                    <div className="font-bold text-slate-900">Peak Dining Hours:</div>
                    <div>&bull; Breakfast: <strong>08:15 AM - 08:45 AM</strong> (410 diners)</div>
                    <div>&bull; Lunch: <strong>12:45 PM - 01:30 PM</strong> (480 diners)</div>
                    <div>&bull; Dinner: <strong>08:00 PM - 09:00 PM</strong> (465 diners)</div>
                  </div>
                </div>
              </div>

              {/* Feedback List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Coffee className="w-4 h-4 text-amber-600" />
                    <span>Student Feedback & Suggestions ({feedbackList.length})</span>
                  </h4>

                  <Button
                    size="sm"
                    onClick={() => setFeedbackModalOpen(true)}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs h-8 px-3 rounded-xl border border-indigo-200"
                  >
                    <Plus className="w-3.5 h-3.5" /> Submit Student Review
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {feedbackList.map((fb) => (
                    <div key={fb.id} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900">{fb.studentName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{fb.rollNumber} &bull; {fb.mealName}</div>
                        </div>
                        <div className="text-amber-500 font-black text-sm">
                          {"★".repeat(fb.rating)}{"☆".repeat(5 - fb.rating)}
                        </div>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-slate-700 italic">
                        "{fb.comment}"
                      </div>

                      {fb.wardenRemark && (
                        <div className="text-[11px] text-emerald-800 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100">
                          <strong>Warden Note:</strong> {fb.wardenRemark}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                        <span>{fb.date}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveFeedback(fb.id, "Reviewed and kitchen SOP updated.")}
                          className="h-6 text-[10px] px-2 rounded font-semibold text-emerald-700 border-emerald-200"
                        >
                          Resolve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ═════════ ADD MEAL MODAL ═════════ */}
          {addMealModalOpen && (
            <Dialog open={addMealModalOpen} onOpenChange={setAddMealModalOpen}>
              <DialogContent className="max-w-md bg-white rounded-3xl p-6 sm:p-7 space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-600" />
                    <span>Create New Meal Slot</span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    Add a new meal schedule slot with timings and dining capacity.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleAddMeal} className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <Label className="font-bold text-slate-700">Meal Name *</Label>
                    <Input
                      placeholder="e.g. Midnight Snack / Special Breakfast"
                      value={mealForm.name}
                      onChange={(e) => setMealForm({ ...mealForm, name: e.target.value })}
                      required
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="font-bold text-slate-700">Timing (HH:MM - HH:MM) *</Label>
                      <Input
                        placeholder="e.g. 23:00 - 00:30"
                        value={mealForm.time}
                        onChange={(e) => setMealForm({ ...mealForm, time: e.target.value })}
                        required
                        className="h-9 text-xs rounded-xl font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="font-bold text-slate-700">Capacity (Diners)</Label>
                      <Input
                        type="number"
                        value={mealForm.capacity}
                        onChange={(e) => setMealForm({ ...mealForm, capacity: Number(e.target.value) })}
                        className="h-9 text-xs rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="font-bold text-slate-700">Planned Menu Description</Label>
                    <Textarea
                      rows={2}
                      placeholder="e.g. Milk, Cookies, Sandwiches and Herbal Tea"
                      value={mealForm.menuSummary}
                      onChange={(e) => setMealForm({ ...mealForm, menuSummary: e.target.value })}
                      className="text-xs"
                    />
                  </div>

                  <DialogFooter className="pt-2 flex items-center justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setAddMealModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" className="bg-[#162354] hover:bg-[#1f3073] text-white font-bold">
                      Add Meal Slot
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {/* ═════════ EDIT MEAL MODAL ═════════ */}
          {editMealModalOpen && (
            <Dialog open={!!editMealModalOpen} onOpenChange={() => setEditMealModalOpen(null)}>
              <DialogContent className="max-w-md bg-white rounded-3xl p-6 sm:p-7 space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Edit2 className="w-5 h-5 text-indigo-600" />
                    <span>Edit Meal Slot: {editMealModalOpen.name}</span>
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleEditMeal} className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <Label className="font-bold text-slate-700">Meal Name *</Label>
                    <Input
                      value={mealForm.name}
                      onChange={(e) => setMealForm({ ...mealForm, name: e.target.value })}
                      required
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="font-bold text-slate-700">Timing</Label>
                      <Input
                        value={mealForm.time}
                        onChange={(e) => setMealForm({ ...mealForm, time: e.target.value })}
                        required
                        className="h-9 text-xs rounded-xl font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="font-bold text-slate-700">Status</Label>
                      <select
                        value={mealForm.status}
                        onChange={(e) => setMealForm({ ...mealForm, status: e.target.value as any })}
                        className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs bg-white"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="font-bold text-slate-700">Menu Highlights</Label>
                    <Textarea
                      rows={2}
                      value={mealForm.menuSummary}
                      onChange={(e) => setMealForm({ ...mealForm, menuSummary: e.target.value })}
                      className="text-xs"
                    />
                  </div>

                  <DialogFooter className="pt-2 flex items-center justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setEditMealModalOpen(null)}>
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" className="bg-[#162354] hover:bg-[#1f3073] text-white font-bold">
                      Save Changes
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {/* ═════════ ADD INDENT ITEM MODAL ═════════ */}
          {indentModalOpen && (
            <Dialog open={indentModalOpen} onOpenChange={setIndentModalOpen}>
              <DialogContent className="max-w-md bg-white rounded-3xl p-6 sm:p-7 space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-indigo-600" />
                    <span>Create Grocery Indent Requisition</span>
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleAddIndentItem} className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <Label className="font-bold text-slate-700">Item Name *</Label>
                    <Input
                      placeholder="e.g. Farm Fresh Eggs (Crate)"
                      value={indentForm.itemName}
                      onChange={(e) => setIndentForm({ ...indentForm, itemName: e.target.value })}
                      required
                      className="h-9 text-xs rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="font-bold text-slate-700">Category</Label>
                      <select
                        value={indentForm.category}
                        onChange={(e) => setIndentForm({ ...indentForm, category: e.target.value })}
                        className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs bg-white"
                      >
                        <option value="Grains & Cereals">Grains & Cereals</option>
                        <option value="Pulses & Lentils">Pulses & Lentils</option>
                        <option value="Dairy & Poultry">Dairy & Poultry</option>
                        <option value="Oils & Spices">Oils & Spices</option>
                        <option value="Fresh Vegetables">Fresh Vegetables</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label className="font-bold text-slate-700">Unit</Label>
                      <select
                        value={indentForm.unit}
                        onChange={(e) => setIndentForm({ ...indentForm, unit: e.target.value })}
                        className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs bg-white"
                      >
                        <option value="kg">kg</option>
                        <option value="liters">liters</option>
                        <option value="packets">packets</option>
                        <option value="units">units</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="font-bold text-slate-700">Required Qty</Label>
                      <Input
                        type="number"
                        value={indentForm.requiredQty}
                        onChange={(e) => setIndentForm({ ...indentForm, requiredQty: Number(e.target.value) })}
                        required
                        className="h-9 text-xs rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="font-bold text-slate-700">Estimated Cost (₹)</Label>
                      <Input
                        type="number"
                        value={indentForm.estimatedCost}
                        onChange={(e) => setIndentForm({ ...indentForm, estimatedCost: Number(e.target.value) })}
                        required
                        className="h-9 text-xs rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  <DialogFooter className="pt-2 flex items-center justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setIndentModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" className="bg-[#162354] hover:bg-[#1f3073] text-white font-bold">
                      Add Requisition
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}

          {/* ═════════ ADD FEEDBACK MODAL ═════════ */}
          {feedbackModalOpen && (
            <Dialog open={feedbackModalOpen} onOpenChange={setFeedbackModalOpen}>
              <DialogContent className="max-w-md bg-white rounded-3xl p-6 sm:p-7 space-y-4">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Coffee className="w-5 h-5 text-amber-600" />
                    <span>Submit Student Mess Feedback</span>
                  </DialogTitle>
                </DialogHeader>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const newFb: MessFeedbackItem = {
                      id: `FB-${Date.now()}`,
                      studentName: feedbackForm.studentName,
                      rollNumber: feedbackForm.rollNumber,
                      mealName: feedbackForm.mealName,
                      date: "26 Aug 2026",
                      rating: Number(feedbackForm.rating),
                      category: feedbackForm.category,
                      comment: feedbackForm.comment,
                      wardenRemark: "Logged for weekly mess audit review.",
                      status: "OPEN",
                    };
                    setFeedbackList([newFb, ...feedbackList]);
                    setFeedbackModalOpen(false);
                    toast.success("Thank you! Feedback recorded.");
                  }}
                  className="space-y-3.5 text-xs"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="font-bold text-slate-700">Student Name</Label>
                      <Input
                        value={feedbackForm.studentName}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, studentName: e.target.value })}
                        required
                        className="h-9 text-xs rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="font-bold text-slate-700">Roll Number</Label>
                      <Input
                        value={feedbackForm.rollNumber}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, rollNumber: e.target.value })}
                        required
                        className="h-9 text-xs rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="font-bold text-slate-700">Meal</Label>
                      <select
                        value={feedbackForm.mealName}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, mealName: e.target.value })}
                        className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs bg-white"
                      >
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Snacks">Evening Snacks</option>
                        <option value="Dinner">Dinner</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <Label className="font-bold text-slate-700">Rating (1 to 5 Stars)</Label>
                      <select
                        value={feedbackForm.rating}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, rating: Number(e.target.value) })}
                        className="w-full h-9 px-3 rounded-xl border border-slate-300 text-xs bg-white font-bold text-amber-600"
                      >
                        <option value="5">5 Stars - Outstanding ★★★★★</option>
                        <option value="4">4 Stars - Good ★★★★☆</option>
                        <option value="3">3 Stars - Average ★★★☆☆</option>
                        <option value="2">2 Stars - Below Average ★★☆☆☆</option>
                        <option value="1">1 Star - Poor ★☆☆☆☆</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="font-bold text-slate-700">Review & Suggestions</Label>
                    <Textarea
                      rows={3}
                      placeholder="Describe taste, hygiene, food temperature, or portion size..."
                      value={feedbackForm.comment}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                      required
                      className="text-xs"
                    />
                  </div>

                  <DialogFooter className="pt-2 flex items-center justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setFeedbackModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" size="sm" className="bg-[#162354] hover:bg-[#1f3073] text-white font-bold">
                      Submit Feedback
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          )}

        </div>
      )}

      {/* ── 5. OUTING REQUESTS (SCREENSHOT 5) ── */}
      {(activeTab === "outings" || activeTab === "outing-approvals") && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#162354]">Outing Requests</h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Manage all student outing requests and configurations.</p>
          </div>

          <div className="flex items-center justify-between border-b border-slate-200">
            <div className="flex items-center gap-8 text-sm font-semibold">
              <button
                onClick={() => setOutingSubTab("Outing Requests")}
                className={`pb-3 transition-all ${
                  outingSubTab === "Outing Requests"
                    ? "text-[#162354] border-b-2 border-[#162354] font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Outing Requests
              </button>
              <button
                onClick={() => setOutingSubTab("Outing Configurations")}
                className={`pb-3 transition-all ${
                  outingSubTab === "Outing Configurations"
                    ? "text-[#162354] border-b-2 border-[#162354] font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Outing Configurations
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Input
                placeholder="Search by name, email, or ID"
                value={outingSearch}
                onChange={(e) => setOutingSearch(e.target.value)}
                className="h-9 text-xs pr-8 rounded-lg border-slate-300"
              />
              <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
            </div>

            <Button size="sm" className="bg-[#162354] hover:bg-[#1f3073] text-white text-xs h-9 px-4 rounded-lg gap-1.5 font-semibold">
              <Filter className="h-3.5 w-3.5" /> Filter
            </Button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#162354] text-white font-semibold text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">STUDENT</th>
                    <th className="py-3 px-4">FROM DATE</th>
                    <th className="py-3 px-4">TO DATE</th>
                    <th className="py-3 px-4">REASON</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4">PARENT APPROVAL</th>
                    <th className="py-3 px-4">REQUESTED AT</th>
                    <th className="py-3 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {outingRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span className="h-7 w-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                            {req.studentName.charAt(0)}
                          </span>
                          <div>
                            <span className="font-bold text-slate-800 block">{req.studentName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {req.studentId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">{req.fromDate}</td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono">{req.toDate}</td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-xs">{req.reason}</td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          req.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" :
                          req.status === "REJECTED" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          req.parentApproval === "APPROVED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {req.parentApproval}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">{req.requestedAt}</td>
                      <td className="py-3.5 px-4 text-right">
                        {req.status === "PENDING" ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => handleOutingAction(req.id, "APPROVED")}
                              className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 rounded"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOutingAction(req.id, "REJECTED")}
                              className="h-7 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 px-2.5 rounded"
                            >
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 5.5 MAINTENANCE & COMPLAINTS MANAGEMENT ── */}
      {(activeTab === "maintenance" || activeTab === "complaints") && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-[#162354]">Maintenance & Facility Complaints</h1>
                  <p className="text-xs text-slate-500 font-medium">Track hostel repairs, electrical, plumbing, carpentry, and Wi-Fi facility complaints.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                size="sm"
                onClick={() => setAddTicketModalOpen(true)}
                className="bg-[#162354] hover:bg-[#1f3073] text-white text-xs h-9 px-4 rounded-xl gap-2 font-semibold shadow-sm"
              >
                <Plus className="h-4 w-4" /> Raise Maintenance Ticket
              </Button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">Total Tickets</span>
                <span className="text-xl font-bold text-slate-800">{maintenanceTickets.length}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 shadow-sm flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-rose-700 block uppercase tracking-wider">Open Issues</span>
                <span className="text-xl font-bold text-rose-700">
                  {maintenanceTickets.filter((t) => t.status === "OPEN").length}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4 shadow-sm flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-amber-700 block uppercase tracking-wider">In Progress</span>
                <span className="text-xl font-bold text-amber-700">
                  {maintenanceTickets.filter((t) => t.status === "IN_PROGRESS").length}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-sm flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-emerald-700 block uppercase tracking-wider">Resolved</span>
                <span className="text-xl font-bold text-emerald-700">
                  {maintenanceTickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length}
                </span>
              </div>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-2xl no-scrollbar">
              {["ALL", "Plumbing", "Electrical", "Carpentry", "AC / HVAC", "Wi-Fi & Network"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setMaintenanceCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    maintenanceCategoryFilter === cat
                      ? "bg-[#162354] text-white shadow-sm"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Input
                placeholder="Search ticket, room, or student..."
                value={maintenanceSearch}
                onChange={(e) => setMaintenanceSearch(e.target.value)}
                className="h-9 text-xs pr-8 rounded-xl border-slate-300"
              />
              <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
            </div>
          </div>

          {/* Maintenance Tickets Table */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#162354] text-white font-semibold text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">TICKET</th>
                    <th className="py-3.5 px-4">ISSUE DETAILS</th>
                    <th className="py-3.5 px-4">LOCATION</th>
                    <th className="py-3.5 px-4">REPORTED BY</th>
                    <th className="py-3.5 px-4">PRIORITY</th>
                    <th className="py-3.5 px-4">ASSIGNED TECH</th>
                    <th className="py-3.5 px-4">STATUS</th>
                    <th className="py-3.5 px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {maintenanceTickets
                    .filter((t) => {
                      if (maintenanceCategoryFilter !== "ALL" && t.category !== maintenanceCategoryFilter) return false;
                      if (!maintenanceSearch) return true;
                      const q = maintenanceSearch.toLowerCase();
                      return (
                        t.ticketNumber.toLowerCase().includes(q) ||
                        t.title.toLowerCase().includes(q) ||
                        t.roomNumber.toLowerCase().includes(q) ||
                        t.reportedBy.toLowerCase().includes(q) ||
                        t.category.toLowerCase().includes(q)
                      );
                    })
                    .map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                            {ticket.ticketNumber}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-mono mt-1">{ticket.reportedAt}</span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-bold text-slate-900">{ticket.title}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-1.5 py-0.5 rounded">
                              {ticket.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{ticket.description}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">Room {ticket.roomNumber}</div>
                          <div className="text-[10px] text-slate-400">{ticket.blockName}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="h-6 w-6 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                              {ticket.reportedBy.charAt(0)}
                            </span>
                            <span className="font-medium text-slate-800">{ticket.reportedBy}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              ticket.priority === "URGENT"
                                ? "bg-rose-100 text-rose-700 animate-pulse"
                                : ticket.priority === "HIGH"
                                ? "bg-orange-100 text-orange-700"
                                : ticket.priority === "MEDIUM"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          {ticket.assignedTechnician ? (
                            <span className="text-slate-700 font-medium bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                              {ticket.assignedTechnician}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              ticket.status === "RESOLVED" || ticket.status === "CLOSED"
                                ? "bg-emerald-100 text-emerald-700"
                                : ticket.status === "IN_PROGRESS"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {ticket.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" ? (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateTicketStatus(ticket.id, "IN_PROGRESS")}
                                  className="h-7 text-[11px] bg-blue-600 hover:bg-blue-700 text-white px-2.5 rounded-lg"
                                >
                                  In Progress
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateTicketStatus(ticket.id, "RESOLVED")}
                                  className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 rounded-lg"
                                >
                                  Resolve
                                </Button>
                              </>
                            ) : (
                              <span className="text-[11px] text-emerald-600 font-semibold flex items-center justify-end gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Done
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 6. OUTING LOG HISTORY & VIOLATIONS (DATABASE DRIVEN) ── */}
      {(activeTab === "logs" ||
        activeTab === "outing-logs" ||
        activeTab === "outing-log-history" ||
        activeTab === "outing_log_history" ||
        activeTab === "log-history") && (() => {
        // Filter logic for Gate Logs
        const filteredGateLogs = logs.filter((log: any) => {
          if (logSearch) {
            const q = logSearch.toLowerCase();
            const matchesSearch =
              (log.name && log.name.toLowerCase().includes(q)) ||
              (log.studentName && log.studentName.toLowerCase().includes(q)) ||
              (log.registrationId && log.registrationId.toLowerCase().includes(q)) ||
              (log.userId && log.userId.toLowerCase().includes(q)) ||
              (log.room && log.room.toLowerCase().includes(q)) ||
              (log.outingId && log.outingId.toLowerCase().includes(q)) ||
              (log.block && log.block.toLowerCase().includes(q));
            if (!matchesSearch) return false;
          }

          if (gateLogFilters.movementType !== "ALL" && log.type !== gateLogFilters.movementType) return false;
          if (gateLogFilters.authorization !== "ALL") {
            const authStatus = log.authorizationStatus || "AUTHORIZED";
            if (authStatus !== gateLogFilters.authorization) return false;
          }
          if (gateLogFilters.status !== "ALL") {
            const st = log.status || "NORMAL";
            if (st !== gateLogFilters.status) return false;
          }
          if (gateLogFilters.block !== "ALL" && !log.block?.toLowerCase().includes(gateLogFilters.block.toLowerCase())) return false;
          if (gateLogFilters.device !== "ALL" && !log.device?.toLowerCase().includes(gateLogFilters.device.toLowerCase())) return false;
          if (gateLogFilters.method !== "ALL" && !log.method?.toLowerCase().includes(gateLogFilters.method.toLowerCase())) return false;

          return true;
        });

        const activeGateLogFilterCount = Object.values(gateLogFilters).filter((v) => v && v !== "ALL").length;
        const totalGateLogPages = Math.ceil(filteredGateLogs.length / gateLogPageSize) || 1;
        const paginatedGateLogs = filteredGateLogs.slice((gateLogPage - 1) * gateLogPageSize, gateLogPage * gateLogPageSize);

        // Filter logic for Violations
        const filteredViolations = violationsList.filter((v) => {
          if (violationTabFilter !== "ALL" && v.status !== violationTabFilter) return false;
          if (logSearch) {
            const q = logSearch.toLowerCase();
            const matches =
              v.studentName.toLowerCase().includes(q) ||
              v.registrationId.toLowerCase().includes(q) ||
              v.blockName.toLowerCase().includes(q) ||
              v.violationType.toLowerCase().includes(q) ||
              v.roomNumber.toLowerCase().includes(q);
            if (!matches) return false;
          }
          return true;
        });

        const totalViolationPages = Math.ceil(filteredViolations.length / violationsPageSize) || 1;
        const paginatedViolations = filteredViolations.slice((violationsPage - 1) * violationsPageSize, violationsPage * violationsPageSize);

        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#162354]">Log History</h1>
                <p className="text-sm text-slate-500 font-medium mt-0.5">
                  Review gate logs, track physical presence, monitor outing students, and identify violations.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Presence Engine Live: {stillInHostelStudents.length} Inside / {outingStudentsList.length} Out
                </span>
              </div>
            </div>

            <div className="flex items-center gap-8 text-sm font-semibold border-b border-slate-200 overflow-x-auto">
              {[
                { key: "Logs", label: "All Gate Logs", count: logs.length },
                { key: "Students Still in Hostel", label: "Students Still in Hostel", count: stillInHostelStudents.length, badgeColor: "bg-emerald-100 text-emerald-800" },
                { key: "Outing Students List", label: "Outing Students List", count: outingStudentsList.length, badgeColor: "bg-amber-100 text-amber-800" },
                { key: "Analytics", label: "Analytics" },
                { key: "Violations", label: "Violations", count: violationsList.filter((v) => v.status === "OPEN").length, badgeColor: "bg-rose-100 text-rose-800" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setLogSubTab(tab.key)}
                  className={`pb-3 whitespace-nowrap transition-all flex items-center gap-2 ${
                    logSubTab === tab.key
                      ? "text-[#162354] border-b-2 border-[#162354] font-bold"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${tab.badgeColor || "bg-slate-100 text-slate-700"}`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search, Interactive Filter Panel and Export Toolbar */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1 max-w-lg">
                  <div className="relative flex-1">
                    <Input
                      placeholder={`Search by student name, registration ID, room, or outing ID...`}
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      className="h-9 text-xs pr-8 rounded-lg border-slate-300 shadow-sm"
                    />
                    <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setGateLogFilterPanelOpen(!gateLogFilterPanelOpen)}
                    className={`h-9 px-3 text-xs gap-1.5 font-semibold rounded-lg border-slate-300 transition-all ${
                      gateLogFilterPanelOpen || activeGateLogFilterCount > 0
                        ? "bg-[#162354] text-white hover:bg-[#1f3073] hover:text-white border-[#162354]"
                        : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Filter className="h-3.5 w-3.5" />
                    Filters
                    {activeGateLogFilterCount > 0 && (
                      <span className="ml-1 px-1.5 py-0.2 text-[10px] bg-emerald-500 text-white rounded-full font-bold">
                        {activeGateLogFilterCount}
                      </span>
                    )}
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleExportPresenceCSV}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 px-3 rounded-lg gap-1.5 font-semibold shadow-sm"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" /> Export CSV
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      toast.success(`Exporting ${logSubTab} report to PDF...`);
                      window.print();
                    }}
                    className="bg-rose-500 hover:bg-rose-600 text-white text-xs h-9 px-3 rounded-lg gap-1.5 font-semibold shadow-sm"
                  >
                    <FileText className="h-3.5 w-3.5" /> Export PDF
                  </Button>
                  <Button
                    size="sm"
                    onClick={fetchAllData}
                    className="bg-[#162354] hover:bg-[#1f3073] text-white text-xs h-9 px-3 rounded-lg gap-1.5 font-semibold shadow-sm"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh
                  </Button>
                </div>
              </div>

              {/* Collapsible Dynamic Filter Panel */}
              {gateLogFilterPanelOpen && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Filter className="h-3.5 w-3.5 text-[#162354]" /> Advanced Gate Movement & Violation Filters
                    </span>
                    <button
                      onClick={() =>
                        setGateLogFilters({
                          fromDate: "",
                          toDate: "",
                          movementType: "ALL",
                          authorization: "ALL",
                          status: "ALL",
                          block: "ALL",
                          device: "ALL",
                          method: "ALL",
                        })
                      }
                      className="text-[11px] font-bold text-rose-600 hover:underline"
                    >
                      Reset Filters
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
                    <div>
                      <Label className="text-[10px] font-semibold text-slate-600">From Date/Time</Label>
                      <Input
                        type="datetime-local"
                        value={gateLogFilters.fromDate}
                        onChange={(e) => setGateLogFilters({ ...gateLogFilters, fromDate: e.target.value })}
                        className="h-8 text-[11px] mt-1 bg-white border-slate-300"
                      />
                    </div>

                    <div>
                      <Label className="text-[10px] font-semibold text-slate-600">To Date/Time</Label>
                      <Input
                        type="datetime-local"
                        value={gateLogFilters.toDate}
                        onChange={(e) => setGateLogFilters({ ...gateLogFilters, toDate: e.target.value })}
                        className="h-8 text-[11px] mt-1 bg-white border-slate-300"
                      />
                    </div>

                    <div>
                      <Label className="text-[10px] font-semibold text-slate-600">Movement Type</Label>
                      <Select
                        value={gateLogFilters.movementType}
                        onValueChange={(v) => setGateLogFilters({ ...gateLogFilters, movementType: v })}
                      >
                        <SelectTrigger className="h-8 text-[11px] mt-1 bg-white border-slate-300">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All Movements</SelectItem>
                          <SelectItem value="CHECK-IN">Check-In</SelectItem>
                          <SelectItem value="CHECK-OUT">Check-Out</SelectItem>
                          <SelectItem value="UNAUTHORIZED_EXIT">Unauthorized Exit</SelectItem>
                          <SelectItem value="EMERGENCY_EXIT">Emergency Exit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-[10px] font-semibold text-slate-600">Authorization</Label>
                      <Select
                        value={gateLogFilters.authorization}
                        onValueChange={(v) => setGateLogFilters({ ...gateLogFilters, authorization: v })}
                      >
                        <SelectTrigger className="h-8 text-[11px] mt-1 bg-white border-slate-300">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All</SelectItem>
                          <SelectItem value="AUTHORIZED">Authorized</SelectItem>
                          <SelectItem value="UNAUTHORIZED">Unauthorized</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-[10px] font-semibold text-slate-600">Status</Label>
                      <Select
                        value={gateLogFilters.status}
                        onValueChange={(v) => setGateLogFilters({ ...gateLogFilters, status: v })}
                      >
                        <SelectTrigger className="h-8 text-[11px] mt-1 bg-white border-slate-300">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All Statuses</SelectItem>
                          <SelectItem value="NORMAL">Normal</SelectItem>
                          <SelectItem value="LATE">Late</SelectItem>
                          <SelectItem value="VIOLATION">Violation</SelectItem>
                          <SelectItem value="COMPLETED">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-[10px] font-semibold text-slate-600">Block</Label>
                      <Select
                        value={gateLogFilters.block}
                        onValueChange={(v) => setGateLogFilters({ ...gateLogFilters, block: v })}
                      >
                        <SelectTrigger className="h-8 text-[11px] mt-1 bg-white border-slate-300">
                          <SelectValue placeholder="All Blocks" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All Blocks</SelectItem>
                          <SelectItem value="Boys Block A">Boys Block A</SelectItem>
                          <SelectItem value="Girls Block B">Girls Block B</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-[10px] font-semibold text-slate-600">Method</Label>
                      <Select
                        value={gateLogFilters.method}
                        onValueChange={(v) => setGateLogFilters({ ...gateLogFilters, method: v })}
                      >
                        <SelectTrigger className="h-8 text-[11px] mt-1 bg-white border-slate-300">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All Methods</SelectItem>
                          <SelectItem value="Fingerprint">Fingerprint</SelectItem>
                          <SelectItem value="RFID">RFID</SelectItem>
                          <SelectItem value="Face">Face Recognition</SelectItem>
                          <SelectItem value="Manual">Manual</SelectItem>
                          <SelectItem value="QR">QR Code</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ═══ SUB-TAB 1: ALL GATE LOGS (COMPLETE PROFESSIONAL 13-COLUMN TABLE) ═══ */}
            {logSubTab === "Logs" && (
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm space-y-0">
                <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">All Gate Movement & Turnstile Event Logs</span>
                  <span className="text-[11px] font-medium text-slate-500">
                    Showing {paginatedGateLogs.length} of {filteredGateLogs.length} verified database records
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#162354] text-white font-semibold text-[10px] uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">STUDENT</th>
                        <th className="py-3 px-4">REGISTRATION ID</th>
                        <th className="py-3 px-4">BLOCK</th>
                        <th className="py-3 px-4">FLOOR</th>
                        <th className="py-3 px-4">ROOM</th>
                        <th className="py-3 px-4">MOVEMENT TYPE</th>
                        <th className="py-3 px-4">TIMESTAMP</th>
                        <th className="py-3 px-4">DEVICE</th>
                        <th className="py-3 px-4">METHOD</th>
                        <th className="py-3 px-4">OUTING ID</th>
                        <th className="py-3 px-4">AUTHORIZATION</th>
                        <th className="py-3 px-4">STATUS</th>
                        <th className="py-3 px-4 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedGateLogs.length === 0 ? (
                        <tr>
                          <td colSpan={13} className="py-10 text-center text-slate-400">
                            <p className="font-semibold text-sm">No gate movement records found</p>
                            <p className="text-xs text-slate-500 mt-1">Try adjusting your filters or search keywords.</p>
                          </td>
                        </tr>
                      ) : (
                        paginatedGateLogs.map((log: any) => (
                          <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <span className="h-7 w-7 rounded-full bg-[#162354]/10 text-[#162354] font-bold flex items-center justify-center text-xs">
                                  {(log.name || log.studentName || "S").charAt(0).toUpperCase()}
                                </span>
                                <div>
                                  <span className="font-bold text-slate-800 block">{log.name || log.studentName}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">ID: {log.userId || log.studentId}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                              {log.registrationId || log.userId || log.studentId}
                            </td>
                            <td className="py-3.5 px-4 text-slate-700 font-medium">{log.block || log.blockName}</td>
                            <td className="py-3.5 px-4 text-slate-600">{log.floor || log.floorName || "Floor 1"}</td>
                            <td className="py-3.5 px-4 font-semibold text-slate-800">{log.room || log.roomNumber}</td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded inline-flex items-center gap-1 ${
                                  log.type === "CHECK-IN"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : log.type === "CHECK-OUT"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-rose-100 text-rose-800 font-black"
                                }`}
                              >
                                {log.type}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                              {log.formattedTimestamp || log.timestamp}
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">{log.device || log.deviceName}</td>
                            <td className="py-3.5 px-4 text-slate-600">{log.method}</td>
                            <td className="py-3.5 px-4 font-mono font-semibold text-blue-700">
                              {log.outingId || (log.type === "CHECK-OUT" ? "OUT-2026001" : "-")}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  (log.authorizationStatus || "AUTHORIZED") === "AUTHORIZED"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                    : "bg-rose-50 text-rose-700 border border-rose-200"
                                }`}
                              >
                                {log.authorizationStatus || "AUTHORIZED"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  log.status === "LATE"
                                    ? "bg-rose-100 text-rose-800"
                                    : log.status === "VIOLATION"
                                    ? "bg-red-200 text-red-900"
                                    : log.status === "COMPLETED"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {log.status || (log.type === "CHECK-IN" ? "COMPLETED" : "NORMAL")}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedGateLogForDetails(log)}
                                className="h-7 text-[11px] px-2.5 rounded-lg border-slate-300 hover:bg-slate-100 font-semibold gap-1"
                              >
                                <Eye className="h-3 w-3" /> View
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Dynamic Pagination Bar */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span>
                      Showing {filteredGateLogs.length > 0 ? (gateLogPage - 1) * gateLogPageSize + 1 : 0} to{" "}
                      {Math.min(gateLogPage * gateLogPageSize, filteredGateLogs.length)} of {filteredGateLogs.length} entries
                    </span>
                    <select
                      value={gateLogPageSize}
                      onChange={(e) => {
                        setGateLogPageSize(Number(e.target.value));
                        setGateLogPage(1);
                      }}
                      className="h-7 text-xs bg-white border border-slate-300 rounded px-1.5 font-medium ml-2"
                    >
                      <option value={10}>10 / page</option>
                      <option value={25}>25 / page</option>
                      <option value={50}>50 / page</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={gateLogPage <= 1}
                      onClick={() => setGateLogPage((p) => Math.max(1, p - 1))}
                      className="h-7 px-2.5 text-xs font-semibold rounded"
                    >
                      Previous
                    </Button>

                    {Array.from({ length: totalGateLogPages }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        onClick={() => setGateLogPage(pg)}
                        className={`h-7 w-7 rounded text-xs font-bold transition-all ${
                          gateLogPage === pg
                            ? "bg-[#162354] text-white shadow-sm"
                            : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                        }`}
                      >
                        {pg}
                      </button>
                    ))}

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={gateLogPage >= totalGateLogPages}
                      onClick={() => setGateLogPage((p) => Math.min(totalGateLogPages, p + 1))}
                      className="h-7 px-2.5 text-xs font-semibold rounded"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ SUB-TAB 2: STUDENTS STILL IN HOSTEL ═══ */}
            {logSubTab === "Students Still in Hostel" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Showing students physically verified inside hostel (Latest movement = CHECK-IN). Checked-out students are automatically excluded.
                  </div>
                  <span className="font-bold text-emerald-900 bg-emerald-200/70 px-2.5 py-0.5 rounded-full">
                    {stillInHostelStudents.length} Students Inside
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#162354] text-white font-semibold text-[10px] uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">STUDENT</th>
                          <th className="py-3 px-4">REGISTRATION ID</th>
                          <th className="py-3 px-4">BLOCK</th>
                          <th className="py-3 px-4">FLOOR</th>
                          <th className="py-3 px-4">ROOM</th>
                          <th className="py-3 px-4">BED</th>
                          <th className="py-3 px-4">LAST CHECK-IN</th>
                          <th className="py-3 px-4">DEVICE</th>
                          <th className="py-3 px-4">ENTRY METHOD</th>
                          <th className="py-3 px-4">CURRENT STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {stillInHostelStudents
                          .filter((s) => {
                            if (!logSearch) return true;
                            const q = logSearch.toLowerCase();
                            return (
                              s.studentName.toLowerCase().includes(q) ||
                              s.registrationId.toLowerCase().includes(q) ||
                              s.blockName.toLowerCase().includes(q) ||
                              s.roomNumber.toLowerCase().includes(q)
                            );
                          })
                          .map((student) => (
                            <tr key={student.id} className="hover:bg-slate-50">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-2.5">
                                  <span className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                                    {student.studentName.charAt(0).toUpperCase()}
                                  </span>
                                  <div>
                                    <span className="font-bold text-slate-800 block">{student.studentName}</span>
                                    <span className="text-[10px] text-slate-400 font-mono">Roll: {student.rollNumber}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">{student.registrationId}</td>
                              <td className="py-3.5 px-4 text-slate-700 font-medium">{student.blockName}</td>
                              <td className="py-3.5 px-4 text-slate-600">{student.floorName}</td>
                              <td className="py-3.5 px-4 font-semibold text-slate-800">{student.roomNumber}</td>
                              <td className="py-3.5 px-4 font-mono text-slate-600">{student.bedNumber}</td>
                              <td className="py-3.5 px-4 font-mono text-slate-600">{student.lastCheckIn}</td>
                              <td className="py-3.5 px-4 text-slate-600">{student.device}</td>
                              <td className="py-3.5 px-4 text-slate-600">{student.method}</td>
                              <td className="py-3.5 px-4">
                                <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full text-[10px] inline-flex items-center gap-1 shadow-xs">
                                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                                  INSIDE HOSTEL
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ SUB-TAB 3: OUTING STUDENTS LIST ═══ */}
            {logSubTab === "Outing Students List" && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-amber-800 font-semibold">
                    <PersonStanding className="h-4 w-4 text-amber-600" />
                    Showing students currently outside on verified outing pass. Clicking "Mark Check-In" triggers presence recalculation.
                  </div>
                  <span className="font-bold text-amber-900 bg-amber-200/70 px-2.5 py-0.5 rounded-full">
                    {outingStudentsList.length} Students Outside
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#162354] text-white font-semibold text-[10px] uppercase tracking-wider">
                        <tr>
                          <th className="py-3 px-4">STUDENT</th>
                          <th className="py-3 px-4">REGISTRATION ID</th>
                          <th className="py-3 px-4">BLOCK</th>
                          <th className="py-3 px-4">ROOM</th>
                          <th className="py-3 px-4">REASON</th>
                          <th className="py-3 px-4">APPROVED BY</th>
                          <th className="py-3 px-4">EXPECTED OUT</th>
                          <th className="py-3 px-4">ACTUAL OUT</th>
                          <th className="py-3 px-4">EXPECTED RETURN</th>
                          <th className="py-3 px-4">ACTUAL RETURN</th>
                          <th className="py-3 px-4">DURATION</th>
                          <th className="py-3 px-4">STATUS</th>
                          <th className="py-3 px-4 text-right">ACTION</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {outingStudentsList.map((student) => (
                          <tr key={student.id} className="hover:bg-slate-50">
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2.5">
                                <span className="h-7 w-7 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs">
                                  {student.studentName.charAt(0).toUpperCase()}
                                </span>
                                <div>
                                  <span className="font-bold text-slate-800 block">{student.studentName}</span>
                                  <span className="text-[10px] text-slate-400 font-mono">ID: {student.registrationId}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">{student.registrationId}</td>
                            <td className="py-3.5 px-4 text-slate-700 font-medium">{student.blockName}</td>
                            <td className="py-3.5 px-4 font-semibold text-slate-800">{student.roomNumber}</td>
                            <td className="py-3.5 px-4 text-slate-700">{student.reason}</td>
                            <td className="py-3.5 px-4 text-slate-600 font-medium">{student.approvedBy}</td>
                            <td className="py-3.5 px-4 font-mono text-slate-600">{student.expectedOutTime}</td>
                            <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">{student.actualOutTime}</td>
                            <td className="py-3.5 px-4 font-mono text-slate-600">{student.expectedReturnTime}</td>
                            <td className="py-3.5 px-4 font-mono">
                              <span className="text-amber-700 font-bold italic">{student.actualReturnTime}</span>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-800">{student.durationText}</td>
                            <td className="py-3.5 px-4">
                              <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full text-[10px] inline-flex items-center gap-1 shadow-xs">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-ping"></span>
                                OUTSIDE
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <Button
                                size="sm"
                                onClick={() => handleMarkCheckIn(student)}
                                className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-2.5 rounded-lg shadow-sm"
                              >
                                Mark Check-In
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ── 8. STUDENT USER MANAGEMENT (STUDENTS ONLY) ── */}
      {activeTab === "users" && (() => {
        const filteredStudentUsers = users.filter((u) => {
          if (u.role && u.role.toLowerCase() !== "student") return false;
          if (userSearch && userSearch.trim()) {
            const q = userSearch.trim().toLowerCase();
            const matches =
              (u.name && u.name.toLowerCase().includes(q)) ||
              (u.rollNumber && u.rollNumber.toLowerCase().includes(q)) ||
              (u.jntuNumber && u.jntuNumber.toLowerCase().includes(q)) ||
              (u.username && u.username.toLowerCase().includes(q)) ||
              (u.email && u.email.toLowerCase().includes(q)) ||
              (u.department && u.department.toLowerCase().includes(q)) ||
              (u.branch && u.branch.toLowerCase().includes(q)) ||
              (u.roomNumber && u.roomNumber.toLowerCase().includes(q)) ||
              (u.blockName && u.blockName.toLowerCase().includes(q)) ||
              (u.bedNumber && u.bedNumber.toLowerCase().includes(q)) ||
              (u.contact && u.contact.includes(q)) ||
              (u.parentContact && u.parentContact.includes(q));
            if (!matches) return false;
          }
          if (userBranchFilter && userBranchFilter !== "ALL") {
            const deptLower = (u.department || u.branch || "").toLowerCase();
            const filterLower = userBranchFilter.toLowerCase();
            if (!deptLower.includes(filterLower)) return false;
          }
          if (userYearFilter && userYearFilter !== "ALL") {
            if (String(u.year) !== String(userYearFilter)) return false;
          }
          if (userAllocFilter && userAllocFilter !== "ALL") {
            const isAlloc = u.roomNumber && u.roomNumber !== "Unallocated" && u.roomNumber !== "-";
            if (userAllocFilter === "ALLOCATED" && !isAlloc) return false;
            if (userAllocFilter === "PENDING" && isAlloc) return false;
          }
          if (userStatusFilter && userStatusFilter !== "ALL") {
            if (u.status?.toUpperCase() !== userStatusFilter.toUpperCase()) return false;
          }
          return true;
        });

        const totalUserPages = Math.ceil(filteredStudentUsers.length / userPageSize) || 1;
        const paginatedStudentUsers = filteredStudentUsers.slice(
          (userPage - 1) * userPageSize,
          userPage * userPageSize
        );

        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#162354]">Student User Management</h1>
                <p className="text-sm text-slate-500 font-medium mt-0.5">
                  Manage registered hostel students, branch details, JNTU roll numbers, room allocations, and student login credentials.
                </p>
              </div>
              <Button
                onClick={() => setAddUserModalOpen(true)}
                className="bg-[#162354] hover:bg-[#1f3073] text-white text-xs font-semibold px-4 h-9 rounded-lg gap-1.5 shadow-sm"
              >
                <Plus className="h-4 w-4" /> Add New Student
              </Button>
            </div>

            {/* Search & Dynamic Filter Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Input
                  placeholder="Search by student name, JNTU roll no, branch, room, or email..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUserPage(1);
                  }}
                  className="h-9 text-xs pr-8 rounded-lg border-slate-300 focus:ring-2 focus:ring-[#162354]"
                />
                <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={userBranchFilter}
                  onValueChange={(v) => {
                    setUserBranchFilter(v);
                    setUserPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs w-36 bg-white border-slate-300">
                    <SelectValue placeholder="All Branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Branches</SelectItem>
                    <SelectItem value="CSE">Computer Science (CSE)</SelectItem>
                    <SelectItem value="ECE">Electronics (ECE)</SelectItem>
                    <SelectItem value="IT">Information Tech (IT)</SelectItem>
                    <SelectItem value="MECH">Mechanical (ME)</SelectItem>
                    <SelectItem value="CIVIL">Civil (CE)</SelectItem>
                    <SelectItem value="AIML">AI & ML (AIML)</SelectItem>
                    <SelectItem value="AIDS">AI & DS (AIDS)</SelectItem>
                    <SelectItem value="EEE">Electrical (EEE)</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={userYearFilter}
                  onValueChange={(v) => {
                    setUserYearFilter(v);
                    setUserPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs w-28 bg-white border-slate-300">
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Years</SelectItem>
                    <SelectItem value="1">1st Year</SelectItem>
                    <SelectItem value="2">2nd Year</SelectItem>
                    <SelectItem value="3">3rd Year</SelectItem>
                    <SelectItem value="4">4th Year</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={userAllocFilter}
                  onValueChange={(v) => {
                    setUserAllocFilter(v);
                    setUserPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs w-32 bg-white border-slate-300">
                    <SelectValue placeholder="Allocation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Allocation</SelectItem>
                    <SelectItem value="ALLOCATED">Room Allocated</SelectItem>
                    <SelectItem value="PENDING">Unallocated</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={userStatusFilter}
                  onValueChange={(v) => {
                    setUserStatusFilter(v);
                    setUserPage(1);
                  }}
                >
                  <SelectTrigger className="h-9 text-xs w-32 bg-white border-slate-300">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                    <SelectItem value="PENDING">PENDING</SelectItem>
                    <SelectItem value="DEACTIVATED">DEACTIVATED</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                onClick={handleBulkDeactivate}
                className="bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs h-8 px-3 rounded-md gap-1 border-0"
              >
                <XCircle className="h-3.5 w-3.5" /> Deactivate Selected
              </Button>
              <Button
                size="sm"
                onClick={handleBulkActivate}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 px-3 rounded-md gap-1"
              >
                <Check className="h-3.5 w-3.5" /> Activate Selected
              </Button>
              <Button
                size="sm"
                onClick={handleBulkResetPasswords}
                className="bg-[#162354] hover:bg-[#1f3073] text-white text-xs h-8 px-3 rounded-md gap-1"
              >
                <Lock className="h-3.5 w-3.5" /> Reset Passwords
              </Button>
              <Button
                size="sm"
                onClick={handleBulkDeallocateRooms}
                className="bg-amber-500 hover:bg-amber-600 text-white text-xs h-8 px-3 rounded-md gap-1"
              >
                <MinusCircle className="h-3.5 w-3.5" /> Deallocate Rooms
              </Button>
              <Button
                size="sm"
                onClick={() => handleExportStudentUsers(filteredStudentUsers)}
                className="bg-[#162354] hover:bg-[#1f3073] text-white text-xs h-8 px-3 rounded-md gap-1 ml-auto"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" /> Export Excel
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleExportStudentUsers(filteredStudentUsers)}
                className="text-xs h-8 px-3 rounded-md gap-1 border-slate-300"
              >
                <FileText className="h-3.5 w-3.5" /> Export CSV
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  fetchAllData();
                  toast.success("Refreshed student users from database!");
                }}
                className="text-xs h-8 px-2.5 rounded-md gap-1 border-slate-300"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Refresh
              </Button>
            </div>

            {/* Student Table */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#162354] text-white font-semibold text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3 w-8">
                        <input
                          type="checkbox"
                          checked={
                            paginatedStudentUsers.length > 0 &&
                            paginatedStudentUsers.every((u) => selectedUserIds.includes(u.id))
                          }
                          onChange={() => handleToggleSelectAll(paginatedStudentUsers)}
                          className="rounded border-slate-300"
                        />
                      </th>
                      <th className="py-3 px-4">STUDENT</th>
                      <th className="py-3 px-4">JNTU ROLL NO</th>
                      <th className="py-3 px-4">BRANCH / DEPT</th>
                      <th className="py-3 px-4">YEAR & SEM</th>
                      <th className="py-3 px-4">HOSTEL ROOM</th>
                      <th className="py-3 px-4">CONTACT</th>
                      <th className="py-3 px-4">STATUS</th>
                      <th className="py-3 px-4">LOGIN CREDENTIALS</th>
                      <th className="py-3 px-4 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedStudentUsers.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-8 text-center text-xs text-slate-500">
                          No student records found matching the active search or filters.
                        </td>
                      </tr>
                    ) : (
                      paginatedStudentUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-3">
                            <input
                              type="checkbox"
                              checked={selectedUserIds.includes(u.id)}
                              onChange={() => handleToggleSelectUser(u.id)}
                              className="rounded border-slate-300"
                            />
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <span className="h-7 w-7 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs">
                                {u.name.charAt(0).toUpperCase()}
                              </span>
                              <div>
                                <span className="font-bold text-slate-900 block">{u.name}</span>
                                <span className="text-[10px] text-slate-400 font-mono block">{u.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs">
                              {u.rollNumber}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-700 block text-xs">
                              {u.department}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-slate-800 text-xs">
                              {u.yearText || `${u.year}th Year`}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              {u.semesterText || `Sem ${u.semester}`} • Sec {u.section || "A"}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            {u.roomNumber && u.roomNumber !== "Unallocated" ? (
                              <div>
                                <span className="font-bold text-slate-800 block text-xs">
                                  {u.blockName} • Room {u.roomNumber}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  Bed: {u.bedNumber || "Bed-1"}
                                </span>
                              </div>
                            ) : (
                              <span className="bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded border border-amber-200 text-[10px]">
                                Unallocated
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-mono text-slate-800 text-xs">{u.contact}</div>
                            {u.parentContact && (
                              <div className="text-[10px] text-slate-400 font-mono">P: {u.parentContact}</div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                u.status === "ACTIVE"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : u.status === "PENDING"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              {u.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setViewCredentialsModal(u)}
                              className="h-7 text-[11px] gap-1 px-2.5 font-semibold text-[#162354] border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs"
                            >
                              <Key className="h-3 w-3 text-blue-600" /> View Credentials
                            </Button>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                title="Reset Student Password"
                                onClick={() => {
                                  setResetPasswordStudent(u);
                                  setNewCustomPassword(`${u.rollNumber}@2026`);
                                }}
                                className="h-7 w-7 p-0 text-blue-600 hover:bg-blue-50"
                              >
                                <Lock className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                title="Deallocate Room"
                                onClick={() => handleDeallocateStudentRoom(u.id, u.name)}
                                className="h-7 w-7 p-0 text-amber-600 hover:bg-amber-50"
                              >
                                <MinusCircle className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                title={u.status === "ACTIVE" ? "Deactivate Account" : "Activate Account"}
                                onClick={() => {
                                  const newSt = u.status === "ACTIVE" ? "DEACTIVATED" : "ACTIVE";
                                  setUsers((prev) =>
                                    prev.map((item) => (item.id === u.id ? { ...item, status: newSt } : item))
                                  );
                                  toast.success(`Student ${u.name} marked as ${newSt}!`);
                                }}
                                className={`h-7 w-7 p-0 ${
                                  u.status === "ACTIVE" ? "text-rose-600 hover:bg-rose-50" : "text-emerald-600 hover:bg-emerald-50"
                                }`}
                              >
                                <Ban className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Dynamic Pagination */}
              <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 border-t text-xs text-slate-500 bg-slate-50 gap-2">
                <div className="flex items-center gap-2">
                  <span>
                    Showing {filteredStudentUsers.length === 0 ? 0 : (userPage - 1) * userPageSize + 1} to{" "}
                    {Math.min(userPage * userPageSize, filteredStudentUsers.length)} of {filteredStudentUsers.length} students
                  </span>
                  <select
                    value={userPageSize}
                    onChange={(e) => {
                      setUserPageSize(Number(e.target.value));
                      setUserPage(1);
                    }}
                    className="h-7 text-xs border border-slate-300 rounded px-1 bg-white font-medium ml-2"
                  >
                    <option value={10}>10 / page</option>
                    <option value={25}>25 / page</option>
                    <option value={50}>50 / page</option>
                  </select>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={userPage <= 1}
                    onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                    className="h-7 text-xs px-2.5"
                  >
                    Previous
                  </Button>
                  {Array.from({ length: Math.min(5, totalUserPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalUserPages > 5 && userPage > 3) {
                      pageNum = userPage - 2 + i;
                      if (pageNum > totalUserPages) pageNum = totalUserPages - (4 - i);
                    }
                    return (
                      <Button
                        key={pageNum}
                        size="sm"
                        variant={userPage === pageNum ? "default" : "outline"}
                        onClick={() => setUserPage(pageNum)}
                        className={`h-7 text-xs px-2.5 ${
                          userPage === pageNum ? "bg-[#162354] text-white hover:bg-[#1f3073]" : ""
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={userPage >= totalUserPages}
                    onClick={() => setUserPage((p) => Math.min(totalUserPages, p + 1))}
                    className="h-7 text-xs px-2.5"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── 9. GUEST & PARENT BILLING (STEP-BY-STEP DYNAMIC WIZARD) ── */}
      {activeTab === "guest-billing" && (() => {
        const fromTime = new Date(guestForm.fromDate).getTime();
        const toTime = new Date(guestForm.toDate).getTime();
        const diffDays = Math.max(1, Math.ceil((toTime - fromTime) / (1000 * 60 * 60 * 24)) + 1);

        let dailyMessRate = 0;
        if (guestForm.includeBreakfast) dailyMessRate += 80;
        if (guestForm.includeLunch) dailyMessRate += 120;
        if (guestForm.includeDinner) dailyMessRate += 120;

        let extraChargesTotal = 0;
        if (guestForm.extraBed) extraChargesTotal += 150 * diffDays;
        if (guestForm.extraAC) extraChargesTotal += 100 * diffDays;
        if (guestForm.extraLaundry) extraChargesTotal += 80;

        const liveRoomSubtotal = Number(guestForm.roomCharges) * diffDays;
        const liveMessSubtotal = dailyMessRate * diffDays;
        const liveGrandTotal = liveRoomSubtotal + liveMessSubtotal + extraChargesTotal;

        const totalRevenue = guestBills
          .filter((b) => b.status === "PAID")
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
        const pendingDues = guestBills
          .filter((b) => b.status === "PENDING")
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        const filteredBills = guestBills.filter((b) => {
          const matchQuery =
            !billSearchQuery.trim() ||
            b.billNumber.toLowerCase().includes(billSearchQuery.toLowerCase()) ||
            b.guestName.toLowerCase().includes(billSearchQuery.toLowerCase()) ||
            (b.studentName && b.studentName.toLowerCase().includes(billSearchQuery.toLowerCase())) ||
            (b.studentRollNo && b.studentRollNo.toLowerCase().includes(billSearchQuery.toLowerCase()));
          const matchStatus = billStatusFilter === "ALL" || b.status === billStatusFilter;
          const matchRelation = billRelationFilter === "ALL" || b.relation === billRelationFilter;
          return matchQuery && matchStatus && matchRelation;
        });

        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#162354] flex items-center gap-2.5">
                  <Building2 className="h-6 w-6 text-blue-600" /> Guest & Parent Billing Management
                </h1>
                <p className="text-sm text-slate-500 font-medium mt-0.5">
                  Link visiting parents with student records, configure guest suites, dining plans, and generate official stamped receipts.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    const ledgerEl = document.getElementById("guest-billing-ledger");
                    if (ledgerEl) ledgerEl.scrollIntoView({ behavior: "smooth" });
                  }}
                  variant="outline"
                  className="text-xs font-semibold h-9 rounded-xl border-slate-300 gap-1.5"
                >
                  <Receipt className="h-4 w-4 text-blue-600" /> View Ledger ({guestBills.length})
                </Button>
                <Button
                  onClick={() => {
                    setGuestBillingStep(1);
                    toast.success("Ready to record a new guest stay!");
                  }}
                  className="bg-[#162354] hover:bg-[#1f3073] text-white text-xs font-semibold h-9 rounded-xl gap-1.5 shadow-sm"
                >
                  <Plus className="h-4 w-4" /> New Guest Stay
                </Button>
              </div>
            </div>

            {/* Top Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Total Guest Revenue</span>
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <BadgeIndianRupee className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-black text-slate-900">₹{totalRevenue.toLocaleString()}</div>
                <div className="mt-1 text-[11px] text-emerald-600 font-medium">✓ Settled & Collected</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Total Stays Recorded</span>
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Receipt className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-black text-slate-900">{guestBills.length} Invoices</div>
                <div className="mt-1 text-[11px] text-slate-500 font-medium">Across all campus guest rooms</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Active Parent Stays</span>
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <UserCheck className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-black text-slate-900">
                  {guestBills.filter((b) => b.toDate >= "2026-08-26").length} Active
                </div>
                <div className="mt-1 text-[11px] text-indigo-600 font-medium">Currently in Guest Suites</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Pending Dues</span>
                  <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-black text-slate-900">₹{pendingDues.toLocaleString()}</div>
                <div className="mt-1 text-[11px] text-amber-600 font-medium">Payable at Check-Out</div>
              </div>
            </div>

            {/* Step-By-Step Guest Billing Card */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              {/* Stepper Progress Bar Header */}
              <div className="bg-slate-50/80 border-b border-slate-200 px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#162354]">Guest Accommodation & Billing Wizard</h3>
                    <p className="text-xs text-slate-500">Complete 4 quick steps to generate an itemized official receipt.</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[
                      { num: 1, label: "Student & Ward" },
                      { num: 2, label: "Guest Info" },
                      { num: 3, label: "Stay & Meals" },
                      { num: 4, label: "Payment & Total" },
                    ].map((step) => {
                      const isActive = guestBillingStep === step.num;
                      const isCompleted = guestBillingStep > step.num;
                      return (
                        <button
                          key={step.num}
                          type="button"
                          onClick={() => setGuestBillingStep(step.num)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            isActive
                              ? "bg-[#162354] text-white shadow-sm"
                              : isCompleted
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-200/70 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              isActive ? "bg-white text-[#162354]" : isCompleted ? "bg-blue-700 text-white" : "bg-slate-300 text-slate-700"
                            }`}
                          >
                            {isCompleted ? "✓" : step.num}
                          </span>
                          <span>{step.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Stepper Form Content */}
              <form onSubmit={handleGuestSubmit} className="p-6 space-y-6">
                {/* ── STEP 1: STUDENT & WARD LINKAGE ── */}
                {guestBillingStep === 1 && (
                  <div className="space-y-5 animate-in fade-in-50 duration-200">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-sm font-bold text-[#162354] flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">1</span>
                          Select Student / Ward Being Visited
                        </h4>
                        <p className="text-xs text-slate-500">Link this guest visit with an existing student registered in the hostel database.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-600">Visitor Type:</span>
                        <Button
                          type="button"
                          size="sm"
                          variant={!isExternalGuest ? "default" : "outline"}
                          onClick={() => {
                            setIsExternalGuest(false);
                            setGuestForm((prev) => ({
                              ...prev,
                              relation: "Father",
                              purpose: "Visiting Student & Academic Review",
                            }));
                          }}
                          className={`text-xs h-7 rounded-lg ${!isExternalGuest ? "bg-[#162354] text-white" : ""}`}
                        >
                          Student's Family / Parent
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={isExternalGuest ? "default" : "outline"}
                          onClick={() => {
                            setIsExternalGuest(true);
                            setGuestForm((prev) => ({
                              ...prev,
                              studentName: "External University Visitor",
                              studentRollNo: "EXTERNAL",
                              studentDepartment: "Institutional Guest",
                              studentRoom: "Guest House",
                              relation: "Official Guest",
                              purpose: "Official Campus Visit & Inspection",
                            }));
                          }}
                          className={`text-xs h-7 rounded-lg ${isExternalGuest ? "bg-[#162354] text-white" : ""}`}
                        >
                          External Official Guest
                        </Button>
                      </div>
                    </div>

                    {!isExternalGuest ? (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-slate-700">Choose Student From Hostel Database *</Label>
                          <Select
                            value={guestForm.studentId || (users[0] ? users[0].id : "")}
                            onValueChange={(selectedId) => {
                              const found = users.find((u) => u.id === selectedId);
                              if (found) {
                                setSelectedStudentForGuest(found);
                                setGuestForm((prev) => ({
                                  ...prev,
                                  studentId: found.id,
                                  studentName: found.name,
                                  studentRollNo: found.rollNumber,
                                  studentDepartment: found.department || "Computer Science (CSE)",
                                  studentRoom: `${found.blockName || "Hostel Block"} • Room ${found.roomNumber || "101"}`,
                                  contactNumber: found.parentContact || prev.contactNumber,
                                  guestName: prev.guestName || `${found.name}'s Parent`,
                                }));
                              }
                            }}
                          >
                            <SelectTrigger className="h-10 text-xs border-slate-300 bg-white">
                              <SelectValue placeholder="Select student by Roll No or Name" />
                            </SelectTrigger>
                            <SelectContent className="max-h-64">
                              {users.map((u) => (
                                <SelectItem key={u.id} value={u.id} className="text-xs">
                                  <span className="font-bold text-slate-900">{u.name}</span>{" "}
                                  <span className="text-blue-600 font-mono">({u.rollNumber})</span> — {u.department || "Engineering"} • Room {u.roomNumber || "N/A"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Selected Student Card Preview */}
                        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl bg-[#162354] text-white flex items-center justify-center font-bold text-base shadow-sm">
                              {guestForm.studentName ? guestForm.studentName.slice(0, 2).toUpperCase() : "ST"}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="text-sm font-bold text-slate-900">{guestForm.studentName}</h5>
                                <Badge className="bg-blue-600 text-white text-[10px] font-mono px-2 py-0.5">
                                  {guestForm.studentRollNo}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5">
                                {guestForm.studentDepartment} • <span className="font-medium text-slate-900">{guestForm.studentRoom}</span>
                              </p>
                              <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                                <span>📞 Parent Contact: <strong className="text-slate-800 font-mono">{guestForm.contactNumber}</strong></span>
                              </div>
                            </div>
                          </div>

                          <Button
                            type="button"
                            onClick={() => setGuestBillingStep(2)}
                            className="bg-[#162354] hover:bg-[#1f3073] text-white text-xs font-semibold h-9 px-5 rounded-xl gap-1.5 shrink-0"
                          >
                            Next: Guest / Parent Details <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h5 className="text-sm font-bold text-purple-950">Official Institutional / University Guest</h5>
                            <Badge className="bg-purple-600 text-white text-[10px]">VIP / Auditor</Badge>
                          </div>
                          <p className="text-xs text-purple-700 mt-0.5">
                            Guest is visiting for official college duties, audits, inspections, or guest lectures.
                          </p>
                        </div>
                        <Button
                          type="button"
                          onClick={() => setGuestBillingStep(2)}
                          className="bg-purple-900 hover:bg-purple-950 text-white text-xs font-semibold h-9 px-5 rounded-xl gap-1.5"
                        >
                          Next: Guest Details <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* ── STEP 2: GUEST / PARENT INFORMATION ── */}
                {guestBillingStep === 2 && (
                  <div className="space-y-5 animate-in fade-in-50 duration-200">
                    <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-[#162354] flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">2</span>
                          Guest / Parent Identification & Contact
                        </h4>
                        <p className="text-xs text-slate-500">Provide official identity and contact credentials for safety and record verification.</p>
                      </div>
                      <span className="text-xs font-medium text-slate-500">
                        Visiting: <strong className="text-slate-900">{guestForm.studentName}</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">Guest / Parent Full Name *</Label>
                        <Input
                          required
                          placeholder="e.g. B. Nageswara Rao"
                          value={guestForm.guestName}
                          onChange={(e) => setGuestForm({ ...guestForm, guestName: e.target.value })}
                          className="h-10 text-xs border-slate-300"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">Contact Mobile Number *</Label>
                        <Input
                          required
                          placeholder="e.g. 9440123456"
                          value={guestForm.contactNumber}
                          onChange={(e) => setGuestForm({ ...guestForm, contactNumber: e.target.value })}
                          className="h-10 text-xs border-slate-300 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">Relation to Student *</Label>
                        <Select
                          value={guestForm.relation}
                          onValueChange={(v: any) => setGuestForm({ ...guestForm, relation: v })}
                        >
                          <SelectTrigger className="h-10 text-xs border-slate-300"><SelectValue placeholder="Select Relation" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Father">Father</SelectItem>
                            <SelectItem value="Mother">Mother</SelectItem>
                            <SelectItem value="Guardian">Guardian</SelectItem>
                            <SelectItem value="Sibling">Brother / Sister</SelectItem>
                            <SelectItem value="Relative">Uncle / Relative</SelectItem>
                            <SelectItem value="Official Guest">Official Guest / Examiner</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">Official ID Proof Type</Label>
                        <Select
                          value={guestForm.idProofType}
                          onValueChange={(v) => setGuestForm({ ...guestForm, idProofType: v })}
                        >
                          <SelectTrigger className="h-10 text-xs border-slate-300"><SelectValue placeholder="ID Type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Aadhaar Card">Aadhaar Card</SelectItem>
                            <SelectItem value="PAN Card">PAN Card</SelectItem>
                            <SelectItem value="Voter ID">Voter ID</SelectItem>
                            <SelectItem value="Driving License">Driving License</SelectItem>
                            <SelectItem value="Passport">Passport</SelectItem>
                            <SelectItem value="Institutional ID">Institutional ID</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">ID Proof Number / Ref</Label>
                        <Input
                          placeholder="e.g. 5432-8765-9012"
                          value={guestForm.idProofNumber}
                          onChange={(e) => setGuestForm({ ...guestForm, idProofNumber: e.target.value })}
                          className="h-10 text-xs border-slate-300 font-mono"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Purpose of Stay / Remarks</Label>
                      <Input
                        placeholder="e.g. Visiting Student & Academic Review / Medical support"
                        value={guestForm.purpose}
                        onChange={(e) => setGuestForm({ ...guestForm, purpose: e.target.value })}
                        className="h-10 text-xs border-slate-300"
                      />
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {[
                          "Visiting Student & Academic Review",
                          "Health Care & Medical Support",
                          "Fee Payment & Clearance",
                          "Convocation & Campus Event",
                          "Weekend Family Accommodation",
                        ].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setGuestForm({ ...guestForm, purpose: p })}
                            className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                          >
                            + {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setGuestBillingStep(1)}
                        className="text-xs h-9 gap-1.5 border-slate-300"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" /> Back: Student
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setGuestBillingStep(3)}
                        className="bg-[#162354] hover:bg-[#1f3073] text-white text-xs font-semibold h-9 px-5 rounded-xl gap-1.5"
                      >
                        Next: Stay & Dining Plan <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* ── STEP 3: STAY, ROOM & DINING PLAN ── */}
                {guestBillingStep === 3 && (
                  <div className="space-y-5 animate-in fade-in-50 duration-200">
                    <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-[#162354] flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">3</span>
                          Accommodation Room, Dates & Dining Plan
                        </h4>
                        <p className="text-xs text-slate-500">Configure guest suite tariff, stay duration, meal inclusions, and extra amenities.</p>
                      </div>
                      <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold font-mono">
                        Duration: {diffDays} Day(s)
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">Guest Accommodation Category *</Label>
                        <Select
                          value={guestForm.roomType}
                          onValueChange={(v) => {
                            let rRate = 600;
                            let rNum = "Guest Suite 101";
                            if (v.includes("1,000") || v.includes("VIP")) {
                              rRate = 1000;
                              rNum = "VIP Suite 01";
                            } else if (v.includes("400") || v.includes("Transit")) {
                              rRate = 400;
                              rNum = "Parent Room 201";
                            } else if (v.includes("250")) {
                              rRate = 250;
                              rNum = "Attached Bed 03";
                            }
                            setGuestForm({ ...guestForm, roomType: v, roomCharges: rRate, roomNumber: rNum });
                          }}
                        >
                          <SelectTrigger className="h-10 text-xs border-slate-300"><SelectValue placeholder="Room Type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Parent Guest Suite (AC - ₹600/day)">Parent Guest Suite (AC - ₹600/day)</SelectItem>
                            <SelectItem value="Executive VIP Suite (AC - ₹1,000/day)">Executive VIP Suite (AC - ₹1,000/day)</SelectItem>
                            <SelectItem value="Standard Transit Room (Non-AC - ₹400/day)">Standard Transit Room (Non-AC - ₹400/day)</SelectItem>
                            <SelectItem value="Student Attached Bed (₹250/day)">Student Attached Bed (₹250/day)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">Assigned Room Number</Label>
                        <Input
                          placeholder="e.g. Guest Suite 101"
                          value={guestForm.roomNumber}
                          onChange={(e) => setGuestForm({ ...guestForm, roomNumber: e.target.value })}
                          className="h-10 text-xs border-slate-300 font-medium"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">Room Tariff (₹ / Day)</Label>
                        <Input
                          type="number"
                          value={guestForm.roomCharges}
                          onChange={(e) => setGuestForm({ ...guestForm, roomCharges: Number(e.target.value) })}
                          className="h-10 text-xs border-slate-300 font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">Check-In Date *</Label>
                        <Input
                          type="date"
                          value={guestForm.fromDate}
                          onChange={(e) => setGuestForm({ ...guestForm, fromDate: e.target.value })}
                          className="h-10 text-xs border-slate-300"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">Check-Out Date *</Label>
                        <Input
                          type="date"
                          value={guestForm.toDate}
                          onChange={(e) => setGuestForm({ ...guestForm, toDate: e.target.value })}
                          className="h-10 text-xs border-slate-300"
                        />
                      </div>
                    </div>

                    {/* Dining & Mess Configuration */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-xs font-bold text-[#162354] flex items-center gap-1.5">
                            <Coffee className="h-4 w-4 text-amber-600" /> Dining & Mess Meal Plan
                          </h5>
                          <p className="text-[11px] text-slate-500">Select meals included per day for the guest during the stay.</p>
                        </div>
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                          Daily Mess: ₹{dailyMessRate}/day (Total: ₹{liveMessSubtotal})
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <label className="flex items-center gap-2 text-xs font-medium text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 cursor-pointer hover:border-blue-300">
                          <input
                            type="checkbox"
                            checked={guestForm.includeBreakfast}
                            onChange={(e) => setGuestForm({ ...guestForm, includeBreakfast: e.target.checked })}
                            className="rounded text-blue-600"
                          />
                          <span>Breakfast (₹80/day)</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs font-medium text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 cursor-pointer hover:border-blue-300">
                          <input
                            type="checkbox"
                            checked={guestForm.includeLunch}
                            onChange={(e) => setGuestForm({ ...guestForm, includeLunch: e.target.checked })}
                            className="rounded text-blue-600"
                          />
                          <span>Lunch (₹120/day)</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs font-medium text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 cursor-pointer hover:border-blue-300">
                          <input
                            type="checkbox"
                            checked={guestForm.includeDinner}
                            onChange={(e) => setGuestForm({ ...guestForm, includeDinner: e.target.checked })}
                            className="rounded text-blue-600"
                          />
                          <span>Dinner (₹120/day)</span>
                        </label>
                      </div>
                    </div>

                    {/* Extra Amenities */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-xs font-bold text-[#162354] flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4 text-purple-600" /> Additional Amenities & Extras
                          </h5>
                          <p className="text-[11px] text-slate-500">Optional extra facilities requested during the stay.</p>
                        </div>
                        <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200">
                          Extras Total: ₹{extraChargesTotal}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                        <label className="flex items-center gap-2 text-xs font-medium text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 cursor-pointer hover:border-purple-300">
                          <input
                            type="checkbox"
                            checked={guestForm.extraBed}
                            onChange={(e) => setGuestForm({ ...guestForm, extraBed: e.target.checked })}
                            className="rounded text-purple-600"
                          />
                          <span>Extra Mattress (+₹150/d)</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs font-medium text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 cursor-pointer hover:border-purple-300">
                          <input
                            type="checkbox"
                            checked={guestForm.extraAC}
                            onChange={(e) => setGuestForm({ ...guestForm, extraAC: e.target.checked })}
                            className="rounded text-purple-600"
                          />
                          <span>AC Power Backup (+₹100/d)</span>
                        </label>
                        <label className="flex items-center gap-2 text-xs font-medium text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200 cursor-pointer hover:border-purple-300">
                          <input
                            type="checkbox"
                            checked={guestForm.extraLaundry}
                            onChange={(e) => setGuestForm({ ...guestForm, extraLaundry: e.target.checked })}
                            className="rounded text-purple-600"
                          />
                          <span>Laundry & Linen (+₹80)</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setGuestBillingStep(2)}
                        className="text-xs h-9 gap-1.5 border-slate-300"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" /> Back: Guest Info
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setGuestBillingStep(4)}
                        className="bg-[#162354] hover:bg-[#1f3073] text-white text-xs font-semibold h-9 px-5 rounded-xl gap-1.5"
                      >
                        Next: Payment & Review <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* ── STEP 4: PAYMENT & LIVE TOTAL BREAKDOWN ── */}
                {guestBillingStep === 4 && (
                  <div className="space-y-5 animate-in fade-in-50 duration-200">
                    <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-[#162354] flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">4</span>
                          Payment Method & Final Invoice Review
                        </h4>
                        <p className="text-xs text-slate-500">Review itemized bill calculations and select payment method to generate official receipt.</p>
                      </div>
                    </div>

                    {/* Live Calculation Card */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-[#162354] to-[#1e3a8a] text-white shadow-md">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
                        <div>
                          <span className="text-xs text-blue-200 uppercase tracking-wider font-semibold">Guest & Stay Summary</span>
                          <h4 className="text-lg font-bold text-white mt-0.5">
                            {guestForm.guestName} ({guestForm.relation})
                          </h4>
                          <p className="text-xs text-blue-100/80">
                            Visiting: <strong className="text-white">{guestForm.studentName}</strong> ({guestForm.studentRollNo}) • Room {guestForm.roomNumber}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-blue-200 block">Total Payable Amount</span>
                          <span className="text-3xl font-black text-white">₹{liveGrandTotal.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
                        <div className="bg-white/10 p-3 rounded-xl">
                          <span className="text-blue-200 block text-[11px]">Stay Duration</span>
                          <span className="font-bold text-white text-sm">{diffDays} Day(s)</span>
                          <span className="text-[10px] text-blue-200 block">{guestForm.fromDate} &rarr; {guestForm.toDate}</span>
                        </div>
                        <div className="bg-white/10 p-3 rounded-xl">
                          <span className="text-blue-200 block text-[11px]">Room Subtotal</span>
                          <span className="font-bold text-white text-sm">₹{liveRoomSubtotal.toLocaleString()}</span>
                          <span className="text-[10px] text-blue-200 block">₹{guestForm.roomCharges} × {diffDays}d</span>
                        </div>
                        <div className="bg-white/10 p-3 rounded-xl">
                          <span className="text-blue-200 block text-[11px]">Mess & Dining</span>
                          <span className="font-bold text-white text-sm">₹{liveMessSubtotal.toLocaleString()}</span>
                          <span className="text-[10px] text-blue-200 block">₹{dailyMessRate} × {diffDays}d</span>
                        </div>
                        <div className="bg-white/10 p-3 rounded-xl">
                          <span className="text-blue-200 block text-[11px]">Extra Amenities</span>
                          <span className="font-bold text-white text-sm">₹{extraChargesTotal.toLocaleString()}</span>
                          <span className="text-[10px] text-blue-200 block">Mattress/AC/Linen</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">Payment Mode *</Label>
                        <Select
                          value={guestForm.paymentMode}
                          onValueChange={(v: any) => setGuestForm({ ...guestForm, paymentMode: v })}
                        >
                          <SelectTrigger className="h-10 text-xs border-slate-300"><SelectValue placeholder="Payment Mode" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UPI / QR">UPI / QR Code (PhonePe/GPay)</SelectItem>
                            <SelectItem value="CASH">Cash at Warden Desk</SelectItem>
                            <SelectItem value="CARD (POS)">Card (POS Machine)</SelectItem>
                            <SelectItem value="NET BANKING">Net Banking / NEFT</SelectItem>
                            <SelectItem value="STUDENT ACCOUNT">Student Fee Account Deduction</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">Payment Status *</Label>
                        <Select
                          value={guestForm.paymentStatus}
                          onValueChange={(v: any) => setGuestForm({ ...guestForm, paymentStatus: v })}
                        >
                          <SelectTrigger className="h-10 text-xs border-slate-300"><SelectValue placeholder="Status" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PAID">PAID (Settled Immediately)</SelectItem>
                            <SelectItem value="PENDING">PENDING (Pay at Check-Out)</SelectItem>
                            <SelectItem value="WAIVED">WAIVED (Institutional Guest)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">Transaction Ref / Receipt Note</Label>
                        <Input
                          placeholder="e.g. UPI-98712398 or Cash Slip #42"
                          value={guestForm.transactionRef}
                          onChange={(e) => setGuestForm({ ...guestForm, transactionRef: e.target.value })}
                          className="h-10 text-xs border-slate-300 font-mono"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setGuestBillingStep(3)}
                        className="text-xs h-10 gap-1.5 border-slate-300"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" /> Back: Stay & Meals
                      </Button>
                      <Button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold h-10 px-8 rounded-xl gap-2 shadow-md hover:shadow-lg transition-all"
                      >
                        <Receipt className="h-4 w-4" /> Submit & Generate Official Invoice
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* ── 5. GUEST INVOICES & BILLING LEDGER TABLE ── */}
            <div id="guest-billing-ledger" className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm space-y-0">
              <div className="px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[#162354] flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-blue-600" /> Guest Invoices & Billing Ledger
                  </h4>
                  <p className="text-xs text-slate-400">Complete historical register of all parent and guest accommodation receipts.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative w-48">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      placeholder="Search guest/student..."
                      value={billSearchQuery}
                      onChange={(e) => setBillSearchQuery(e.target.value)}
                      className="pl-8 h-8 text-xs border-slate-300 rounded-lg"
                    />
                  </div>

                  <Select value={billStatusFilter} onValueChange={setBillStatusFilter}>
                    <SelectTrigger className="h-8 text-xs border-slate-300 rounded-lg w-28"><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Status</SelectItem>
                      <SelectItem value="PAID">PAID</SelectItem>
                      <SelectItem value="PENDING">PENDING</SelectItem>
                      <SelectItem value="WAIVED">WAIVED</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={billRelationFilter} onValueChange={setBillRelationFilter}>
                    <SelectTrigger className="h-8 text-xs border-slate-300 rounded-lg w-32"><SelectValue placeholder="Relation" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Relations</SelectItem>
                      <SelectItem value="Father">Father</SelectItem>
                      <SelectItem value="Mother">Mother</SelectItem>
                      <SelectItem value="Guardian">Guardian</SelectItem>
                      <SelectItem value="Official Guest">Official Guest</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const csvRows = [
                        ["Invoice #", "Guest Name", "Contact", "Relation", "Student Name", "Roll No", "Duration", "Room Charges", "Mess Charges", "Total Amount", "Payment Mode", "Status", "Date"],
                        ...filteredBills.map((b) => [
                          b.billNumber,
                          b.guestName,
                          b.contactNumber,
                          b.relation,
                          b.studentName || "-",
                          b.studentRollNo || "-",
                          `${b.days} Days`,
                          b.roomCharges,
                          b.messCharges,
                          b.totalAmount,
                          b.paymentMode,
                          b.status,
                          b.generatedAt,
                        ]),
                      ];
                      const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
                      const link = document.createElement("a");
                      link.setAttribute("href", encodeURI(csvContent));
                      link.setAttribute("download", `hostel_guest_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      toast.success("Guest billing ledger exported as CSV!");
                    }}
                    className="h-8 text-xs px-2.5 gap-1 border-slate-300"
                  >
                    <Download className="h-3.5 w-3.5" /> Export
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#162354] text-white font-semibold text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">INVOICE #</th>
                      <th className="py-3 px-4">GUEST / PARENT</th>
                      <th className="py-3 px-4">STUDENT / WARD</th>
                      <th className="py-3 px-4">STAY & ROOM</th>
                      <th className="py-3 px-4">BILL BREAKDOWN</th>
                      <th className="py-3 px-4">TOTAL</th>
                      <th className="py-3 px-4">PAYMENT</th>
                      <th className="py-3 px-4">STATUS</th>
                      <th className="py-3 px-4 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBills.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400">
                          No guest invoices found matching the current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredBills.map((bill) => (
                        <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                              #{bill.billNumber}
                            </span>
                            <div className="text-[10px] text-slate-400 mt-0.5">{bill.generatedAt}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{bill.guestName}</div>
                            <div className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                              <span>📞 {bill.contactNumber}</span>
                            </div>
                            <span className="inline-block mt-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                              {bill.relation}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {bill.studentName ? (
                              <div>
                                <div className="font-bold text-slate-800">{bill.studentName}</div>
                                <div className="text-[10px] font-mono text-blue-600">{bill.studentRollNo}</div>
                                <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{bill.studentDepartment}</div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">External Guest</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-800">{bill.days} Day(s)</div>
                            <div className="text-[10px] text-slate-400 font-mono">{bill.fromDate} &rarr; {bill.toDate}</div>
                            <span className="text-[10px] font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                              {bill.roomNumber || bill.roomType || "Guest Room"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-[11px] text-slate-700">Room: <strong>₹{bill.roomCharges}</strong></div>
                            <div className="text-[11px] text-slate-700">Mess: <strong>₹{bill.messCharges}</strong></div>
                            {bill.extraCharges > 0 && (
                              <div className="text-[10px] text-slate-500">Extras: ₹{bill.extraCharges}</div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-extrabold text-slate-900 text-sm">
                              ₹{bill.totalAmount.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge variant="outline" className="text-[10px] font-medium border-slate-300">
                              {bill.paymentMode || "UPI"}
                            </Badge>
                            {bill.transactionRef && (
                              <div className="text-[9px] text-slate-400 font-mono truncate max-w-[90px]">{bill.transactionRef}</div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                bill.status === "PAID"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : bill.status === "PENDING"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {bill.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedBillForInvoice(bill)}
                                className="h-7 text-xs gap-1 text-[#162354] border-slate-300 hover:bg-slate-50 rounded-lg"
                              >
                                <Eye className="h-3 w-3" /> View Receipt
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedBillForInvoice(bill);
                                  setTimeout(() => window.print(), 300);
                                }}
                                className="h-7 text-xs gap-1 text-slate-700 border-slate-300 hover:bg-slate-50 rounded-lg"
                              >
                                <Printer className="h-3 w-3" /> Print
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── OFFICIAL STAMPED PRINTABLE INVOICE MODAL ── */}
            <Dialog open={!!selectedBillForInvoice} onOpenChange={(open) => !open && setSelectedBillForInvoice(null)}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-slate-200">
                {selectedBillForInvoice && (
                  <div>
                    {/* Invoice Print Container */}
                    <div id="printable-guest-invoice" className="p-8 bg-white text-slate-900 space-y-6">
                      {/* Letterhead Header */}
                      <div className="flex items-start justify-between border-b-2 border-[#162354] pb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-[#162354] text-white flex items-center justify-center font-black text-xl">
                            CS
                          </div>
                          <div>
                            <h3 className="text-base font-black text-[#162354] uppercase tracking-wide">
                              CampusStay Hostel Management System
                            </h3>
                            <p className="text-xs text-slate-500">Affiliated to JNTU • Campus Guest Accommodation & Transit Center</p>
                            <p className="text-[10px] text-slate-400 font-mono">GSTIN: 36AAAAA0000A1Z5 • State Code: 36 (Telangana)</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider">
                            OFFICIAL TAX INVOICE
                          </span>
                          <div className="text-xs font-mono font-bold text-slate-800 mt-1">
                            #{selectedBillForInvoice.billNumber}
                          </div>
                          <div className="text-[10px] text-slate-400">{selectedBillForInvoice.generatedAt}</div>
                        </div>
                      </div>

                      {/* Student & Guest Info Grids */}
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Guest / Parent Information
                          </span>
                          <div className="font-bold text-slate-900 text-sm">{selectedBillForInvoice.guestName}</div>
                          <div className="text-slate-600">Relation: <strong>{selectedBillForInvoice.relation}</strong></div>
                          <div className="text-slate-600 font-mono">Phone: {selectedBillForInvoice.contactNumber}</div>
                          {selectedBillForInvoice.idProofType && (
                            <div className="text-slate-500 text-[11px]">
                              ID Proof: {selectedBillForInvoice.idProofType} ({selectedBillForInvoice.idProofNumber || "Verified"})
                            </div>
                          )}
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Linked Student / Ward Record
                          </span>
                          <div className="font-bold text-slate-900 text-sm">
                            {selectedBillForInvoice.studentName || "External Visitor"}
                          </div>
                          <div className="text-blue-700 font-mono font-bold">
                            Roll No: {selectedBillForInvoice.studentRollNo || "N/A"}
                          </div>
                          <div className="text-slate-600">{selectedBillForInvoice.studentDepartment || "Hostel Resident"}</div>
                          <div className="text-slate-500 text-[11px]">Room: {selectedBillForInvoice.studentRoom || "Campus Block"}</div>
                        </div>
                      </div>

                      {/* Stay & Room Details */}
                      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-blue-600 font-bold uppercase block">Accommodation Details</span>
                          <span className="font-bold text-slate-900">{selectedBillForInvoice.roomType || "Parent Guest Suite"}</span>
                          <span className="text-slate-600 ml-2">({selectedBillForInvoice.roomNumber || "Suite 101"})</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-blue-600 font-bold uppercase block">Stay Period</span>
                          <span className="font-bold text-slate-900">{selectedBillForInvoice.days} Day(s)</span>
                          <span className="text-slate-500 text-[10px] ml-2">({selectedBillForInvoice.fromDate} &rarr; {selectedBillForInvoice.toDate})</span>
                        </div>
                      </div>

                      {/* Itemized Charges Table */}
                      <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                        <thead className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                          <tr>
                            <th className="py-2.5 px-3">SL</th>
                            <th className="py-2.5 px-3">DESCRIPTION OF CHARGES</th>
                            <th className="py-2.5 px-3 text-center">DURATION / UNITS</th>
                            <th className="py-2.5 px-3 text-right">AMOUNT (INR)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-slate-800">
                          <tr>
                            <td className="py-2.5 px-3 text-slate-400 font-mono">01</td>
                            <td className="py-2.5 px-3 font-medium">
                              Room Accommodation Tariff ({selectedBillForInvoice.roomType || "Guest Suite"})
                            </td>
                            <td className="py-2.5 px-3 text-center font-mono">{selectedBillForInvoice.days} Day(s)</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold">₹{selectedBillForInvoice.roomCharges.toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 text-slate-400 font-mono">02</td>
                            <td className="py-2.5 px-3 font-medium">Mess & Dining Charges (Breakfast, Lunch & Dinner)</td>
                            <td className="py-2.5 px-3 text-center font-mono">{selectedBillForInvoice.days} Day(s)</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold">₹{selectedBillForInvoice.messCharges.toLocaleString()}</td>
                          </tr>
                          {selectedBillForInvoice.extraCharges > 0 && (
                            <tr>
                              <td className="py-2.5 px-3 text-slate-400 font-mono">03</td>
                              <td className="py-2.5 px-3 font-medium">Extra Amenities (Mattress, Power Backup, Laundry)</td>
                              <td className="py-2.5 px-3 text-center font-mono">Combined</td>
                              <td className="py-2.5 px-3 text-right font-mono font-bold">₹{selectedBillForInvoice.extraCharges.toLocaleString()}</td>
                            </tr>
                          )}
                          <tr className="bg-slate-50 font-bold">
                            <td colSpan={3} className="py-3 px-3 text-right text-slate-900 uppercase text-xs">
                              TOTAL AMOUNT PAID:
                            </td>
                            <td className="py-3 px-3 text-right text-base text-[#162354] font-black font-mono">
                              ₹{selectedBillForInvoice.totalAmount.toLocaleString()}
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Payment & Verification Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Payment Method:</span>
                            <Badge className="bg-slate-100 text-slate-800 text-[10px] font-bold">
                              {selectedBillForInvoice.paymentMode}
                            </Badge>
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">
                              ✓ {selectedBillForInvoice.status}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Ref: {selectedBillForInvoice.transactionRef || "REC-26082026"} • Purpose: {selectedBillForInvoice.purpose}
                          </div>
                        </div>

                        {/* Digital Warden Signature & Stamp */}
                        <div className="text-center space-y-1">
                          <div className="w-28 h-8 mx-auto border-b border-dashed border-slate-400 flex items-end justify-center">
                            <span className="text-[10px] font-cursive italic font-bold text-blue-900">Dr. V. Rao</span>
                          </div>
                          <span className="text-[9px] text-slate-400 block font-semibold uppercase">Chief Hostel Warden (Signed)</span>
                        </div>
                      </div>
                    </div>

                    {/* Modal Action Buttons */}
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSelectedBillForInvoice(null)}
                        className="text-xs h-9"
                      >
                        Close
                      </Button>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          onClick={() => window.print()}
                          className="bg-[#162354] hover:bg-[#1f3073] text-white text-xs font-semibold h-9 px-5 rounded-xl gap-1.5"
                        >
                          <Printer className="h-4 w-4" /> Print Tax Invoice
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        );
      })()}

      {/* ── 10. STUDENT LEAVE MANAGEMENT (STREAMLINED & DYNAMIC) ── */}
      {activeTab === "leaves" && (() => {
        const activeLeavesCount = leaveRequests.filter((l) => l.status === "APPROVED").length;
        const pendingLeavesCount = leaveRequests.filter((l) => l.status === "PENDING").length;
        const verifiedParentLeavesCount = leaveRequests.filter((l) => l.parentApproval === "VERIFIED" || l.parentApproval === "CALL CONFIRMED").length;

        const filteredLeaves = leaveRequests.filter((l) => {
          const matchSearch =
            !leaveSearchQuery.trim() ||
            l.studentName.toLowerCase().includes(leaveSearchQuery.toLowerCase()) ||
            l.rollNumber.toLowerCase().includes(leaveSearchQuery.toLowerCase()) ||
            l.department.toLowerCase().includes(leaveSearchQuery.toLowerCase()) ||
            l.reason.toLowerCase().includes(leaveSearchQuery.toLowerCase());
          const matchStatus = leaveFilterStatus === "ALL" || l.status === leaveFilterStatus;
          const matchType = leaveFilterType === "ALL" || l.leaveType === leaveFilterType;
          const matchParent = leaveFilterParent === "ALL" || l.parentApproval === leaveFilterParent;
          return matchSearch && matchStatus && matchType && matchParent;
        });

        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#162354] flex items-center gap-2.5">
                  <Bookmark className="h-6 w-6 text-blue-600" /> Student Leave Management
                </h1>
                <p className="text-sm text-slate-500 font-medium mt-0.5">
                  Manage student leave applications, parent verification calls, departure schedules, and automated gatepass approvals.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setCreateLeaveModalOpen(true)}
                  className="bg-[#162354] hover:bg-[#1f3073] text-white text-xs font-semibold px-4 h-9 rounded-xl gap-1.5 shadow-sm"
                >
                  <Plus className="h-4 w-4" /> Apply Student Leave
                </Button>
              </div>
            </div>

            {/* Metric Cards for Leaves */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Active Leaves Today</span>
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-black text-slate-900">{activeLeavesCount} Approved</div>
                <div className="mt-1 text-[11px] text-emerald-600 font-medium">Gate departure passes active</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Pending Warden Action</span>
                  <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Clock className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-black text-slate-900">{pendingLeavesCount} Pending</div>
                <div className="mt-1 text-[11px] text-amber-600 font-medium">Awaiting parent verification call</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Parent Verified</span>
                  <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Phone className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-black text-slate-900">{verifiedParentLeavesCount} Verified</div>
                <div className="mt-1 text-[11px] text-blue-600 font-medium">Via OTP or phone call</div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Total Semester Leaves</span>
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Bookmark className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-2 text-2xl font-black text-slate-900">{leaveRequests.length} Applications</div>
                <div className="mt-1 text-[11px] text-slate-500 font-medium">Logged in academic record</div>
              </div>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by student name, roll no, department, reason..."
                  value={leaveSearchQuery}
                  onChange={(e) => setLeaveSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs border-slate-300 rounded-xl"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select value={leaveFilterType} onValueChange={setLeaveFilterType}>
                  <SelectTrigger className="h-9 text-xs w-36 rounded-xl border-slate-300"><SelectValue placeholder="Leave Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Leave Types</SelectItem>
                    <SelectItem value="Home Visit">Home Visit</SelectItem>
                    <SelectItem value="Medical Leave">Medical Leave</SelectItem>
                    <SelectItem value="Academic / Internship">Academic / Internship</SelectItem>
                    <SelectItem value="Emergency Leave">Emergency Leave</SelectItem>
                    <SelectItem value="Vacation">Vacation</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={leaveFilterStatus} onValueChange={setLeaveFilterStatus}>
                  <SelectTrigger className="h-9 text-xs w-32 rounded-xl border-slate-300"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="APPROVED">APPROVED</SelectItem>
                    <SelectItem value="PENDING">PENDING</SelectItem>
                    <SelectItem value="REJECTED">REJECTED</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={leaveFilterParent} onValueChange={setLeaveFilterParent}>
                  <SelectTrigger className="h-9 text-xs w-36 rounded-xl border-slate-300"><SelectValue placeholder="Parent Consent" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Consent</SelectItem>
                    <SelectItem value="VERIFIED">VERIFIED</SelectItem>
                    <SelectItem value="CALL CONFIRMED">CALL CONFIRMED</SelectItem>
                    <SelectItem value="PENDING">PENDING</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setLeaveSearchQuery("");
                    setLeaveFilterType("ALL");
                    setLeaveFilterStatus("ALL");
                    setLeaveFilterParent("ALL");
                  }}
                  className="h-9 text-xs rounded-xl"
                >
                  Reset
                </Button>
              </div>
            </div>

            {/* Leaves Table */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#162354] text-white font-semibold text-[10px] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">STUDENT / RESIDENT</th>
                      <th className="py-3 px-4">LEAVE CATEGORY</th>
                      <th className="py-3 px-4">DEPARTURE</th>
                      <th className="py-3 px-4">EXPECTED RETURN</th>
                      <th className="py-3 px-4">PARENT APPROVAL</th>
                      <th className="py-3 px-4">WARDEN STATUS</th>
                      <th className="py-3 px-4">GATE PERMISSION</th>
                      <th className="py-3 px-4 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLeaves.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400">
                          No leave records found matching your search and filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredLeaves.map((leave) => (
                        <tr key={leave.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-900 font-bold text-xs flex items-center justify-center">
                                {leave.studentName.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{leave.studentName}</div>
                                <div className="text-[10px] font-mono text-blue-600">{leave.rollNumber}</div>
                                <div className="text-[10px] text-slate-400">{leave.department} • Room {leave.roomNumber}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge
                              className={`text-[10px] font-semibold ${
                                leave.leaveType === "Home Visit"
                                  ? "bg-blue-50 text-blue-800 border-blue-200"
                                  : leave.leaveType === "Medical Leave"
                                  ? "bg-rose-50 text-rose-800 border-rose-200"
                                  : leave.leaveType === "Academic / Internship"
                                  ? "bg-purple-50 text-purple-800 border-purple-200"
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                              }`}
                            >
                              {leave.leaveType}
                            </Badge>
                            <div className="text-[10px] text-slate-500 truncate max-w-[150px] mt-0.5" title={leave.reason}>
                              {leave.reason}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-800">{leave.startDate}</div>
                            <div className="text-[10px] text-slate-400">Via {leave.travelMode || "Transport"}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-800">{leave.endDate}</div>
                            <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded font-bold">
                              {leave.totalDays} Day(s)
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 ${
                                leave.parentApproval === "VERIFIED" || leave.parentApproval === "CALL CONFIRMED"
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : "bg-amber-50 text-amber-800 border border-amber-200"
                              }`}
                            >
                              <Phone className="h-3 w-3" /> {leave.parentApproval}
                            </span>
                            <div className="text-[9px] text-slate-400 font-mono mt-0.5">📞 {leave.parentContact}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                leave.status === "APPROVED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : leave.status === "PENDING"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-rose-100 text-rose-800"
                              }`}
                            >
                              {leave.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge
                              className={`text-[9px] font-mono font-bold ${
                                leave.gateAccessStatus === "PASS ACTIVE"
                                  ? "bg-emerald-600 text-white"
                                  : leave.gateAccessStatus === "AWAITING APPROVAL"
                                  ? "bg-amber-500 text-white"
                                  : "bg-slate-300 text-slate-700"
                              }`}
                            >
                              {leave.gateAccessStatus}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {leave.status === "PENDING" && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setLeaveRequests((prev) =>
                                        prev.map((item) =>
                                          item.id === leave.id
                                            ? {
                                                ...item,
                                                status: "APPROVED",
                                                parentApproval: "VERIFIED",
                                                gateAccessStatus: "PASS ACTIVE",
                                                wardenRemarks: "Approved by Warden after telephone verification.",
                                              }
                                            : item
                                        )
                                      );
                                      toast.success(`Approved leave application for ${leave.studentName}! Gatepass activated.`);
                                    }}
                                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 rounded-lg"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setLeaveRequests((prev) =>
                                        prev.map((item) =>
                                          item.id === leave.id
                                            ? { ...item, status: "REJECTED", gateAccessStatus: "BARRED" }
                                            : item
                                        )
                                      );
                                      toast.error(`Leave application for ${leave.studentName} rejected.`);
                                    }}
                                    className="h-7 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 px-2 rounded-lg"
                                  >
                                    Reject
                                  </Button>
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setLeaveGatePassModal(leave)}
                                className="h-7 text-xs gap-1 text-[#162354] border-slate-300 hover:bg-slate-50 rounded-lg"
                              >
                                <Printer className="h-3 w-3" /> Gatepass
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedLeaveDossier(leave)}
                                className="h-7 text-xs text-slate-500 hover:text-slate-900"
                              >
                                <Eye className="h-3 w-3" /> Details
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── CREATE LEAVE APPLICATION MODAL ── */}
            <Dialog open={createLeaveModalOpen} onOpenChange={setCreateLeaveModalOpen}>
              <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-7 space-y-5">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-blue-600" /> Apply Student Hostel Leave
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    Record planned student departure, verify parent consent, and schedule automatic gatepass authorization.
                  </DialogDescription>
                </DialogHeader>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fromTime = new Date(newLeaveForm.startDate).getTime();
                    const toTime = new Date(newLeaveForm.endDate).getTime();
                    const days = Math.max(1, Math.ceil((toTime - fromTime) / (1000 * 60 * 60 * 24)) + 1);

                    const newLeaveItem: HostelLeaveItem = {
                      id: `LV-${Date.now().toString().slice(-4)}`,
                      studentId: newLeaveForm.studentId,
                      studentName: newLeaveForm.studentName,
                      rollNumber: newLeaveForm.rollNumber,
                      department: newLeaveForm.department,
                      yearText: newLeaveForm.yearText,
                      blockName: newLeaveForm.blockName,
                      roomNumber: newLeaveForm.roomNumber,
                      parentContact: newLeaveForm.parentContact,
                      leaveType: newLeaveForm.leaveType,
                      startDate: newLeaveForm.startDate,
                      endDate: newLeaveForm.endDate,
                      totalDays: days,
                      reason: newLeaveForm.reason,
                      destinationAddress: newLeaveForm.destinationAddress,
                      travelMode: newLeaveForm.travelMode,
                      parentApproval: newLeaveForm.parentApproval,
                      status: newLeaveForm.status,
                      gateAccessStatus: newLeaveForm.status === "APPROVED" ? "PASS ACTIVE" : "AWAITING APPROVAL",
                      createdBy: "Warden",
                      createdAt: "26 Aug 2026, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                      wardenRemarks: newLeaveForm.wardenRemarks,
                    };

                    setLeaveRequests((prev) => [newLeaveItem, ...prev]);
                    setCreateLeaveModalOpen(false);
                    toast.success(`🎉 Leave recorded for ${newLeaveItem.studentName}! Gate departure pass scheduled.`);
                  }}
                  className="space-y-4"
                >
                  {/* Select Student */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Choose Student From Hostel Database *</Label>
                    <Select
                      value={newLeaveForm.studentId}
                      onValueChange={(id) => {
                        const found = users.find((u) => u.id === id);
                        if (found) {
                          setNewLeaveForm((prev) => ({
                            ...prev,
                            studentId: found.id,
                            studentName: found.name,
                            rollNumber: found.rollNumber,
                            department: found.department || "Engineering",
                            yearText: found.yearText || "3rd Year",
                            blockName: found.blockName || "Hostel Block",
                            roomNumber: found.roomNumber || "101",
                            parentContact: found.parentContact || "9440123456",
                          }));
                        }
                      }}
                    >
                      <SelectTrigger className="h-10 text-xs border-slate-300 bg-white">
                        <SelectValue placeholder="Select Student" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.id} className="text-xs">
                            <span className="font-bold text-slate-900">{u.name}</span>{" "}
                            <span className="text-blue-600 font-mono">({u.rollNumber})</span> • Room {u.roomNumber || "N/A"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Student Details Card */}
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{newLeaveForm.studentName} ({newLeaveForm.rollNumber})</div>
                      <div className="text-slate-600">{newLeaveForm.department} • Room {newLeaveForm.roomNumber}</div>
                    </div>
                    <div className="text-right font-mono text-slate-700 font-medium">
                      📞 {newLeaveForm.parentContact}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Leave Category *</Label>
                      <Select
                        value={newLeaveForm.leaveType}
                        onValueChange={(v: any) => setNewLeaveForm({ ...newLeaveForm, leaveType: v })}
                      >
                        <SelectTrigger className="h-10 text-xs border-slate-300"><SelectValue placeholder="Select Leave Type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Home Visit">Home Visit</SelectItem>
                          <SelectItem value="Medical Leave">Medical Leave</SelectItem>
                          <SelectItem value="Academic / Internship">Academic / Internship</SelectItem>
                          <SelectItem value="Emergency Leave">Emergency Leave</SelectItem>
                          <SelectItem value="Vacation">Vacation / Festival Leave</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Travel Mode</Label>
                      <Input
                        placeholder="e.g. Bus / Train / Parent Pickup"
                        value={newLeaveForm.travelMode}
                        onChange={(e) => setNewLeaveForm({ ...newLeaveForm, travelMode: e.target.value })}
                        className="h-10 text-xs border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Start Date (Departure) *</Label>
                      <Input
                        type="date"
                        required
                        value={newLeaveForm.startDate}
                        onChange={(e) => setNewLeaveForm({ ...newLeaveForm, startDate: e.target.value })}
                        className="h-10 text-xs border-slate-300"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">End Date (Expected Return) *</Label>
                      <Input
                        type="date"
                        required
                        value={newLeaveForm.endDate}
                        onChange={(e) => setNewLeaveForm({ ...newLeaveForm, endDate: e.target.value })}
                        className="h-10 text-xs border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Reason for Leave *</Label>
                    <Input
                      required
                      placeholder="e.g. Attending sister's wedding at hometown / Medical review"
                      value={newLeaveForm.reason}
                      onChange={(e) => setNewLeaveForm({ ...newLeaveForm, reason: e.target.value })}
                      className="h-10 text-xs border-slate-300"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Destination Address</Label>
                    <Input
                      placeholder="e.g. D.No 4-12, Main Road, Vijayawada, AP"
                      value={newLeaveForm.destinationAddress}
                      onChange={(e) => setNewLeaveForm({ ...newLeaveForm, destinationAddress: e.target.value })}
                      className="h-10 text-xs border-slate-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Parent Consent Verification *</Label>
                      <Select
                        value={newLeaveForm.parentApproval}
                        onValueChange={(v: any) => setNewLeaveForm({ ...newLeaveForm, parentApproval: v })}
                      >
                        <SelectTrigger className="h-10 text-xs border-slate-300"><SelectValue placeholder="Parent Consent" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="VERIFIED">VERIFIED (Consent Letter / OTP)</SelectItem>
                          <SelectItem value="CALL CONFIRMED">CALL CONFIRMED (Phone Call)</SelectItem>
                          <SelectItem value="PENDING">PENDING (Awaiting Confirmation)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-slate-700">Warden Approval Status *</Label>
                      <Select
                        value={newLeaveForm.status}
                        onValueChange={(v: any) => setNewLeaveForm({ ...newLeaveForm, status: v })}
                      >
                        <SelectTrigger className="h-10 text-xs border-slate-300"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="APPROVED">APPROVED (Issue Biometric Gatepass)</SelectItem>
                          <SelectItem value="PENDING">PENDING (Keep on Hold)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Warden Remarks</Label>
                    <Input
                      placeholder="e.g. Parent call confirmed. Safe travel advised."
                      value={newLeaveForm.wardenRemarks}
                      onChange={(e) => setNewLeaveForm({ ...newLeaveForm, wardenRemarks: e.target.value })}
                      className="h-10 text-xs border-slate-300"
                    />
                  </div>

                  <DialogFooter className="pt-2">
                    <Button type="button" variant="outline" onClick={() => setCreateLeaveModalOpen(false)} className="h-9 text-xs">
                      Cancel
                    </Button>
                    <Button type="submit" className="h-9 text-xs bg-[#162354] hover:bg-[#1f3073] text-white font-semibold">
                      Submit & Schedule Leave
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* ── PRINTABLE LEAVE GATEPASS MODAL ── */}
            <Dialog open={!!leaveGatePassModal} onOpenChange={(open) => !open && setLeaveGatePassModal(null)}>
              <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl border-slate-200">
                {leaveGatePassModal && (
                  <div>
                    <div id="printable-leave-gatepass" className="p-8 bg-white text-slate-900 space-y-5">
                      {/* Pass Header */}
                      <div className="flex items-start justify-between border-b-2 border-[#162354] pb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-[#162354] text-white flex items-center justify-center font-black text-xl">
                            CS
                          </div>
                          <div>
                            <h3 className="text-base font-black text-[#162354] uppercase tracking-wide">
                              CampusStay Hostel Systems
                            </h3>
                            <p className="text-xs text-slate-500">Official Student Leave Gatepass & Departure Clearance</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-2.5 py-1 rounded-md">
                            AUTHORIZED GATEPASS
                          </span>
                          <div className="text-xs font-mono font-bold text-slate-800 mt-1">
                            #{leaveGatePassModal.id}
                          </div>
                        </div>
                      </div>

                      {/* Student Info Box */}
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Student Name</span>
                          <strong className="text-slate-900 text-sm">{leaveGatePassModal.studentName}</strong>
                          <div className="text-blue-700 font-mono font-bold">{leaveGatePassModal.rollNumber}</div>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Hostel Room</span>
                          <div className="font-bold text-slate-800">{leaveGatePassModal.blockName} • Room {leaveGatePassModal.roomNumber}</div>
                          <div className="text-slate-500">{leaveGatePassModal.department}</div>
                        </div>
                      </div>

                      {/* Leave Schedule */}
                      <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-100 grid grid-cols-3 gap-2 text-xs text-center">
                        <div>
                          <span className="text-[10px] text-blue-600 font-bold uppercase block">Departure Date</span>
                          <strong className="text-slate-900">{leaveGatePassModal.startDate}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-blue-600 font-bold uppercase block">Expected Return</span>
                          <strong className="text-slate-900">{leaveGatePassModal.endDate}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-blue-600 font-bold uppercase block">Total Leave</span>
                          <strong className="text-indigo-700">{leaveGatePassModal.totalDays} Day(s)</strong>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="text-slate-700"><strong>Leave Reason:</strong> {leaveGatePassModal.reason}</div>
                        <div className="text-slate-700"><strong>Destination Address:</strong> {leaveGatePassModal.destinationAddress || "Hometown"}</div>
                        <div className="text-slate-700"><strong>Travel Mode:</strong> {leaveGatePassModal.travelMode || "Public Transit"}</div>
                        <div className="text-slate-700"><strong>Parent Contact & Consent:</strong> 📞 {leaveGatePassModal.parentContact} ({leaveGatePassModal.parentApproval})</div>
                      </div>

                      {/* Signatures Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
                        <div className="text-center">
                          <div className="w-24 h-8 border-b border-dashed border-slate-400 flex items-end justify-center">
                            <span className="text-[10px] font-mono text-slate-600">Verified</span>
                          </div>
                          <span className="text-[9px] text-slate-400 uppercase font-semibold block mt-0.5">Parent Consent</span>
                        </div>
                        <div className="text-center">
                          <div className="w-24 h-8 border-b border-dashed border-slate-400 flex items-end justify-center">
                            <span className="text-[10px] font-mono text-slate-600">Checked Out</span>
                          </div>
                          <span className="text-[9px] text-slate-400 uppercase font-semibold block mt-0.5">Main Gate Security</span>
                        </div>
                        <div className="text-center">
                          <div className="w-28 h-8 border-b border-dashed border-slate-400 flex items-end justify-center">
                            <span className="text-[10px] font-cursive italic font-bold text-blue-900">Dr. V. Rao</span>
                          </div>
                          <span className="text-[9px] text-slate-400 uppercase font-semibold block mt-0.5">Hostel Warden (Approved)</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                      <Button type="button" variant="outline" onClick={() => setLeaveGatePassModal(null)} className="text-xs h-9">
                        Close
                      </Button>
                      <Button
                        type="button"
                        onClick={() => window.print()}
                        className="bg-[#162354] hover:bg-[#1f3073] text-white text-xs font-semibold h-9 px-5 rounded-xl gap-1.5"
                      >
                        <Printer className="h-4 w-4" /> Print Departure Gatepass
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* ── LEAVE DOSSIER MODAL ── */}
            <Dialog open={!!selectedLeaveDossier} onOpenChange={(open) => !open && setSelectedLeaveDossier(null)}>
              <DialogContent className="max-w-md rounded-3xl p-6 space-y-4">
                {selectedLeaveDossier && (
                  <div>
                    <DialogHeader>
                      <DialogTitle className="text-lg font-bold text-[#162354] flex items-center gap-2">
                        <Bookmark className="w-5 h-5 text-blue-600" /> Student Leave Record Dossier
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 pt-2 text-xs">
                      <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                        <div className="font-bold text-slate-900 text-sm">{selectedLeaveDossier.studentName}</div>
                        <div className="text-blue-700 font-mono font-bold">Roll No: {selectedLeaveDossier.rollNumber}</div>
                        <div className="text-slate-600">{selectedLeaveDossier.department} • Room {selectedLeaveDossier.roomNumber}</div>
                      </div>

                      <div className="space-y-1">
                        <span className="font-bold text-slate-800">Leave Category:</span>
                        <div className="text-blue-700 font-semibold">{selectedLeaveDossier.leaveType}</div>
                      </div>

                      <div className="space-y-1">
                        <span className="font-bold text-slate-800">Reason for Leave:</span>
                        <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          {selectedLeaveDossier.reason}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-slate-50 p-2 rounded-lg border">
                          <span className="text-slate-400 block text-[10px]">Leave Duration</span>
                          <strong>{selectedLeaveDossier.startDate} &rarr; {selectedLeaveDossier.endDate} ({selectedLeaveDossier.totalDays} Days)</strong>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border">
                          <span className="text-slate-400 block text-[10px]">Parent Verification</span>
                          <strong className="text-emerald-700">{selectedLeaveDossier.parentApproval}</strong>
                        </div>
                      </div>

                      {selectedLeaveDossier.wardenRemarks && (
                        <div className="text-slate-500 text-[11px] bg-slate-50 p-2 rounded-lg border">
                          Warden Notes: <em>{selectedLeaveDossier.wardenRemarks}</em>
                        </div>
                      )}
                    </div>

                    <DialogFooter className="pt-2">
                      <Button type="button" variant="outline" onClick={() => setSelectedLeaveDossier(null)} className="h-8 text-xs">
                        Close
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setLeaveGatePassModal(selectedLeaveDossier);
                          setSelectedLeaveDossier(null);
                        }}
                        className="h-8 text-xs bg-[#162354] hover:bg-[#1f3073] text-white gap-1"
                      >
                        <Printer className="h-3.5 w-3.5" /> View Gatepass
                      </Button>
                    </DialogFooter>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        );
      })()}

      {/* ── 11. DEVICE MANAGEMENT ── */}
      {activeTab === "devices" && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold tracking-tight text-[#162354]">Device Management</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">Main Gate Turnstile A1</span>
                <Badge className="bg-emerald-500 text-white text-xs">Online</Badge>
              </div>
              <p className="text-xs text-slate-500">IP: 192.168.1.101 • Biometric Optical Turnstile</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">Girls Block B Turnstile B1</span>
                <Badge className="bg-emerald-500 text-white text-xs">Online</Badge>
              </div>
              <p className="text-xs text-slate-500">IP: 192.168.1.102 • Biometric Optical Turnstile</p>
            </div>
            <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-sm">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">Mess Gate Reader C1</span>
                <Badge className="bg-emerald-500 text-white text-xs">Online</Badge>
              </div>
              <p className="text-xs text-slate-500">IP: 192.168.1.105 • QR & RFID Turnstile Gate</p>
            </div>
          </div>
        </div>
      )}

      {/* ── 12. NOTIFICATIONS ── */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold tracking-tight text-[#162354]">Notifications</h1>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2 shadow-sm">
            <strong className="text-sm text-slate-800">Water Tank Maintenance Notice</strong>
            <p className="text-xs text-slate-600">UV cleaning and water sterilization scheduled for Sunday 8:00 AM.</p>
          </div>
        </div>
      )}

      {/* ── ADD BLOCK MODAL ── */}
      <Dialog open={addBlockModalOpen} onOpenChange={setAddBlockModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#162354] flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Add New Hostel Block
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddBlock} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label className="text-xs">Block Name</Label>
              <Input
                required
                placeholder="e.g. Boys-Block-E"
                value={newBlockForm.name}
                onChange={(e) => setNewBlockForm({ ...newBlockForm, name: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Hostel Type</Label>
                <Select value={newBlockForm.type} onValueChange={(v: any) => setNewBlockForm({ ...newBlockForm, type: v })}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Boys Hostel">Boys Hostel</SelectItem>
                    <SelectItem value="Girls Hostel">Girls Hostel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Capacity</Label>
                <Input
                  type="number"
                  required
                  value={newBlockForm.totalCapacity}
                  onChange={(e) => setNewBlockForm({ ...newBlockForm, totalCapacity: Number(e.target.value) })}
                  className="h-9 text-xs"
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setAddBlockModalOpen(false)} className="h-9 text-xs">Cancel</Button>
              <Button type="submit" className="h-9 text-xs bg-[#162354] hover:bg-[#1f3073] text-white font-semibold">Create Block</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── ADD NEW STUDENT USER MODAL ── */}
      <Dialog open={addUserModalOpen} onOpenChange={setAddUserModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#162354] flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-blue-600" /> Add New Hostel Student
            </DialogTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Register a student in the hostel system and generate login credentials for their student portal account.
            </p>
          </DialogHeader>

          <form onSubmit={handleAddStudent} className="space-y-4 mt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Student Full Name *</Label>
                <Input
                  required
                  placeholder="e.g. M. Rajesh Kumar"
                  value={newStudentForm.name}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, name: e.target.value })}
                  className="h-9 text-xs border-slate-300"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">JNTU / College Roll No *</Label>
                <Input
                  required
                  placeholder="e.g. 24331A05W2"
                  value={newStudentForm.rollNumber}
                  onChange={(e) => {
                    const roll = e.target.value.toUpperCase();
                    setNewStudentForm({
                      ...newStudentForm,
                      rollNumber: roll,
                      email: newStudentForm.email ? newStudentForm.email : `${roll.toLowerCase()}@cms.com`,
                      password: newStudentForm.password === "Student@2026" ? `${roll}@2026` : newStudentForm.password,
                    });
                  }}
                  className="h-9 text-xs font-mono border-slate-300 uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Branch / Department *</Label>
                <Select
                  value={newStudentForm.department}
                  onValueChange={(v) => setNewStudentForm({ ...newStudentForm, department: v })}
                >
                  <SelectTrigger className="h-9 text-xs border-slate-300"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Computer Science (CSE)">Computer Science (CSE)</SelectItem>
                    <SelectItem value="Electronics & Comm (ECE)">Electronics & Comm (ECE)</SelectItem>
                    <SelectItem value="Information Technology (IT)">Information Technology (IT)</SelectItem>
                    <SelectItem value="Mechanical Engg (ME)">Mechanical Engg (ME)</SelectItem>
                    <SelectItem value="Civil Engg (CE)">Civil Engg (CE)</SelectItem>
                    <SelectItem value="AI & Machine Learning (AIML)">AI & Machine Learning (AIML)</SelectItem>
                    <SelectItem value="AI & Data Science (AIDS)">AI & Data Science (AIDS)</SelectItem>
                    <SelectItem value="Electrical & Electronics (EEE)">Electrical & Electronics (EEE)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Academic Year *</Label>
                <Select
                  value={String(newStudentForm.year)}
                  onValueChange={(v) => setNewStudentForm({ ...newStudentForm, year: Number(v) })}
                >
                  <SelectTrigger className="h-9 text-xs border-slate-300"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1st Year</SelectItem>
                    <SelectItem value="2">2nd Year</SelectItem>
                    <SelectItem value="3">3rd Year</SelectItem>
                    <SelectItem value="4">4th Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Semester *</Label>
                <Select
                  value={String(newStudentForm.semester)}
                  onValueChange={(v) => setNewStudentForm({ ...newStudentForm, semester: Number(v) })}
                >
                  <SelectTrigger className="h-9 text-xs border-slate-300"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 8 }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1)}>
                        Semester {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Student Email</Label>
                <Input
                  type="email"
                  placeholder="student@cms.com"
                  value={newStudentForm.email}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                  className="h-9 text-xs border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Student Mobile *</Label>
                <Input
                  required
                  placeholder="9876543210"
                  value={newStudentForm.contact}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, contact: e.target.value })}
                  className="h-9 text-xs border-slate-300"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-700">Parent Contact</Label>
                <Input
                  placeholder="9440123456"
                  value={newStudentForm.parentContact}
                  onChange={(e) => setNewStudentForm({ ...newStudentForm, parentContact: e.target.value })}
                  className="h-9 text-xs border-slate-300"
                />
              </div>
            </div>

            {/* Room Allocation Info */}
            <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 space-y-3">
              <span className="text-xs font-bold text-[#162354] block flex items-center gap-1.5">
                <DoorClosed className="h-3.5 w-3.5 text-blue-600" /> Hostel Room Assignment (Optional)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-600 font-medium">Block</Label>
                  <Select
                    value={newStudentForm.blockName}
                    onValueChange={(v) => setNewStudentForm({ ...newStudentForm, blockName: v })}
                  >
                    <SelectTrigger className="h-8 text-xs bg-white border-slate-300"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Boys Block A">Boys Block A</SelectItem>
                      <SelectItem value="Girls Block B">Girls Block B</SelectItem>
                      <SelectItem value="Boys Hostel (Block B)">Boys Hostel (Block B)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-600 font-medium">Room Number</Label>
                  <Input
                    placeholder="e.g. 103"
                    value={newStudentForm.roomNumber}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, roomNumber: e.target.value })}
                    className="h-8 text-xs bg-white border-slate-300"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-slate-600 font-medium">Bed Number</Label>
                  <Select
                    value={newStudentForm.bedNumber}
                    onValueChange={(v) => setNewStudentForm({ ...newStudentForm, bedNumber: v })}
                  >
                    <SelectTrigger className="h-8 text-xs bg-white border-slate-300"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bed-1">Bed 1</SelectItem>
                      <SelectItem value="Bed-2">Bed 2</SelectItem>
                      <SelectItem value="Bed-3">Bed 3</SelectItem>
                      <SelectItem value="Bed-4">Bed 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Login Credentials Preview */}
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5 text-emerald-700" /> Student Login Credentials
                </span>
                <span className="text-[10px] font-semibold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  Student Portal Access
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-emerald-700 block font-semibold">LOGIN USERNAME (JNTU ROLL NO)</span>
                  <span className="font-mono font-bold text-emerald-950 text-xs bg-white px-2 py-1 rounded border border-emerald-200 block mt-0.5">
                    {newStudentForm.rollNumber || "Enter JNTU Roll No above"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-700 block font-semibold">STUDENT PASSWORD</span>
                  <Input
                    placeholder="e.g. Student@2026"
                    value={newStudentForm.password}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, password: e.target.value })}
                    className="h-7 text-xs bg-white border-emerald-300 font-mono mt-0.5"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setAddUserModalOpen(false)} className="h-9 text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-9 text-xs bg-[#162354] hover:bg-[#1f3073] text-white font-semibold shadow-sm px-5"
              >
                Register Student & Issue Credentials
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── GENERATED STUDENT CREDENTIALS CONFIRMATION MODAL ── */}
      {createdCredentialsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Student Account Created!</h3>
                  <p className="text-xs text-slate-500">Login credentials generated successfully.</p>
                </div>
              </div>
              <button
                onClick={() => setCreatedCredentialsModal(null)}
                className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Student Name:</span>
                  <span className="font-bold text-slate-900">{createdCredentialsModal.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Department / Branch:</span>
                  <span className="font-semibold text-slate-800">{createdCredentialsModal.department}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Room Allocation:</span>
                  <span className="font-semibold text-blue-700">{createdCredentialsModal.room}</span>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2.5">
                <span className="font-bold text-emerald-900 block text-xs flex items-center gap-1.5">
                  <Key className="h-4 w-4 text-emerald-600" /> Vignan Student Login Credentials
                </span>

                <div className="bg-white p-2.5 rounded-lg border border-emerald-200 space-y-1.5 font-mono">
                  <div className="flex justify-between items-center bg-emerald-900 px-2.5 py-2 rounded-lg">
                    <span className="text-emerald-300 text-[11px] font-sans">📧 Email (Primary Login):</span>
                    <span className="font-black text-white">
                      {`${(createdCredentialsModal.name || '').split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '')}@vignan_student.edu.in`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[11px]">🔒 Password:</span>
                    <span className="font-bold text-emerald-900">{createdCredentialsModal.password || 'password123'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[11px]">🎫 Alt. Login (Roll No / ID):</span>
                    <span className="font-semibold text-slate-600">{createdCredentialsModal.username}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[11px]">👤 First Name Login:</span>
                    <span className="font-semibold text-slate-700">{(createdCredentialsModal.name || '').split(' ')[0]}</span>
                  </div>
                </div>

                <p className="text-[11px] text-emerald-800">
                  The student can now log in to the student portal with their <strong>{`${(createdCredentialsModal.name || '').split(' ')[0].toLowerCase()}@vignan_student.edu.in`}</strong> or First Name and password <strong>password123</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const firstName = (createdCredentialsModal.name || '').split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
                  navigator.clipboard.writeText(
                    `Vignan Student Login Credentials:\n------------------------------------\nStudent Name: ${createdCredentialsModal.name}\nEmail / Login ID: ${firstName}@vignan_student.edu.in\nFirst Name: ${(createdCredentialsModal.name || '').split(' ')[0]}\nRoll No: ${createdCredentialsModal.username}\nPassword: ${createdCredentialsModal.password || 'password123'}\nStudent Portal: http://localhost:8082/student/dashboard`
                  );
                  toast.success("Credentials copied to clipboard!");
                }}
                className="text-xs h-8 gap-1 border-slate-300"
              >
                <ClipboardList className="h-3.5 w-3.5" /> Copy Credentials
              </Button>
              <Button
                size="sm"
                onClick={() => setCreatedCredentialsModal(null)}
                className="text-xs h-8 bg-[#162354] hover:bg-[#1f3073] text-white font-semibold"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── VIEW CREDENTIALS MODAL ── */}
      {viewCredentialsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
                  <Key className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Vignan Student Credentials</h3>
                  <p className="text-xs text-slate-500 font-medium">Official student portal login credentials</p>
                </div>
              </div>
              <button
                onClick={() => setViewCredentialsModal(null)}
                className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Student Master Dossier */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <span className="text-slate-500 font-semibold">Student Name:</span>
                  <span className="font-extrabold text-slate-900 text-sm">{viewCredentialsModal.name}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">College ID</span>
                    <span className="font-bold text-blue-700 font-mono">
                      {`STU2026${(viewCredentialsModal.department || "CSE").slice(0, 3).toUpperCase()}${viewCredentialsModal.rollNumber.slice(-3)}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">JNTU Roll No</span>
                    <span className="font-bold text-slate-800 font-mono">{viewCredentialsModal.rollNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Branch / Dept</span>
                    <span className="font-semibold text-slate-800">{viewCredentialsModal.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Academic Year</span>
                    <span className="font-semibold text-slate-800">{viewCredentialsModal.academicYear || "3rd Year"}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200/60 flex justify-between items-center">
                  <span className="text-slate-500 font-semibold">Hostel Allocation:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {viewCredentialsModal.blockName} • Room {viewCredentialsModal.roomNumber || "101"} • Bed {viewCredentialsModal.bedNumber || "Bed-1"}
                  </span>
                </div>
              </div>

              {/* Login Credentials Box */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50/60 rounded-xl border border-blue-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-700" /> Authentication Keys
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    ACTIVE ACCOUNT
                  </span>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  {/* PRIMARY LOGIN: firstname@vignan_student.edu.in */}
                  <div className="flex justify-between items-center bg-blue-950 px-3 py-2.5 rounded-lg">
                    <span className="text-blue-300 text-[11px] font-sans font-bold">📧 Email Login (Primary):</span>
                    <span className="font-black text-emerald-400 tracking-wide text-xs sm:text-sm">
                      {`${viewCredentialsModal.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '')}@vignan_student.edu.in`}
                    </span>
                  </div>
                  {/* FIRST NAME LOGIN */}
                  <div className="flex justify-between items-center bg-slate-900 px-3 py-2 rounded-lg">
                    <span className="text-slate-400 text-[11px] font-sans font-medium">👤 First Name Login:</span>
                    <span className="font-bold text-white text-xs">
                      {viewCredentialsModal.name.split(" ")[0]}
                    </span>
                  </div>
                  {/* PASSWORD */}
                  <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg border border-blue-200">
                    <span className="text-slate-500 text-[11px] font-sans font-medium">🔒 Password:</span>
                    <span className="font-black text-blue-950 font-mono tracking-wider">
                      {viewCredentialsModal.defaultPassword || "password123"}
                    </span>
                  </div>
                  {/* ROLL NUMBER */}
                  <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                    <span className="text-slate-500 text-[11px] font-sans font-medium">🎫 Alt. Roll No Login:</span>
                    <span className="font-bold text-slate-700">{viewCredentialsModal.rollNumber}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const firstName = viewCredentialsModal.name.split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, '');
                  const studentEmail = `${firstName}@vignan_student.edu.in`;
                  navigator.clipboard.writeText(
                    `Vignan Student Login Credentials\n------------------------------------\nStudent Name: ${viewCredentialsModal.name}\nEmail / Login ID (Primary): ${studentEmail}\nFirst Name (Username): ${viewCredentialsModal.name.split(" ")[0]}\nJNTU Roll No: ${viewCredentialsModal.rollNumber}\nPassword: ${viewCredentialsModal.defaultPassword || "password123"}\nHostel Allocation: ${viewCredentialsModal.blockName} - Room ${viewCredentialsModal.roomNumber || "101"} (${viewCredentialsModal.bedNumber || "Bed-1"})\nStudent Dashboard: http://localhost:8082/student/dashboard`
                  );
                  toast.success("Credentials copied to clipboard!");
                }}
                className="text-xs h-9 gap-1.5 border-slate-300 font-bold"
              >
                <ClipboardList className="h-4 w-4 text-slate-600" /> Copy Credentials
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={async () => {
                    const firstName = viewCredentialsModal.name.split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, '');
                    const studentEmail = `${firstName}@vignan_student.edu.in`;
                    const password = viewCredentialsModal.defaultPassword || "password123";
                    
                    try {
                      // Try login with email format first
                      let res = await fetch("http://localhost:5000/api/student/auth/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ identifier: studentEmail, password }),
                      });
                      let data = await res.json();
                      
                      if (!data.token) {
                        // Fallback with first name
                        res = await fetch("http://localhost:5000/api/student/auth/login", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ identifier: viewCredentialsModal.name.split(" ")[0], password }),
                        });
                        data = await res.json();
                      }

                      if (!data.token) {
                        // Fallback with roll number
                        res = await fetch("http://localhost:5000/api/student/auth/login", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ identifier: viewCredentialsModal.rollNumber, password }),
                        });
                        data = await res.json();
                      }

                      if (data.token) {
                        localStorage.setItem("student_token", data.token);
                        localStorage.setItem("token", data.token);
                        toast.success(`✅ Authenticated as ${viewCredentialsModal.name}! Opening Student Portal...`);
                        window.open("/student/dashboard", "_blank");
                        setViewCredentialsModal(null);
                      } else {
                        toast.error(data.error || "Authentication failed.");
                      }
                    } catch (err) {
                      toast.error("Failed to connect to authentication server.");
                    }
                  }}
                  className="text-xs h-9 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold gap-1.5 shadow-md shadow-emerald-600/30"
                >
                  <ExternalLink className="h-4 w-4" /> Direct Student Login (New Tab)
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── RESET PASSWORD MODAL ── */}
      {resetPasswordStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Reset Student Password</h3>
                  <p className="text-xs text-slate-500">
                    {resetPasswordStudent.name} ({resetPasswordStudent.rollNumber})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setResetPasswordStudent(null)}
                className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <Label className="text-slate-700 font-semibold text-xs">New Password</Label>
                <Input
                  placeholder="Enter new password or leave for default"
                  value={newCustomPassword}
                  onChange={(e) => setNewCustomPassword(e.target.value)}
                  className="h-9 text-xs font-mono border-slate-300"
                />
                <span className="text-[10px] text-slate-400">
                  Default format: <code className="text-blue-700">{resetPasswordStudent.rollNumber}@2026</code>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResetPasswordStudent(null)}
                className="text-xs h-8"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleResetPasswordSubmit}
                className="text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Confirm & Update Password
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── RAISE MAINTENANCE TICKET MODAL ── */}
      <Dialog open={addTicketModalOpen} onOpenChange={setAddTicketModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#162354] flex items-center gap-2">
              <Wrench className="h-5 w-5 text-amber-600" /> Raise Maintenance / Facility Complaint
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateMaintenanceTicket} className="space-y-3.5 mt-2">
            <div className="space-y-1">
              <Label className="text-xs">Issue Title</Label>
              <Input
                required
                placeholder="e.g. Geyser not working / AC leaking water"
                value={ticketForm.title}
                onChange={(e) => setTicketForm({ ...ticketForm, title: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Category</Label>
                <Select
                  value={ticketForm.category}
                  onValueChange={(v: any) => setTicketForm({ ...ticketForm, category: v })}
                >
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Plumbing">Plumbing</SelectItem>
                    <SelectItem value="Electrical">Electrical</SelectItem>
                    <SelectItem value="Carpentry">Carpentry</SelectItem>
                    <SelectItem value="AC / HVAC">AC / HVAC</SelectItem>
                    <SelectItem value="Cleaning & Hygiene">Cleaning & Hygiene</SelectItem>
                    <SelectItem value="Wi-Fi & Network">Wi-Fi & Network</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Priority</Label>
                <Select
                  value={ticketForm.priority}
                  onValueChange={(v: any) => setTicketForm({ ...ticketForm, priority: v })}
                >
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">LOW</SelectItem>
                    <SelectItem value="MEDIUM">MEDIUM</SelectItem>
                    <SelectItem value="HIGH">HIGH</SelectItem>
                    <SelectItem value="URGENT">URGENT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Hostel Block</Label>
                <Select
                  value={ticketForm.blockName}
                  onValueChange={(v: any) => setTicketForm({ ...ticketForm, blockName: v })}
                >
                  <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Boys Hostel (Block B)">Boys Hostel (Block B)</SelectItem>
                    <SelectItem value="Girls Hostel (Block G)">Girls Hostel (Block G)</SelectItem>
                    <SelectItem value="International Block">International Block</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Room Number</Label>
                <Input
                  required
                  placeholder="e.g. 103"
                  value={ticketForm.roomNumber}
                  onChange={(e) => setTicketForm({ ...ticketForm, roomNumber: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Reported By (Resident Name)</Label>
              <Input
                required
                placeholder="e.g. Vishnu Vardhan"
                value={ticketForm.reportedBy}
                onChange={(e) => setTicketForm({ ...ticketForm, reportedBy: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Detailed Description</Label>
              <textarea
                rows={2}
                placeholder="Describe the issue in detail..."
                value={ticketForm.description}
                onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                className="w-full rounded-md border border-input px-3 py-2 text-xs shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" onClick={() => setAddTicketModalOpen(false)} className="h-9 text-xs">
                Cancel
              </Button>
              <Button type="submit" className="h-9 text-xs bg-[#162354] hover:bg-[#1f3073] text-white font-semibold">
                Submit Ticket
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── GATE LOG DETAILS MODAL ── */}
      <Dialog open={!!selectedGateLogForDetails} onOpenChange={(open) => !open && setSelectedGateLogForDetails(null)}>
        <DialogContent className="sm:max-w-xl rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#162354] flex items-center gap-2">
              <History className="h-5 w-5 text-blue-600" /> Gate Movement Event Details
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Verified Turnstile / Biometric event record synchronized with database.
            </DialogDescription>
          </DialogHeader>

          {selectedGateLogForDetails && (
            <div className="space-y-4 text-xs mt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 rounded-full bg-[#162354] text-white font-bold flex items-center justify-center text-sm">
                    {(selectedGateLogForDetails.name || selectedGateLogForDetails.studentName || "S").charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {selectedGateLogForDetails.name || selectedGateLogForDetails.studentName}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono">
                      ID: {selectedGateLogForDetails.registrationId || selectedGateLogForDetails.userId || selectedGateLogForDetails.studentId}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge
                    className={
                      selectedGateLogForDetails.type === "CHECK-IN"
                        ? "bg-emerald-100 text-emerald-800"
                        : selectedGateLogForDetails.type === "CHECK-OUT"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }
                  >
                    {selectedGateLogForDetails.type}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-2.5 rounded-lg border border-slate-100 bg-white shadow-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Block & Floor</span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {selectedGateLogForDetails.block || selectedGateLogForDetails.blockName} ({selectedGateLogForDetails.floor || selectedGateLogForDetails.floorName || "Floor 1"})
                  </p>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-100 bg-white shadow-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Room Number</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedGateLogForDetails.room || selectedGateLogForDetails.roomNumber}</p>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-100 bg-white shadow-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Timestamp</span>
                  <p className="font-bold text-slate-800 font-mono mt-0.5">
                    {selectedGateLogForDetails.formattedTimestamp || selectedGateLogForDetails.timestamp}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-100 bg-white shadow-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Gate Device</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedGateLogForDetails.device || selectedGateLogForDetails.deviceName}</p>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-100 bg-white shadow-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Method</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedGateLogForDetails.method}</p>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-100 bg-white shadow-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Outing ID</span>
                  <p className="font-bold text-blue-700 font-mono mt-0.5">
                    {selectedGateLogForDetails.outingId || (selectedGateLogForDetails.type === "CHECK-OUT" ? "OUT-2026001" : "-")}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Authorization Status:</span>
                  <span className="font-bold text-emerald-700">
                    {selectedGateLogForDetails.authorizationStatus || "AUTHORIZED"}
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Movement Result:</span>
                  <span className="font-bold text-slate-800">{selectedGateLogForDetails.status || "NORMAL"}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Audit Remarks:</span>
                  <span className="text-slate-700">
                    {selectedGateLogForDetails.remarks || `${selectedGateLogForDetails.type} verified via biometric device.`}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button onClick={() => setSelectedGateLogForDetails(null)} className="h-8 text-xs bg-[#162354] hover:bg-[#1f3073] text-white">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── VIOLATION DETAILS MODAL ── */}
      <Dialog open={!!selectedViolationForDetails} onOpenChange={(open) => !open && setSelectedViolationForDetails(null)}>
        <DialogContent className="sm:max-w-xl rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-rose-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-600" /> Outing Violation Breakdown
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Hostel entry/exit rule violation detected by automatic presence engine.
            </DialogDescription>
          </DialogHeader>

          {selectedViolationForDetails && (
            <div className="space-y-4 text-xs mt-2">
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 rounded-full bg-rose-200 text-rose-900 font-bold flex items-center justify-center text-sm">
                    {selectedViolationForDetails.studentName.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{selectedViolationForDetails.studentName}</h4>
                    <p className="text-[11px] text-slate-500 font-mono">ID: {selectedViolationForDetails.registrationId}</p>
                  </div>
                </div>
                <Badge
                  className={
                    selectedViolationForDetails.severity === "CRITICAL"
                      ? "bg-red-600 text-white animate-pulse"
                      : "bg-rose-100 text-rose-800"
                  }
                >
                  {selectedViolationForDetails.severity} SEVERITY
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-2.5 rounded-lg border border-slate-100 bg-white shadow-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Violation Type</span>
                  <p className="font-bold text-rose-700 mt-0.5">{selectedViolationForDetails.violationType}</p>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-100 bg-white shadow-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Expected Return</span>
                  <p className="font-bold text-slate-800 font-mono mt-0.5">{selectedViolationForDetails.expectedReturnTime}</p>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-100 bg-white shadow-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Allowed Until</span>
                  <p className="font-bold text-slate-800 font-mono mt-0.5">{selectedViolationForDetails.allowedUntilTime}</p>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-100 bg-white shadow-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Actual Return</span>
                  <p className="font-bold text-rose-700 font-mono mt-0.5">
                    {selectedViolationForDetails.actualReturnTime || "Not Returned"}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-100 bg-white shadow-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Late Duration</span>
                  <p className="font-bold text-rose-700 font-mono mt-0.5">
                    {selectedViolationForDetails.lateDurationText || `${selectedViolationForDetails.lateMinutes} min`}
                  </p>
                </div>

                <div className="p-2.5 rounded-lg border border-slate-100 bg-white shadow-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Status</span>
                  <p className="font-bold text-slate-800 mt-0.5">{selectedViolationForDetails.status}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-100 bg-slate-50 space-y-1.5">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Action Taken & Warden Notes:</span>
                <p className="text-slate-700 font-medium">
                  {selectedViolationForDetails.actionTaken || "Pending disciplinary review by Chief Warden."}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button onClick={() => setSelectedViolationForDetails(null)} className="h-8 text-xs bg-[#162354] hover:bg-[#1f3073] text-white">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── RESOLVE VIOLATION MODAL ── */}
      <Dialog open={!!selectedViolationForResolution} onOpenChange={(open) => !open && setSelectedViolationForResolution(null)}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#162354] flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" /> Resolve Movement Violation
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Record disciplinary action and mark this violation as resolved.
            </DialogDescription>
          </DialogHeader>

          {selectedViolationForResolution && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleResolveMovementViolation(selectedViolationForResolution.id, violationResolutionRemark || violationActionTaken);
              }}
              className="space-y-4 text-xs mt-2"
            >
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block text-sm">{selectedViolationForResolution.studentName}</span>
                <span className="text-[11px] text-slate-500 font-mono">
                  ID: {selectedViolationForResolution.registrationId} | {selectedViolationForResolution.violationType} (Late by{" "}
                  {selectedViolationForResolution.lateDurationText || `${selectedViolationForResolution.lateMinutes} min`})
                </span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Action Taken</Label>
                <Select value={violationActionTaken} onValueChange={setViolationActionTaken}>
                  <SelectTrigger className="h-9 text-xs bg-white border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Warning issued; Parent informed by Warden">
                      Warning issued; Parent informed by Warden
                    </SelectItem>
                    <SelectItem value="Late fee penalty charged to student mess account">
                      Late fee penalty charged to student mess account
                    </SelectItem>
                    <SelectItem value="Outing privileges suspended for 7 days">
                      Outing privileges suspended for 7 days
                    </SelectItem>
                    <SelectItem value="Explanation letter obtained and approved by Warden">
                      Explanation letter obtained and approved by Warden
                    </SelectItem>
                    <SelectItem value="Exempted due to verified medical/academic emergency">
                      Exempted due to verified medical/academic emergency
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Warden Remarks / Justification</Label>
                <Textarea
                  rows={3}
                  placeholder="Enter remarks or justification for resolving this violation..."
                  value={violationResolutionRemark}
                  onChange={(e) => setViolationResolutionRemark(e.target.value)}
                  className="text-xs border-slate-300"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setSelectedViolationForResolution(null)}
                  className="h-9 text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" className="h-9 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                  Confirm & Resolve
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Exported Route View Wrappers ──
export const HostelAttendanceView = () => <HostelModuleView />;
export const HostelDeviceManagementView = () => <HostelModuleView />;
export const HostelFeesView = () => <HostelModuleView />;
export const HostelGuestBillingView = () => <HostelModuleView />;
export const HostelLeavesSuspensionView = () => <HostelModuleView />;
export const HostelLogHistoryView = () => <HostelModuleView />;
export const HostelMaintenanceView = () => <HostelModuleView />;
export const HostelMessFeesView = () => <HostelModuleView />;
export const HostelMessMenusView = () => <HostelModuleView />;
export const HostelNotificationsView = () => <HostelModuleView />;
export const HostelOutingLogHistoryView = () => <HostelModuleView />;
export const HostelSettingsView = () => <HostelModuleView />;
export const HostelUserManagementView = () => <HostelModuleView />;
export const HostelVisitorsView = () => <HostelModuleView />;
