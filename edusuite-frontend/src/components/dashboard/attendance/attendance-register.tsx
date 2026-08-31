import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Panel } from "@/components/dashboard/panel";
import type { StudentAttendance } from "@/data/faculty-mock-data";

interface AttendanceRegisterProps {
  students?: StudentAttendance[];
  subject?: string;
  section?: string;
}

export function AttendanceRegister({ students = [], subject, section }: AttendanceRegisterProps) {
  // Generate dates 01 Aug to 15 Aug
  const days = Array.from({ length: 15 }, (_, i) => i + 1);

  const getStatusColor = (val: string) => {
    switch (val) {
      case "P":
        return "text-emerald-600 bg-emerald-500/5 font-extrabold";
      case "A":
        return "text-rose-600 bg-rose-500/5 font-extrabold";
      case "L":
        return "text-amber-600 bg-amber-500/5 font-bold";
      case "OD":
        return "text-blue-600 bg-blue-500/5 font-bold";
      default:
        return "text-purple-600 bg-purple-500/5 font-bold";
    }
  };

  // Mock function returning choices based on indices to look random yet deterministic
  const getMockStatus = (roll: string, day: number) => {
    const val = (roll.charCodeAt(roll.length - 1) + day) % 15;
    if (val === 3 || val === 11) return "A";
    if (val === 7) return "L";
    if (val === 13) return "OD";
    if (val === 14) return "ML";
    return "P";
  };

  const studentList = students && students.length > 0 ? students : Array.from({ length: 24 }).map((_, i) => ({
    rollNumber: `26SEC0${(i + 1).toString().padStart(2, "0")}`,
    name: ["Alapati Charan", "Meka Krishna", "Boddu Varun", "K. Sai Teja", "Sanjay Gupta", "A. Meghana", "R. Karthik", "J. Rahul"][i % 8] || `Student ${i + 1}`,
    status: "Present",
    percentage: 85
  }));

  return (
    <Panel
      title={`Monthly Attendance Register Grid ${subject && subject !== 'ALL' ? `— ${subject}` : ''}`}
      description="Visual matrix showing daily attendance logs for August 2026"
      className="border border-border bg-card rounded-2xl p-5 shadow-card text-xs"
    >
      <div className="overflow-x-auto max-w-full rounded-2xl border">
        <Table className="min-w-[800px] text-xs">
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-[180px] font-bold sticky left-0 bg-background/90 z-10 border-r">Student Name</TableHead>
              {days.map((day) => (
                <TableHead key={day} className="text-center font-mono font-bold w-[45px]">
                  {day < 10 ? `0${day}` : day}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {studentList.map((stud) => (
              <TableRow key={stud.rollNumber} className="hover:bg-muted/20">
                <TableCell className="font-bold text-foreground sticky left-0 bg-background/90 z-10 border-r">
                  <div>
                    <p className="truncate w-[160px]">{stud.name}</p>
                    <p className="font-mono text-[0.55rem] text-muted-foreground font-semibold mt-0.5">{stud.rollNumber}</p>
                  </div>
                </TableCell>
                {days.map((day) => {
                  const status = getMockStatus(stud.rollNumber, day);
                  return (
                    <TableCell
                      key={day}
                      className={`text-center font-mono text-[0.7rem] border-r border-b/20 last:border-r-0 ${getStatusColor(status)}`}
                    >
                      {status}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Panel>
  );
}
