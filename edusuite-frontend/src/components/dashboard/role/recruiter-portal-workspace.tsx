import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import {
  Briefcase,
  Users,
  CheckCircle,
  Clock,
  Upload,
  FileText,
  Building,
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  Send,
  Save,
  Menu,
  Sparkles,
  BarChart3,
  Calendar,
  Award,
  Bell,
  Settings,
  Shield,
  HelpCircle,
  MessageSquare,
  Lock,
  Eye,
  Edit,
  Trash2,
  Copy,
  RefreshCw,
  AlertTriangle,
  FileCheck2,
  Video,
  Database,
  Code2,
  CheckCheck,
  Check,
  X,
  FileSpreadsheet,
  Layers,
  User,
  Key,
  Smartphone,
  LogOut,
  ChevronRight,
  BookOpen,
  BrainCircuit,
  Calculator,
  Cpu,
  PieChart as PieChartIcon,
  TrendingUp,
  Brain,
  FileDown,
  ShieldCheck,
  SlidersHorizontal,
  Play,
  Phone,
  Mail,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { toast } from "sonner";
import { pushToSharedQueue, getAllStudentSubmissions, type StudentSubmissionRecord } from "@/lib/shared-assessment-store";

import { Panel } from "@/components/dashboard/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ============================================================================
// RECRUITER PORTAL DATA MODELS & MOCK STATE
// ============================================================================

export type RecruiterPageModule =
  | "dashboard"
  | "company-profile"
  | "placement-drives"
  | "assessments"
  | "question-bank"
  | "assessment-requests"
  | "interviews"
  | "offers"
  | "reports"
  | "notifications"
  | "support"
  | "profile-security";

export interface RecruiterDrive {
  id: string;
  driveCode: string;
  title: string;
  role: string;
  ctc: string;
  location: string;
  applicationsCount: number;
  shortlistedCount: number;
  interviewedCount: number;
  offersCount: number;
  status: "Active Registration" | "Assessment Phase" | "Interview Phase" | "Completed";
  progressPct: number;
}

export interface RecruiterAssessment {
  id: string;
  title: string;
  type: "MCQ + Coding + SQL" | "Coding Only" | "Aptitude & MCQ";
  mcqCount: number;
  codingCount: number;
  sqlCount: number;
  duration: string;
  totalMarks: number;
  passingMarksPct: number;
  version: string;
  requestStatus: "Draft" | "Submitted" | "Under Review" | "Changes Requested" | "Resubmitted" | "Approved" | "Rejected";
  reviewerNotes?: string;
  lastUpdated: string;
}

export interface InterviewCandidate {
  id: string;
  name: string;
  rollNo: string;
  department: string;
  cgpa: number;
  slotTime: string;
  panelAssigned: string;
  interviewer: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Recommended" | "Rejected";
  scorecardMarks?: number;
  feedbackRemarks?: string;
}

export interface CandidateOffer {
  id: string;
  candidateName: string;
  rollNo: string;
  department: string;
  jobRole: string;
  ctc: string;
  joiningDate: string;
  location: string;
  offerStatus: "Draft" | "Uploaded" | "Verification Pending" | "Accepted" | "Withdrawn";
  acceptanceDate?: string;
}

const MOCK_RECRUITER_DRIVES: RecruiterDrive[] = [
  {
    id: "DRV-GGL-01",
    driveCode: "DRV-2026-GGL-01",
    title: "Google Cloud SDE Hiring Drive 2026",
    role: "Software Engineer I (Cloud Solutions)",
    ctc: "₹32.0 LPA",
    location: "Bengaluru / Hyderabad",
    applicationsCount: 360,
    shortlistedCount: 328,
    interviewedCount: 48,
    offersCount: 14,
    status: "Assessment Phase",
    progressPct: 88,
  },
  {
    id: "DRV-GGL-02",
    driveCode: "DRV-2026-GGL-02",
    title: "Google Cloud Data Engineer Drive 2026",
    role: "Cloud Data Engineer",
    ctc: "₹28.5 LPA",
    location: "Bengaluru, KA",
    applicationsCount: 220,
    shortlistedCount: 180,
    interviewedCount: 0,
    offersCount: 0,
    status: "Active Registration",
    progressPct: 45,
  },
];

const MOCK_RECRUITER_ASSESSMENTS: RecruiterAssessment[] = [
  {
    id: "AST-GGL-01",
    title: "Google Cloud Aptitude & Coding Round 1",
    type: "MCQ + Coding + SQL",
    mcqCount: 35,
    codingCount: 5,
    sqlCount: 5,
    duration: "90 Mins",
    totalMarks: 100,
    passingMarksPct: 75,
    version: "v1.2",
    requestStatus: "Approved",
    reviewerNotes: "Approved by Placement Officer Dr. Anand Sharma. Ready for session scheduling.",
    lastUpdated: "2026-07-30",
  },
  {
    id: "AST-GGL-02",
    title: "Google Cloud Systems DSA Assessment",
    type: "Coding Only",
    mcqCount: 0,
    codingCount: 6,
    sqlCount: 0,
    duration: "120 Mins",
    totalMarks: 120,
    passingMarksPct: 80,
    version: "v1.0",
    requestStatus: "Submitted",
    reviewerNotes: "Awaiting TPO approval.",
    lastUpdated: "2026-08-01",
  },
  {
    id: "AST-GGL-03",
    title: "Google Cloud Infrastructure MCQ Test",
    type: "Aptitude & MCQ",
    mcqCount: 50,
    codingCount: 0,
    sqlCount: 0,
    duration: "60 Mins",
    totalMarks: 100,
    passingMarksPct: 70,
    version: "v1.1",
    requestStatus: "Changes Requested",
    reviewerNotes: "Please reduce MCQ count to 40 and include 2 SQL database problems.",
    lastUpdated: "2026-07-31",
  },
];

const MOCK_INTERVIEW_CANDIDATES: InterviewCandidate[] = [
  {
    id: "INT-01",
    name: "Aditya Sharma",
    rollNo: "2022CSE188",
    department: "CSE",
    cgpa: 9.2,
    slotTime: "10:00 AM – 10:45 AM",
    panelAssigned: "Panel 1 (Cloud Core)",
    interviewer: "David Miller (Staff Recruiter)",
    status: "Recommended",
    scorecardMarks: 94,
    feedbackRemarks: "Exceptional DSA problem solving & system architecture understanding.",
  },
  {
    id: "INT-02",
    name: "Rohan Varma",
    rollNo: "2022CSE104",
    department: "CSE",
    cgpa: 8.9,
    slotTime: "11:00 AM – 11:45 AM",
    panelAssigned: "Panel 2 (Algorithms)",
    interviewer: "Sarah Jenkins (Senior SDE)",
    status: "Scheduled",
  },
  {
    id: "INT-03",
    name: "Sneha Reddy",
    rollNo: "2022ECE042",
    department: "ECE",
    cgpa: 8.4,
    slotTime: "02:00 PM – 02:45 PM",
    panelAssigned: "Panel 1 (Cloud Core)",
    interviewer: "David Miller (Staff Recruiter)",
    status: "Completed",
    scorecardMarks: 88,
    feedbackRemarks: "Strong OOP concepts and database queries.",
  },
];

const MOCK_CANDIDATE_OFFERS: CandidateOffer[] = [
  {
    id: "OFR-01",
    candidateName: "Aditya Sharma",
    rollNo: "2022CSE188",
    department: "CSE",
    jobRole: "Software Engineer I (Cloud Solutions)",
    ctc: "₹32.0 LPA",
    joiningDate: "2026-09-01",
    location: "Bengaluru, KA",
    offerStatus: "Accepted",
    acceptanceDate: "2026-08-01",
  },
  {
    id: "OFR-02",
    candidateName: "Sneha Reddy",
    rollNo: "2022ECE042",
    department: "ECE",
    jobRole: "Software Engineer I (Cloud Solutions)",
    ctc: "₹32.0 LPA",
    joiningDate: "2026-09-01",
    location: "Hyderabad, TS",
    offerStatus: "Verification Pending",
  },
];

export const SAMPLE_20_MCQS = [
  { id: 1, question: "Which algorithm is primarily utilized by Google Bigtable for high-throughput append-only distributed key-value storage?", options: ["A. Log-Structured Merge-Tree (LSM-Tree)", "B. B+ Tree Indexing with WAL", "C. Red-Black Balanced Binary Search Tree", "D. Distributed Hash Map Ring"], correct: 0 },
  { id: 2, question: "What is the primary consistency model guarantee in Google Spanner distributed database system globally?", options: ["A. Eventual Consistency", "B. External Consistency (TrueTime API)", "C. Causal Consistency", "D. Read-Uncommitted Isolation"], correct: 1 },
  { id: 3, question: "According to the CAP Theorem, which two guarantees does Apache Cassandra prioritize during network partition?", options: ["A. Consistency & Availability (CA)", "B. Availability & Partition Tolerance (AP)", "C. Consistency & Partition Tolerance (CP)", "D. Durability & Isolation (DI)"], correct: 1 },
  { id: 4, question: "What is the average time complexity of searching an element in a B-Tree of degree t with N keys?", options: ["A. O(1)", "B. O(N)", "C. O(log N)", "D. O(N log N)"], correct: 2 },
  { id: 5, question: "In TCP networking, what is the purpose of the Sliding Window Mechanism?", options: ["A. Flow Control & Congestion Management", "B. Encryption Key Exchange", "C. DNS Resolution Caching", "D. Packet Fragment Reassembly"], correct: 0 },
  { id: 6, question: "Which Linux kernel feature enables Docker container resource limitation (CPU, Memory, IO)?", options: ["A. Namespaces", "B. Control Groups (cgroups)", "C. chroot", "D. iptables"], correct: 1 },
  { id: 7, question: "Which Kubernetes component is responsible for assigning unscheduled pods to nodes based on resource constraints?", options: ["A. kube-apiserver", "B. kube-scheduler", "C. kubelet", "D. etcd"], correct: 1 },
  { id: 8, question: "What happens when a CPU attempts to access a virtual memory address not present in physical RAM?", options: ["A. Segmentation Fault Crash", "B. Page Fault Interrupt", "C. Bus Lock State", "D. Stack Overflow Exception"], correct: 1 },
  { id: 9, question: "Which Java JVM Garbage Collector is designed for ultra-low latency with pause times under 1ms?", options: ["A. Serial GC", "B. Parallel GC", "C. ZGC (Z Garbage Collector)", "D. CMS Collector"], correct: 2 },
  { id: 10, question: "What is the time complexity of the 0/1 Knapsack problem using Dynamic Programming with N items and capacity W?", options: ["A. O(N + W)", "B. O(N * W)", "C. O(2^N)", "D. O(N log N)"], correct: 1 },
  { id: 11, question: "In Hash Map implementation, what technique resolves collisions by chaining elements in linked lists or red-black trees at the same bucket index?", options: ["A. Separate Chaining", "B. Linear Probing", "C. Quadratic Probing", "D. Double Hashing"], correct: 0 },
  { id: 12, question: "In Java concurrency, which synchronizer allows up to N threads to access a shared resource simultaneously?", options: ["A. ReentrantLock", "B. CountDownLatch", "C. Semaphore", "D. CyclicBarrier"], correct: 2 },
  { id: 13, question: "What binary serialization format and transport protocol does gRPC use for high-performance microservices?", options: ["A. JSON over HTTP/1.1", "B. Protocol Buffers over HTTP/2", "C. XML over SOAP", "D. BSON over WebSockets"], correct: 1 },
  { id: 14, question: "Which Redis caching eviction policy removes keys that were used least recently?", options: ["A. volatile-ttl", "B. allkeys-lru", "C. noeviction", "D. volatile-random"], correct: 1 },
  { id: 15, question: "Which tree traversal order visits nodes in strictly sorted ascending order for a Binary Search Tree (BST)?", options: ["A. Pre-order", "B. In-order", "C. Post-order", "D. Level-order"], correct: 1 },
  { id: 16, question: "Which operating system algorithm is used for deadlock avoidance by verifying resource allocation safety state?", options: ["A. Round Robin Algorithm", "B. Banker's Algorithm", "C. Priority Scheduling", "D. Elevator Algorithm"], correct: 1 },
  { id: 17, question: "In microservices architecture, which design pattern prevents cascading service failures when a remote dependency fails?", options: ["A. API Gateway", "B. Circuit Breaker", "C. Saga Pattern", "D. Command Query Responsibility Segregation (CQRS)"], correct: 1 },
  { id: 18, question: "How does Apache Kafka achieve horizontal scalability and high throughput for event streams?", options: ["A. Single Master Database", "B. Topic Partitioning & Consumer Groups", "C. Distributed Shared Memory", "D. Synchronous HTTP Polling"], correct: 1 },
  { id: 19, question: "Which SOLID principle states that high-level modules should not depend on low-level modules, but both should depend on abstractions?", options: ["A. Single Responsibility Principle", "B. Open/Closed Principle", "C. Liskov Substitution Principle", "D. Dependency Inversion Principle"], correct: 3 },
  { id: 20, question: "What is the worst-case time complexity of QuickSort when the pivot chosen is consistently the smallest or largest element?", options: ["A. O(N log N)", "B. O(N^2)", "C. O(N)", "D. O(log N)"], correct: 1 },
];

export interface CodingTestCase {
  id: string;
  name: string;
  input: string;
  output: string;
  explanation?: string;
  isHidden: boolean;
  category?: string;
}

export interface CodingChallenge {
  id: string;
  title: string;
  marks: number;
  timeLimit: string;
  memoryLimit: string;
  statement: string;
  compilers: Array<{ name: string; code: string }>;
  sampleInput: string;
  sampleOutput: string;
  normalTestCases: CodingTestCase[];
  hiddenTestCases: CodingTestCase[];
}

export const SAMPLE_2_CODING_CHALLENGES: CodingChallenge[] = [
  {
    id: "CODING-01",
    title: "Problem 1: Distributed Cache Eviction (LRU-K Policy)",
    marks: 20,
    timeLimit: "2.0 Seconds",
    memoryLimit: "256 MB",
    statement: "Implement an LRU-K cache eviction strategy. The LRU-K algorithm evicts the page whose K-th backward distance is maximum. If a page has been accessed less than K times, its backward distance is defined as infinity. If multiple pages have infinite backward distance, LRU on first access time is used as the tie-breaker.",
    compilers: [
      { name: "Java 17", code: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int capacity = sc.nextInt();\n        int k = sc.nextInt();\n        // Write LRU-K cache solution here\n        System.out.println("Evicted Node ID = 2");\n    }\n}` },
      { name: "Python 3.11", code: `import sys\n\ndef solve():\n    # Read capacity and K\n    capacity, k = map(int, sys.stdin.readline().split())\n    # Implement LRU-K logic\n    print("Evicted Node ID = 2")\n\nif __name__ == '__main__':\n    solve()` },
      { name: "C++ 20", code: `#include <iostream>\n#include <unordered_map>\n#include <list>\nusing namespace std;\n\nint main() {\n    int capacity, k;\n    cin >> capacity >> k;\n    // LRU-K Implementation\n    cout << "Evicted Node ID = 2" << endl;\n    return 0;\n}` },
      { name: "C (GCC)", code: `#include <stdio.h>\n#include <stdlib.h>\n\nint main() {\n    int capacity, k;\n    if (scanf("%d %d", &capacity, &k) == 2) {\n        printf("Evicted Node ID = 2\\n");\n    }\n    return 0;\n}` },
      { name: "C# 10", code: `using System;\n\nclass Program {\n    static void Main() {\n        string[] input = Console.ReadLine().Split();\n        int capacity = int.Parse(input[0]);\n        int k = int.Parse(input[1]);\n        Console.WriteLine("Evicted Node ID = 2");\n    }\n}` },
      { name: "Go 1.20", code: `package main\nimport "fmt"\n\nfunc main() {\n    var capacity, k int\n    fmt.Scanf("%d %d", &capacity, &k)\n    fmt.Println("Evicted Node ID = 2")\n}` }
    ],
    sampleInput: "Capacity = 3, K = 2\nPage Requests: 1, 2, 3, 1, 4",
    sampleOutput: "Evicted Node ID = 2",
    normalTestCases: [
      {
        id: "TC-NORM-101",
        name: "Normal Case 1 (Standard LRU-K Eviction)",
        input: "Capacity = 3, K = 2\nRequests: 1, 2, 3, 1, 4",
        output: "Evicted Node ID = 2",
        explanation: "Page 2 has only 1 access (backward distance = infinity), while Page 1 reached K=2 accesses. Page 2 is evicted to make room for Page 4.",
        isHidden: false
      },
      {
        id: "TC-NORM-102",
        name: "Normal Case 2 (Infinite Distance Tie-Breaking)",
        input: "Capacity = 3, K = 2\nRequests: 1, 2, 1, 2, 3, 4",
        output: "Evicted Node ID = 3",
        explanation: "Page 3 is accessed only once (< K=2). Hence it has infinite backward distance and is chosen for eviction over Pages 1 and 2.",
        isHidden: false
      },
      {
        id: "TC-NORM-103",
        name: "Normal Case 3 (All Pages Reached K Accesses)",
        input: "Capacity = 3, K = 2\nRequests: 1, 2, 3, 1, 2, 3, 5",
        output: "Evicted Node ID = 1",
        explanation: "Pages 1, 2, and 3 all have 2 accesses. Page 1's 2nd previous access was oldest among all, making its backward distance largest.",
        isHidden: false
      }
    ],
    hiddenTestCases: [
      { id: "TC-HIDD-101", name: "Hidden Test Case 1", input: "Capacity = 1, K = 2\nRequests: 10, 20, 30", output: "Evicted Node ID = 10", category: "Single Element Capacity Edge Case", isHidden: true },
      { id: "TC-HIDD-102", name: "Hidden Test Case 2", input: "Capacity = 4, K = 1\nRequests: 1, 2, 3, 4, 5", output: "Evicted Node ID = 1", category: "K=1 Standard LRU Fallback", isHidden: true },
      { id: "TC-HIDD-103", name: "Hidden Test Case 3", input: "Capacity = 3, K = 3\nRequests: 5, 5, 5, 5, 6, 7, 8", output: "Evicted Node ID = 6", category: "Repeated Access Frequency", isHidden: true },
      { id: "TC-HIDD-104", name: "Hidden Test Case 4", input: "Capacity = 4, K = 2\nRequests: 1, 2, 3, 4, 5", output: "Evicted Node ID = 1", category: "First-In Tie-Breaker Order", isHidden: true },
      { id: "TC-HIDD-105", name: "Hidden Test Case 5", input: "Capacity = 3, K = 2\nRequests: 10, 20, 10, 30, 20, 40", output: "Evicted Node ID = 30", category: "Interleaved Access Patterns", isHidden: true },
      { id: "TC-HIDD-106", name: "Hidden Test Case 6", input: "Capacity = 5, K = 2\nRequests: 1, 2, 3, 4, 5", output: "No Eviction Required", category: "Zero Eviction Under-Capacity Limit", isHidden: true },
      { id: "TC-HIDD-107", name: "Hidden Test Case 7", input: "Capacity = 3, K = 5\nRequests: 1, 2, 3, 1, 2, 1, 4", output: "Evicted Node ID = 3", category: "Large K Value (K > Unique Hits)", isHidden: true },
      { id: "TC-HIDD-108", name: "Hidden Test Case 8", input: "Capacity = 2, K = 2\nRequests: 100, 200, 100, 300, 400", output: "Evicted Node ID = 200", category: "Rapid Turnover Cache Thrashing", isHidden: true },
      { id: "TC-HIDD-109", name: "Hidden Test Case 9", input: "Capacity = 1000, K = 2\nRequests: 1..1000, 1001", output: "Evicted Node ID = 1", category: "Max Capacity Scale Boundary (N=1000)", isHidden: true },
      { id: "TC-HIDD-110", name: "Hidden Test Case 10", input: "Capacity = 500, K = 3\nRequests: Random Stream N=100k Ops", output: "Execution Time < 0.05s", category: "Time Complexity Stress (N=10^5)", isHidden: true },
      { id: "TC-HIDD-111", name: "Hidden Test Case 11", input: "Capacity = 3, K = 2\nRequests: 7, 7, 8, 8, 9, 9, 10", output: "Evicted Node ID = 7", category: "Duplicate Burst Hits Queue", isHidden: true },
      { id: "TC-HIDD-112", name: "Hidden Test Case 12", input: "Capacity = 2000, K = 10\nRequests: Dense Access Stream", output: "Pass (Memory < 12MB)", category: "Memory Limit Bounds", isHidden: true }
    ]
  },
  {
    id: "CODING-02",
    title: "Problem 2: Optimal Cloud Subgraph Network Connectivity",
    marks: 30,
    timeLimit: "1.5 Seconds",
    memoryLimit: "512 MB",
    statement: "Given N cloud data centers connected by weighted bidirectional fiber links and K maximum link failure tolerance, find the minimum cost subtree connecting all data centers such that no single link failure disconnects more than K nodes.",
    compilers: [
      { name: "Java 17", code: `import java.util.*;\n\npublic class Solution {\n    public static void main(String[] args) {\n        // Subgraph MST with K constraint\n        System.out.println("Minimum Subgraph Cost = 1420");\n    }\n}` },
      { name: "Python 3.11", code: `import sys\n\ndef main():\n    # Optimal Subgraph MST\n    print("Minimum Subgraph Cost = 1420")\n\nif __name__ == '__main__':\n    main()` },
      { name: "C++ 20", code: `#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\n\nint main() {\n    // Kruskal's / Prim's MST with failure constraint\n    cout << "Minimum Subgraph Cost = 1420" << endl;\n    return 0;\n}` },
      { name: "C (GCC)", code: `#include <stdio.h>\n\nint main() {\n    printf("Minimum Subgraph Cost = 1420\\n");\n    return 0;\n}` },
      { name: "C# 10", code: `using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Minimum Subgraph Cost = 1420");\n    }\n}` },
      { name: "Go 1.20", code: `package main\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Minimum Subgraph Cost = 1420")\n}` }
    ],
    sampleInput: "Nodes = 5, Edges = 7, K = 1\nEdges: (1,2,100), (2,3,200), (3,4,150), (4,5,300), (1,3,400), (2,4,250), (3,5,220)",
    sampleOutput: "Minimum Subgraph Cost = 1420",
    normalTestCases: [
      {
        id: "TC-NORM-201",
        name: "Normal Case 1 (Basic 5-Node Cloud Topology)",
        input: "Nodes = 5, Edges = 7, K = 1\nEdges: (1,2,100), (2,3,200), (3,4,150), (4,5,300), (1,3,400), (2,4,250), (3,5,220)",
        output: "Minimum Subgraph Cost = 1420",
        explanation: "Standard 5-node cloud cluster network. Selects optimum weighted fiber links respecting single-link fault tolerance K=1.",
        isHidden: false
      },
      {
        id: "TC-NORM-202",
        name: "Normal Case 2 (Linear Chain Topology)",
        input: "Nodes = 4, Edges = 3, K = 2\nEdges: (1,2,50), (2,3,80), (3,4,60)",
        output: "Minimum Subgraph Cost = 190",
        explanation: "Tree directly connects 4 nodes in a line with edge weights 50 + 80 + 60 = 190, satisfying failure tolerance K=2.",
        isHidden: false
      },
      {
        id: "TC-NORM-203",
        name: "Normal Case 3 (Fully Connected Mesh Topology)",
        input: "Nodes = 4, Edges = 6, K = 1\nEdges: (1,2,10), (1,3,20), (1,4,30), (2,3,15), (2,4,25), (3,4,35)",
        output: "Minimum Subgraph Cost = 45",
        explanation: "Selects lowest cost edges (1,2,10), (2,3,15), and (1,3,20) avoiding cut-set partitions exceeding K=1.",
        isHidden: false
      }
    ],
    hiddenTestCases: [
      { id: "TC-HIDD-201", name: "Hidden Test Case 1", input: "Nodes = 5, Edges = 3, K = 1\nEdges: (1,2,10), (3,4,20), (4,5,30)", output: "Disconnected Graph (-1)", category: "Unreachable Graph / Disconnected Nodes", isHidden: true },
      { id: "TC-HIDD-202", name: "Hidden Test Case 2", input: "Nodes = 1, Edges = 0, K = 1", output: "Minimum Subgraph Cost = 0", category: "Trivial Single-Node Cloud Instance", isHidden: true },
      { id: "TC-HIDD-203", name: "Hidden Test Case 3", input: "Nodes = 2, Edges = 1, K = 1\nEdges: (1,2,999)", output: "Minimum Subgraph Cost = 999", category: "Two Nodes Single Link Boundary", isHidden: true },
      { id: "TC-HIDD-204", name: "Hidden Test Case 4", input: "Nodes = 4, Edges = 5, K = 0\nEdges: (1,2,10), (2,3,10), (3,4,10), (4,1,10), (1,3,15)", output: "Minimum Subgraph Cost = 40", category: "K=0 Zero Disconnection Tolerance", isHidden: true },
      { id: "TC-HIDD-205", name: "Hidden Test Case 5", input: "Nodes = 6, Edges = 8, K = 2\nEdges: all weights = 100", output: "Minimum Subgraph Cost = 500", category: "Equal Fiber Weights & MST Tie", isHidden: true },
      { id: "TC-HIDD-206", name: "Hidden Test Case 6", input: "Nodes = 7, Edges = 6, K = 3\nEdges: (1,2,5), (1,3,5), (1,4,5), (1,5,5), (1,6,5), (1,7,5)", output: "Minimum Subgraph Cost = 30", category: "Star Hub Topology Network", isHidden: true },
      { id: "TC-HIDD-207", name: "Hidden Test Case 7", input: "Nodes = 1000, Edges = 5000, K = 5", output: "Minimum Subgraph Cost = 84520", category: "Large Subgraph Scaling (N=1000)", isHidden: true },
      { id: "TC-HIDD-208", name: "Hidden Test Case 8", input: "Nodes = 3, Edges = 3, K = 1\nEdges: (1,2,10^9), (2,3,10^9), (1,3,2*10^9)", output: "Minimum Subgraph Cost = 2000000000", category: "64-bit Overflow & Huge Weights", isHidden: true },
      { id: "TC-HIDD-209", name: "Hidden Test Case 9", input: "Nodes = 8, Edges = 12, K = 2", output: "Minimum Subgraph Cost = 3280", category: "Cyclic Loop Redundancy Check", isHidden: true },
      { id: "TC-HIDD-210", name: "Hidden Test Case 10", input: "Nodes = 50000, Edges = 200000, K = 10", output: "Execution Time < 0.12s", category: "Stress Test (N=50,000 Nodes)", isHidden: true },
      { id: "TC-HIDD-211", name: "Hidden Test Case 11", input: "Nodes = 4, Edges = 8, K = 1", output: "Minimum Subgraph Cost = 240", category: "Self Loops & Parallel Link Filter", isHidden: true },
      { id: "TC-HIDD-212", name: "Hidden Test Case 12", input: "Nodes = 10, Edges = 15, K = 2", output: "Minimum Subgraph Cost = 5120", category: "Bottleneck Cut-Set Partition", isHidden: true }
    ]
  }
];

export function RecruiterPortalWorkspace({ initialModule = "dashboard" }: { initialModule?: RecruiterPageModule }) {
  const location = useLocation();
  const navigate = useNavigate();

  const searchObj = (location.search || {}) as Record<string, string | undefined>;
  const currentModuleFromUrl = (searchObj["module"] as RecruiterPageModule) || initialModule;

  const activeModule = currentModuleFromUrl;

  const setActiveModule = (mod: RecruiterPageModule) => {
    navigate({
      to: "/external-user/dashboard",
      search: (prev: any) => ({ ...prev, module: mod }),
    });
  };

  // Initial Question Bank Items Divided by Subject
  const INITIAL_QUESTION_BANK: Array<{
    id: string;
    type: "MCQ" | "Coding" | "SQL";
    subject: "Verbal Ability" | "Logical Reasoning" | "Quantitative Aptitude" | "Data Structures & Algorithms" | "Database Management Systems (DBMS)" | "Core Systems (OS & Networks)";
    title: string;
    optionsOrConstraints: string;
    difficulty: "Easy" | "Medium" | "Hard";
    marks: number;
  }> = [
    // Data Structures & Algorithms
    { id: "QB-DSA-01", type: "Coding", subject: "Data Structures & Algorithms", title: "Distributed Cache Eviction (LRU-K Policy with O(1) time complexity)", optionsOrConstraints: "Java 17, Python 3.11, C++ 20", difficulty: "Hard", marks: 20 },
    { id: "QB-DSA-02", type: "Coding", subject: "Data Structures & Algorithms", title: "Optimal Cloud Subgraph Network Connectivity (K Minimum Spanning Tree)", optionsOrConstraints: "Java 17, Python 3.11, C++ 20", difficulty: "Hard", marks: 30 },
    { id: "QB-DSA-03", type: "MCQ", subject: "Data Structures & Algorithms", title: "Log-Structured Merge-Tree (LSM-Tree) append-only storage in Google Bigtable", optionsOrConstraints: "4 Options (LSM, B+, Tree, Hash Ring)", difficulty: "Hard", marks: 1 },

    // Verbal Ability
    { id: "QB-VERBAL-01", type: "MCQ", subject: "Verbal Ability", title: "Sentence Completion & Contextual Technical Vocabulary Analogy", optionsOrConstraints: "4 Options", difficulty: "Easy", marks: 1 },
    { id: "QB-VERBAL-02", type: "MCQ", subject: "Verbal Ability", title: "Reading Comprehension Inferences: High-Throughput System Documentation", optionsOrConstraints: "4 Options", difficulty: "Medium", marks: 1 },

    // Logical Reasoning
    { id: "QB-LOGIC-01", type: "MCQ", subject: "Logical Reasoning", title: "Syllogism Deductive Logic: Statements & Venn Diagram Conclusions", optionsOrConstraints: "4 Options", difficulty: "Medium", marks: 1 },
    { id: "QB-LOGIC-02", type: "MCQ", subject: "Logical Reasoning", title: "Circular Seating Arrangement & Directional Positioning Matrix", optionsOrConstraints: "4 Options", difficulty: "Hard", marks: 1 },

    // Quantitative Aptitude
    { id: "QB-QUANT-01", type: "MCQ", subject: "Quantitative Aptitude", title: "Work & Time Efficiency Ratio: 3 Pipes Filling Cistern at Differential Flow Rates", optionsOrConstraints: "4 Options", difficulty: "Medium", marks: 1 },
    { id: "QB-QUANT-02", type: "MCQ", subject: "Quantitative Aptitude", title: "Combinatorics & Probability of Concurrent Distributed Server Node Failures", optionsOrConstraints: "4 Options", difficulty: "Hard", marks: 1 },

    // Database Systems (DBMS)
    { id: "QB-DBMS-01", type: "SQL", subject: "Database Management Systems (DBMS)", title: "Top 5 High-Revenue Corporate Accounts Window Aggregation (DENSE_RANK)", optionsOrConstraints: "PostgreSQL 15 / MySQL 8", difficulty: "Medium", marks: 10 },
    { id: "QB-DBMS-02", type: "SQL", subject: "Database Management Systems (DBMS)", title: "Recursive Common Table Expression (CTE) for Org Hierarchy Tree Traversals", optionsOrConstraints: "PostgreSQL 15 / MySQL 8", difficulty: "Hard", marks: 15 },

    // Core Systems (OS & Networks)
    { id: "QB-OS-01", type: "MCQ", subject: "Core Systems (OS & Networks)", title: "Banker's Algorithm Resource Request Deadlock Prevention State Matrix", optionsOrConstraints: "4 Options", difficulty: "Medium", marks: 1 },
    { id: "QB-CN-01", type: "MCQ", subject: "Core Systems (OS & Networks)", title: "TCP 3-Way Handshake SYN-ACK Sequence & Acknowledgement Numbering", optionsOrConstraints: "4 Options", difficulty: "Medium", marks: 1 },
  ];

  // Password reset alert state
  const [isFirstLoginPasswordResetRequired, setIsFirstLoginPasswordResetRequired] = useState(false);

  // Recruiter Profile State
  const [companyName, setCompanyName] = useState("Google Cloud India");
  const [website, setWebsite] = useState("https://cloud.google.com");
  const [headOffice, setHeadOffice] = useState("Bengaluru, KA");

  // Create Assessment Modal State
  const [isCreateAssessmentModalOpen, setIsCreateAssessmentModalOpen] = useState(false);
  const [newAstTitle, setNewAstTitle] = useState("");
  const [newAstType, setNewAstType] = useState<"MCQ + Coding + SQL" | "Coding Only" | "Aptitude & MCQ">("MCQ + Coding + SQL");
  const [newAstDuration, setNewAstDuration] = useState("90 Mins");
  const [newAstPassingPct, setNewAstPassingPct] = useState("75");

  // Placement Drives State
  const [drivesList, setDrivesList] = useState<RecruiterDrive[]>(MOCK_RECRUITER_DRIVES);
  const [isCreateDriveModalOpen, setIsCreateDriveModalOpen] = useState(false);
  const [driveTitle, setDriveTitle] = useState("");
  const [driveRole, setDriveRole] = useState("Software Engineer I (Cloud Solutions)");
  const [driveCtc, setDriveCtc] = useState("₹32.0 LPA");
  const [driveLocation, setDriveLocation] = useState("Bengaluru / Hyderabad");

  // View Drive Applicants Modal State
  const [selectedDriveForApplicants, setSelectedDriveForApplicants] = useState<RecruiterDrive | null>(null);
  const [isApplicantsModalOpen, setIsApplicantsModalOpen] = useState(false);

  const handleCreateDriveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDrive: RecruiterDrive = {
      id: `DRV-GGL-${Date.now().toString().slice(-3)}`,
      driveCode: `DRV-2026-GGL-0${drivesList.length + 1}`,
      title: driveTitle || "Google Cloud Systems & AI Placement Drive",
      role: driveRole,
      ctc: driveCtc,
      location: driveLocation,
      applicationsCount: 150,
      shortlistedCount: 120,
      interviewedCount: 0,
      offersCount: 0,
      status: "Active Registration",
      progressPct: 25,
    };

    setDrivesList((prev) => [newDrive, ...prev]);
    setIsCreateDriveModalOpen(false);
    setDriveTitle("");
    toast.success(`Successfully launched placement drive: ${newDrive.title}!`);
  };

  // Interview Management & Scorecard State
  const [interviewList, setInterviewList] = useState<InterviewCandidate[]>(MOCK_INTERVIEW_CANDIDATES);

  // Schedule Interview Form State
  const [isScheduleInterviewModalOpen, setIsScheduleInterviewModalOpen] = useState(false);
  const [schedCandName, setSchedCandName] = useState("");
  const [schedRollNo, setSchedRollNo] = useState("");
  const [schedDept, setSchedDept] = useState("CSE");
  const [schedSlotTime, setSchedSlotTime] = useState("10:00 AM – 10:45 AM");
  const [schedPanel, setSchedPanel] = useState("Panel 1 (Cloud Core)");
  const [schedInterviewer, setSchedInterviewer] = useState("David Miller (Staff Recruiter)");
  const [schedMeetUrl, setSchedMeetUrl] = useState("https://meet.google.com/ggl-recruiter-01");

  // Scorecard Modal State
  const [isScorecardModalOpen, setIsScorecardModalOpen] = useState(false);
  const [selectedScorecardCand, setSelectedScorecardCand] = useState<InterviewCandidate | null>(null);
  const [scorecardRating, setScorecardRating] = useState("90");
  const [scorecardStatus, setScorecardStatus] = useState<"Recommended" | "Scheduled" | "Completed" | "Rejected">("Recommended");
  const [scorecardRemarks, setScorecardRemarks] = useState("");

  const handleCreateInterviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCand: InterviewCandidate = {
      id: `INT-${Date.now().toString().slice(-3)}`,
      name: schedCandName || "Kavya Patel",
      rollNo: schedRollNo || `2023${schedDept}045`,
      department: schedDept,
      cgpa: 8.8,
      slotTime: schedSlotTime,
      panelAssigned: schedPanel,
      interviewer: schedInterviewer,
      status: "Scheduled",
      feedbackRemarks: "Interview slot scheduled. Awaiting interviewer evaluation.",
    };

    setInterviewList((prev) => [newCand, ...prev]);
    setIsScheduleInterviewModalOpen(false);
    setSchedCandName("");
    setSchedRollNo("");
    toast.success(`Successfully scheduled interview slot for ${newCand.name}!`);
  };

  const handleSaveScorecardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScorecardCand) return;

    const marksNum = parseInt(scorecardRating) || 85;
    setInterviewList((prev) =>
      prev.map((c) =>
        c.id === selectedScorecardCand.id
          ? {
              ...c,
              scorecardMarks: marksNum,
              status: scorecardStatus,
              feedbackRemarks: scorecardRemarks || "Evaluated by recruiter panel.",
            }
          : c
      )
    );

    setIsScorecardModalOpen(false);
    setSelectedScorecardCand(null);
    toast.success(`Updated interview scorecard for ${selectedScorecardCand.name}!`);
  };

  // Offer Management State
  const [offerList, setOfferList] = useState<CandidateOffer[]>(MOCK_CANDIDATE_OFFERS);

  // Upload Offer Form State
  const [isUploadOfferModalOpen, setIsUploadOfferModalOpen] = useState(false);
  const [offerCandName, setOfferCandName] = useState("");
  const [offerRollNo, setOfferRollNo] = useState("");
  const [offerDept, setOfferDept] = useState("CSE");
  const [offerJobRole, setOfferJobRole] = useState("Software Engineer I (Cloud Solutions)");
  const [offerCtc, setOfferCtc] = useState("₹32.0 LPA");
  const [offerJoiningDate, setOfferJoiningDate] = useState("2026-09-01");
  const [offerLocation, setOfferLocation] = useState("Bengaluru, KA");
  const [uploadedPdfName, setUploadedPdfName] = useState("");

  // View/Download Offer Modal State
  const [selectedViewOffer, setSelectedViewOffer] = useState<CandidateOffer | null>(null);
  const [isViewOfferModalOpen, setIsViewOfferModalOpen] = useState(false);

  const handleUploadOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOffer: CandidateOffer = {
      id: `OFR-${Date.now().toString().slice(-3)}`,
      candidateName: offerCandName || "Kavya Patel",
      rollNo: offerRollNo || `2023${offerDept}045`,
      department: offerDept,
      jobRole: offerJobRole,
      ctc: offerCtc,
      joiningDate: offerJoiningDate || "2026-09-01",
      location: offerLocation,
      offerStatus: "Verification Pending",
    };

    setOfferList((prev) => [newOffer, ...prev]);
    setIsUploadOfferModalOpen(false);
    setOfferCandName("");
    setOfferRollNo("");
    setUploadedPdfName("");
    toast.success(`Successfully uploaded corporate offer letter for ${newOffer.candidateName}!`);
  };

  const handleDownloadOfferDocument = (ofr: CandidateOffer) => {
    const documentText = `========================================================================
                    GOOGLE CLOUD INDIA - CORPORATE OFFER LETTER
========================================================================

Date: ${new Date().toLocaleDateString()}
Offer Reference ID: ${ofr.id}

To:
Candidate Name : ${ofr.candidateName}
Student ID / Roll No: ${ofr.rollNo}
Department      : ${ofr.department}

Dear ${ofr.candidateName},

We are pleased to extend an offer of employment for the position of:
Designation     : ${ofr.jobRole}
Offered CTC     : ${ofr.ctc} (Per Annum)
Work Location   : ${ofr.location}
Expected Joining Date : ${ofr.joiningDate}

Status: ${ofr.offerStatus}

Sincerely,
Corporate HR Recruitment Team
Google Cloud Systems India Pvt Ltd
Bengaluru, Karnataka
========================================================================`;

    const blob = new Blob([documentText], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Official_Offer_Letter_${ofr.rollNo}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded official offer letter document for ${ofr.candidateName}!`);
  };

  const handleExportRecruiterReportCsv = () => {
    const headers = "Placement Drive Title,Target Batch,Registered / Attempted,Assessment Passed,Interview Shortlisted,Offers Extended,Conversion Rate Pct\n";
    const rows = [
      '"Google Cloud Systems & Coding Assessment 2026","2026 CSE/CSM/ECE","150","45","20","12","8.0%"',
      '"Google Cloud AI & Machine Learning Drive","2026 CSE/CSM","120","38","18","10","8.3%"',
      '"Google Infrastructure Engineering Round","2026 ECE/EEE","72","22","10","5","6.9%"',
    ].join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "recruiter_campus_hiring_analytics_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Downloaded Recruiter Campus Hiring Analytics CSV report!");
  };

  // Notifications State & Activity Stream
  const INITIAL_NOTIFICATIONS = [
    {
      id: "NOTIF-01",
      title: "Assessment Drive Approved by TPO",
      message: "Placement Officer Dr. Ramesh Kumar approved 'Google Cloud Systems & Coding Assessment 2026' for campus drive execution.",
      timestamp: "10 Mins Ago",
      category: "TPO Approvals",
      isUnread: true,
      targetModule: "assessment-requests",
    },
    {
      id: "NOTIF-02",
      title: "New Student Test Submission Received",
      message: "Candidate 23341a4229@college.edu.in submitted 'Google Cloud Systems & Coding Assessment 2026' with 90% score (18/20 MCQ, 45/50 Coding).",
      timestamp: "25 Mins Ago",
      category: "Submissions",
      isUnread: true,
      targetModule: "reports",
    },
    {
      id: "NOTIF-03",
      title: "Corporate Offer Letter Accepted",
      message: "Aditya Sharma (2022CSE188) formally accepted the Software Engineer I offer letter of ₹32.0 LPA!",
      timestamp: "1 Hour Ago",
      category: "Offers",
      isUnread: true,
      targetModule: "offers",
    },
    {
      id: "NOTIF-04",
      title: "Assessment Changes Requested by TPO",
      message: "TPO requested updates on 'Google Cloud Infrastructure MCQ Test' - Please include 2 SQL database problems.",
      timestamp: "3 Hours Ago",
      category: "TPO Approvals",
      isUnread: false,
      targetModule: "assessment-requests",
    },
    {
      id: "NOTIF-05",
      title: "Interview Slot Confirmed",
      message: "Interview slot confirmed for Sneha Reddy (2022ECE042) on Panel 1 (Cloud Core) for 02:00 PM.",
      timestamp: "5 Hours Ago",
      category: "Interviews",
      isUnread: false,
      targetModule: "interviews",
    },
  ];

  const [notificationsList, setNotificationsList] = useState(INITIAL_NOTIFICATIONS);
  const [notifFilterTab, setNotifFilterTab] = useState<"All" | "Unread" | "TPO Approvals" | "Submissions" | "Offers">("All");

  const handleMarkAllAsRead = () => {
    setNotificationsList((prev) => prev.map((n) => ({ ...n, isUnread: false })));
    toast.success("Marked all recruiter notifications as read!");
  };

  const handleDeleteNotification = (id: string) => {
    setNotificationsList((prev) => prev.filter((n) => n.id !== id));
    toast.success("Dismissed notification.");
  };

  // Support Tickets State
  interface SupportTicketItem {
    id: string;
    subject: string;
    category: string;
    priority: "High" | "Medium" | "Low";
    status: string;
    createdDate: string;
    assignedAgent: string;
    description: string;
  }

  const MOCK_SUPPORT_TICKETS: SupportTicketItem[] = [
    {
      id: "TCK-801",
      subject: "Proctoring Auto-Submit Audit Request for Candidate 2022CSE104",
      category: "Assessment Proctoring",
      priority: "High",
      status: "In Progress",
      createdDate: "2026-08-01",
      assignedAgent: "TPO Tech Desk (Mr. Suresh Nair)",
      description: "Candidate reached tab switch limit during Google Cloud Systems test. Requesting TPO manual review log.",
    },
    {
      id: "TCK-802",
      subject: "Campus Placement Interview Slot Schedule Confirmation",
      category: "Interview Scheduling",
      priority: "Medium",
      status: "Resolved",
      createdDate: "2026-07-30",
      assignedAgent: "Placement Officer (Dr. Ramesh Kumar)",
      description: "Confirmed Google Meet room links and interviewer panel assignments for Aug 05 drive.",
    },
  ];

  const [supportTickets, setSupportTickets] = useState<SupportTicketItem[]>(MOCK_SUPPORT_TICKETS);
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("Assessment Proctoring");
  const [ticketPriority, setTicketPriority] = useState<"High" | "Medium" | "Low">("High");
  const [ticketDescription, setTicketDescription] = useState("");

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket: SupportTicketItem = {
      id: `TCK-${Math.floor(100 + Math.random() * 900)}`,
      subject: ticketSubject || "Corporate Placement Query",
      category: ticketCategory,
      priority: ticketPriority,
      status: "Open",
      createdDate: new Date().toISOString().slice(0, 10),
      assignedAgent: "TPO Support Helpdesk",
      description: ticketDescription || "Query submitted to college placement administration.",
    };

    setSupportTickets((prev) => [newTicket, ...prev]);
    setIsCreateTicketModalOpen(false);
    setTicketSubject("");
    setTicketDescription("");
    toast.success(`Submitted support ticket ${newTicket.id} to Placement Helpdesk!`);
  };

  // Preview Assessment Modal State
  const [selectedPreviewAst, setSelectedPreviewAst] = useState<RecruiterAssessment | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [candidateSimulationMode, setCandidateSimulationMode] = useState(false);
  const [tabViolationCount, setTabViolationCount] = useState(0);
  const [isAutoSubmitted, setIsAutoSubmitted] = useState(false);
  const simulationContainerRef = useRef<HTMLDivElement>(null);
  const [selectedCompilerLangs, setSelectedCompilerLangs] = useState<Record<string, string>>({
    "CODING-01": "Java 17",
    "CODING-02": "Python 3.11",
  });

  // Edit Assessment Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingAst, setEditingAst] = useState<RecruiterAssessment | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editType, setEditType] = useState<"MCQ + Coding + SQL" | "Coding Only" | "Aptitude & MCQ">("MCQ + Coding + SQL");
  const [editDuration, setEditDuration] = useState("");
  const [editPassingPct, setEditPassingPct] = useState("");

  // Audit Timeline Modal State
  const [selectedAuditAst, setSelectedAuditAst] = useState<RecruiterAssessment | null>(null);
  const [isAuditTimelineModalOpen, setIsAuditTimelineModalOpen] = useState(false);

  // Send Test to TPO Modal State
  const [isSendToTpoModalOpen, setIsSendToTpoModalOpen] = useState(false);
  const [sendToTpoAst, setSendToTpoAst] = useState<RecruiterAssessment | null>(null);
  const [sendTpoName, setSendTpoName] = useState("Dr. Ramesh Kumar");
  const [sendTpoEmail, setSendTpoEmail] = useState("tpo@nitk.edu.in");
  const [sendMessage, setSendMessage] = useState("");
  const [sendDeadline, setSendDeadline] = useState("");
  const [generatedTestLink, setGeneratedTestLink] = useState("");
  const [isSendSuccess, setIsSendSuccess] = useState(false);

  // Question View Detail Modal State
  const [selectedViewQuestion, setSelectedViewQuestion] = useState<{
    id: string;
    type: "MCQ" | "Coding" | "SQL";
    subject: string;
    title: string;
    optionsOrConstraints: string;
    difficulty: "Easy" | "Medium" | "Hard";
    marks: number;
  } | null>(null);
  const [isViewQuestionModalOpen, setIsViewQuestionModalOpen] = useState(false);

  // Question Bank & Bulk Upload State
  const [qbList, setQbList] = useState(INITIAL_QUESTION_BANK);
  const [qbCounts, setQbCounts] = useState({ mcq: 80, coding: 42, sql: 20, total: 142 });
  const [qbSearchQuery, setQbSearchQuery] = useState("");
  const [qbFilterTab, setQbFilterTab] = useState<"All" | "MCQ" | "Coding" | "SQL">("All");
  const [qbSubjectFilter, setQbSubjectFilter] = useState("All");

  // Bulk Upload Modal State
  const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<Array<{
    id: string;
    type: "MCQ" | "Coding" | "SQL";
    subject: "Verbal Ability" | "Logical Reasoning" | "Quantitative Aptitude" | "Data Structures & Algorithms" | "Database Management Systems (DBMS)" | "Core Systems (OS & Networks)";
    title: string;
    optionsOrConstraints: string;
    difficulty: "Easy" | "Medium" | "Hard";
    marks: number;
  }>>([]);

  // Create Assessment Question Bank Auto-Generator State
  const [newAstMcqCount, setNewAstMcqCount] = useState("20");
  const [newAstMcqSubject, setNewAstMcqSubject] = useState("Data Structures & Algorithms");
  const [newAstCodingCount, setNewAstCodingCount] = useState("2");
  const [newAstCodingSubject, setNewAstCodingSubject] = useState("Data Structures & Algorithms");
  const [isPaperAutoGenerated, setIsPaperAutoGenerated] = useState(false);
  const [isPreviewPaperModalOpen, setIsPreviewPaperModalOpen] = useState(false);
  const [dispatchedAstIds, setDispatchedAstIds] = useState<Record<string, boolean>>({});

  // Placement Portal Preview States
  const [previewSearchQuery, setPreviewSearchQuery] = useState("");
  const [previewDiffFilter, setPreviewDiffFilter] = useState<"All" | "Easy" | "Medium" | "Hard">("All");
  const [previewSectionFilter, setPreviewSectionFilter] = useState<"All" | "Aptitude" | "Technical" | "Coding">("All");
  const [expandedExplanations, setExpandedExplanations] = useState<Record<number, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    aptitude: true,
    technical: true,
    coding: true,
  });

  const [paperBreakdown, setPaperBreakdown] = useState({


    easyMcq: 8,
    mediumMcq: 8,
    hardMcq: 4,
    easyCoding: 1,
    mediumCoding: 1,
    hardCoding: 0,
    totalQuestions: 22,
    totalMarks: 70,
  });

  const handleAutoGeneratePaper = () => {
    const mcqs = parseInt(newAstMcqCount) || 20;
    const codings = parseInt(newAstCodingCount) || 2;

    const easyM = Math.round(mcqs * 0.4);
    const medM = Math.round(mcqs * 0.4);
    const hardM = mcqs - easyM - medM;

    const easyC = Math.ceil(codings / 2);
    const medC = codings - easyC;
    const hardC = 0;

    const totQ = mcqs + codings;
    const totM = mcqs * 1 + codings * 25;

    setPaperBreakdown({
      easyMcq: easyM,
      mediumMcq: medM,
      hardMcq: hardM,
      easyCoding: easyC,
      mediumCoding: medC,
      hardCoding: hardC,
      totalQuestions: totQ,
      totalMarks: totM,
    });
    setIsPaperAutoGenerated(true);

    toast.success(`🎉 Auto-picked ${mcqs} MCQs (${newAstMcqSubject}) & ${codings} Coding Problems (${newAstCodingSubject}) from Question Bank! Difficulty: 40% Easy, 40% Medium, 20% Hard.`);
  };

  const handleDownloadPaperPdf = (astTitle?: string) => {
    const title = astTitle || newAstTitle || "Google Cloud Technical Placement Assessment 2026";
    const mcqSubject = newAstMcqSubject || "Data Structures & Algorithms";
    const codingSubject = newAstCodingSubject || "Data Structures & Algorithms";

    let docText = `================================================================================\n`;
    docText += `OFFICIAL TPO EXAMINATION QUESTION PAPER (CONFIDENTIAL)\n`;
    docText += `Assessment Title: ${title}\n`;
    docText += `Date: ${new Date().toLocaleDateString("en-IN")}\n`;
    docText += `MCQ Domain: ${mcqSubject} (${newAstMcqCount || 20} Questions)\n`;
    docText += `Coding Domain: ${codingSubject} (${newAstCodingCount || 2} Problems)\n`;
    docText += `Total Marks: ${paperBreakdown.totalMarks} Marks | Duration: ${newAstDuration || "90 Mins"}\n`;
    docText += `================================================================================\n\n`;

    docText += `SECTION A: TECHNICAL & APTITUDE MCQS (20 QUESTIONS)\n--------------------------------------------------------------------------------\n\n`;

    const sampleMcqs = [
      { q: "What is the time complexity of searching an element in a balanced AVL Binary Search Tree?", opt: ["A) O(N)", "B) O(log N)", "C) O(N log N)", "D) O(1)"], ans: "B) O(log N)" },
      { q: "Which graph traversal algorithm uses a Queue data structure to explore vertices level by level?", opt: ["A) BFS", "B) DFS", "C) Dijkstra", "D) Topological"], ans: "A) BFS" },
      { q: "In relational database indexing, what prevents B+ Tree leaves from becoming unbalanced during random inserts?", opt: ["A) Table locking", "B) Automatic hashing", "C) Node splitting", "D) Compaction"], ans: "C) Node splitting" },
      { q: "What algorithm is used to detect deadlocks in an operating system resource allocation graph?", opt: ["A) Banker's Algorithm", "B) Round Robin", "C) SJF", "D) Peterson"], ans: "A) Banker's Algorithm" },
      { q: "Which data structure is optimal for evaluating infix/postfix arithmetic expressions?", opt: ["A) Stack", "B) Queue", "C) Priority Queue", "D) HashMap"], ans: "A) Stack" },
    ];

    sampleMcqs.forEach((m, idx) => {
      docText += `Q${idx + 1}. ${m.q}\n`;
      m.opt.forEach((o) => (docText += `   ${o}\n`));
      docText += `   [Correct Answer: ${m.ans}]\n\n`;
    });

    docText += `\nSECTION B: LIVE CODING CHALLENGES (2 PROBLEMS)\n--------------------------------------------------------------------------------\n\n`;
    docText += `Problem 1: Distributed Cache Eviction (LRU-K Policy) [20 Marks]\n`;
    docText += `Statement: Implement an LRU-K cache eviction strategy.\n`;
    docText += `Sample Test Case: Input: Capacity = 3, K = 2 -> Output: Evicted Node ID = 2\n\n`;

    docText += `Problem 2: Optimal Cloud Subgraph Network Connectivity [30 Marks]\n`;
    docText += `Statement: Calculate the minimum cost MST subtree connecting all nodes under fault tolerance K.\n`;
    docText += `Sample Test Case: Input: Nodes = 5, Edges = 7, K = 1 -> Output: Cost = 1420\n\n`;
    docText += `================================================================================\nEND OF QUESTION PAPER - TPO AUDIT CERTIFIED\n`;

    const blob = new Blob([docText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Question_Paper_${title.replaceAll(" ", "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Downloaded official Question Paper document for "${title}"!`);
  };

  const handlePrintPaper = () => {
    window.print();
  };



  const handleDownloadSampleCsv = () => {
    const sampleHeaders = "Subject,Question Type,Title / Problem Statement,Options / Constraints,Difficulty,Marks\n";
    const sampleRows = [
      '"Data Structures & Algorithms","Coding","Implement LRU-K Cache Eviction Policy","Java 17, Python 3.11, C++ 20","Hard","20"',
      '"Database Management Systems (DBMS)","SQL","Top 5 Revenue Accounts Window Function","PostgreSQL 15 / MySQL 8","Medium","10"',
      '"Operating Systems","MCQ","Bankers Algorithm Deadlock State Matrix","A. Safe B. Unsafe C. Deadlock D. Blocked","Medium","1"',
      '"Computer Networks","MCQ","TCP 3-Way Handshake SYN-ACK Sequence","4 Options","Medium","1"',
      '"Aptitude & Reasoning","MCQ","Permutations for Distributed Nodes","4 Options","Easy","1"',
    ].join("\n");
    const blob = new Blob([sampleHeaders + sampleRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "sample_question_bank_upload.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Downloaded sample CSV template with Subjects!");
  };

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n").filter((line) => line.trim() !== "");
      const parsed: Array<{
        id: string;
        type: "MCQ" | "Coding" | "SQL";
        subject: "Verbal Ability" | "Logical Reasoning" | "Quantitative Aptitude" | "Data Structures & Algorithms" | "Database Management Systems (DBMS)" | "Core Systems (OS & Networks)";
        title: string;
        optionsOrConstraints: string;
        difficulty: "Easy" | "Medium" | "Hard";
        marks: number;
      }> = [];

      const dataLines = lines.length > 1 && lines[0]!.toLowerCase().includes("subject") ? lines.slice(1) : lines;
      dataLines.forEach((line, idx) => {
        const cols = line.split(",").map((c) => c.replace(/^"|"$/g, "").trim());
        if (cols.length >= 2) {
          const rawSubject = cols[0] || "Data Structures & Algorithms";
          let subject: "Verbal Ability" | "Logical Reasoning" | "Quantitative Aptitude" | "Data Structures & Algorithms" | "Database Management Systems (DBMS)" | "Core Systems (OS & Networks)" = "Data Structures & Algorithms";
          if (rawSubject.includes("Verbal")) subject = "Verbal Ability";
          else if (rawSubject.includes("Logical")) subject = "Logical Reasoning";
          else if (rawSubject.includes("Quantitative") || rawSubject.includes("Aptitude")) subject = "Quantitative Aptitude";
          else if (rawSubject.includes("DBMS") || rawSubject.includes("Database")) subject = "Database Management Systems (DBMS)";
          else if (rawSubject.includes("Core") || rawSubject.includes("Operating") || rawSubject.includes("OS") || rawSubject.includes("Networks")) subject = "Core Systems (OS & Networks)";

          const rawType = (cols[1] || "MCQ").toUpperCase();
          const type: "MCQ" | "Coding" | "SQL" = rawType.includes("CODING") ? "Coding" : rawType.includes("SQL") ? "SQL" : "MCQ";
          parsed.push({
            id: `QB-UP-${Date.now()}-${idx}`,
            type,
            subject,
            title: cols[2] || cols[1] || `Uploaded Question ${idx + 1}`,
            optionsOrConstraints: cols[3] || "Standard options / constraints",
            difficulty: (cols[4] as any) || (type === "Coding" ? "Hard" : "Medium"),
            marks: parseInt(cols[5] || "10") || (type === "Coding" ? 20 : 1),
          });
        }
      });

      if (parsed.length === 0) {
        setParsedQuestions([
          { id: `QB-UP-1`, type: "Coding", subject: "Data Structures & Algorithms", title: "Rate Limiter Leaky Bucket Algorithm", optionsOrConstraints: "Java 17, Python 3.11", difficulty: "Medium", marks: 20 },
          { id: `QB-UP-2`, type: "SQL", subject: "Database Management Systems (DBMS)", title: "Monthly Recurring Revenue (MRR) Churn Rate", optionsOrConstraints: "PostgreSQL 15", difficulty: "Hard", marks: 15 },
          { id: `QB-UP-3`, type: "MCQ", subject: "Core Systems (OS & Networks)", title: "Process Control Block (PCB) Context Switch Latency", optionsOrConstraints: "4 Options", difficulty: "Medium", marks: 1 },
        ]);
      } else {
        setParsedQuestions(parsed);
      }
      toast.success(`Parsed ${parsed.length || 3} questions divided by subjects!`);
    };
    reader.readAsText(file);
  };

  const handleCommitImport = () => {
    const listToImport = parsedQuestions.length > 0 ? parsedQuestions : [
      { id: `QB-UP-1`, type: "Coding" as const, subject: "Data Structures & Algorithms" as const, title: "Rate Limiter Leaky Bucket Algorithm", optionsOrConstraints: "Java 17, Python 3.11", difficulty: "Medium" as const, marks: 20 },
      { id: `QB-UP-2`, type: "SQL" as const, subject: "Database Management Systems (DBMS)" as const, title: "Monthly Recurring Revenue (MRR) Churn Rate", optionsOrConstraints: "PostgreSQL 15", difficulty: "Hard" as const, marks: 15 },
      { id: `QB-UP-3`, type: "MCQ" as const, subject: "Core Systems (OS & Networks)" as const, title: "Process Control Block (PCB) Context Switch Latency", optionsOrConstraints: "4 Options", difficulty: "Medium" as const, marks: 1 },
    ];

    const mcqAdded = listToImport.filter((q) => q.type === "MCQ").length;
    const codingAdded = listToImport.filter((q) => q.type === "Coding").length;
    const sqlAdded = listToImport.filter((q) => q.type === "SQL").length;
    const totalAdded = listToImport.length;

    setQbList((prev) => [...listToImport, ...prev]);
    setQbCounts((prev) => ({
      mcq: prev.mcq + mcqAdded,
      coding: prev.coding + codingAdded,
      sql: prev.sql + sqlAdded,
      total: prev.total + totalAdded,
    }));

    setIsBulkUploadModalOpen(false);
    setUploadedFile(null);
    setParsedQuestions([]);
    toast.success(`Successfully imported and indexed ${totalAdded} new questions into Google Cloud Bank!`);
  };

  const handleCreateAssessmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mcqCnt = parseInt(newAstMcqCount) || 20;
    const codingCnt = parseInt(newAstCodingCount) || 2;

    const newAst: RecruiterAssessment = {
      id: `AST-GGL-${Date.now().toString().slice(-3)}`,
      title: newAstTitle || `Google Cloud ${newAstMcqSubject} Assessment`,
      type: newAstType,
      mcqCount: mcqCnt,
      codingCount: codingCnt,
      sqlCount: 0,
      duration: newAstDuration || "90 Mins",
      totalMarks: paperBreakdown.totalMarks || 70,
      passingMarksPct: parseInt(newAstPassingPct) || 75,
      version: "v1.0",
      requestStatus: "Submitted",
      reviewerNotes: `Auto-generated from Question Bank: ${mcqCnt} MCQs (${newAstMcqSubject}) & ${codingCnt} Coding Problems (${newAstCodingSubject}). Difficulty: 40% Easy, 40% Medium, 20% Hard.`,
      lastUpdated: "Just now",
    };


    MOCK_RECRUITER_ASSESSMENTS.unshift(newAst);

    // Push into the shared store so TPO sees it immediately
    const reqId = `REQ-${Date.now().toString().slice(-6)}`;
    pushToSharedQueue({
      id: reqId,
      assessmentId: newAst.id,
      name: newAst.title,
      recruiterName: "David Miller (Staff Recruiter)",
      recruiterEmail: "david.miller@google.com",
      company: companyName,
      companyLogoBg: "bg-blue-600",
      assessmentType: newAst.type as any,
      mcqCount: newAst.mcqCount,
      codingCount: newAst.codingCount,
      sqlCount: newAst.sqlCount,
      totalQuestions: newAst.mcqCount + newAst.codingCount + newAst.sqlCount,
      duration: newAst.duration,
      totalMarks: newAst.totalMarks,
      passingMarksPct: newAst.passingMarksPct,
      submittedDate: new Date().toISOString().split("T")[0]!,
      priority: "High",
      status: "Submitted",
      version: newAst.version,
      expectedCandidates: 100,
      programmingLanguages: ["Java", "Python", "C++"],
      recruiterNotes: `Submitted by David Miller. ${newAst.reviewerNotes}`,
      mcqQuestions: [],
      codingQuestions: [],
      sqlQuestions: [],
      auditTrail: [{
        timestamp: new Date().toLocaleString("en-IN"),
        action: "Submitted",
        actor: "David Miller (Staff Recruiter)",
        notes: "Assessment submitted via Recruiter Portal.",
      }],
      versionHistory: [{
        version: newAst.version,
        date: new Date().toISOString().split("T")[0]!,
        status: "Submitted",
        author: "David Miller",
      }],
    });

    setDispatchedAstIds((prev) => ({ ...prev, [newAst.id]: true }));
    setIsCreateAssessmentModalOpen(false);
    setNewAstTitle("");
    toast.success(`Created & submitted assessment "${newAst.title}" to Placement Officer for approval!`);
  };

  const handleOpenSendToTpo = (ast: RecruiterAssessment) => {
    setSendToTpoAst(ast);
    setSendMessage(`Dear TPO,\n\nWe at Google Cloud India would like to conduct the assessment "${ast.title}" for the upcoming placement drive.\n\nKindly review the test details and schedule the exam at the earliest convenience.\n\nBest regards,\nDavid Miller\nGoogle Cloud India Recruiter`);
    setSendDeadline("");
    setIsSendSuccess(false);
    setGeneratedTestLink("");
    setIsSendToTpoModalOpen(true);
  };

  const handleSendToTpoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendToTpoAst) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:8082";
    const link = `${origin}/exam/take?id=${sendToTpoAst.id}`;
    setGeneratedTestLink(link);
    setIsSendSuccess(true);
    setDispatchedAstIds((prev) => ({ ...prev, [sendToTpoAst.id]: true }));
    toast.success(`Test "${sendToTpoAst.title}" sent to TPO ${sendTpoName} successfully!`);
  };


  // ── SECURITY RESTRICTIONS WHEN SIMULATION MODE IS ACTIVE ─────────────────
  useEffect(() => {
    if (!candidateSimulationMode) return;

    // 1. Request Fullscreen
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});

    // 2. Disable Right-Click
    const blockContextMenu = (e: MouseEvent) => { e.preventDefault(); toast.error("Right-click is disabled during the assessment."); };
    // 3. Disable Copy & Paste
    const blockCopy = (e: ClipboardEvent) => { e.preventDefault(); toast.error("Copy is disabled during the assessment."); };
    const blockPaste = (e: ClipboardEvent) => { e.preventDefault(); toast.error("Paste is disabled during the assessment."); };
    // 4. Disable Refresh (F5, Ctrl+R) and DevTools (Ctrl+Shift+I, F12)
    const blockKeys = (e: KeyboardEvent) => {
      const blocked = (
        e.key === "F5" ||
        e.key === "F12" ||
        (e.ctrlKey && (e.key === "r" || e.key === "R")) ||
        (e.ctrlKey && e.shiftKey && (e.key === "i" || e.key === "I" || e.key === "j" || e.key === "J")) ||
        (e.ctrlKey && (e.key === "u" || e.key === "U"))
      );
      if (blocked) { e.preventDefault(); e.stopPropagation(); toast.error("This action is disabled during the assessment."); }
    };
    // 5. Warn on page leave / refresh
    const blockUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Assessment is in progress. Are you sure you want to leave?";
    };
    // 6. Detect tab switch / window focus loss — auto-submit after 3 violations
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabViolationCount((prev) => {
          const next = prev + 1;
          if (next >= 3) {
            // Auto-submit: show overlay then exit simulation
            toast.error("🚨 Assessment AUTO-SUBMITTED! You exceeded 3 tab-switch violations.", { duration: 8000 });
            setIsAutoSubmitted(true);
            // Remove listeners and exit fullscreen after a short delay
            setTimeout(() => {
              if (document.fullscreenElement && document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
              }
            }, 4000);
          } else {
            toast.error(`⚠️ Tab switch detected! Violation ${next}/3. Assessment will auto-submit at violation 3.`, { duration: 5000 });
          }
          return next;
        });
      }
    };

    document.addEventListener("contextmenu", blockContextMenu);
    document.addEventListener("copy", blockCopy);
    document.addEventListener("paste", blockPaste);
    document.addEventListener("keydown", blockKeys);
    window.addEventListener("beforeunload", blockUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("contextmenu", blockContextMenu);
      document.removeEventListener("copy", blockCopy);
      document.removeEventListener("paste", blockPaste);
      document.removeEventListener("keydown", blockKeys);
      window.removeEventListener("beforeunload", blockUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Exit Fullscreen
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [candidateSimulationMode]);

  const handleDuplicateAssessment = (ast: RecruiterAssessment) => {
    const duplicated: RecruiterAssessment = {
      ...ast,
      id: `AST-GGL-${Date.now().toString().slice(-4)}`,
      title: `${ast.title} (Copy)`,
      version: "v1.0",
      requestStatus: "Submitted",
      reviewerNotes: "Duplicated draft — submitted for review.",
      lastUpdated: "Just now",
    };
    MOCK_RECRUITER_ASSESSMENTS.unshift(duplicated);
    toast.success(`Duplicated "${ast.title}" — new draft created and submitted!`);
  };

  const handleOpenEditModal = (ast: RecruiterAssessment) => {
    setEditingAst(ast);
    setEditTitle(ast.title);
    setEditType(ast.type as any);
    setEditDuration(ast.duration);
    setEditPassingPct(String(ast.passingMarksPct));
    setIsEditModalOpen(true);
  };

  const handleEditAssessmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAst) return;
    const idx = MOCK_RECRUITER_ASSESSMENTS.findIndex((a) => a.id === editingAst.id);
    if (idx !== -1) {
      MOCK_RECRUITER_ASSESSMENTS[idx] = {
        ...MOCK_RECRUITER_ASSESSMENTS[idx]!,
        title: editTitle || editingAst.title,
        type: editType,
        duration: editDuration || editingAst.duration,
        passingMarksPct: parseInt(editPassingPct) || editingAst.passingMarksPct,
        lastUpdated: "Just now",
      };
    }
    setIsEditModalOpen(false);
    setEditingAst(null);
    toast.success(`Assessment "${editTitle}" updated successfully!`);
  };

  const handleDownloadPdfPaper = (ast: RecruiterAssessment) => {
    // Build MCQ lines dynamically from SAMPLE_20_MCQS
    const mcqLines = SAMPLE_20_MCQS.map((mcq, idx) => {
      const optLines = mcq.options
        .map((opt, oIdx) => `    [${String.fromCharCode(65 + oIdx)}] ${opt}${oIdx === mcq.correct ? " [CORRECT]" : ""}`)
        .join("\n");
      return `Q${idx + 1}. ${mcq.question}\n${optLines}`;
    }).join("\n\n");

    // Build Coding Challenge lines dynamically from SAMPLE_2_CODING_CHALLENGES
    const codingLines = SAMPLE_2_CODING_CHALLENGES.map((prob, idx) => {
      const compilerNames = prob.compilers.map((c) => c.name).join(" | ");
      return `Problem ${idx + 1}: ${prob.title} (${prob.marks} Marks)\nTime Limit: ${prob.timeLimit} | Memory Limit: ${prob.memoryLimit}\nSupported Languages: ${compilerNames}\n\nStatement:\n${prob.statement}\n\nSample Input:\n${prob.sampleInput}\n\nSample Output:\n${prob.sampleOutput}`;
    }).join("\n\n--------------------------------------------------------------------------------\n\n");

    // 1. Full text content with all questions
    const content = `
================================================================================
EDUSUITE PRO - OFFICIAL ASSESSMENT QUESTION PAPER
================================================================================
Assessment Title : ${ast.title}
Assessment ID    : ${ast.id}
Version          : ${ast.version}
Type             : ${ast.type}
Duration         : ${ast.duration}
Total Marks      : ${ast.totalMarks} Marks
Passing Cutoff   : ${ast.passingMarksPct}%
Status           : ${ast.requestStatus}
Organization     : Google Cloud India (Placement Drive 2026)
Date Generated   : ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}
================================================================================

INSTRUCTIONS FOR CANDIDATES:
1. Webcam AI Proctoring is enabled. Do NOT switch tabs or exit full-screen mode.
2. Negative marking: -0.25 marks for every incorrect MCQ answer.
3. Coding problems must pass all hidden test cases.
4. Supported Languages: Java, Python, C++, C, C#, Go.

================================================================================
SECTION 1: MCQ APTITUDE & TECHNICAL QUESTIONS (${SAMPLE_20_MCQS.length} Questions | 20 Marks)
================================================================================

${mcqLines}

================================================================================
SECTION 2: CODING CHALLENGES (${SAMPLE_2_CODING_CHALLENGES.length} Problems | 50 Marks)
================================================================================

${codingLines}

================================================================================
END OF QUESTION PAPER - EDUSUITE PRO ENTERPRISE ATS
================================================================================
    `.trim();

    // Download as .txt file
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${ast.title.replace(/[^a-zA-Z0-9]/g, "_")}_Complete_Question_Paper.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // 2. Open formatted Print/Save-as-PDF window with all questions
    const mcqHtml = SAMPLE_20_MCQS.map((mcq, idx) => {
      const optHtml = mcq.options.map((opt, oIdx) =>
        `<div class="option ${oIdx === mcq.correct ? "correct" : ""}">${String.fromCharCode(65 + oIdx)}. ${opt}${oIdx === mcq.correct ? " ✓" : ""}</div>`
      ).join("");
      return `<div class="question"><p class="q-text"><strong>Q${idx + 1}.</strong> ${mcq.question}</p><div class="options">${optHtml}</div></div>`;
    }).join("\n");

    const codingHtml = SAMPLE_2_CODING_CHALLENGES.map((prob, idx) => {
      const compilerBadges = prob.compilers.map((c) => `<span class="lang-badge">${c.name}</span>`).join(" ");
      return `
        <div class="coding-prob">
          <div class="coding-header">
            <span><strong>Problem ${idx + 1}:</strong> ${prob.title}</span>
            <span class="marks-badge">${prob.marks} Marks</span>
          </div>
          <p class="meta">Time Limit: ${prob.timeLimit} &nbsp;|&nbsp; Memory Limit: ${prob.memoryLimit}</p>
          <div class="langs">${compilerBadges}</div>
          <p class="stmt">${prob.statement}</p>
          <div class="io-block">
            <div><strong>Sample Input:</strong><br/><code>${prob.sampleInput.replace(/\n/g, "<br/>")}</code></div>
            <div><strong>Expected Output:</strong><br/><code>${prob.sampleOutput}</code></div>
          </div>
        </div>`;
    }).join("\n");

    const printWin = window.open("", "_blank");
    if (printWin) {
      printWin.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${ast.title} - Complete Question Paper</title>
            <style>
              * { box-sizing: border-box; }
              body { font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; color: #111; line-height: 1.65; font-size: 13px; }
              h1 { font-size: 20px; border-bottom: 3px solid #2563eb; padding-bottom: 8px; color: #1e3a8a; margin-bottom: 4px; }
              .meta-row { display: flex; flex-wrap: wrap; gap: 12px; font-size: 12px; color: #555; margin-bottom: 20px; }
              .meta-row span { background: #f1f5f9; padding: 3px 8px; border-radius: 4px; }
              .section-title { font-weight: bold; font-size: 13px; background: #eff6ff; padding: 7px 12px; margin-top: 28px; margin-bottom: 12px; border-left: 4px solid #2563eb; color: #1e40af; }
              .question { margin-bottom: 16px; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; }
              .q-text { font-weight: 600; margin: 0 0 8px 0; }
              .options { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding-left: 8px; }
              .option { padding: 3px 6px; border-radius: 4px; font-size: 12px; color: #374151; }
              .option.correct { background: #dcfce7; color: #15803d; font-weight: bold; }
              .coding-prob { margin-bottom: 20px; padding: 14px; border: 1px solid #d8b4fe; border-radius: 10px; background: #faf5ff; }
              .coding-header { display: flex; justify-content: space-between; align-items: center; font-size: 14px; font-weight: bold; margin-bottom: 6px; }
              .marks-badge { background: #7c3aed; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; }
              .meta { font-size: 11px; color: #6b7280; margin: 4px 0 8px; }
              .langs { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
              .lang-badge { background: #ede9fe; color: #5b21b6; font-size: 11px; padding: 2px 7px; border-radius: 4px; font-weight: 600; }
              .stmt { font-size: 12px; margin-bottom: 10px; }
              .io-block { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 11px; }
              .io-block code { display: block; background: #f8f8f8; padding: 6px 8px; border-radius: 4px; border: 1px solid #e5e7eb; white-space: pre-wrap; margin-top: 4px; }
              .instructions { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 10px 14px; font-size: 12px; margin-bottom: 20px; }
              .instructions li { margin-bottom: 3px; }
              @media print { body { padding: 15px; } .question, .coding-prob { break-inside: avoid; } }
            </style>
          </head>
          <body>
            <h1>${ast.title} <span style="font-size:13px;background:#dbeafe;color:#1d4ed8;padding:2px 8px;border-radius:4px;font-weight:600">${ast.version}</span></h1>
            <div class="meta-row">
              <span>Type: ${ast.type}</span>
              <span>Duration: ${ast.duration}</span>
              <span>Total Marks: ${ast.totalMarks}</span>
              <span>Passing Cutoff: ${ast.passingMarksPct}%</span>
              <span>Date: ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}</span>
            </div>
            <div class="instructions">
              <strong>Instructions:</strong>
              <ul>
                <li>Webcam AI Proctoring is enabled. Do NOT switch tabs or exit full-screen mode.</li>
                <li>Negative Marking: <strong>−0.25 marks</strong> for each incorrect MCQ answer.</li>
                <li>Coding problems must pass all hidden test cases. Allowed Languages: Java, Python, C++, C, C#, Go.</li>
              </ul>
            </div>

            <div class="section-title">SECTION 1 — MCQ APTITUDE &amp; TECHNICAL QUESTIONS &nbsp;(${SAMPLE_20_MCQS.length} Questions | 20 Marks)</div>
            ${mcqHtml}

            <div class="section-title">SECTION 2 — CODING CHALLENGES &nbsp;(${SAMPLE_2_CODING_CHALLENGES.length} Problems | 50 Marks)</div>
            ${codingHtml}

            <script>window.onload = function() { window.print(); }<\/script>
          </body>
        </html>
      `);
      printWin.document.close();
    }

    toast.success(`Complete question paper (${SAMPLE_20_MCQS.length} MCQs + ${SAMPLE_2_CODING_CHALLENGES.length} Coding) downloaded for "${ast.title}"!`);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* FIRST LOGIN MANDATORY PASSWORD RESET ALERT BANNER */}
      {isFirstLoginPasswordResetRequired && (
        <div className="p-4 rounded-2xl border border-amber-500/50 bg-amber-500/10 text-amber-600 flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 shrink-0" />
            <span><strong>Mandatory Account Action:</strong> You are logged in using a temporary passkey. Please update your account password.</span>
          </div>
          <Button size="sm" onClick={() => setActiveModule("profile-security")} className="bg-amber-600 text-white font-bold text-xs rounded-xl h-8">
            Update Password Now
          </Button>
        </div>
      )}

      {/* RECRUITER ATS TOP BAR HEADER */}
      <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs flex flex-wrap items-center justify-between gap-3 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-blue-600 text-white grid place-items-center font-extrabold text-sm shadow-xs">
            G
          </div>
          <div>
            <h2 className="font-display text-sm font-extrabold text-foreground">Google Cloud Recruiter Portal</h2>
            <span className="text-[0.68rem] font-mono text-muted-foreground">Corporate HR Partner • David Miller (Staff Recruiter)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono text-[0.65rem]">
            ● Verified Corporate HR
          </Badge>
          <Badge variant="outline" className="font-mono text-[0.65rem] capitalize">
            Active Workspace: {activeModule.replace("-", " ")}
          </Badge>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 1. EXECUTIVE RECRUITER DASHBOARD                                      */}
      {/* ===================================================================== */}
      {activeModule === "dashboard" && (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            {[
              { label: "Active Drives", val: "2 Drives", desc: "Google Cloud 2026", color: "text-blue-600 bg-blue-500/10" },
              { label: "Total Applications", val: "580", desc: "Registered Students", color: "text-purple-600 bg-purple-500/10" },
              { label: "Approved Tests", val: "1 Test", desc: "Ready for Session", color: "text-emerald-600 bg-emerald-500/10" },
              { label: "Pending Requests", val: "1 Test", desc: "Awaiting TPO", color: "text-amber-600 bg-amber-500/10" },
              { label: "Interviews Booked", val: "48 Slots", desc: "Panels Assigned", color: "text-indigo-600 bg-indigo-500/10" },
              { label: "Offers Released", val: "14 Offers", desc: "₹32.0 LPA Package", color: "text-emerald-600 bg-emerald-500/10" },
            ].map((kpi) => (
              <div key={kpi.label} className="p-4 rounded-2xl border border-border/70 bg-card space-y-1 shadow-xs">
                <span className="text-[0.68rem] font-semibold text-muted-foreground block truncate">{kpi.label}</span>
                <p className="font-display text-2xl font-extrabold">{kpi.val}</p>
                <span className={`text-[0.62rem] font-mono px-2 py-0.5 rounded-md inline-block ${kpi.color}`}>{kpi.desc}</span>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Panel
                title="Active Recruitment Drives Overview"
                action={
                  <Button size="sm" onClick={() => setActiveModule("placement-drives")} className="h-8 text-xs rounded-xl cursor-pointer">
                    Manage Drives
                  </Button>
                }
              >
                <div className="space-y-3 pt-1">
                  {MOCK_RECRUITER_DRIVES.map((drv) => (
                    <div key={drv.id} className="p-4 rounded-2xl border border-border/70 bg-card space-y-3 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-600 text-white text-[0.65rem]">{drv.driveCode}</Badge>
                          <h4 className="font-sans font-bold text-foreground text-sm">{drv.title}</h4>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-600 text-[0.65rem]">● {drv.status}</Badge>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-4 text-muted-foreground pt-1">
                        <div>Applications: <strong className="text-foreground">{drv.applicationsCount}</strong></div>
                        <div>Shortlisted: <strong className="text-purple-600">{drv.shortlistedCount}</strong></div>
                        <div>Interviews: <strong className="text-blue-600">{drv.interviewedCount}</strong></div>
                        <div>Offers: <strong className="text-emerald-600">{drv.offersCount}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>

            <div className="space-y-6">
              <Panel title="Quick ATS Actions">
                <div className="space-y-2 pt-1">
                  <Button onClick={() => setIsCreateAssessmentModalOpen(true)} className="w-full justify-start h-9 text-xs rounded-xl bg-brand-gradient shadow-glow cursor-pointer gap-2 font-bold">
                    <Plus className="size-4" /> + Create New Assessment
                  </Button>
                  <Button onClick={() => setActiveModule("question-bank")} variant="outline" className="w-full justify-start h-9 text-xs rounded-xl cursor-pointer gap-2">
                    <Database className="size-4 text-purple-600" /> Open Question Bank
                  </Button>
                  <Button onClick={() => setActiveModule("interviews")} variant="outline" className="w-full justify-start h-9 text-xs rounded-xl cursor-pointer gap-2">
                    <Video className="size-4 text-blue-600" /> Schedule Interview Panels
                  </Button>
                  <Button onClick={() => setActiveModule("offers")} variant="outline" className="w-full justify-start h-9 text-xs rounded-xl cursor-pointer gap-2">
                    <Award className="size-4 text-emerald-600" /> Upload Candidate Offer Letter
                  </Button>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 2. PLACEMENT DRIVES WORKSPACE                                         */}
      {/* ===================================================================== */}
      {activeModule === "placement-drives" && (
        <div className="space-y-6">
          <Panel
            title="Corporate Campus Recruitment Drives Management"
            action={
              <Button onClick={() => setIsCreateDriveModalOpen(true)} className="bg-brand-gradient shadow-glow font-bold text-xs rounded-xl h-8 cursor-pointer gap-1.5">
                <Plus className="size-3.5" /> + Launch New Placement Drive
              </Button>
            }
          >
            <div className="space-y-6 pt-1 font-sans">
              {/* DRIVES GRID CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {drivesList.map((drv) => (
                  <div key={drv.id} className="p-5 rounded-2xl border bg-card space-y-4 shadow-xs hover:border-primary/40 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600 text-white text-[0.65rem] font-mono">{drv.driveCode}</Badge>
                        <Badge className="bg-emerald-500/10 text-emerald-600 text-[0.65rem]">● {drv.status}</Badge>
                      </div>
                      <span className="font-extrabold text-emerald-600 text-sm font-mono">{drv.ctc}</span>
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-extrabold text-foreground text-base">{drv.title}</h3>
                      <p className="text-xs text-muted-foreground font-mono">Role: <strong className="text-foreground">{drv.role}</strong> • Location: {drv.location}</p>
                    </div>

                    {/* CONVERSION & APPLICATIONS SUMMARY */}
                    <div className="grid grid-cols-4 gap-2 p-3 rounded-xl bg-muted/30 border text-center font-mono text-[0.7rem]">
                      <div>
                        <span className="text-muted-foreground text-[0.62rem] block">Applied</span>
                        <strong className="text-foreground text-sm font-sans font-extrabold">{drv.applicationsCount}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-[0.62rem] block">Shortlisted</span>
                        <strong className="text-purple-600 text-sm font-sans font-extrabold">{drv.shortlistedCount}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-[0.62rem] block">Interviewed</span>
                        <strong className="text-blue-600 text-sm font-sans font-extrabold">{drv.interviewedCount}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground text-[0.62rem] block">Offers</span>
                        <strong className="text-emerald-600 text-sm font-sans font-extrabold">{drv.offersCount}</strong>
                      </div>
                    </div>

                    {/* PROGRESS BAR */}
                    <div className="space-y-1 text-[0.68rem] font-mono">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Drive Completion Milestone</span>
                        <span className="font-bold text-foreground">{drv.progressPct}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-brand-gradient rounded-full" style={{ width: `${drv.progressPct}%` }} />
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex items-center justify-between pt-1 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedDriveForApplicants(drv);
                          setIsApplicantsModalOpen(true);
                        }}
                        className="h-8 text-xs rounded-xl cursor-pointer gap-1"
                      >
                        <Users className="size-3.5 text-purple-600" /> View Applicants ({drv.applicationsCount})
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setIsCreateAssessmentModalOpen(true)}
                        className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl cursor-pointer gap-1"
                      >
                        <Plus className="size-3.5" /> Create Assessment
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. COMPANY PROFILE WORKSPACE                                          */}
      {/* ===================================================================== */}
      {activeModule === "company-profile" && (
        <div className="space-y-6">
          <Panel title="Corporate Company Workspace & Verification Status">
            <div className="space-y-4 pt-1 text-xs font-mono">
              <div className="flex items-center gap-4 border-b border-border pb-4">
                <div className="size-16 rounded-2xl bg-blue-600 text-white grid place-items-center font-extrabold text-2xl shadow-glow">
                  G
                </div>
                <div>
                  <h3 className="font-display text-lg font-extrabold text-foreground">{companyName}</h3>
                  <Badge className="bg-emerald-600 text-white text-[0.65rem]">● Verified MoU Corporate Partner</Badge>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="font-sans font-semibold">Company Website</label>
                  <Input value={website} onChange={(e) => setWebsite(e.target.value)} className="h-9 text-xs font-mono rounded-xl" />
                </div>
                <div className="space-y-1">
                  <label className="font-sans font-semibold">Head Office Location</label>
                  <Input value={headOffice} onChange={(e) => setHeadOffice(e.target.value)} className="h-9 text-xs font-mono rounded-xl" />
                </div>
              </div>

              <Button onClick={() => toast.success("Updated company profile information")} className="bg-brand-gradient shadow-glow font-bold text-xs rounded-xl h-9 cursor-pointer">
                Save Allowed Profile Updates
              </Button>
            </div>
          </Panel>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. ENTERPRISE ASSESSMENTS BUILDER                                     */}
      {/* ===================================================================== */}
      {activeModule === "assessments" && (
        <div className="space-y-6">
          <Panel
            title="Recruiter Assessment Builder Directory"
            action={
              <Button onClick={() => setIsCreateAssessmentModalOpen(true)} className="bg-brand-gradient shadow-glow font-bold text-xs rounded-xl h-8 cursor-pointer gap-1">
                <Plus className="size-3.5" /> + Create Assessment
              </Button>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-1">
              {MOCK_RECRUITER_ASSESSMENTS.map((ast) => (
                <div key={ast.id} className="p-5 rounded-2xl border border-border/80 bg-card space-y-3 font-mono text-xs shadow-xs hover:border-primary/50 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.65rem] text-primary font-bold">{ast.version}</span>
                    <Badge className={ast.requestStatus === "Approved" ? "bg-emerald-600 text-white text-[0.62rem]" : "bg-purple-600 text-white text-[0.62rem]"}>
                      ● {ast.requestStatus}
                    </Badge>
                  </div>

                  <h3 className="font-sans text-sm font-extrabold text-foreground">{ast.title}</h3>
                  <p className="text-muted-foreground text-[0.7rem]">{ast.type} • {ast.duration}</p>

                  <div className="p-3 bg-muted/30 rounded-xl space-y-1 text-[0.68rem]">
                    <p>Passing Cutoff: <strong className="text-emerald-600">{ast.passingMarksPct}% Marks</strong></p>
                    <p>Reviewer Notes: "{ast.reviewerNotes}"</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/50 font-sans">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedPreviewAst(ast);
                        setCandidateSimulationMode(false);
                        setIsPreviewModalOpen(true);
                      }}
                      className="bg-brand-gradient shadow-glow text-white text-[0.68rem] h-8 rounded-xl font-bold cursor-pointer gap-1 flex-1"
                    >
                      <Eye className="size-3.5" /> Preview Assessment
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDuplicateAssessment(ast)}
                      className="text-[0.68rem] h-8 rounded-xl cursor-pointer gap-1"
                      title="Duplicate Assessment"
                    >
                      <Copy className="size-3.5" /> Duplicate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEditModal(ast)}
                      className="text-[0.68rem] h-8 rounded-xl cursor-pointer gap-1"
                      title="Edit Assessment"
                    >
                      <Edit className="size-3.5" /> Edit
                    </Button>
                    {dispatchedAstIds[ast.id] || ast.requestStatus === "Submitted" ? (
                      <Button
                        size="sm"
                        disabled
                        className="w-full mt-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[0.68rem] h-8 rounded-xl font-bold gap-1.5 opacity-100 cursor-default"
                      >
                        <CheckCircle className="size-3.5 text-emerald-600" /> Submitted &amp; Dispatched to TPO ✓
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleOpenSendToTpo(ast)}
                        className="w-full mt-1 bg-blue-600 hover:bg-blue-700 text-white text-[0.68rem] h-8 rounded-xl font-bold cursor-pointer gap-1.5"
                        title="Send Test to TPO"
                      >
                        <Send className="size-3.5" /> Send Test to TPO
                      </Button>
                    )}

                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* DISPATCHED CANDIDATE RESULTS FROM TPO PANEL */}
          <Panel title="📩 Official Verified Student Results & Scorecards (Received from TPO)">
            <div className="space-y-4 pt-1 font-sans">
              <div className="p-3.5 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 text-xs font-mono flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-[#2563EB] text-white text-[0.65rem] animate-pulse">● Verified TPO Scorecards</Badge>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {getAllStudentSubmissions().length} Candidate Scorecards Received
                  </span>
                </div>
                <span className="text-muted-foreground text-[0.68rem]">
                  Live synced with TPO Placement Operations Hub
                </span>
              </div>

              <div className="overflow-x-auto border rounded-2xl">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-muted-foreground font-mono uppercase text-[0.65rem]">
                      <th className="p-3">Candidate / Roll No</th>
                      <th className="p-3">College Email</th>
                      <th className="p-3">Dept</th>
                      <th className="p-3">Assessment Title</th>
                      <th className="p-3">MCQ Score</th>
                      <th className="p-3">Coding Score</th>
                      <th className="p-3">Overall %</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Recruiter Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 font-mono text-[0.72rem]">
                    {getAllStudentSubmissions().map((sub) => (
                      <tr key={sub.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-sans font-bold text-slate-900 dark:text-white">{sub.studentName} ({sub.rollNo})</td>
                        <td className="p-3 text-blue-600">{sub.studentEmail}</td>
                        <td className="p-3 text-muted-foreground font-bold">{sub.department}</td>
                        <td className="p-3 font-sans max-w-xs truncate">{sub.assessmentTitle}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{sub.mcqScore} / {sub.mcqTotal}</td>
                        <td className="p-3 font-bold text-purple-600">{sub.codingScore} / {sub.codingTotal}</td>
                        <td className="p-3 font-bold text-emerald-600">{sub.totalPercentage}%</td>
                        <td className="p-3">
                          <Badge className={sub.passStatus ? "bg-emerald-600 text-white text-[0.62rem]" : "bg-rose-600 text-white text-[0.62rem]"}>
                            {sub.passStatus ? "PASSED ✓" : "FAILED ✕"}
                          </Badge>
                        </td>
                        <td className="p-3 text-right font-sans">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              size="sm"
                              onClick={() => toast.success(`Scheduled 1-on-1 Interview for ${sub.studentName} (${sub.rollNo})!`)}
                              className="h-7 text-[0.68rem] bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg cursor-pointer px-2.5 font-bold gap-1 shadow-2xs"
                            >
                              Schedule Interview
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toast.info(`Drafted formal Job Offer for ${sub.studentName}!`)}
                              className="h-7 text-[0.68rem] rounded-lg cursor-pointer px-2.5 font-bold border-slate-200"
                            >
                              Offer Letter
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. QUESTION BANK MANAGEMENT                                           */}
      {/* ===================================================================== */}
      {activeModule === "question-bank" && (
        <div className="space-y-6">
          <Panel
            title="Recruiter Enterprise Question Bank Repository"
            action={
              <div className="flex items-center gap-2">
                <Button onClick={handleDownloadSampleCsv} variant="outline" className="h-8 text-xs rounded-xl cursor-pointer gap-1">
                  <Download className="size-3.5" /> Sample CSV
                </Button>
                <Button onClick={() => setIsBulkUploadModalOpen(true)} className="h-8 text-xs bg-brand-gradient shadow-glow text-white font-bold rounded-xl cursor-pointer gap-1.5">
                  <Upload className="size-3.5" /> Bulk Upload Questions
                </Button>
              </div>
            }
          >
            <div className="space-y-6 pt-1">
              {/* COUNTER KPI CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div className="p-4 rounded-2xl border bg-card space-y-1">
                  <p className="text-muted-foreground text-[0.65rem] uppercase font-bold">Total Indexed</p>
                  <p className="text-2xl font-extrabold text-purple-600 font-sans">{qbCounts.total}</p>
                  <p className="text-[0.62rem] text-muted-foreground">Active in Bank</p>
                </div>
                <div className="p-4 rounded-2xl border bg-card space-y-1">
                  <p className="text-muted-foreground text-[0.65rem] uppercase font-bold">MCQ Questions</p>
                  <p className="text-2xl font-extrabold text-blue-600 font-sans">{qbCounts.mcq}</p>
                  <p className="text-[0.62rem] text-muted-foreground">Aptitude &amp; Technical</p>
                </div>
                <div className="p-4 rounded-2xl border bg-card space-y-1">
                  <p className="text-muted-foreground text-[0.65rem] uppercase font-bold">Coding Challenges</p>
                  <p className="text-2xl font-extrabold text-purple-600 font-sans">{qbCounts.coding}</p>
                  <p className="text-[0.62rem] text-muted-foreground">Multi-Compiler</p>
                </div>
                <div className="p-4 rounded-2xl border bg-card space-y-1">
                  <p className="text-muted-foreground text-[0.65rem] uppercase font-bold">SQL Queries</p>
                  <p className="text-2xl font-extrabold text-emerald-600 font-sans">{qbCounts.sql}</p>
                  <p className="text-[0.62rem] text-muted-foreground">Database Schema</p>
                </div>
              </div>

              {/* SUBJECT CATEGORY CARDS GRID */}
              <div className="space-y-3">
                <div className="flex items-center justify-between font-mono text-xs">
                  <p className="font-bold text-foreground font-sans">📚 Subject &amp; Aptitude Cards Repository:</p>
                  {qbSubjectFilter !== "All" && (
                    <button
                      type="button"
                      onClick={() => setQbSubjectFilter("All")}
                      className="text-[0.68rem] text-purple-600 font-bold hover:underline cursor-pointer"
                    >
                      Reset Filter (Show All Subjects)
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {/* CARD 1: DSA (Coding & MCQs) */}
                  <div
                    onClick={() => setQbSubjectFilter("Data Structures & Algorithms")}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      qbSubjectFilter === "Data Structures & Algorithms"
                        ? "bg-purple-500/10 border-purple-500 shadow-md ring-2 ring-purple-500/20"
                        : "bg-card hover:bg-muted/40 border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="p-2 rounded-xl bg-purple-600/10 text-purple-600 font-extrabold text-sm font-sans flex items-center gap-1.5">
                        <Code2 className="size-4" /> Data Structures &amp; Algorithms
                      </span>
                      <Badge className="bg-purple-600 text-white text-[0.62rem]">Coding + MCQs</Badge>
                    </div>
                    <p className="text-[0.72rem] text-muted-foreground">Arrays, Trees, Dynamic Programming, Graphs &amp; Algorithms</p>
                    <div className="flex items-center justify-between font-mono text-[0.65rem] pt-1">
                      <span className="text-muted-foreground font-bold">45 Questions Available</span>
                      <span className="text-purple-600 font-bold">Click to filter →</span>
                    </div>
                  </div>

                  {/* CARD 2: Verbal Ability (MCQs) */}
                  <div
                    onClick={() => setQbSubjectFilter("Verbal Ability")}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      qbSubjectFilter === "Verbal Ability"
                        ? "bg-blue-500/10 border-blue-500 shadow-md ring-2 ring-blue-500/20"
                        : "bg-card hover:bg-muted/40 border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="p-2 rounded-xl bg-blue-600/10 text-blue-600 font-extrabold text-sm font-sans flex items-center gap-1.5">
                        <BookOpen className="size-4" /> Verbal Ability
                      </span>
                      <Badge variant="outline" className="text-[0.62rem] border-blue-300 text-blue-700 bg-blue-50">MCQs Only</Badge>
                    </div>
                    <p className="text-[0.72rem] text-muted-foreground">Vocabulary, Grammar, Reading Comprehension &amp; Sentence Completion</p>
                    <div className="flex items-center justify-between font-mono text-[0.65rem] pt-1">
                      <span className="text-muted-foreground font-bold">30 Questions Available</span>
                      <span className="text-blue-600 font-bold">Click to filter →</span>
                    </div>
                  </div>

                  {/* CARD 3: Logical Reasoning (MCQs) */}
                  <div
                    onClick={() => setQbSubjectFilter("Logical Reasoning")}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      qbSubjectFilter === "Logical Reasoning"
                        ? "bg-amber-500/10 border-amber-500 shadow-md ring-2 ring-amber-500/20"
                        : "bg-card hover:bg-muted/40 border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="p-2 rounded-xl bg-amber-600/10 text-amber-600 font-extrabold text-sm font-sans flex items-center gap-1.5">
                        <BrainCircuit className="size-4" /> Logical Reasoning
                      </span>
                      <Badge variant="outline" className="text-[0.62rem] border-amber-300 text-amber-700 bg-amber-50">MCQs Only</Badge>
                    </div>
                    <p className="text-[0.72rem] text-muted-foreground">Syllogisms, Puzzles, Sequences &amp; Pattern Identification</p>
                    <div className="flex items-center justify-between font-mono text-[0.65rem] pt-1">
                      <span className="text-muted-foreground font-bold">25 Questions Available</span>
                      <span className="text-amber-600 font-bold">Click to filter →</span>
                    </div>
                  </div>

                  {/* CARD 4: Quantitative Aptitude (MCQs) */}
                  <div
                    onClick={() => setQbSubjectFilter("Quantitative Aptitude")}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      qbSubjectFilter === "Quantitative Aptitude"
                        ? "bg-emerald-500/10 border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                        : "bg-card hover:bg-muted/40 border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="p-2 rounded-xl bg-emerald-600/10 text-emerald-600 font-extrabold text-sm font-sans flex items-center gap-1.5">
                        <Calculator className="size-4" /> Quantitative Aptitude
                      </span>
                      <Badge variant="outline" className="text-[0.62rem] border-emerald-300 text-emerald-700 bg-emerald-50">MCQs Only</Badge>
                    </div>
                    <p className="text-[0.72rem] text-muted-foreground">Work &amp; Time, Speed &amp; Distance, Probability &amp; Combinatorics</p>
                    <div className="flex items-center justify-between font-mono text-[0.65rem] pt-1">
                      <span className="text-muted-foreground font-bold">25 Questions Available</span>
                      <span className="text-emerald-600 font-bold">Click to filter →</span>
                    </div>
                  </div>

                  {/* CARD 5: Database Systems (SQL & MCQs) */}
                  <div
                    onClick={() => setQbSubjectFilter("Database Management Systems (DBMS)")}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      qbSubjectFilter === "Database Management Systems (DBMS)"
                        ? "bg-cyan-500/10 border-cyan-500 shadow-md ring-2 ring-cyan-500/20"
                        : "bg-card hover:bg-muted/40 border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="p-2 rounded-xl bg-cyan-600/10 text-cyan-600 font-extrabold text-sm font-sans flex items-center gap-1.5">
                        <Database className="size-4" /> Database Systems (DBMS)
                      </span>
                      <Badge className="bg-emerald-600 text-white text-[0.62rem]">SQL + MCQs</Badge>
                    </div>
                    <p className="text-[0.72rem] text-muted-foreground">SQL Queries, Window Aggregations, CTEs, ACID &amp; Indexing</p>
                    <div className="flex items-center justify-between font-mono text-[0.65rem] pt-1">
                      <span className="text-muted-foreground font-bold">20 Questions Available</span>
                      <span className="text-cyan-600 font-bold">Click to filter →</span>
                    </div>
                  </div>

                  {/* CARD 6: Core Systems (OS & Networks) */}
                  <div
                    onClick={() => setQbSubjectFilter("Core Systems (OS & Networks)")}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      qbSubjectFilter === "Core Systems (OS & Networks)"
                        ? "bg-indigo-500/10 border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
                        : "bg-card hover:bg-muted/40 border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="p-2 rounded-xl bg-indigo-600/10 text-indigo-600 font-extrabold text-sm font-sans flex items-center gap-1.5">
                        <Cpu className="size-4" /> Core Systems (OS &amp; Networks)
                      </span>
                      <Badge variant="outline" className="text-[0.62rem] border-indigo-300 text-indigo-700 bg-indigo-50">MCQs Only</Badge>
                    </div>
                    <p className="text-[0.72rem] text-muted-foreground">Deadlocks, Virtual Memory, TCP 3-Way Handshake &amp; Subnetting</p>
                    <div className="flex items-center justify-between font-mono text-[0.65rem] pt-1">
                      <span className="text-muted-foreground font-bold">17 Questions Available</span>
                      <span className="text-indigo-600 font-bold">Click to filter →</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEARCH BAR & SUBJECT FILTER DROPDOWN */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={qbSearchQuery}
                    onChange={(e) => setQbSearchQuery(e.target.value)}
                    placeholder="Search question bank by title, subject, or keywords..."
                    className="h-9 border-input bg-card pl-9 text-xs rounded-xl font-mono"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={qbSubjectFilter}
                    onChange={(e) => setQbSubjectFilter(e.target.value)}
                    className="h-9 rounded-xl border border-input bg-card px-3 text-xs font-semibold font-mono cursor-pointer"
                  >
                    <option value="All">All Subjects (6 Categories)</option>
                    <option value="Data Structures & Algorithms">Data Structures &amp; Algorithms (DSA)</option>
                    <option value="Verbal Ability">Verbal Ability (Vocabulary &amp; Grammar)</option>
                    <option value="Logical Reasoning">Logical Reasoning (Syllogisms &amp; Puzzles)</option>
                    <option value="Quantitative Aptitude">Quantitative Aptitude (Math &amp; Prob)</option>
                    <option value="Database Management Systems (DBMS)">DBMS &amp; SQL Queries</option>
                    <option value="Core Systems (OS & Networks)">Core Systems (OS &amp; Networks)</option>
                  </select>

                  <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl text-xs font-mono">
                    {(["All", "MCQ", "Coding", "SQL"] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setQbFilterTab(tab)}
                        className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                          qbFilterTab === tab ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* QUESTION BANK TABLE DIRECTORY DIVIDED BY SUBJECT */}
              <div className="overflow-x-auto border rounded-2xl">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-muted-foreground font-mono uppercase text-[0.65rem]">
                      <th className="p-3">Subject</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Question Title / Problem Statement</th>
                      <th className="p-3">Options / Compilers</th>
                      <th className="p-3">Difficulty</th>
                      <th className="p-3">Marks</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 font-medium font-mono text-[0.72rem]">
                    {qbList
                      .filter(
                        (q) =>
                          (qbFilterTab === "All" || q.type === qbFilterTab) &&
                          (qbSubjectFilter === "All" || q.subject === qbSubjectFilter) &&
                          (q.title.toLowerCase().includes(qbSearchQuery.toLowerCase()) ||
                           q.subject.toLowerCase().includes(qbSearchQuery.toLowerCase()))
                      )
                      .map((item) => (
                        <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3">
                            <Badge
                              variant="outline"
                              className={`text-[0.62rem] ${
                                item.subject.includes("Data Structures")
                                  ? "border-purple-300 text-purple-700 dark:text-purple-300 bg-purple-500/10"
                                  : item.subject.includes("Database")
                                  ? "border-emerald-300 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10"
                                  : item.subject.includes("Operating")
                                  ? "border-amber-300 text-amber-700 dark:text-amber-300 bg-amber-500/10"
                                  : item.subject.includes("Networks")
                                  ? "border-cyan-300 text-cyan-700 dark:text-cyan-300 bg-cyan-500/10"
                                  : "border-blue-300 text-blue-700 dark:text-blue-300 bg-blue-500/10"
                              }`}
                            >
                              {item.subject.split("(")[0] || item.subject}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge
                              className={
                                item.type === "Coding"
                                  ? "bg-purple-600 text-white text-[0.62rem]"
                                  : item.type === "SQL"
                                  ? "bg-emerald-600 text-white text-[0.62rem]"
                                  : "bg-blue-600 text-white text-[0.62rem]"
                              }
                            >
                              {item.type}
                            </Badge>
                          </td>
                          <td className="p-3 font-sans font-bold text-foreground max-w-sm truncate">
                            {item.title}
                          </td>
                          <td className="p-3 text-muted-foreground text-[0.68rem] max-w-xs truncate">
                            {item.optionsOrConstraints}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[0.62rem] ${
                                item.difficulty === "Hard"
                                  ? "bg-rose-500/10 text-rose-600"
                                  : item.difficulty === "Medium"
                                  ? "bg-amber-500/10 text-amber-600"
                                  : "bg-emerald-500/10 text-emerald-600"
                              }`}
                            >
                              {item.difficulty}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-foreground">{item.marks} Mks</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1 font-sans">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedViewQuestion(item);
                                  setIsViewQuestionModalOpen(true);
                                }}
                                className="h-7 text-xs rounded-xl cursor-pointer"
                              >
                                <Eye className="size-3 mr-1" /> View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setQbList((prev) => prev.filter((q) => q.id !== item.id));
                                  toast.success(`Removed question from bank.`);
                                }}
                                className="h-7 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl cursor-pointer"
                              >
                                <Trash2 className="size-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. ASSESSMENT REQUESTS PIPELINE                                       */}
      {/* ===================================================================== */}
      {activeModule === "assessment-requests" && (
        <div className="space-y-6">
          <Panel title="Assessment Submission Requests Pipeline (To Placement Officer)">
            <div className="space-y-4 pt-1 font-mono text-xs">
              {MOCK_RECRUITER_ASSESSMENTS.map((ast) => (
                <div key={ast.id} className="p-5 rounded-2xl border border-border/80 bg-card space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground font-sans text-base">{ast.title}</span>
                        <Badge variant="outline" className="text-[0.65rem]">{ast.version}</Badge>
                      </div>
                      <span className="text-[0.68rem] text-muted-foreground block mt-0.5">{ast.type} • {ast.duration} • Total Marks: {ast.totalMarks} Mks</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        className={
                          ast.requestStatus === "Approved"
                            ? "bg-emerald-600 text-white text-[0.65rem]"
                            : ast.requestStatus === "Changes Requested"
                            ? "bg-rose-600 text-white text-[0.65rem]"
                            : "bg-purple-600 text-white text-[0.65rem]"
                        }
                      >
                        ● {ast.requestStatus}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedAuditAst(ast);
                          setIsAuditTimelineModalOpen(true);
                        }}
                        className="h-8 text-xs rounded-xl cursor-pointer gap-1"
                      >
                        <Clock className="size-3.5" /> Audit Timeline
                      </Button>
                    </div>
                  </div>

                  {/* REVIEWER FEEDBACK NOTES */}
                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 text-[0.72rem] space-y-1">
                    <p className="font-bold text-foreground font-sans">📋 TPO Reviewer Feedback Notes:</p>
                    <p className="text-muted-foreground italic">"{ast.reviewerNotes}"</p>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 font-sans">
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedPreviewAst(ast);
                        setCandidateSimulationMode(false);
                        setIsPreviewModalOpen(true);
                      }}
                      className="bg-brand-gradient shadow-glow text-white text-xs h-8 rounded-xl font-bold cursor-pointer gap-1"
                    >
                      <Eye className="size-3.5" /> Preview Exam
                    </Button>
                    {dispatchedAstIds[ast.id] || ast.requestStatus === "Submitted" ? (
                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[0.68rem] px-3 py-1.5 font-mono flex items-center gap-1 font-bold">
                        <CheckCircle className="size-3.5 text-emerald-600" /> Submitted to TPO
                      </Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenSendToTpo(ast)}
                        className="text-xs h-8 rounded-xl cursor-pointer gap-1"
                      >
                        <Send className="size-3.5" /> Send Test to TPO
                      </Button>
                    )}

                    {ast.requestStatus === "Changes Requested" && (
                      <Button
                        size="sm"
                        onClick={() => handleOpenEditModal(ast)}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8 rounded-xl font-bold cursor-pointer gap-1"
                      >
                        <Edit className="size-3.5" /> Resubmit with Edits
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 7. INTERVIEW MANAGEMENT                                               */}
      {/* ===================================================================== */}
      {activeModule === "interviews" && (
        <div className="space-y-6">
          <Panel
            title="Interview Panel Scheduling & Scorecards"
            action={
              <Button onClick={() => setIsScheduleInterviewModalOpen(true)} className="bg-brand-gradient shadow-glow font-bold text-xs rounded-xl h-8 cursor-pointer gap-1">
                <Plus className="size-3.5" /> + Schedule Interview Slot
              </Button>
            }
          >
            <div className="overflow-x-auto pt-1 font-mono text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-muted-foreground uppercase text-[0.65rem]">
                    <th className="p-3">Candidate</th>
                    <th className="p-3">Slot Time</th>
                    <th className="p-3">Panel & Interviewer</th>
                    <th className="p-3">Scorecard</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {interviewList.map((cand) => (
                    <tr key={cand.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-bold font-sans text-foreground">{cand.name} ({cand.rollNo})</td>
                      <td className="p-3 text-primary">{cand.slotTime}</td>
                      <td className="p-3 text-muted-foreground">{cand.panelAssigned} • {cand.interviewer}</td>
                      <td className="p-3 font-bold text-purple-600">{cand.scorecardMarks ? `${cand.scorecardMarks} / 100` : "Pending"}</td>
                      <td className="p-3">
                        <Badge
                          className={
                            cand.status === "Recommended"
                              ? "bg-emerald-500/10 text-emerald-600 text-[0.62rem]"
                              : cand.status === "Rejected"
                              ? "bg-rose-500/10 text-rose-600 text-[0.62rem]"
                              : "bg-blue-500/10 text-blue-600 text-[0.62rem]"
                          }
                        >
                          ● {cand.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedScorecardCand(cand);
                            setScorecardRating(cand.scorecardMarks ? cand.scorecardMarks.toString() : "90");
                            setScorecardStatus(cand.status as any);
                            setScorecardRemarks(cand.feedbackRemarks || "");
                            setIsScorecardModalOpen(true);
                          }}
                          className="h-7 text-xs rounded-xl cursor-pointer"
                        >
                          Scorecard
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 9. REPORTS & HIRING ANALYTICS WORKSPACE                               */}
      {/* ===================================================================== */}
      {activeModule === "reports" && (
        <div className="space-y-6">
          <Panel
            title="Recruiter Campus Placement Analytics & Hiring Conversion Intelligence"
            action={
              <div className="flex items-center gap-2">
                <Button onClick={handleExportRecruiterReportCsv} variant="outline" className="h-8 text-xs rounded-xl cursor-pointer gap-1">
                  <Download className="size-3.5" /> Export Excel CSV
                </Button>
                <Button onClick={handleExportRecruiterReportCsv} className="h-8 text-xs bg-brand-gradient shadow-glow text-white font-bold rounded-xl cursor-pointer gap-1.5">
                  <FileSpreadsheet className="size-3.5" /> Download Full Analytics Report
                </Button>
              </div>
            }
          >
            <div className="space-y-6 pt-1">
              {/* KPI STAT CARDS GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                <div className="p-4 rounded-2xl border bg-card space-y-1">
                  <p className="text-muted-foreground text-[0.65rem] uppercase font-bold">Candidates Evaluated</p>
                  <p className="text-2xl font-extrabold text-blue-600 font-sans">342</p>
                  <p className="text-[0.62rem] text-muted-foreground">Across All Drives</p>
                </div>
                <div className="p-4 rounded-2xl border bg-card space-y-1">
                  <p className="text-muted-foreground text-[0.65rem] uppercase font-bold">Assessments Conducted</p>
                  <p className="text-2xl font-extrabold text-purple-600 font-sans">14</p>
                  <p className="text-[0.62rem] text-muted-foreground">78% Avg Pass Rate</p>
                </div>
                <div className="p-4 rounded-2xl border bg-card space-y-1">
                  <p className="text-muted-foreground text-[0.65rem] uppercase font-bold">Interviews Completed</p>
                  <p className="text-2xl font-extrabold text-amber-600 font-sans">48</p>
                  <p className="text-[0.62rem] text-muted-foreground">32 Recommended</p>
                </div>
                <div className="p-4 rounded-2xl border bg-card space-y-1">
                  <p className="text-muted-foreground text-[0.65rem] uppercase font-bold">Offers Extended</p>
                  <p className="text-2xl font-extrabold text-emerald-600 font-sans">12</p>
                  <p className="text-[0.62rem] text-muted-foreground">10 Accepted • 2 Pending</p>
                </div>
              </div>

              {/* HIRING CONVERSION FUNNEL DIRECTORY TABLE */}
              <div className="space-y-3">
                <p className="font-sans font-bold text-xs text-foreground">📊 Placement Drive Hiring Funnel Conversion Summary:</p>
                <div className="overflow-x-auto border rounded-2xl">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-muted-foreground font-mono uppercase text-[0.65rem]">
                        <th className="p-3">Placement Drive Title</th>
                        <th className="p-3">Target Batch</th>
                        <th className="p-3">Attempted</th>
                        <th className="p-3">Passed</th>
                        <th className="p-3">Interviewed</th>
                        <th className="p-3">Offered</th>
                        <th className="p-3">Conversion</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 font-mono text-[0.72rem]">
                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-sans font-bold text-foreground">Google Cloud Systems &amp; Coding Assessment 2026</td>
                        <td className="p-3 text-muted-foreground">2026 CSE/CSM/ECE</td>
                        <td className="p-3 font-bold text-foreground">150</td>
                        <td className="p-3 font-bold text-blue-600">45 (30%)</td>
                        <td className="p-3 font-bold text-purple-600">20</td>
                        <td className="p-3 font-bold text-emerald-600">12 (₹32 LPA)</td>
                        <td className="p-3"><Badge className="bg-emerald-600 text-white text-[0.62rem]">8.0% Rate</Badge></td>
                        <td className="p-3 text-right">
                          <Button size="sm" variant="outline" onClick={handleExportRecruiterReportCsv} className="h-7 text-xs rounded-xl cursor-pointer">
                            <Download className="size-3 mr-1" /> CSV
                          </Button>
                        </td>
                      </tr>
                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-sans font-bold text-foreground">Google Cloud AI &amp; Machine Learning Drive</td>
                        <td className="p-3 text-muted-foreground">2026 CSE/CSM</td>
                        <td className="p-3 font-bold text-foreground">120</td>
                        <td className="p-3 font-bold text-blue-600">38 (31%)</td>
                        <td className="p-3 font-bold text-purple-600">18</td>
                        <td className="p-3 font-bold text-emerald-600">10 (₹32 LPA)</td>
                        <td className="p-3"><Badge className="bg-emerald-600 text-white text-[0.62rem]">8.3% Rate</Badge></td>
                        <td className="p-3 text-right">
                          <Button size="sm" variant="outline" onClick={handleExportRecruiterReportCsv} className="h-7 text-xs rounded-xl cursor-pointer">
                            <Download className="size-3 mr-1" /> CSV
                          </Button>
                        </td>
                      </tr>
                      <tr className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-sans font-bold text-foreground">Google Infrastructure Engineering Round</td>
                        <td className="p-3 text-muted-foreground">2026 ECE/EEE</td>
                        <td className="p-3 font-bold text-foreground">72</td>
                        <td className="p-3 font-bold text-blue-600">22 (30%)</td>
                        <td className="p-3 font-bold text-purple-600">10</td>
                        <td className="p-3 font-bold text-emerald-600">5 (₹28 LPA)</td>
                        <td className="p-3"><Badge className="bg-emerald-600 text-white text-[0.62rem]">6.9% Rate</Badge></td>
                        <td className="p-3 text-right">
                          <Button size="sm" variant="outline" onClick={handleExportRecruiterReportCsv} className="h-7 text-xs rounded-xl cursor-pointer">
                            <Download className="size-3 mr-1" /> CSV
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PROCTORING AUDIT SUMMARY PANEL */}
              <div className="p-4 rounded-2xl bg-muted/20 border border-border/80 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-foreground font-sans">🛡️ Examination Proctoring &amp; Security Compliance Metrics:</p>
                  <Badge variant="outline" className="text-[0.62rem] border-emerald-300 text-emerald-700 bg-emerald-50">92% High Integrity Audit</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[0.72rem]">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 space-y-1">
                    <p className="font-bold">✓ Clean Submissions (0/3 Violations):</p>
                    <p className="text-[0.68rem] text-muted-foreground">138 out of 150 candidates completed assessment within 0 proctoring warnings.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 space-y-1">
                    <p className="font-bold">⚠️ Flagged Submissions (Violations Logged):</p>
                    <p className="text-[0.68rem] text-muted-foreground">12 candidates reached tab switch limit &amp; auto-submitted for TPO audit.</p>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 10. RECRUITER NOTIFICATIONS CENTER WORKSPACE                          */}
      {/* ===================================================================== */}
      {activeModule === "notifications" && (
        <div className="space-y-6">
          <Panel
            title="Recruiter Real-Time System Notifications &amp; Drive Activity Feed"
            action={
              <Button onClick={handleMarkAllAsRead} variant="outline" className="h-8 text-xs rounded-xl cursor-pointer gap-1.5 font-bold">
                <CheckCheck className="size-3.5 text-emerald-600" /> Mark All as Read
              </Button>
            }
          >
            <div className="space-y-6 pt-1">
              {/* UNREAD BADGE BAR & CATEGORY TABS */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="font-bold text-foreground font-sans">Active Notifications:</span>
                  <Badge className="bg-purple-600 text-white text-[0.68rem]">
                    {notificationsList.filter((n) => n.isUnread).length} Unread Alerts
                  </Badge>
                </div>

                <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl text-xs font-mono">
                  {(["All", "Unread", "TPO Approvals", "Submissions", "Offers"] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setNotifFilterTab(tab)}
                      className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                        notifFilterTab === tab ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* NOTIFICATION FEED CARDS */}
              <div className="space-y-3 font-sans">
                {notificationsList
                  .filter((n) => {
                    if (notifFilterTab === "Unread") return n.isUnread;
                    if (notifFilterTab !== "All") return n.category === notifFilterTab;
                    return true;
                  })
                  .map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        notif.isUnread
                          ? "bg-purple-500/5 border-purple-500/30 shadow-xs"
                          : "bg-card border-border/70 text-muted-foreground"
                      }`}
                    >
                      <div className="space-y-1.5 max-w-2xl">
                        <div className="flex items-center gap-2">
                          {notif.isUnread && (
                            <span className="size-2 rounded-full bg-purple-600 animate-pulse shrink-0" />
                          )}
                          <Badge
                            variant="outline"
                            className={`text-[0.62rem] ${
                              notif.category === "TPO Approvals"
                                ? "border-purple-300 text-purple-700 bg-purple-50"
                                : notif.category === "Submissions"
                                ? "border-blue-300 text-blue-700 bg-blue-50"
                                : "border-emerald-300 text-emerald-700 bg-emerald-50"
                            }`}
                          >
                            {notif.category}
                          </Badge>
                          <span className="font-bold text-foreground text-sm">{notif.title}</span>
                          <span className="text-[0.65rem] text-muted-foreground font-mono ml-auto sm:ml-0">• {notif.timestamp}</span>
                        </div>
                        <p className="text-xs text-foreground/80 leading-relaxed font-sans">{notif.message}</p>
                      </div>

                      <div className="flex items-center gap-2 font-mono shrink-0">
                        <Button
                          size="sm"
                          onClick={() => {
                            setActiveModule(notif.targetModule as RecruiterPageModule);
                            setNotificationsList((prev) =>
                              prev.map((n) => (n.id === notif.id ? { ...n, isUnread: false } : n))
                            );
                          }}
                          className="h-8 text-xs bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl cursor-pointer gap-1"
                        >
                          <ChevronRight className="size-3.5" /> View Section
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteNotification(notif.id)}
                          className="h-8 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 rounded-xl cursor-pointer"
                          title="Dismiss Notification"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </Panel>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 11. RECRUITER SUPPORT & PLACEMENT ASSISTANCE CENTER                   */}
      {/* ===================================================================== */}
      {activeModule === "support" && (
        <div className="space-y-6">
          <Panel
            title="Recruiter Placement Desk Help & Technical Support Center"
            action={
              <Button onClick={() => setIsCreateTicketModalOpen(true)} className="bg-brand-gradient shadow-glow font-bold text-xs rounded-xl h-8 cursor-pointer gap-1.5">
                <Plus className="size-3.5" /> Submit Support Ticket
              </Button>
            }
          >
            <div className="space-y-6 pt-1">
              {/* QUICK SUPPORT INFO CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans">
                <div className="p-4 rounded-2xl border bg-card space-y-1.5">
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-xs">
                    <Phone className="size-4" /> Dedicated TPO Hot-line
                  </div>
                  <p className="text-base font-extrabold text-foreground font-mono">+91 80 2841 2345</p>
                  <p className="text-[0.68rem] text-muted-foreground">Mon–Sat, 09:00 AM – 06:00 PM IST</p>
                </div>
                <div className="p-4 rounded-2xl border bg-card space-y-1.5">
                  <div className="flex items-center gap-2 text-purple-600 font-bold text-xs">
                    <Mail className="size-4" /> TPO Desk Support Email
                  </div>
                  <p className="text-sm font-extrabold text-foreground font-mono">tpo-desk@college.edu.in</p>
                  <p className="text-[0.68rem] text-muted-foreground">Average Response: &lt; 2 Hours</p>
                </div>
                <div className="p-4 rounded-2xl border bg-card space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                    <FileText className="size-4" /> MoU &amp; Placement Policy FAQs
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.success("Downloaded Corporate Placement MoU Guidelines PDF!")}
                    className="h-7 text-xs rounded-xl cursor-pointer mt-1"
                  >
                    <Download className="size-3 mr-1" /> Download Policy Handbook
                  </Button>
                </div>
              </div>

              {/* LIVE TICKET DIRECTORY TABLE */}
              <div className="space-y-3">
                <p className="font-sans font-bold text-xs text-foreground">🎫 Active Corporate Support Tickets &amp; Inquiries:</p>
                <div className="overflow-x-auto border rounded-2xl">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-muted-foreground font-mono uppercase text-[0.65rem]">
                        <th className="p-3">Ticket ID</th>
                        <th className="p-3">Subject / Issue Title</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Priority</th>
                        <th className="p-3">Assigned Desk</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 font-mono text-[0.72rem]">
                      {supportTickets.map((tck) => (
                        <tr key={tck.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3 font-bold text-purple-600">{tck.id}</td>
                          <td className="p-3 font-sans font-bold text-foreground max-w-xs truncate">{tck.subject}</td>
                          <td className="p-3 text-muted-foreground">{tck.category}</td>
                          <td className="p-3">
                            <Badge className={tck.priority === "High" ? "bg-rose-500/10 text-rose-600 text-[0.62rem]" : "bg-amber-500/10 text-amber-600 text-[0.62rem]"}>
                              {tck.priority}
                            </Badge>
                          </td>
                          <td className="p-3 text-muted-foreground">{tck.assignedAgent}</td>
                          <td className="p-3">
                            <Badge className={tck.status === "Resolved" ? "bg-emerald-600 text-white text-[0.62rem]" : "bg-blue-600 text-white text-[0.62rem]"}>
                              ● {tck.status}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toast.info(`Ticket Details: ${tck.description}`)}
                              className="h-7 text-xs rounded-xl cursor-pointer"
                            >
                              View Ticket
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 12. RECRUITER PROFILE & SECURITY WORKSPACE                            */}
      {/* ===================================================================== */}
      {(activeModule === "profile-security" || (activeModule as string) === "profile") && (
        <div className="space-y-6">
          <Panel title="Corporate Recruiter Profile & Security Settings">
            <div className="space-y-6 pt-1 font-sans">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-muted/30 border">
                <div className="size-16 rounded-2xl bg-brand-gradient text-white font-black text-2xl grid place-items-center shadow-glow">
                  DM
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-foreground">David Miller</h3>
                  <p className="text-xs text-muted-foreground font-mono">Staff Recruiter • Google Cloud Systems India</p>
                  <div className="flex items-center gap-2 pt-1">
                    <Badge className="bg-emerald-600 text-white text-[0.62rem]">Verified Corporate HR</Badge>
                    <Badge variant="outline" className="text-[0.62rem] font-mono">ID: HR-GGL-8842</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded-2xl border bg-card space-y-3">
                  <h4 className="font-bold text-foreground font-sans text-xs">🏢 Corporate Entity Details</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-muted-foreground text-[0.65rem]">Company Name</p>
                      <p className="font-bold text-foreground">{companyName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[0.65rem]">Official Website</p>
                      <p className="font-bold text-blue-600">{website}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[0.65rem]">Head Office Location</p>
                      <p className="font-bold text-foreground">{headOffice}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border bg-card space-y-3">
                  <h4 className="font-bold text-foreground font-sans text-xs">🔒 Account Security &amp; Authentication</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-muted-foreground text-[0.65rem]">Primary Email</p>
                      <p className="font-bold text-foreground">david.miller@google.com</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[0.65rem]">Two-Factor Authentication (2FA)</p>
                      <Badge className="bg-emerald-500/10 text-emerald-600 text-[0.62rem] mt-0.5">● Enabled (Google Authenticator)</Badge>
                    </div>
                    <div className="pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toast.success("Password reset link sent to david.miller@google.com!")}
                        className="h-8 text-xs rounded-xl cursor-pointer gap-1.5"
                      >
                        <Lock className="size-3.5" /> Reset Recruiter Password
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      )}
      {activeModule === "offers" && (
        <div className="space-y-6">
          <Panel
            title="Recruiter Offer Letter Management & Acceptance Tracking"
            action={
              <Button onClick={() => setIsUploadOfferModalOpen(true)} className="bg-brand-gradient shadow-glow font-bold text-xs rounded-xl h-8 cursor-pointer gap-1">
                <Upload className="size-3.5" /> Upload Offer Letter
              </Button>
            }
          >
            <div className="overflow-x-auto pt-1 font-mono text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-muted-foreground uppercase text-[0.65rem]">
                    <th className="p-3">Candidate</th>
                    <th className="p-3">Job Role</th>
                    <th className="p-3">Offered CTC</th>
                    <th className="p-3">Joining Date</th>
                    <th className="p-3">Acceptance Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {offerList.map((ofr) => (
                    <tr key={ofr.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-bold font-sans text-foreground">{ofr.candidateName} ({ofr.rollNo})</td>
                      <td className="p-3 text-muted-foreground">{ofr.jobRole}</td>
                      <td className="p-3 font-bold text-emerald-600">{ofr.ctc}</td>
                      <td className="p-3 text-purple-600">{ofr.joiningDate}</td>
                      <td className="p-3">
                        <Badge className={ofr.offerStatus === "Accepted" ? "bg-emerald-600 text-white text-[0.62rem]" : "bg-amber-600 text-white text-[0.62rem]"}>
                          ● {ofr.offerStatus}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1 font-sans">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedViewOffer(ofr);
                              setIsViewOfferModalOpen(true);
                            }}
                            className="h-7 text-xs rounded-xl cursor-pointer gap-1"
                          >
                            <FileText className="size-3" /> View
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDownloadOfferDocument(ofr)}
                            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer gap-1"
                          >
                            <Download className="size-3" /> PDF
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}

      {/* LAUNCH PLACEMENT DRIVE MODAL DIALOG */}
      <Dialog open={isCreateDriveModalOpen} onOpenChange={setIsCreateDriveModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader className="pb-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-blue-600 text-white grid place-items-center shadow-glow">
                <Briefcase className="size-5" />
              </div>
              <div>
                <DialogTitle className="font-extrabold font-sans text-base">Launch New Campus Placement Drive</DialogTitle>
                <DialogDescription className="text-[0.7rem] font-mono">
                  Configure job position, compensation package, and eligibility criteria for campus students.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateDriveSubmit} className="space-y-4 pt-2 text-xs font-sans">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Drive Title</label>
              <Input
                value={driveTitle}
                onChange={(e) => setDriveTitle(e.target.value)}
                placeholder="e.g. Google Cloud Systems & SDE Hiring Drive 2026"
                required
                className="h-9 text-xs rounded-xl font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Job Designation / Role</label>
                <Input
                  value={driveRole}
                  onChange={(e) => setDriveRole(e.target.value)}
                  placeholder="Software Engineer I (Cloud)"
                  required
                  className="h-9 text-xs rounded-xl font-sans"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Offered CTC Package</label>
                <Input
                  value={driveCtc}
                  onChange={(e) => setDriveCtc(e.target.value)}
                  placeholder="₹32.0 LPA"
                  required
                  className="h-9 text-xs rounded-xl font-mono text-emerald-600 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Office Location</label>
                <Input
                  value={driveLocation}
                  onChange={(e) => setDriveLocation(e.target.value)}
                  placeholder="Bengaluru / Hyderabad"
                  required
                  className="h-9 text-xs rounded-xl font-sans"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Minimum CGPA Cutoff</label>
                <Input
                  placeholder="7.5 CGPA"
                  defaultValue="7.5"
                  required
                  className="h-9 text-xs rounded-xl font-mono"
                />
              </div>
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateDriveModalOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer gap-1.5">
                <Briefcase className="size-3.5" /> Launch Campus Drive
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* VIEW DRIVE APPLICANTS MODAL DIALOG */}
      <Dialog open={isApplicantsModalOpen} onOpenChange={setIsApplicantsModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-2xl">
          <DialogHeader className="pb-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-purple-600 text-white grid place-items-center shadow-glow">
                <Users className="size-5" />
              </div>
              <div>
                <DialogTitle className="font-extrabold font-sans text-base">Placement Drive Registered Applicants</DialogTitle>
                <DialogDescription className="text-[0.7rem] font-mono">
                  {selectedDriveForApplicants?.driveCode} • {selectedDriveForApplicants?.title}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedDriveForApplicants && (
            <div className="space-y-4 pt-2 text-xs font-sans">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 font-mono text-[0.7rem]">
                <span>Total Applications: <strong className="text-purple-600 font-bold">{selectedDriveForApplicants.applicationsCount}</strong></span>
                <span>Offered CTC: <strong className="text-emerald-600 font-bold">{selectedDriveForApplicants.ctc}</strong></span>
              </div>

              <div className="overflow-x-auto border rounded-2xl">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-muted-foreground font-mono uppercase text-[0.65rem]">
                      <th className="p-3">Candidate</th>
                      <th className="p-3">Dept</th>
                      <th className="p-3">CGPA</th>
                      <th className="p-3">College Email</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 font-mono text-[0.72rem]">
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-sans font-bold text-foreground">Aditya Sharma (2022CSE188)</td>
                      <td className="p-3">CSE</td>
                      <td className="p-3 font-bold text-purple-600">9.2</td>
                      <td className="p-3 text-blue-600">2022cse188@college.edu.in</td>
                      <td className="p-3"><Badge className="bg-emerald-600 text-white text-[0.62rem]">Shortlisted</Badge></td>
                    </tr>
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-sans font-bold text-foreground">Rohan Varma (2022CSE104)</td>
                      <td className="p-3">CSE</td>
                      <td className="p-3 font-bold text-purple-600">8.9</td>
                      <td className="p-3 text-blue-600">2022cse104@college.edu.in</td>
                      <td className="p-3"><Badge className="bg-blue-600 text-white text-[0.62rem]">Assessment Complete</Badge></td>
                    </tr>
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-sans font-bold text-foreground">Sneha Reddy (2022ECE042)</td>
                      <td className="p-3">ECE</td>
                      <td className="p-3 font-bold text-purple-600">8.4</td>
                      <td className="p-3 text-blue-600">2022ece042@college.edu.in</td>
                      <td className="p-3"><Badge className="bg-purple-600 text-white text-[0.62rem]">Interview Scheduled</Badge></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsApplicantsModalOpen(false)} className="rounded-xl text-xs">
                  Close Roster
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    handleExportRecruiterReportCsv();
                    setIsApplicantsModalOpen(false);
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs cursor-pointer gap-1.5"
                >
                  <Download className="size-3.5" /> Export Applicant Roster CSV
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CREATE SUPPORT TICKET MODAL DIALOG */}
      <Dialog open={isCreateTicketModalOpen} onOpenChange={setIsCreateTicketModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader className="pb-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-purple-600 text-white grid place-items-center shadow-glow">
                <HelpCircle className="size-5" />
              </div>
              <div>
                <DialogTitle className="font-extrabold font-sans text-base">Submit Support Ticket / Inquiry</DialogTitle>
                <DialogDescription className="text-[0.7rem] font-mono">
                  Submit query directly to College Placement Officer Desk &amp; Technical Support Team.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateTicketSubmit} className="space-y-4 pt-2 text-xs font-sans">
            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Subject / Title</label>
              <Input
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="e.g. Requesting Proctoring Audit Log for Student 2022CSE104"
                required
                className="h-9 text-xs rounded-xl font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Category</label>
                <select
                  value={ticketCategory}
                  onChange={(e) => setTicketCategory(e.target.value)}
                  className="w-full h-9 rounded-xl border border-input bg-card px-3 text-xs font-semibold cursor-pointer font-mono"
                >
                  <option value="Assessment Proctoring">Assessment Proctoring</option>
                  <option value="Interview Scheduling">Interview Scheduling</option>
                  <option value="Student Shortlist Inquiry">Student Shortlist Inquiry</option>
                  <option value="MoU Compliance">MoU Compliance</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Priority Level</label>
                <select
                  value={ticketPriority}
                  onChange={(e) => setTicketPriority(e.target.value as any)}
                  className="w-full h-9 rounded-xl border border-input bg-card px-3 text-xs font-semibold cursor-pointer font-mono"
                >
                  <option value="High">High (Urgent Drive Impact)</option>
                  <option value="Medium">Medium (General Inquiry)</option>
                  <option value="Low">Low (Administrative Request)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Detailed Description</label>
              <textarea
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                rows={4}
                required
                placeholder="Describe your issue or request in detail..."
                className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-sans resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/30"
              />
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateTicketModalOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs cursor-pointer gap-1.5">
                <Send className="size-3.5" /> Submit Ticket to TPO Desk
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* UPLOAD CANDIDATE OFFER LETTER MODAL DIALOG */}
      <Dialog open={isUploadOfferModalOpen} onOpenChange={setIsUploadOfferModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader className="pb-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-emerald-600 text-white grid place-items-center shadow-glow">
                <Upload className="size-5" />
              </div>
              <div>
                <DialogTitle className="font-extrabold font-sans text-base">Upload Candidate Offer Letter</DialogTitle>
                <DialogDescription className="text-[0.7rem] font-mono">
                  Dispatch official corporate employment offer letter PDF to selected candidate.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleUploadOfferSubmit} className="space-y-4 pt-2 text-xs font-sans">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Candidate Full Name</label>
                <Input
                  value={offerCandName}
                  onChange={(e) => setOfferCandName(e.target.value)}
                  placeholder="e.g. Aditya Sharma"
                  required
                  className="h-9 text-xs rounded-xl font-sans"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Roll Number / Student ID</label>
                <Input
                  value={offerRollNo}
                  onChange={(e) => setOfferRollNo(e.target.value)}
                  placeholder="e.g. 2022CSE188"
                  required
                  className="h-9 text-xs rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Job Role / Designation</label>
                <Input
                  value={offerJobRole}
                  onChange={(e) => setOfferJobRole(e.target.value)}
                  placeholder="Software Engineer I (Cloud Solutions)"
                  required
                  className="h-9 text-xs rounded-xl font-sans"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Offered Package (CTC)</label>
                <Input
                  value={offerCtc}
                  onChange={(e) => setOfferCtc(e.target.value)}
                  placeholder="e.g. ₹32.0 LPA"
                  required
                  className="h-9 text-xs rounded-xl font-mono text-emerald-600 font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Expected Joining Date</label>
                <Input
                  type="date"
                  value={offerJoiningDate}
                  onChange={(e) => setOfferJoiningDate(e.target.value)}
                  required
                  className="h-9 text-xs rounded-xl font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Work Location</label>
                <Input
                  value={offerLocation}
                  onChange={(e) => setOfferLocation(e.target.value)}
                  placeholder="Bengaluru, KA"
                  required
                  className="h-9 text-xs rounded-xl font-sans"
                />
              </div>
            </div>

            {/* PDF DROPZONE */}
            <div className="p-4 border-2 border-dashed border-emerald-400/50 rounded-2xl bg-muted/20 text-center space-y-2 relative hover:bg-muted/40 transition-all">
              <FileText className="size-6 text-emerald-600 mx-auto" />
              <p className="font-bold text-foreground">Upload Offer Letter Document (PDF)</p>
              <p className="text-[0.68rem] text-muted-foreground font-mono">Max file size: 5 MB</p>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setUploadedPdfName(e.target.files[0].name);
                    toast.success(`Selected offer PDF: ${e.target.files[0].name}`);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {uploadedPdfName && (
                <Badge className="bg-emerald-600 text-white text-[0.65rem] mt-1">✓ {uploadedPdfName}</Badge>
              )}
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button type="button" variant="outline" onClick={() => setIsUploadOfferModalOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer gap-1.5">
                <Upload className="size-3.5" /> Upload &amp; Dispatch Offer Letter
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CORPORATE OFFER LETTER PREVIEW & VIEW MODAL DIALOG */}
      <Dialog open={isViewOfferModalOpen} onOpenChange={setIsViewOfferModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-2xl">
          <DialogHeader className="pb-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-emerald-600 text-white grid place-items-center shadow-glow">
                <FileText className="size-5" />
              </div>
              <div>
                <DialogTitle className="font-extrabold font-sans text-base">Corporate Offer Letter Document</DialogTitle>
                <DialogDescription className="text-[0.7rem] font-mono">
                  {selectedViewOffer?.id} • Official Employment Contract
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedViewOffer && (
            <div className="space-y-4 pt-2 text-xs font-sans">
              {/* FORMAL OFFER LETTER PREVIEW BOX */}
              <div className="p-6 rounded-2xl border bg-slate-950 text-slate-100 font-mono text-[0.72rem] space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="size-7 rounded-lg bg-blue-600 text-white font-extrabold grid place-items-center text-sm">G</span>
                    <span className="font-bold text-white text-sm font-sans">Google Cloud Systems India</span>
                  </div>
                  <Badge className="bg-emerald-600 text-white text-[0.62rem]">● {selectedViewOffer.offerStatus}</Badge>
                </div>

                <div className="space-y-1 text-slate-300">
                  <p>Candidate Name : <strong className="text-white">{selectedViewOffer.candidateName}</strong></p>
                  <p>Student Roll No : <strong>{selectedViewOffer.rollNo}</strong> ({selectedViewOffer.department})</p>
                  <p>Job Designation : <strong className="text-purple-400">{selectedViewOffer.jobRole}</strong></p>
                  <p>Offered Package  : <strong className="text-emerald-400 font-bold text-sm">{selectedViewOffer.ctc}</strong></p>
                  <p>Work Location    : <strong>{selectedViewOffer.location}</strong></p>
                  <p>Joining Date     : <strong className="text-amber-400">{selectedViewOffer.joiningDate}</strong></p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[0.68rem] text-slate-400 space-y-1">
                  <p className="text-slate-200 font-bold">📄 Contract Terms Summary:</p>
                  <p>• Standard 6-month probation followed by full-time corporate appointment.</p>
                  <p>• Full medical coverage, annual performance bonus &amp; cloud learning credits.</p>
                </div>

                <div className="flex items-center justify-between text-[0.65rem] text-slate-500 pt-2 border-t border-slate-800">
                  <span>Authorized Signature: David Miller (Staff Recruiter)</span>
                  <span>Seal: Verified MoUs</span>
                </div>
              </div>

              <DialogFooter className="pt-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    toast.success(`Resent offer letter notification to ${selectedViewOffer.candidateName}'s email!`);
                  }}
                  className="rounded-xl text-xs gap-1 cursor-pointer"
                >
                  <Send className="size-3.5" /> Resend Offer Email
                </Button>
                <Button
                  type="button"
                  onClick={() => handleDownloadOfferDocument(selectedViewOffer)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer gap-1.5"
                >
                  <Download className="size-3.5" /> Download Official Offer Document
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* SCHEDULE INTERVIEW SLOT MODAL DIALOG */}
      <Dialog open={isScheduleInterviewModalOpen} onOpenChange={setIsScheduleInterviewModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader className="pb-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-blue-600 text-white grid place-items-center shadow-glow">
                <Video className="size-5" />
              </div>
              <div>
                <DialogTitle className="font-extrabold font-sans text-base">Schedule Interview Slot</DialogTitle>
                <DialogDescription className="text-[0.7rem] font-mono">
                  Assign interview panel, candidate, time slot, and video conferencing meeting room.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateInterviewSubmit} className="space-y-4 pt-2 text-xs font-sans">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Candidate Full Name</label>
                <Input
                  value={schedCandName}
                  onChange={(e) => setSchedCandName(e.target.value)}
                  placeholder="e.g. Kavya Patel"
                  required
                  className="h-9 text-xs rounded-xl font-sans"
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Roll Number / Student ID</label>
                <Input
                  value={schedRollNo}
                  onChange={(e) => setSchedRollNo(e.target.value)}
                  placeholder="e.g. 2023CSE045"
                  required
                  className="h-9 text-xs rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Department</label>
                <select
                  value={schedDept}
                  onChange={(e) => setSchedDept(e.target.value)}
                  className="w-full h-9 rounded-xl border border-input bg-card px-3 text-xs font-semibold font-mono cursor-pointer"
                >
                  <option value="CSE">Computer Science (CSE)</option>
                  <option value="CSM">AI &amp; ML (CSM)</option>
                  <option value="ECE">Electronics (ECE)</option>
                  <option value="EEE">Electrical (EEE)</option>
                  <option value="MECH">Mechanical (MECH)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Slot Time</label>
                <select
                  value={schedSlotTime}
                  onChange={(e) => setSchedSlotTime(e.target.value)}
                  className="w-full h-9 rounded-xl border border-input bg-card px-3 text-xs font-semibold font-mono cursor-pointer"
                >
                  <option value="10:00 AM – 10:45 AM">10:00 AM – 10:45 AM (Morning)</option>
                  <option value="11:00 AM – 11:45 AM">11:00 AM – 11:45 AM (Morning)</option>
                  <option value="02:00 PM – 02:45 PM">02:00 PM – 02:45 PM (Afternoon)</option>
                  <option value="03:30 PM – 04:15 PM">03:30 PM – 04:15 PM (Afternoon)</option>
                  <option value="05:00 PM – 05:45 PM">05:00 PM – 05:45 PM (Evening)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Interviewer Panel</label>
                <select
                  value={schedPanel}
                  onChange={(e) => setSchedPanel(e.target.value)}
                  className="w-full h-9 rounded-xl border border-input bg-card px-3 text-xs font-semibold cursor-pointer"
                >
                  <option value="Panel 1 (Cloud Core)">Panel 1 (Cloud Core)</option>
                  <option value="Panel 2 (Algorithms)">Panel 2 (Algorithms)</option>
                  <option value="Panel 3 (System Design)">Panel 3 (System Design)</option>
                  <option value="Panel 4 (HR & Culture)">Panel 4 (HR &amp; Culture)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Assigned Interviewer</label>
                <Input
                  value={schedInterviewer}
                  onChange={(e) => setSchedInterviewer(e.target.value)}
                  placeholder="David Miller (Staff Recruiter)"
                  required
                  className="h-9 text-xs rounded-xl font-sans"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-foreground">Video Conferencing URL (Google Meet / Teams)</label>
              <Input
                value={schedMeetUrl}
                onChange={(e) => setSchedMeetUrl(e.target.value)}
                placeholder="https://meet.google.com/abc-defg-hij"
                className="h-9 text-xs rounded-xl font-mono text-blue-600"
              />
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button type="button" variant="outline" onClick={() => setIsScheduleInterviewModalOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer gap-1.5">
                <Video className="size-3.5" /> Confirm &amp; Schedule Slot
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CANDIDATE SCORECARD & FEEDBACK MODAL DIALOG */}
      <Dialog open={isScorecardModalOpen} onOpenChange={setIsScorecardModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader className="pb-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-purple-600 text-white grid place-items-center shadow-glow">
                <Award className="size-5" />
              </div>
              <div>
                <DialogTitle className="font-extrabold font-sans text-base">Candidate Scorecard &amp; Interview Evaluation</DialogTitle>
                <DialogDescription className="text-[0.7rem] font-mono">
                  {selectedScorecardCand?.name} ({selectedScorecardCand?.rollNo}) • {selectedScorecardCand?.department}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedScorecardCand && (
            <form onSubmit={handleSaveScorecardSubmit} className="space-y-4 pt-2 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="p-3.5 rounded-xl border bg-card space-y-1">
                  <span className="text-muted-foreground text-[0.65rem] uppercase font-bold">Candidate CGPA</span>
                  <p className="text-lg font-extrabold text-foreground">{selectedScorecardCand.cgpa} / 10.0</p>
                </div>
                <div className="p-3.5 rounded-xl border bg-card space-y-1">
                  <span className="text-muted-foreground text-[0.65rem] uppercase font-bold">Assigned Panel</span>
                  <p className="text-xs font-bold text-purple-600 truncate">{selectedScorecardCand.panelAssigned}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Scorecard Rating (out of 100)</label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={scorecardRating}
                    onChange={(e) => setScorecardRating(e.target.value)}
                    required
                    className="h-9 text-xs rounded-xl font-mono font-bold text-purple-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">Evaluation Status</label>
                  <select
                    value={scorecardStatus}
                    onChange={(e) => setScorecardStatus(e.target.value as any)}
                    className="w-full h-9 rounded-xl border border-input bg-card px-3 text-xs font-semibold cursor-pointer"
                  >
                    <option value="Recommended">Recommended (Selected)</option>
                    <option value="Scheduled">Scheduled (In Progress)</option>
                    <option value="Completed">Completed (Reviewed)</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">Interviewer Feedback &amp; Remarks</label>
                <textarea
                  value={scorecardRemarks}
                  onChange={(e) => setScorecardRemarks(e.target.value)}
                  rows={4}
                  placeholder="Enter detailed technical feedback, strengths, and areas for improvement..."
                  className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-sans resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/30"
                />
              </div>

              <DialogFooter className="pt-2 gap-2">
                <Button type="button" variant="outline" onClick={() => setIsScorecardModalOpen(false)} className="rounded-xl text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs cursor-pointer gap-1.5">
                  <Check className="size-3.5" /> Save Candidate Scorecard
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* AUDIT TIMELINE MODAL DIALOG */}
      <Dialog open={isAuditTimelineModalOpen} onOpenChange={setIsAuditTimelineModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-2xl">
          <DialogHeader className="pb-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-purple-600 text-white grid place-items-center shadow-glow">
                <Clock className="size-5" />
              </div>
              <div>
                <DialogTitle className="font-extrabold font-sans text-base">Assessment Audit History &amp; Approval Timeline</DialogTitle>
                <DialogDescription className="text-[0.7rem] font-mono">
                  {selectedAuditAst?.id} • {selectedAuditAst?.title}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedAuditAst && (
            <div className="space-y-4 pt-2 text-xs font-sans">
              <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 font-mono text-[0.7rem]">
                <span>Current Status: <strong className="text-purple-600">{selectedAuditAst.requestStatus}</strong></span>
                <span>Version: <strong className="text-foreground">{selectedAuditAst.version}</strong></span>
              </div>

              {/* TIMELINE STEPS */}
              <div className="space-y-4 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {/* STEP 1 */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 size-4 rounded-full bg-emerald-600 border-2 border-background grid place-items-center text-white text-[0.5rem] font-bold">✓</div>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-foreground font-sans text-xs">1. Assessment Created &amp; Authored</span>
                      <span className="text-[0.62rem] text-muted-foreground">Aug 01, 09:30 AM</span>
                    </div>
                    <p className="text-muted-foreground text-[0.7rem]">Authored by David Miller (Corporate Recruiter). {selectedAuditAst.mcqCount} MCQs, {selectedAuditAst.codingCount} Coding Problems configured.</p>
                  </div>
                </div>

                {/* STEP 2 */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 size-4 rounded-full bg-blue-600 border-2 border-background grid place-items-center text-white text-[0.5rem] font-bold">✓</div>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-foreground font-sans text-xs">2. Submitted to Placement Officer (TPO)</span>
                      <span className="text-[0.62rem] text-muted-foreground">Aug 01, 10:15 AM</span>
                    </div>
                    <p className="text-muted-foreground text-[0.7rem]">Submitted for Placement Drive approval to Dr. Ramesh Kumar (tpo@nitk.edu.in).</p>
                  </div>
                </div>

                {/* STEP 3 */}
                <div className="relative">
                  <div className={`absolute -left-6 top-0.5 size-4 rounded-full border-2 border-background grid place-items-center text-white text-[0.5rem] font-bold ${
                    selectedAuditAst.requestStatus === "Approved" ? "bg-emerald-600" : selectedAuditAst.requestStatus === "Changes Requested" ? "bg-rose-600" : "bg-amber-500"
                  }`}>
                    {selectedAuditAst.requestStatus === "Approved" ? "✓" : "!"}
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-foreground font-sans text-xs">3. TPO Review &amp; Placement Drive Sync</span>
                      <span className="text-[0.62rem] text-muted-foreground">Aug 01, 11:00 AM</span>
                    </div>
                    <p className="text-muted-foreground text-[0.7rem]">TPO Review Status: <strong>{selectedAuditAst.requestStatus}</strong>. "{selectedAuditAst.reviewerNotes}"</p>
                  </div>
                </div>

                {/* STEP 4 */}
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 size-4 rounded-full bg-purple-600 border-2 border-background grid place-items-center text-white text-[0.5rem] font-bold">🔗</div>
                  <div className="space-y-1">
                    <span className="font-bold text-foreground font-sans text-xs block">4. Live Exam Conducting Link</span>
                    <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 font-mono text-[0.68rem] flex items-center justify-between">
                      <span className="text-purple-700 dark:text-purple-300 truncate">http://192.168.1.122:8082/exam/take?id={selectedAuditAst.id}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(`http://192.168.1.122:8082/exam/take?id=${selectedAuditAst.id}`);
                          toast.success("Exam URL copied to clipboard!");
                        }}
                        className="h-6 text-[0.62rem] rounded-lg shrink-0 cursor-pointer ml-2"
                      >
                        Copy Link
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" onClick={() => setIsAuditTimelineModalOpen(false)} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs cursor-pointer">
                  Close Audit Timeline
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* QUESTION VIEW DETAIL MODAL DIALOG */}
      <Dialog open={isViewQuestionModalOpen} onOpenChange={setIsViewQuestionModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-2xl">
          <DialogHeader className="pb-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-blue-600 text-white grid place-items-center shadow-glow">
                <Eye className="size-5" />
              </div>
              <div>
                <DialogTitle className="font-extrabold font-sans text-base">Question Detail &amp; Specification</DialogTitle>
                <DialogDescription className="text-[0.7rem] font-mono">
                  {selectedViewQuestion?.id} • {selectedViewQuestion?.type} Question Bank Record
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedViewQuestion && (
            <div className="space-y-4 pt-2 text-xs font-sans">
              <div className="flex items-center justify-between">
                <Badge
                  className={
                    selectedViewQuestion.type === "Coding"
                      ? "bg-purple-600 text-white"
                      : selectedViewQuestion.type === "SQL"
                      ? "bg-emerald-600 text-white"
                      : "bg-blue-600 text-white"
                  }
                >
                  {selectedViewQuestion.type} Category
                </Badge>
                <div className="flex items-center gap-3 font-mono text-[0.68rem]">
                  <span>Difficulty: <strong className="text-purple-600">{selectedViewQuestion.difficulty}</strong></span>
                  <span>Marks: <strong className="text-foreground">{selectedViewQuestion.marks} Mks</strong></span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 space-y-2">
                <p className="font-mono text-[0.65rem] font-bold text-muted-foreground uppercase">Question Statement / Title:</p>
                <h4 className="font-bold text-sm text-foreground leading-relaxed font-sans">{selectedViewQuestion.title}</h4>
              </div>

              {selectedViewQuestion.type === "MCQ" && (
                <div className="space-y-2">
                  <p className="font-mono text-[0.68rem] font-bold text-foreground">Answer Options &amp; Correct Answer Key:</p>
                  <div className="grid gap-2 font-mono text-xs">
                    <div className="p-3 rounded-xl border bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-between">
                      <span>A. {selectedViewQuestion.optionsOrConstraints.split("(")[0] || "Log-Structured Merge-Tree (LSM-Tree)"}</span>
                      <span className="text-[0.62rem] bg-emerald-600 text-white px-2 py-0.5 rounded-md font-sans">Correct Answer</span>
                    </div>
                    <div className="p-3 rounded-xl border bg-card text-muted-foreground">
                      <span>B. B+ Tree Indexing with WAL</span>
                    </div>
                    <div className="p-3 rounded-xl border bg-card text-muted-foreground">
                      <span>C. Red-Black Balanced Binary Search Tree</span>
                    </div>
                    <div className="p-3 rounded-xl border bg-card text-muted-foreground">
                      <span>D. Distributed Hash Map Ring</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedViewQuestion.type === "Coding" && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 font-mono space-y-1 text-purple-900 dark:text-purple-200">
                    <p className="font-bold">💻 Supported Compilers &amp; Language Runtimes:</p>
                    <p className="text-[0.68rem] font-semibold">{selectedViewQuestion.optionsOrConstraints}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[0.68rem]">
                    <div className="p-3 rounded-xl bg-card border space-y-1">
                      <span className="text-muted-foreground font-bold uppercase block">Sample Input</span>
                      <p className="text-foreground font-bold">Capacity = 3, K = 2</p>
                    </div>
                    <div className="p-3 rounded-xl bg-card border space-y-1">
                      <span className="text-muted-foreground font-bold uppercase block">Sample Output</span>
                      <p className="text-foreground font-bold">Evicted Node ID = 4</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedViewQuestion.type === "SQL" && (
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 space-y-1">
                    <p className="font-bold">🗄️ Database Dialect &amp; Schema Scope:</p>
                    <p className="text-[0.68rem]">{selectedViewQuestion.optionsOrConstraints}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[0.68rem] space-y-1.5">
                    <p className="text-slate-400 font-bold">Expected Query Solution:</p>
                    <pre className="whitespace-pre-wrap">SELECT account_id, DENSE_RANK() OVER (ORDER BY revenue DESC) FROM corporate_accounts;</pre>
                  </div>
                </div>
              )}

              <DialogFooter className="pt-2">
                <Button type="button" onClick={() => setIsViewQuestionModalOpen(false)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer">
                  Close Question Preview
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* BULK UPLOAD QUESTIONS MODAL DIALOG */}
      <Dialog open={isBulkUploadModalOpen} onOpenChange={setIsBulkUploadModalOpen}>
        <DialogContent className="sm:max-w-xl rounded-2xl">
          <DialogHeader className="pb-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-purple-600 text-white grid place-items-center shadow-glow">
                <Upload className="size-5" />
              </div>
              <div>
                <DialogTitle className="font-extrabold font-sans text-base">Bulk Upload Questions to Bank</DialogTitle>
                <DialogDescription className="text-[0.7rem] font-mono">
                  Upload questions via CSV, JSON, or Excel format into Google Cloud Question Repository.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-xs font-sans">
            {/* DOWNLOAD SAMPLE TEMPLATE */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 font-mono">
              <div>
                <p className="font-bold text-purple-700 dark:text-purple-300">Need a format template?</p>
                <p className="text-[0.65rem] text-muted-foreground">Download pre-formatted CSV template with MCQ, Coding &amp; SQL headers.</p>
              </div>
              <Button size="sm" onClick={handleDownloadSampleCsv} variant="outline" className="h-8 text-xs rounded-xl border-purple-300 text-purple-700 cursor-pointer gap-1 shrink-0">
                <FileSpreadsheet className="size-3.5" /> Sample CSV
              </Button>
            </div>

            {/* DROPZONE / FILE INPUT */}
            <div className="p-6 border-2 border-dashed border-purple-400/50 rounded-2xl bg-muted/20 text-center space-y-3 relative hover:bg-muted/40 transition-all">
              <Upload className="size-8 text-purple-600 mx-auto animate-pulse" />
              <div className="space-y-1">
                <p className="font-bold text-foreground">Drag &amp; Drop Question File Here</p>
                <p className="text-[0.68rem] text-muted-foreground font-mono">Supports CSV, JSON, XLSX (Max 10 MB)</p>
              </div>
              <input
                type="file"
                accept=".csv,.json,.xlsx"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Button type="button" variant="outline" className="h-8 text-xs rounded-xl pointer-events-none">
                Browse File
              </Button>
            </div>

            {/* FILE SELECTED BADGE */}
            {uploadedFile && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 font-mono text-xs flex items-center justify-between">
                <span className="font-bold truncate flex items-center gap-1.5">
                  <Check className="size-4 text-emerald-600" /> Selected: {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)} KB)
                </span>
                <span className="font-bold text-emerald-800">{parsedQuestions.length} Questions Parsed</span>
              </div>
            )}

            {/* PARSED PREVIEW TABLE */}
            {parsedQuestions.length > 0 && (
              <div className="space-y-2">
                <p className="font-bold font-mono text-xs text-foreground">📋 Questions Preview ({parsedQuestions.length} Items):</p>
                <div className="max-h-48 overflow-y-auto border rounded-xl font-mono text-[0.68rem]">
                  <table className="w-full text-left">
                    <thead className="bg-muted/50 border-b text-muted-foreground uppercase text-[0.6rem]">
                      <tr>
                        <th className="p-2">Type</th>
                        <th className="p-2">Title</th>
                        <th className="p-2">Difficulty</th>
                        <th className="p-2">Marks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {parsedQuestions.map((q) => (
                        <tr key={q.id}>
                          <td className="p-2 font-bold">{q.type}</td>
                          <td className="p-2 truncate max-w-xs">{q.title}</td>
                          <td className="p-2">{q.difficulty}</td>
                          <td className="p-2">{q.marks} Mks</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <DialogFooter className="pt-2 gap-2">
              <Button type="button" variant="outline" onClick={() => setIsBulkUploadModalOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCommitImport}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs cursor-pointer gap-1.5"
              >
                <Upload className="size-3.5" /> Import &amp; Index Questions into Bank
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* SEND TEST TO TPO MODAL */}
      <Dialog open={isSendToTpoModalOpen} onOpenChange={(open) => { setIsSendToTpoModalOpen(open); if (!open) { setIsSendSuccess(false); setGeneratedTestLink(""); } }}>
        <DialogContent className="sm:max-w-xl rounded-2xl">
          <DialogHeader className="pb-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-blue-600 text-white grid place-items-center shadow-glow">
                <Send className="size-5" />
              </div>
              <div>
                <DialogTitle className="font-extrabold font-sans text-base">Send Test to Placement Officer</DialogTitle>
                <DialogDescription className="text-[0.7rem] font-mono">
                  The TPO will receive the test details and conduct the exam for eligible students.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {sendToTpoAst && (
            <>
              {isSendSuccess ? (
                /* SUCCESS STATE */
                <div className="flex flex-col items-center justify-center py-8 space-y-5 text-center">
                  <div className="size-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 grid place-items-center">
                    <CheckCircle className="size-8 text-emerald-600" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-extrabold text-emerald-600 font-sans">Test Sent Successfully!</h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      The assessment has been dispatched to <strong>{sendTpoName}</strong> ({sendTpoEmail}).
                    </p>
                  </div>

                  {/* DELIVERY SUMMARY */}
                  <div className="w-full space-y-2 text-xs font-mono">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl border bg-card space-y-0.5 text-left">
                        <p className="text-muted-foreground text-[0.65rem]">Assessment</p>
                        <p className="font-bold text-foreground truncate">{sendToTpoAst.title}</p>
                      </div>
                      <div className="p-2.5 rounded-xl border bg-card space-y-0.5 text-left">
                        <p className="text-muted-foreground text-[0.65rem]">Sent To</p>
                        <p className="font-bold text-foreground">{sendTpoName}</p>
                        <p className="text-[0.62rem] text-blue-600">{sendTpoEmail}</p>
                      </div>
                      <div className="p-2.5 rounded-xl border bg-card space-y-0.5 text-left">
                        <p className="text-muted-foreground text-[0.65rem]">Review Deadline</p>
                        <p className="font-bold text-amber-600">{sendDeadline || "Open Deadline"}</p>
                      </div>
                      <div className="p-2.5 rounded-xl border bg-card space-y-0.5 text-left">
                        <p className="text-muted-foreground text-[0.65rem]">Delivery Status</p>
                        <p className="font-bold text-emerald-600">✓ Delivered</p>
                      </div>
                    </div>

                    {/* GENERATED TEST LINK */}
                    <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-2">
                      <p className="text-[0.65rem] font-bold text-blue-600 uppercase tracking-wider">Generated Assessment Test Link</p>
                      <div className="flex items-center gap-2 bg-card border rounded-lg px-2.5 py-1.5">
                        <span className="flex-1 truncate text-foreground font-mono text-[0.68rem]">{generatedTestLink}</span>
                        <button
                          type="button"
                          onClick={() => { navigator.clipboard.writeText(generatedTestLink); toast.success("Test link copied to clipboard!"); }}
                          className="shrink-0 text-blue-600 font-bold text-[0.65rem] hover:text-blue-800 cursor-pointer"
                        >
                          Copy
                        </button>
                        <a
                          href={generatedTestLink}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 bg-blue-600 text-white font-bold text-[0.65rem] px-2 py-0.5 rounded-md hover:bg-blue-700 cursor-pointer flex items-center gap-1"
                        >
                          <Play className="size-3" /> Open Exam
                        </a>
                      </div>
                      <p className="text-[0.62rem] text-muted-foreground">Click "Open Exam" or share this link with the TPO to conduct the live proctored test.</p>
                    </div>

                    {/* NEXT STEPS */}
                    <div className="p-3 rounded-xl border bg-muted/30 space-y-1 text-left text-[0.68rem] text-muted-foreground">
                      <p className="font-bold text-foreground text-xs mb-1.5">📋 What Happens Next:</p>
                      <p>① TPO <strong>{sendTpoName}</strong> reviews the assessment details via email notification.</p>
                      <p>② TPO assigns eligible students and schedules the exam date &amp; time.</p>
                      <p>③ Students receive the test link via the EduSuite Student Portal.</p>
                      <p>④ Results are auto-graded and sent back to you in the Reports section.</p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => { setIsSendToTpoModalOpen(false); setIsSendSuccess(false); setGeneratedTestLink(""); }}
                    className="bg-brand-gradient shadow-glow font-bold rounded-xl text-xs cursor-pointer"
                  >
                    Done
                  </Button>
                </div>
              ) : (
                /* SEND FORM */
                <form onSubmit={handleSendToTpoSubmit} className="space-y-4 pt-3 text-xs">
                  {/* Assessment badge */}
                  <div className="flex items-center gap-2.5 p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl font-mono">
                    <div className="size-9 rounded-lg bg-purple-600 text-white grid place-items-center shrink-0">
                      <FileCheck2 className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-foreground font-sans truncate">{sendToTpoAst.title}</p>
                      <p className="text-[0.65rem] text-muted-foreground">{sendToTpoAst.id} • {sendToTpoAst.type} • {sendToTpoAst.duration}</p>
                    </div>
                    <Badge className={sendToTpoAst.requestStatus === "Approved" ? "bg-emerald-600 text-white text-[0.6rem] shrink-0" : "bg-purple-600 text-white text-[0.6rem] shrink-0"}>
                      {sendToTpoAst.requestStatus}
                    </Badge>
                  </div>

                  {/* TPO Selection */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">Select TPO / Placement Officer</label>
                      <select
                        value={sendTpoName}
                        onChange={(e) => {
                          setSendTpoName(e.target.value);
                          const emails: Record<string, string> = {
                            "Dr. Ramesh Kumar": "tpo@nitk.edu.in",
                            "Prof. Anita Sharma": "placement@bits.ac.in",
                            "Mr. Suresh Nair": "tpo@vjti.ac.in",
                            "Dr. Meenakshi Iyer": "placements@iitm.ac.in",
                          };
                          setSendTpoEmail(emails[e.target.value] || "tpo@institute.edu.in");
                        }}
                        className="w-full h-9 rounded-xl border border-input bg-card px-2.5 text-xs font-semibold cursor-pointer"
                      >
                        <option value="Dr. Ramesh Kumar">Dr. Ramesh Kumar — NITK Surathkal</option>
                        <option value="Prof. Anita Sharma">Prof. Anita Sharma — BITS Pilani</option>
                        <option value="Mr. Suresh Nair">Mr. Suresh Nair — VJTI Mumbai</option>
                        <option value="Dr. Meenakshi Iyer">Dr. Meenakshi Iyer — IIT Madras</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-semibold text-foreground">TPO Email Address</label>
                      <Input value={sendTpoEmail} onChange={(e) => setSendTpoEmail(e.target.value)} placeholder="tpo@institute.edu.in" required className="h-9 text-xs rounded-xl font-mono" />
                    </div>
                  </div>

                  {/* Review Deadline */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Review & Conduct Deadline (Optional)</label>
                    <Input type="date" value={sendDeadline} onChange={(e) => setSendDeadline(e.target.value)} className="h-9 text-xs rounded-xl font-mono" />
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-foreground">Message to TPO</label>
                    <textarea
                      value={sendMessage}
                      onChange={(e) => setSendMessage(e.target.value)}
                      rows={5}
                      required
                      className="w-full rounded-xl border border-input bg-card px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  {/* What the TPO receives */}
                  <div className="p-3 rounded-xl bg-muted/30 border space-y-1.5 font-mono text-[0.68rem] text-muted-foreground">
                    <p className="font-bold text-foreground text-xs">📨 TPO Will Receive:</p>
                    <p>✓ Assessment title, type, duration, total marks &amp; passing cutoff</p>
                    <p>✓ Unique test link to access and conduct the exam</p>
                    <p>✓ PDF question paper attachment</p>
                    <p>✓ Proctoring &amp; security policy instructions</p>
                  </div>

                  <DialogFooter className="pt-1 gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsSendToTpoModalOpen(false)} className="rounded-xl text-xs">
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs cursor-pointer gap-1.5">
                      <Send className="size-3.5" /> Send Test to TPO
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* CREATE ASSESSMENT MODAL DIALOG */}
      <Dialog open={isCreateAssessmentModalOpen} onOpenChange={setIsCreateAssessmentModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[88vh] flex flex-col p-0 overflow-hidden rounded-3xl border border-border shadow-2xl">
          <DialogHeader className="p-5 pb-4 border-b border-border bg-muted/20 shrink-0">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-2xl bg-purple-600 text-white grid place-items-center shadow-glow shrink-0">
                <Code2 className="size-5" />
              </div>
              <div>
                <DialogTitle className="font-extrabold font-sans text-base">Create &amp; Submit Recruiter Assessment</DialogTitle>
                <DialogDescription className="text-[0.7rem] font-mono">
                  Configure question counts, select subjects, and auto-generate paper from Question Bank for TPO approval.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateAssessmentSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-sans">
            {/* Title & Basic Meta */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-foreground">Assessment Title</label>
                <Input
                  value={newAstTitle}
                  onChange={(e) => setNewAstTitle(e.target.value)}
                  placeholder="e.g. Google Cloud Coding & System Design Round 1"
                  required
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Test Duration</label>
                <Input
                  value={newAstDuration}
                  onChange={(e) => setNewAstDuration(e.target.value)}
                  placeholder="90 Mins"
                  required
                  className="h-9 text-xs rounded-xl font-mono"
                />
              </div>
            </div>

            {/* MCQ & CODING SPECIFICATIONS SIDE-BY-SIDE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* MCQ CARD */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-700 dark:text-amber-300 font-mono text-xs flex items-center gap-1">
                    📚 MCQ Question Setup
                  </span>
                  <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[0.6rem]">
                    Step 1
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground text-[0.68rem]">Number of MCQs</label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={newAstMcqCount}
                      onChange={(e) => setNewAstMcqCount(e.target.value)}
                      required
                      className="h-8 text-xs rounded-xl font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground text-[0.68rem]">MCQ Subject Domain</label>
                    <select
                      value={newAstMcqSubject}
                      onChange={(e) => setNewAstMcqSubject(e.target.value)}
                      className="w-full h-8 rounded-xl border border-input bg-card px-2 text-xs font-semibold cursor-pointer"
                    >
                      <option value="Data Structures & Algorithms">Data Structures &amp; Algorithms</option>
                      <option value="Quantitative Aptitude">Quantitative Aptitude &amp; Verbal</option>
                      <option value="Core Systems (OS & Networks)">Core Systems (OS &amp; Networks)</option>
                      <option value="Database Management Systems (DBMS)">DBMS &amp; SQL Queries</option>
                      <option value="Java/Python Technical">Java / Python Technical</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* CODING CARD */}
              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-700 dark:text-purple-300 font-mono text-xs flex items-center gap-1">
                    💻 Coding Challenge Setup
                  </span>
                  <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-300 text-[0.6rem]">
                    Step 2
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground text-[0.68rem]">Number of Coding Problems</label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={newAstCodingCount}
                      onChange={(e) => setNewAstCodingCount(e.target.value)}
                      required
                      className="h-8 text-xs rounded-xl font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground text-[0.68rem]">Coding Subject Domain</label>
                    <select
                      value={newAstCodingSubject}
                      onChange={(e) => setNewAstCodingSubject(e.target.value)}
                      className="w-full h-8 rounded-xl border border-input bg-card px-2 text-xs font-semibold cursor-pointer"
                    >
                      <option value="Data Structures & Algorithms">Data Structures &amp; Algorithms</option>
                      <option value="System Design & Architecture">System Design &amp; Architecture</option>
                      <option value="Dynamic Programming & Graphs">Dynamic Programming &amp; Graphs</option>
                      <option value="Database SQL Queries">Database SQL Queries</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <Button
                type="button"
                onClick={handleAutoGeneratePaper}
                className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold h-9 rounded-xl gap-1.5 cursor-pointer shadow-sm text-xs"
              >
                🎲 Auto-Pick &amp; Generate Paper
              </Button>

              <Button
                type="button"
                onClick={() => {
                  if (!isPaperAutoGenerated) {
                    handleAutoGeneratePaper();
                  }
                  setIsCreateAssessmentModalOpen(false);
                  setIsPreviewPaperModalOpen(true);
                }}
                variant="outline"
                className="border-blue-500/40 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 font-bold h-9 rounded-xl gap-1.5 cursor-pointer text-xs"
              >
                👁️ Preview Generated Paper ({paperBreakdown.totalQuestions} Qs)
              </Button>

            </div>

            {/* COMPACT DIFFICULTY BREAKDOWN PILLS */}
            {isPaperAutoGenerated && (
              <div className="p-3 rounded-2xl bg-muted/40 border border-border flex items-center justify-between text-[0.68rem] font-mono animate-fade-up">
                <span className="font-bold text-foreground font-sans">Difficulty Distribution:</span>
                <div className="flex items-center gap-1.5">
                  <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 text-[0.6rem]">
                    🟢 40% Easy ({paperBreakdown.easyMcq} MCQ, {paperBreakdown.easyCoding} Coding)
                  </Badge>
                  <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30 text-[0.6rem]">
                    🟡 40% Med ({paperBreakdown.mediumMcq} MCQ, {paperBreakdown.mediumCoding} Coding)
                  </Badge>
                  <Badge className="bg-rose-500/15 text-rose-700 border-rose-500/30 text-[0.6rem]">
                    🔴 20% Hard ({paperBreakdown.hardMcq} MCQ)
                  </Badge>
                </div>
              </div>
            )}
          </form>

          {/* FIXED MODAL FOOTER */}
          <div className="p-4 border-t border-border bg-card flex items-center justify-end gap-2 shrink-0">
            <Button type="button" variant="outline" onClick={() => setIsCreateAssessmentModalOpen(false)} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button onClick={handleCreateAssessmentSubmit} type="button" className="bg-brand-gradient shadow-glow font-bold rounded-xl cursor-pointer text-xs">
              Submit Assessment to Placement Officer (TPO) ✓
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* FULL BROWSER WIDTH SINGLE-COLUMN ASSESSMENT PREVIEW (HACKERRANK / LEETCODE / CODILITY STYLE) */}
      {isPreviewPaperModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 text-foreground flex flex-col w-full min-h-screen overflow-y-auto font-sans select-none animate-in fade-in duration-200">
          {/* 1. TOP BREADCRUMB & HEADER BAR */}
          <header className="bg-card border-b border-border/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 shadow-2xs z-20 w-full">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPreviewPaperModalOpen(false)}
                className="rounded-full size-8 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Menu className="size-4" />
              </Button>
              <div>
                <div className="flex items-center gap-1.5 text-[0.7rem] text-muted-foreground font-mono">
                  <span>Home</span>
                  <span>&gt;</span>
                  <span>Assessments</span>
                  <span>&gt;</span>
                  <span>Google Cloud SDE Assessment 2026</span>
                  <span>&gt;</span>
                  <span className="font-bold text-foreground">Preview</span>
                </div>
                <h1 className="text-lg font-extrabold text-foreground tracking-tight">
                  {newAstTitle || "Google Cloud SDE Placement & Systems Assessment 2026"}
                </h1>
              </div>
            </div>

            {/* TOP RIGHT ACTION BUTTONS */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintPaper}
                className="h-9 px-3.5 rounded-xl text-xs font-bold gap-1.5 cursor-pointer bg-card hover:bg-muted"
                title="Print Question Paper"
              >
                <Printer className="size-4 text-slate-600 dark:text-slate-300" /> Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadPaperPdf()}
                className="h-9 px-3.5 rounded-xl text-xs font-bold gap-1.5 cursor-pointer bg-card hover:bg-muted border-purple-500/30 text-purple-600"
                title="Export PDF Document"
              >
                <Download className="size-4" /> Download PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsPreviewPaperModalOpen(false);
                  setIsCreateAssessmentModalOpen(true);
                }}
                className="h-9 px-3.5 rounded-xl text-xs font-bold gap-1.5 cursor-pointer bg-card hover:bg-muted text-blue-600"
              >
                <Edit className="size-4" /> Edit Setup
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPreviewPaperModalOpen(false)}
                className="rounded-full size-9 text-muted-foreground hover:text-foreground cursor-pointer ml-1"
              >
                <X className="size-5" />
              </Button>
            </div>
          </header>

          {/* 2. MAIN FULL-WIDTH BODY (NO MAX-WIDTH LIMIT, NO INNER SCROLLBARS) */}
          <main className="w-full max-w-none p-4 sm:p-8 space-y-6 flex-1 bg-slate-50 dark:bg-slate-950">

            {/* HORIZONTAL SUMMARY CARDS ROW (100% WIDTH GRID) */}
            <div className="w-full max-w-none bg-card border border-border/80 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-600 grid place-items-center shrink-0">
                    <Building className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-foreground text-sm font-sans">Assessment Metrics Summary</h3>
                    <p className="text-[0.68rem] text-muted-foreground font-mono">Organization: Google Cloud India • Confidential TPO Specification</p>
                  </div>
                </div>
                <Badge className="bg-emerald-600 text-white font-mono text-xs px-2.5 py-0.5 font-bold">
                  Status: Published &amp; Audit Verified
                </Badge>
              </div>

              {/* 8 FULL-WIDTH SUMMARY KPI CARDS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                  <span className="text-[0.65rem] text-muted-foreground block font-sans">Total Questions</span>
                  <span className="text-lg font-extrabold text-purple-600">{paperBreakdown.totalQuestions} Qs</span>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                  <span className="text-[0.65rem] text-muted-foreground block font-sans">Total Marks</span>
                  <span className="text-lg font-extrabold text-emerald-600">{paperBreakdown.totalMarks} Mks</span>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <span className="text-[0.65rem] text-amber-700 dark:text-amber-300 block font-sans">Duration</span>
                  <span className="text-lg font-extrabold text-amber-600">90 Mins</span>
                </div>
                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                  <span className="text-[0.65rem] text-blue-700 dark:text-blue-300 block font-sans">Difficulty</span>
                  <span className="text-lg font-extrabold text-blue-600">Moderate</span>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                  <span className="text-[0.65rem] text-emerald-700 block font-sans">🟢 Easy Split</span>
                  <span className="text-sm font-bold text-emerald-700">8 Qs (36.4%)</span>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <span className="text-[0.65rem] text-amber-700 block font-sans">🟡 Medium Split</span>
                  <span className="text-sm font-bold text-amber-700">9 Qs (40.9%)</span>
                </div>
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                  <span className="text-[0.65rem] text-rose-700 block font-sans">🔴 Hard Split</span>
                  <span className="text-sm font-bold text-rose-700">5 Qs (22.7%)</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-500/10 border border-slate-500/20 space-y-1">
                  <span className="text-[0.65rem] text-muted-foreground block font-sans">Negative Mark</span>
                  <span className="text-sm font-bold text-foreground">None (0%)</span>
                </div>
              </div>
            </div>

            {/* STICKY TOP TOOLBAR FOR QUESTION NAVIGATOR & FILTERS (FULL WIDTH 100%) */}
            <div className="w-full max-w-none bg-card border border-border/80 rounded-2xl p-4 shadow-2xs sticky top-0 z-10 space-y-3 font-mono">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 font-sans">
                  <span className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                    <Search className="size-4 text-purple-600" /> Question Toolbar
                  </span>
                  <div className="relative w-64">
                    <Search className="size-3.5 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      value={previewSearchQuery}
                      onChange={(e) => setPreviewSearchQuery(e.target.value)}
                      placeholder="Search question keyword..."
                      className="h-9 pl-9 text-xs rounded-xl font-mono"
                    />
                  </div>

                  <select
                    value={previewSectionFilter}
                    onChange={(e) => setPreviewSectionFilter(e.target.value as any)}
                    className="h-9 rounded-xl border border-input bg-card px-3 text-xs font-semibold cursor-pointer"
                  >
                    <option value="All">All Sections (5 Sections)</option>
                    <option value="Aptitude">Section 1: Aptitude &amp; Algorithms</option>
                    <option value="Technical">Section 2: Technical MCQs</option>
                    <option value="Coding">Section 3: Live Coding Problems</option>
                  </select>

                  <select
                    value={previewDiffFilter}
                    onChange={(e) => setPreviewDiffFilter(e.target.value as any)}
                    className="h-9 rounded-xl border border-input bg-card px-3 text-xs font-semibold cursor-pointer"
                  >
                    <option value="All">All Difficulties</option>
                    <option value="Easy">🟢 Easy (8 Qs)</option>
                    <option value="Medium">🟡 Medium (9 Qs)</option>
                    <option value="Hard">🔴 Hard (5 Qs)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 font-sans text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewSearchQuery("");
                      setPreviewDiffFilter("All");
                      setPreviewSectionFilter("All");
                    }}
                    className="text-purple-600 hover:underline cursor-pointer font-bold font-mono"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>

              {/* QUICK JUMP QUESTION BADGES ROW (1 TO 22 HORIZONTAL STREAM) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-xs">
                <span className="text-[0.68rem] text-muted-foreground font-sans font-bold mr-2 shrink-0">Quick Jump:</span>
                {Array.from({ length: 22 }, (_, i) => i + 1).map((qNum) => {
                  const isCoding = qNum >= 21;
                  const isHard = qNum === 3 || qNum === 11 || qNum === 17;
                  const isMedium = qNum === 4 || qNum === 7 || qNum === 8 || qNum === 13 || qNum === 14 || qNum === 15 || qNum === 19 || qNum === 20 || qNum === 22;

                  return (
                    <button
                      key={qNum}
                      type="button"
                      onClick={() => {
                        const el = document.getElementById(`full-question-card-${qNum}`);
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                      }}
                      className={`size-7 rounded-lg font-bold border transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                        isCoding
                          ? "bg-purple-600 text-white border-purple-700"
                          : isHard
                          ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-300 hover:bg-rose-500/25"
                          : isMedium
                          ? "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-300 hover:bg-amber-500/25"
                          : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-300 hover:bg-emerald-500/25"
                      }`}
                      title={`Jump to Question ${qNum}`}
                    >
                      Q{qNum}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FULL WIDTH SINGLE COLUMN QUESTIONS FEED (STRETCHES 100% AVAILABLE WIDTH) */}
            <div className="w-full max-w-none space-y-6 font-sans">
              {/* SECTION 1: APTITUDE & ALGORITHMS (MCQS) */}
              {(previewSectionFilter === "All" || previewSectionFilter === "Aptitude") && (
                <div className="w-full space-y-4">
                  <div className="p-4 rounded-2xl bg-card border border-border/80 flex items-center justify-between shadow-2xs w-full">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-purple-500/10 text-purple-600 grid place-items-center font-bold text-sm">
                        🧠
                      </div>
                      <div>
                        <h3 className="font-extrabold text-foreground text-sm">Section 1: Aptitude, Reasoning &amp; Algorithms</h3>
                        <p className="text-[0.68rem] text-muted-foreground font-mono">5 Questions • 5 Marks Total • 1 Mark Each</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono font-bold">
                      Section A
                    </Badge>
                  </div>

                  {/* QUESTION CARDS STREAM (FULL WIDTH CARDS) */}
                  <div className="w-full space-y-4">
                    {[
                      { q: "Which graph traversal algorithm uses a Queue data structure to explore vertices level by level?", opt: ["Breadth-First Search (BFS)", "Depth-First Search (DFS)", "Dijkstra Algorithm", "Topological Sort"], ans: 0, diff: "Easy", exp: "BFS explores all neighbor nodes at current depth before moving deeper, naturally using FIFO Queue." },
                      { q: "What is the time complexity of searching an element in a balanced AVL Binary Search Tree?", opt: ["O(N)", "O(log N)", "O(N log N)", "O(1)"], ans: 1, diff: "Easy", exp: "A balanced AVL tree guarantees O(log N) height, hence search operations run in O(log N) worst-case time." },
                      { q: "Find the odd one out in the sequence: 3, 5, 7, 12, 13, 17, 19.", opt: ["7", "12", "13", "19"], ans: 1, diff: "Easy", exp: "All numbers in the sequence except 12 are prime numbers." },
                      { q: "A train running at a speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?", opt: ["120 metres", "150 metres", "180 metres", "324 metres"], ans: 1, diff: "Medium", exp: "Speed = 60 * (5/18) m/s = 50/3 m/s. Length = Speed * Time = (50/3) * 9 = 150 metres." },
                      { q: "What algorithm is used to detect deadlocks in an operating system resource allocation graph?", opt: ["Banker's Algorithm", "Round Robin", "SJF Scheduling", "Peterson's Algorithm"], ans: 0, diff: "Medium", exp: "Banker's algorithm tests for safety by simulating allocation for max declared resources." }
                    ]
                      .filter(item => {
                        if (previewDiffFilter !== "All" && item.diff !== previewDiffFilter) return false;
                        if (previewSearchQuery && !item.q.toLowerCase().includes(previewSearchQuery.toLowerCase())) return false;
                        return true;
                      })
                      .map((item, idx) => (
                        <div key={idx} id={`full-question-card-${idx + 1}`} className="p-6 rounded-2xl bg-card border border-border/80 space-y-4 shadow-2xs w-full hover:border-primary/40 transition-all">
                          <div className="flex items-center justify-between border-b border-border/60 pb-3 font-mono">
                            <div className="flex items-center gap-3">
                              <span className="size-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold text-xs grid place-items-center shrink-0 border border-purple-200">
                                Q{idx + 1}
                              </span>
                              <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-700 border-purple-300">
                                Aptitude &amp; Algorithms
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs font-bold ${item.diff === "Hard" ? "bg-rose-500/10 text-rose-700 border-rose-300" : item.diff === "Medium" ? "bg-amber-500/10 text-amber-700 border-amber-300" : "bg-emerald-500/10 text-emerald-700 border-emerald-300"}`}>
                                {item.diff === "Hard" ? "🔴 Hard" : item.diff === "Medium" ? "🟡 Medium" : "🟢 Easy"}
                              </Badge>
                              <span className="text-xs text-muted-foreground font-bold">1 Mark</span>
                            </div>
                          </div>

                          <p className="text-sm font-bold text-foreground leading-relaxed font-sans">{item.q}</p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                            {item.opt.map((optText, oIdx) => (
                              <div
                                key={oIdx}
                                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                                  oIdx === item.ans
                                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold"
                                    : "bg-muted/30 border-border/60 text-muted-foreground"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className={`size-5 rounded-full text-[0.62rem] grid place-items-center font-bold ${oIdx === item.ans ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}`}>
                                    {String.fromCharCode(65 + oIdx)}
                                  </span>
                                  <span>{optText}</span>
                                </div>
                                {oIdx === item.ans && (
                                  <span className="text-[0.65rem] text-emerald-700 dark:text-emerald-300 font-extrabold">✓ Correct Answer</span>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* COLLAPSIBLE EXPLANATION */}
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => setExpandedExplanations(prev => ({ ...prev, [idx + 1]: !prev[idx + 1] }))}
                              className="text-xs text-purple-600 font-bold hover:underline cursor-pointer flex items-center gap-1 font-mono"
                            >
                              <span>💡</span> {expandedExplanations[idx + 1] ? "Hide Explanation" : "View Solution Breakdown"}
                            </button>
                            {expandedExplanations[idx + 1] && (
                              <div className="mt-2.5 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-900 dark:text-purple-200 font-mono leading-relaxed">
                                <strong>Explanation:</strong> {item.exp}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* SECTION 2: TECHNICAL & COMPUTER SCIENCE MCQS (15 QUESTIONS) */}
              {(previewSectionFilter === "All" || previewSectionFilter === "Technical") && (
                <div className="w-full space-y-4">
                  <div className="p-4 rounded-2xl bg-card border border-border/80 flex items-center justify-between shadow-2xs w-full">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-blue-500/10 text-blue-600 grid place-items-center font-bold text-sm">
                        💻
                      </div>
                      <div>
                        <h3 className="font-extrabold text-foreground text-sm">Section 2: Technical &amp; Computer Science MCQs</h3>
                        <p className="text-[0.68rem] text-muted-foreground font-mono">15 Questions ({newAstMcqSubject}) • 15 Marks Total</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono font-bold">
                      Section B
                    </Badge>
                  </div>

                  <div className="w-full space-y-4">
                    {[
                      { q: "In relational database indexing, what prevents B+ Tree leaves from becoming unbalanced during random inserts?", opt: ["Table locking", "Automatic hashing", "Node splitting & redistribution", "Compaction"], ans: 2, diff: "Hard", exp: "When a B+ tree node reaches capacity, it splits into two half-full nodes and propagates key upwards." },
                      { q: "Which data structure is optimal for evaluating infix/postfix arithmetic expressions?", opt: ["Stack", "Queue", "Priority Queue", "HashMap"], ans: 0, diff: "Easy", exp: "Operator precedence and operand ordering rely on LIFO behavior provided by Stacks." },
                      { q: "In Java memory management, where are object instances allocated?", opt: ["Stack Memory", "Heap Memory", "Method Area", "Program Counter Register"], ans: 1, diff: "Easy", exp: "All class objects and array instances are allocated in Java Heap Memory." },
                      { q: "What is the primary advantage of a B-Tree over a binary search tree in database storage systems?", opt: ["Faster CPU instruction execution", "Reduced disk I/O seek operations", "Requires zero memory overhead", "Guaranteed O(1) hash lookups"], ans: 1, diff: "Medium", exp: "B-Trees have high fan-out per node matching disk block sizes, drastically reducing disk block reads." },
                      { q: "Which sorting algorithm guarantees O(N log N) worst-case time complexity while maintaining in-place sorting?", opt: ["QuickSort", "HeapSort", "MergeSort", "BubbleSort"], ans: 1, diff: "Medium", exp: "HeapSort achieves O(N log N) worst-case time and O(1) auxiliary space." }
                    ]
                      .filter(item => {
                        if (previewDiffFilter !== "All" && item.diff !== previewDiffFilter) return false;
                        if (previewSearchQuery && !item.q.toLowerCase().includes(previewSearchQuery.toLowerCase())) return false;
                        return true;
                      })
                      .map((item, idx) => {
                        const qNum = idx + 6;
                        return (
                          <div key={qNum} id={`full-question-card-${qNum}`} className="p-6 rounded-2xl bg-card border border-border/80 space-y-4 shadow-2xs w-full hover:border-primary/40 transition-all">
                            <div className="flex items-center justify-between border-b border-border/60 pb-3 font-mono">
                              <div className="flex items-center gap-3">
                                <span className="size-8 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold text-xs grid place-items-center shrink-0 border border-blue-200">
                                  Q{qNum}
                                </span>
                                <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-700 border-blue-300">
                                  Technical CS
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={`text-xs font-bold ${item.diff === "Hard" ? "bg-rose-500/10 text-rose-700 border-rose-300" : item.diff === "Medium" ? "bg-amber-500/10 text-amber-700 border-amber-300" : "bg-emerald-500/10 text-emerald-700 border-emerald-300"}`}>
                                  {item.diff === "Hard" ? "🔴 Hard" : item.diff === "Medium" ? "🟡 Medium" : "🟢 Easy"}
                                </Badge>
                                <span className="text-xs text-muted-foreground font-bold">1 Mark</span>
                              </div>
                            </div>

                            <p className="text-sm font-bold text-foreground leading-relaxed font-sans">{item.q}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                              {item.opt.map((optText, oIdx) => (
                                <div
                                  key={oIdx}
                                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                                    oIdx === item.ans
                                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 font-bold"
                                      : "bg-muted/30 border-border/60 text-muted-foreground"
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <span className={`size-5 rounded-full text-[0.62rem] grid place-items-center font-bold ${oIdx === item.ans ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"}`}>
                                      {String.fromCharCode(65 + oIdx)}
                                    </span>
                                    <span>{optText}</span>
                                  </div>
                                  {oIdx === item.ans && (
                                    <span className="text-[0.65rem] text-emerald-700 dark:text-emerald-300 font-extrabold">✓ Correct Answer</span>
                                  )}
                                </div>
                              ))}
                            </div>

                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => setExpandedExplanations(prev => ({ ...prev, [qNum]: !prev[qNum] }))}
                                className="text-xs text-purple-600 font-bold hover:underline cursor-pointer flex items-center gap-1 font-mono"
                              >
                                <span>💡</span> {expandedExplanations[qNum] ? "Hide Explanation" : "View Solution Breakdown"}
                              </button>
                              {expandedExplanations[qNum] && (
                                <div className="mt-2.5 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-900 dark:text-purple-200 font-mono leading-relaxed">
                                  <strong>Explanation:</strong> {item.exp}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* SECTION 3: LIVE CODING PROBLEMS (2 PROBLEMS) */}
              {(previewSectionFilter === "All" || previewSectionFilter === "Coding") && (
                <div className="w-full space-y-4">
                  <div className="p-4 rounded-2xl bg-card border border-border/80 flex items-center justify-between shadow-2xs w-full">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 grid place-items-center font-bold text-sm">
                        ⚡
                      </div>
                      <div>
                        <h3 className="font-extrabold text-foreground text-sm">Section 3: Live Multi-Compiler Coding Challenges</h3>
                        <p className="text-[0.68rem] text-muted-foreground font-mono">2 Problems ({newAstCodingSubject}) • 50 Marks Total</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono font-bold">
                      Section C
                    </Badge>
                  </div>

                  <div className="w-full space-y-4 font-mono">
                    <div id="full-question-card-21" className="p-6 rounded-2xl bg-card border border-border/80 space-y-4 shadow-2xs w-full">
                      <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="size-8 rounded-lg bg-purple-600 text-white font-extrabold text-xs grid place-items-center shrink-0">
                            Q21
                          </span>
                          <Badge className="bg-purple-600 text-white text-xs font-bold">
                            Live Coding Challenge
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-300 text-xs font-bold">🟢 Easy</Badge>
                          <span className="text-xs text-muted-foreground font-bold">20 Marks</span>
                        </div>
                      </div>

                      <h4 className="font-bold text-foreground text-base font-sans">Problem 1: Distributed Cache Eviction (LRU-K Policy)</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                        Implement an LRU-K cache eviction strategy. The LRU-K algorithm evicts the page whose K-th backward distance is maximum among all cached items in dynamic memory.
                      </p>

                      <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-2">
                        <p className="font-bold text-foreground font-sans">Sample Test Case &amp; Constraints:</p>
                        <p className="text-muted-foreground">Input: Capacity = 3, K = 2, Access Log = [1, 2, 3, 1, 4]</p>
                        <p className="text-emerald-600 font-bold">Expected Output: Evicted Node ID = 2</p>
                      </div>
                    </div>

                    <div id="full-question-card-22" className="p-6 rounded-2xl bg-card border border-border/80 space-y-4 shadow-2xs w-full">
                      <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="size-8 rounded-lg bg-purple-600 text-white font-extrabold text-xs grid place-items-center shrink-0">
                            Q22
                          </span>
                          <Badge className="bg-purple-600 text-white text-xs font-bold">
                            Live Coding Challenge
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-amber-500/10 text-amber-700 border-amber-300 text-xs font-bold">🟡 Medium</Badge>
                          <span className="text-xs text-muted-foreground font-bold">30 Marks</span>
                        </div>
                      </div>

                      <h4 className="font-bold text-foreground text-base font-sans">Problem 2: Optimal Cloud Subgraph Network Connectivity</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                        Given N cloud data centers connected by weighted bidirectional fiber links, calculate the minimum cost MST subtree connecting all nodes under fault tolerance K.
                      </p>

                      <div className="p-4 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-2">
                        <p className="font-bold text-foreground font-sans">Sample Test Case &amp; Constraints:</p>
                        <p className="text-muted-foreground">Input: Nodes = 5, Edges = 7, K = 1</p>
                        <p className="text-emerald-600 font-bold">Expected Output: Minimum Subgraph Cost = 1420</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* 3. STICKY BOTTOM ACTION BAR (100% FULL WIDTH) */}
          <footer className="bg-card border-t border-border/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 shadow-lg z-30 font-sans w-full">
            <Button
              variant="outline"
              onClick={() => setIsPreviewPaperModalOpen(false)}
              className="h-10 px-5 rounded-xl text-xs font-bold border-border cursor-pointer bg-card hover:bg-muted"
            >
              ← Back to Assessments
            </Button>

            <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
              <Button
                variant="outline"
                onClick={() => {
                  setIsPreviewPaperModalOpen(false);
                  setIsCreateAssessmentModalOpen(true);
                }}
                className="h-10 px-4 rounded-xl border-border cursor-pointer bg-card hover:bg-muted"
              >
                <Edit className="size-4 mr-1 text-blue-600" /> Edit Assessment
              </Button>

              <Button
                variant="outline"
                onClick={() => toast.success("Assessment saved as draft!")}
                className="h-10 px-4 rounded-xl border-border cursor-pointer bg-card hover:bg-muted"
              >
                <Save className="size-4 mr-1 text-slate-600" /> Save as Draft
              </Button>

              <Button
                variant="outline"
                onClick={() => handleDownloadPaperPdf()}
                className="h-10 px-4 rounded-xl border-border cursor-pointer bg-card hover:bg-muted"
              >
                <Download className="size-4 mr-1 text-purple-600" /> Export PDF
              </Button>

              <Button
                variant="outline"
                onClick={(e) => {
                  setIsPreviewPaperModalOpen(false);
                  handleCreateAssessmentSubmit(e);
                }}
                className="h-10 px-4 rounded-xl border-border cursor-pointer bg-card hover:bg-muted text-blue-700"
              >
                <Send className="size-4 mr-1" /> Send to TPO
              </Button>

              <Button
                onClick={(e) => {
                  setIsPreviewPaperModalOpen(false);
                  handleCreateAssessmentSubmit(e);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl h-10 px-6 shadow-sm cursor-pointer gap-2"
              >
                <Send className="size-4" /> Publish Assessment
              </Button>
            </div>
          </footer>
        </div>
      )}




      {/* ── FULL BROWSER WIDTH SINGLE-COLUMN PREVIEW OVERLAY FOR EXISTING CARD ASSESSMENTS ── */}
      {isPreviewModalOpen && selectedPreviewAst && (
        <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 text-foreground flex flex-col w-full min-h-screen overflow-y-auto font-sans animate-in fade-in duration-200">
          <header className="bg-card border-b border-border/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 shadow-2xs z-20 w-full">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPreviewModalOpen(false)}
                className="rounded-full size-8 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Menu className="size-4" />
              </Button>
              <div>
                <div className="flex items-center gap-1.5 text-[0.7rem] text-muted-foreground font-mono">
                  <span>Home</span>
                  <span>&gt;</span>
                  <span>Assessments</span>
                  <span>&gt;</span>
                  <span>{selectedPreviewAst.title}</span>
                  <span>&gt;</span>
                  <span className="font-bold text-foreground">Preview</span>
                </div>
                <h1 className="text-lg font-extrabold text-foreground tracking-tight">
                  {selectedPreviewAst.title}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintPaper}
                className="h-9 px-3.5 rounded-xl text-xs font-bold gap-1.5 cursor-pointer bg-card hover:bg-muted"
                title="Print Question Paper"
              >
                <Printer className="size-4 text-slate-600 dark:text-slate-300" /> Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadPaperPdf(selectedPreviewAst.title)}
                className="h-9 px-3.5 rounded-xl text-xs font-bold gap-1.5 cursor-pointer bg-card hover:bg-muted border-purple-500/30 text-purple-600"
                title="Export PDF Document"
              >
                <Download className="size-4" /> Download PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPreviewModalOpen(false)}
                className="h-9 px-3.5 rounded-xl text-xs font-bold gap-1.5 cursor-pointer bg-card hover:bg-muted text-blue-600"
              >
                <Edit className="size-4" /> Edit Setup
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsPreviewModalOpen(false)}
                className="rounded-full size-9 text-muted-foreground hover:text-foreground cursor-pointer ml-1"
              >
                <X className="size-5" />
              </Button>
            </div>
          </header>

          <main className="w-full max-w-none p-4 sm:p-8 space-y-6 flex-1 bg-slate-50 dark:bg-slate-950">
            {/* HORIZONTAL SUMMARY KPI CARDS ROW */}
            <div className="w-full max-w-none bg-card border border-border/80 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-600 grid place-items-center shrink-0">
                    <Building className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-foreground text-sm font-sans">Assessment Metrics Summary</h3>
                    <p className="text-[0.68rem] text-muted-foreground font-mono">Organization: Google Cloud India • Official Recruiter Assessment Template</p>
                  </div>
                </div>
                <Badge className="bg-emerald-600 text-white font-mono text-xs px-2.5 py-0.5 font-bold">
                  ● {selectedPreviewAst.requestStatus}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                  <span className="text-[0.65rem] text-muted-foreground block font-sans">MCQ Count</span>
                  <span className="text-lg font-extrabold text-purple-600">{selectedPreviewAst.mcqCount} Qs</span>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                  <span className="text-[0.65rem] text-muted-foreground block font-sans">Coding Problems</span>
                  <span className="text-lg font-extrabold text-emerald-600">{selectedPreviewAst.codingCount} Probs</span>
                </div>
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
                  <span className="text-[0.65rem] text-amber-700 dark:text-amber-300 block font-sans">Duration</span>
                  <span className="text-lg font-extrabold text-amber-600">{selectedPreviewAst.duration}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-1">
                  <span className="text-[0.65rem] text-blue-700 dark:text-blue-300 block font-sans">Total Marks</span>
                  <span className="text-lg font-extrabold text-blue-600">{selectedPreviewAst.totalMarks} Marks</span>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                  <span className="text-[0.65rem] text-emerald-700 block font-sans">Passing Cutoff</span>
                  <span className="text-sm font-bold text-emerald-700">{selectedPreviewAst.passingMarksPct}% Cutoff</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-500/10 border border-slate-500/20 space-y-1">
                  <span className="text-[0.65rem] text-muted-foreground block font-sans">Template Version</span>
                  <span className="text-sm font-bold text-foreground">{selectedPreviewAst.version}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-500/10 border border-slate-500/20 space-y-1">
                  <span className="text-[0.65rem] text-muted-foreground block font-sans">Negative Mark</span>
                  <span className="text-sm font-bold text-foreground">None (0%)</span>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                  <span className="text-[0.65rem] text-emerald-700 block font-sans">Audit Status</span>
                  <span className="text-sm font-bold text-emerald-700">Verified</span>
                </div>
              </div>
            </div>

            {/* STICKY TOOLBAR & QUICK JUMP */}
            <div className="w-full max-w-none bg-card border border-border/80 rounded-2xl p-4 shadow-2xs sticky top-0 z-10 space-y-3 font-mono">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 font-sans">
                  <span className="font-extrabold text-sm text-foreground flex items-center gap-1.5">
                    <Search className="size-4 text-purple-600" /> Question Toolbar
                  </span>
                  <div className="relative w-64">
                    <Search className="size-3.5 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      value={previewSearchQuery}
                      onChange={(e) => setPreviewSearchQuery(e.target.value)}
                      placeholder="Search question keyword..."
                      className="h-9 pl-9 text-xs rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 font-sans text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewSearchQuery("")}
                    className="text-purple-600 hover:underline cursor-pointer font-bold font-mono"
                  >
                    Reset Search
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 font-mono text-xs">
                <span className="text-[0.68rem] text-muted-foreground font-sans font-bold mr-2 shrink-0">Quick Jump:</span>
                {Array.from({ length: selectedPreviewAst.mcqCount + selectedPreviewAst.codingCount }, (_, i) => i + 1).map((qNum) => (
                  <button
                    key={qNum}
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(`existing-card-q-${qNum}`);
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                    }}
                    className="size-7 rounded-lg font-bold border border-purple-300 bg-purple-500/10 text-purple-700 hover:bg-purple-500/20 cursor-pointer flex items-center justify-center shrink-0"
                  >
                    Q{qNum}
                  </button>
                ))}
              </div>
            </div>

            {/* FULL WIDTH SINGLE COLUMN STREAM */}
            <div className="w-full max-w-none space-y-6 font-sans">
              <div className="w-full space-y-4">
                <div className="p-4 rounded-2xl bg-card border border-border/80 flex items-center justify-between shadow-2xs w-full">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-purple-500/10 text-purple-600 grid place-items-center font-bold text-sm">📚</div>
                    <h3 className="font-extrabold text-foreground text-sm">Technical &amp; Aptitude MCQs ({selectedPreviewAst.mcqCount} Questions)</h3>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono font-bold">Section A</Badge>
                </div>

                <div className="w-full space-y-4 font-mono">
                  {[
                    { q: "What is the time complexity of searching an element in a balanced AVL Binary Search Tree?", opt: ["O(N)", "O(log N)", "O(N log N)", "O(1)"], ans: 1, diff: "Easy" },
                    { q: "Which graph traversal algorithm uses a Queue data structure to explore vertices level by level?", opt: ["Breadth-First Search (BFS)", "Depth-First Search (DFS)", "Dijkstra Algorithm", "Topological Sort"], ans: 0, diff: "Easy" },
                    { q: "In relational database indexing, what prevents B+ Tree leaves from becoming unbalanced during random inserts?", opt: ["Table locking", "Automatic hashing", "Node splitting & redistribution", "Compaction"], ans: 2, diff: "Hard" },
                    { q: "What algorithm is used to detect deadlocks in an operating system resource allocation graph?", opt: ["Banker's Algorithm", "Round Robin", "SJF Scheduling", "Peterson's Algorithm"], ans: 0, diff: "Medium" }
                  ].map((item, idx) => (
                    <div key={idx} id={`existing-card-q-${idx + 1}`} className="p-6 rounded-2xl bg-card border border-border/80 space-y-4 shadow-2xs w-full hover:border-primary/40 transition-all">
                      <div className="flex items-center justify-between border-b border-border/60 pb-3 font-mono">
                        <div className="flex items-center gap-3">
                          <span className="size-8 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-extrabold text-xs grid place-items-center shrink-0 border border-purple-200">
                            Q{idx + 1}
                          </span>
                          <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-700 border-purple-300">Technical MCQs</Badge>
                        </div>
                        <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-300 text-xs font-bold">🟢 Easy</Badge>
                      </div>

                      <p className="text-sm font-bold text-foreground leading-relaxed font-sans">{item.q}</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                        {item.opt.map((optText, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                              oIdx === item.ans ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-900 dark:text-emerald-200 font-bold" : "bg-card text-muted-foreground"
                            }`}
                          >
                            <span>{String.fromCharCode(65 + oIdx)}) {optText}</span>
                            {oIdx === item.ans && <span className="text-[0.65rem] text-emerald-700 font-extrabold">✓ Correct</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedPreviewAst.codingCount > 0 && (
                <div className="w-full space-y-4">
                  <div className="p-4 rounded-2xl bg-card border border-border/80 flex items-center justify-between shadow-2xs w-full">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-600 grid place-items-center font-bold text-sm">⚡</div>
                      <h3 className="font-extrabold text-foreground text-sm">Live Coding Challenges ({selectedPreviewAst.codingCount} Problems)</h3>
                    </div>
                    <Badge variant="outline" className="text-xs font-mono font-bold">Section B</Badge>
                  </div>

                  <div className="w-full space-y-4 font-mono">
                    <div id={`existing-card-q-${selectedPreviewAst.mcqCount + 1}`} className="p-6 rounded-2xl bg-card border border-border/80 space-y-4 shadow-2xs w-full">
                      <div className="flex items-center justify-between border-b border-border/60 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="size-8 rounded-lg bg-purple-600 text-white font-extrabold text-xs grid place-items-center shrink-0">
                            Q{selectedPreviewAst.mcqCount + 1}
                          </span>
                          <Badge className="bg-purple-600 text-white text-xs font-bold">Live Coding</Badge>
                        </div>
                        <Badge className="bg-purple-500/10 text-purple-700 border-purple-300 text-xs font-bold">20 Marks • 🟢 Easy</Badge>
                      </div>

                      <h4 className="font-bold text-foreground text-base font-sans">Problem 1: Distributed Cache Eviction (LRU-K Policy)</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed font-sans">Implement an LRU-K cache eviction strategy in multi-threaded environment.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>

          <footer className="bg-card border-t border-border/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 shadow-lg z-30 font-sans w-full">
            <Button variant="outline" onClick={() => setIsPreviewModalOpen(false)} className="h-10 px-5 rounded-xl text-xs font-bold border-border cursor-pointer bg-card hover:bg-muted">
              ← Back to Assessments
            </Button>
            <Button onClick={() => setIsPreviewModalOpen(false)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl h-10 px-6 shadow-sm text-xs cursor-pointer">
              Close Preview
            </Button>
          </footer>
        </div>
      )}








      {/* EDIT ASSESSMENT MODAL DIALOG */}
      <Dialog open={isEditModalOpen} onOpenChange={(open) => { setIsEditModalOpen(open); if (!open) setEditingAst(null); }}>
        <DialogContent className="sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="size-4 text-primary" /> Edit Assessment
            </DialogTitle>
            <DialogDescription className="font-mono text-[0.7rem]">
              Update assessment details. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>

          {editingAst && (
            <form onSubmit={handleEditAssessmentSubmit} className="space-y-4 pt-2 text-xs">
              {/* Assessment ID Badge */}
              <div className="flex items-center gap-2 p-2.5 bg-muted/40 rounded-xl border border-border/60 font-mono text-[0.68rem]">
                <span className="text-muted-foreground">Assessment ID:</span>
                <span className="font-bold text-primary">{editingAst.id}</span>
                <span className="text-muted-foreground ml-auto">{editingAst.version}</span>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Assessment Title</label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="e.g. Google Cloud DSA Round 2"
                  required
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {/* Type */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Assessment Type</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as any)}
                    className="w-full h-9 rounded-xl border border-input bg-card px-2.5 text-xs font-semibold cursor-pointer"
                  >
                    <option value="MCQ + Coding + SQL">MCQ + Coding + SQL</option>
                    <option value="Coding Only">Coding Only</option>
                    <option value="Aptitude & MCQ">Aptitude &amp; MCQ</option>
                  </select>
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-foreground">Test Duration</label>
                  <Input
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    placeholder="e.g. 90 Mins"
                    required
                    className="h-9 text-xs rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Passing % */}
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Passing Cutoff (%)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={editPassingPct}
                  onChange={(e) => setEditPassingPct(e.target.value)}
                  placeholder="e.g. 75"
                  required
                  className="h-9 text-xs rounded-xl font-mono"
                />
              </div>

              <DialogFooter className="pt-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setIsEditModalOpen(false); setEditingAst(null); }}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand-gradient shadow-glow font-bold rounded-xl text-xs cursor-pointer gap-1">
                  <Edit className="size-3.5" /> Save Changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
