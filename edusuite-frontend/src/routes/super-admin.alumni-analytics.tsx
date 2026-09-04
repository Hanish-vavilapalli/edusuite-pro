import React, { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Users,
  Briefcase,
  GraduationCap,
  HeartHandshake,
  DollarSign,
  TrendingUp,
  Globe,
  Award,
  Download,
  RefreshCw,
  Filter,
  ShieldCheck,
  Building2,
  Calendar,
  MessageSquare,
  AlertTriangle,
  UserCheck,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { Panel } from "@/components/dashboard/panel";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SimpleBarChart, GroupedBarChart } from "@/components/dashboard/charts";
import {
  fetchAnalyticsOverview,
  fetchDemographicsAnalytics,
  fetchCareersAnalytics,
  fetchEngagementAnalytics,
  fetchMentorshipAnalytics,
  fetchReferralsAnalytics,
  fetchDonationsAnalytics,
  fetchEventsAnalytics,
  fetchFeedbackAnalytics,
  fetchDepartmentAnalytics,
  downloadAnalyticsCSV,
  type AlumniOverviewData,
  type DemographicsData,
  type CareersData,
  type EngagementData,
  type MentorshipData,
  type ReferralsData,
  type DonationsData,
  type EventsData,
  type FeedbackData,
  type DepartmentAnalyticsData
} from "@/services/alumni-analytics.service";

export const Route = createFileRoute("/super-admin/alumni-analytics")({
  head: () => ({
    meta: [{ title: "Alumni Intelligence & Analytics — EduSuite Pro" }],
  }),
  component: AlumniAnalyticsPage,
});

function AlumniAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab State
  const [activeTab, setActiveTab] = useState("overview");

  // Global Filters
  const [batchYear, setBatchYear] = useState("all");
  const [department, setDepartment] = useState("all");
  const [country, setCountry] = useState("all");

  // Analytics Data States
  const [overview, setOverview] = useState<AlumniOverviewData | null>(null);
  const [demographics, setDemographics] = useState<DemographicsData | null>(null);
  const [careers, setCareers] = useState<CareersData | null>(null);
  const [engagement, setEngagement] = useState<EngagementData | null>(null);
  const [mentorship, setMentorship] = useState<MentorshipData | null>(null);
  const [referrals, setReferrals] = useState<ReferralsData | null>(null);
  const [donations, setDonations] = useState<DonationsData | null>(null);
  const [events, setEvents] = useState<EventsData | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [departments, setDepartments] = useState<DepartmentAnalyticsData | null>(null);

  const loadAllAnalytics = async () => {
    setLoading(true);
    setError(null);

    const filterObj: Record<string, string> = {};
    if (batchYear !== "all") filterObj.batchYear = batchYear;
    if (department !== "all") filterObj.department = department;
    if (country !== "all") filterObj.country = country;

    try {
      const [
        ov, demo, car, eng, ment, ref, don, evt, fb, dept
      ] = await Promise.all([
        fetchAnalyticsOverview(),
        fetchDemographicsAnalytics(filterObj),
        fetchCareersAnalytics(),
        fetchEngagementAnalytics(),
        fetchMentorshipAnalytics(),
        fetchReferralsAnalytics(),
        fetchDonationsAnalytics(),
        fetchEventsAnalytics(),
        fetchFeedbackAnalytics(),
        fetchDepartmentAnalytics()
      ]);

      setOverview(ov);
      setDemographics(demo);
      setCareers(car);
      setEngagement(eng);
      setMentorship(ment);
      setReferrals(ref);
      setDonations(don);
      setEvents(evt);
      setFeedback(fb);
      setDepartments(dept);
    } catch (err: any) {
      console.error("Failed to load alumni analytics:", err);
      setError("Unable to load alumni analytics. Please check backend API connection and permissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAnalytics();
  }, [batchYear, department, country]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Alumni Intelligence & Analytics
            </h1>
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 text-xs px-2.5 py-0.5">
              Super Admin + Authorized Staff Only
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Institutional career placement, mentorship impact, donation tracking, and IQAC accreditation analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAllAnalytics}
            disabled={loading}
            className="rounded-xl text-xs gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={downloadAnalyticsCSV}
            className="rounded-xl text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Download className="size-3.5" />
            Export CSV Report
          </Button>
        </div>
      </div>

      {/* Global Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-card/60 p-3 rounded-2xl border border-border/50">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Filter className="size-3.5 text-primary" />
          Global Filters:
        </div>

        <Select value={batchYear} onValueChange={setBatchYear}>
          <SelectTrigger className="w-[140px] h-8 text-xs rounded-xl">
            <SelectValue placeholder="Graduation Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Batches</SelectItem>
            <SelectItem value="Batch of 2024">Batch of 2024</SelectItem>
            <SelectItem value="Batch of 2023">Batch of 2023</SelectItem>
            <SelectItem value="Batch of 2022">Batch of 2022</SelectItem>
            <SelectItem value="Batch of 2021">Batch of 2021</SelectItem>
            <SelectItem value="Batch of 2020">Batch of 2020</SelectItem>
          </SelectContent>
        </Select>

        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-[200px] h-8 text-xs rounded-xl">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="Computer Science & Engineering">Computer Science & Eng</SelectItem>
            <SelectItem value="Artificial Intelligence & Machine Learning">AI & Machine Learning</SelectItem>
            <SelectItem value="Information Technology">Information Technology</SelectItem>
            <SelectItem value="Electronics & Communication Engineering">Electronics & Comm Eng</SelectItem>
          </SelectContent>
        </Select>

        <Select value={country} onValueChange={setCountry}>
          <SelectTrigger className="w-[140px] h-8 text-xs rounded-xl">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            <SelectItem value="India">India</SelectItem>
            <SelectItem value="USA">USA</SelectItem>
            <SelectItem value="UK">UK</SelectItem>
            <SelectItem value="Canada">Canada</SelectItem>
            <SelectItem value="Germany">Germany</SelectItem>
          </SelectContent>
        </Select>

        {(batchYear !== "all" || department !== "all" || country !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setBatchYear("all"); setDepartment("all"); setCountry("all"); }}
            className="h-8 text-xs rounded-xl text-muted-foreground hover:text-foreground"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="size-5 shrink-0" />
            <span className="text-xs font-semibold">{error}</span>
          </div>
          <Button variant="outline" size="sm" onClick={loadAllAnalytics} className="rounded-xl text-xs border-destructive/30">
            Retry
          </Button>
        </div>
      )}

      {/* Overview Top KPI Summary Cards */}
      {overview && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <KpiCard title="Total Alumni" value={overview.totalAlumni.toLocaleString()} icon={Users} hint="Registered alumni profiles" />
          <KpiCard title="Employment Rate" value={`${overview.employmentRate}%`} icon={TrendingUp} hint="Known status verified" />
          <KpiCard title="Active Mentors" value={overview.activeMentors.toString()} icon={HeartHandshake} hint="Available mentors" />
          <KpiCard title="Referral Placements" value={overview.referralPlacements.toString()} icon={Briefcase} hint="Students placed via alumni" />
          <KpiCard title="Total Donations" value={`₹${(overview.totalDonations / 100000).toFixed(2)} L`} icon={DollarSign} hint="Confirmed contributions" />
          <KpiCard title="Engagement Rate" value={`${overview.engagementRate}%`} icon={Award} hint="Active participation" />
          <KpiCard title="Global Reach" value={`${overview.countries} Countries`} icon={Globe} hint="International footprints" />
          <KpiCard title="Active Chapters" value={overview.activeChapters.toString()} icon={Building2} hint="Regional chapters" />
        </div>
      )}

      {/* Interactive Sub-View Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex flex-wrap h-auto p-1 bg-muted/60 rounded-2xl gap-1 overflow-x-auto">
          <TabsTrigger value="overview" className="rounded-xl text-xs px-3 py-1.5">Overview</TabsTrigger>
          <TabsTrigger value="demographics" className="rounded-xl text-xs px-3 py-1.5">Demographics</TabsTrigger>
          <TabsTrigger value="careers" className="rounded-xl text-xs px-3 py-1.5">Career Intelligence</TabsTrigger>
          <TabsTrigger value="engagement" className="rounded-xl text-xs px-3 py-1.5">Engagement</TabsTrigger>
          <TabsTrigger value="mentorship" className="rounded-xl text-xs px-3 py-1.5">Mentorship</TabsTrigger>
          <TabsTrigger value="referrals" className="rounded-xl text-xs px-3 py-1.5">Referrals</TabsTrigger>
          <TabsTrigger value="donations" className="rounded-xl text-xs px-3 py-1.5">Donations</TabsTrigger>
          <TabsTrigger value="events" className="rounded-xl text-xs px-3 py-1.5">Events</TabsTrigger>
          <TabsTrigger value="feedback" className="rounded-xl text-xs px-3 py-1.5">IQAC Feedback</TabsTrigger>
          <TabsTrigger value="departments" className="rounded-xl text-xs px-3 py-1.5">Department Comparative</TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Panel title="Alumni Distribution by Batch">
              {demographics?.alumniByBatch && (
                <SimpleBarChart
                  data={demographics.alumniByBatch.map(b => ({ label: b.batch, value: b.count }))}
                />
              )}
            </Panel>

            <Panel title="Employment & Career Path Breakdown">
              {careers?.employmentStatus && (
                <SimpleBarChart
                  data={careers.employmentStatus.map(s => ({ label: s.status, value: s.count }))}
                />
              )}
            </Panel>
          </div>
        </TabsContent>

        {/* Tab 2: Demographics */}
        <TabsContent value="demographics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Panel title="Alumni Count by Department">
              {demographics?.alumniByDepartment && (
                <SimpleBarChart
                  data={demographics.alumniByDepartment.map(d => ({ label: d.department, value: d.count }))}
                />
              )}
            </Panel>

            <Panel title="Alumni by Country">
              {demographics?.alumniByCountry && (
                <SimpleBarChart
                  data={demographics.alumniByCountry.map(c => ({ label: c.country, value: c.count }))}
                />
              )}
            </Panel>
          </div>

          {demographics?.domesticVsInternational && (
            <Panel title="Domestic vs International Footprint">
              <div className="grid grid-cols-2 gap-4 text-center py-4">
                <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
                  <div className="text-3xl font-extrabold text-primary">{demographics.domesticVsInternational.domestic}</div>
                  <div className="text-xs text-muted-foreground mt-1">Domestic Alumni (India)</div>
                </div>
                <div className="p-4 bg-accent/10 rounded-2xl border border-accent/20">
                  <div className="text-3xl font-extrabold text-foreground">{demographics.domesticVsInternational.international}</div>
                  <div className="text-xs text-muted-foreground mt-1">International Alumni</div>
                </div>
              </div>
            </Panel>
          )}
        </TabsContent>

        {/* Tab 3: Career Intelligence */}
        <TabsContent value="careers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Panel title="Top Recruiting Companies">
              {careers?.topEmployers && (
                <SimpleBarChart
                  data={careers.topEmployers.map(e => ({ label: e.company, value: e.count }))}
                />
              )}
            </Panel>

            <Panel title="Top Industry Sectors">
              {careers?.topIndustries && (
                <SimpleBarChart
                  data={careers.topIndustries.map(i => ({ label: i.industry, value: i.count }))}
                />
              )}
            </Panel>
          </div>
        </TabsContent>

        {/* Tab 4: Engagement */}
        <TabsContent value="engagement" className="space-y-4">
          {engagement && (
            <Panel title="Alumni Engagement Tier Breakdown">
              <SimpleBarChart
                data={engagement.engagementBreakdown.map(e => ({ label: e.level, value: e.count }))}
              />
            </Panel>
          )}
        </TabsContent>

        {/* Tab 5: Mentorship */}
        <TabsContent value="mentorship" className="space-y-4">
          {mentorship && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Panel title="Mentorship Impact Metrics" className="md:col-span-1">
                <div className="space-y-4 py-2">
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-xs text-muted-foreground">Active Mentors</span>
                    <span className="text-sm font-bold text-foreground">{mentorship.activeMentors}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-xs text-muted-foreground">Completed Sessions</span>
                    <span className="text-sm font-bold text-foreground">{mentorship.completedSessions}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-xs text-muted-foreground">Average Rating</span>
                    <span className="text-sm font-bold text-primary">{mentorship.averageRating} / 5.0</span>
                  </div>
                </div>
              </Panel>

              <Panel title="Mentorship Domain Expertise" className="md:col-span-2">
                <SimpleBarChart
                  data={mentorship.expertiseDistribution.map(e => ({ label: e.domain, value: e.count }))}
                />
              </Panel>
            </div>
          )}
        </TabsContent>

        {/* Tab 6: Referrals */}
        <TabsContent value="referrals" className="space-y-4">
          {referrals && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Panel title="Referral Conversion Stats">
                <div className="grid grid-cols-2 gap-4 py-2">
                  <div className="p-3 bg-muted/40 rounded-xl">
                    <div className="text-xs text-muted-foreground">Jobs Posted</div>
                    <div className="text-xl font-bold text-foreground">{referrals.jobsPosted}</div>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl">
                    <div className="text-xs text-muted-foreground">Students Placed</div>
                    <div className="text-xl font-bold text-primary">{referrals.studentsPlaced}</div>
                  </div>
                  <div className="p-3 bg-muted/40 rounded-xl col-span-2">
                    <div className="text-xs text-muted-foreground">Referral Conversion Rate</div>
                    <div className="text-2xl font-extrabold text-emerald-500">{referrals.conversionRate}%</div>
                  </div>
                </div>
              </Panel>

              <Panel title="Top Referral Hiring Companies">
                <SimpleBarChart
                  data={referrals.topCompanies.map(c => ({ label: c.company, value: c.count }))}
                />
              </Panel>
            </div>
          )}
        </TabsContent>

        {/* Tab 7: Donations */}
        <TabsContent value="donations" className="space-y-4">
          {donations && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Panel title="Fundraising Summary">
                <div className="space-y-3 py-2">
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-xs text-muted-foreground">Total Raised</span>
                    <span className="text-lg font-extrabold text-emerald-500">₹{(donations.totalDonations / 100000).toFixed(2)} Lakhs</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-xs text-muted-foreground">Average Contribution</span>
                    <span className="text-sm font-bold text-foreground">₹{donations.averageDonation.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-border/40 pb-2">
                    <span className="text-xs text-muted-foreground">Largest Single Gift</span>
                    <span className="text-sm font-bold text-foreground">₹{donations.largestDonation.toLocaleString()}</span>
                  </div>
                </div>
              </Panel>

              <Panel title="Donations Allocation Purpose">
                <SimpleBarChart
                  data={donations.donationsByPurpose.map(p => ({ label: p.purpose, value: p.totalAmount / 1000 }))}
                />
              </Panel>
            </div>
          )}
        </TabsContent>

        {/* Tab 8: Events */}
        <TabsContent value="events" className="space-y-4">
          {events && (
            <Panel title="Event Participation & Categories">
              <SimpleBarChart
                data={events.popularEventTypes.map(c => ({ label: c.category, value: c.count }))}
              />
            </Panel>
          )}
        </TabsContent>

        {/* Tab 9: IQAC Feedback */}
        <TabsContent value="feedback" className="space-y-4">
          {feedback && (
            <Panel title="IQAC Accreditation Scores (1-5 Scale)">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 py-2 text-center">
                <div className="p-3 bg-muted/40 rounded-xl">
                  <div className="text-2xl font-bold text-primary">{feedback.curriculumRating}</div>
                  <div className="text-xs text-muted-foreground mt-1">Curriculum</div>
                </div>
                <div className="p-3 bg-muted/40 rounded-xl">
                  <div className="text-2xl font-bold text-primary">{feedback.industryReadiness}</div>
                  <div className="text-xs text-muted-foreground mt-1">Industry Readiness</div>
                </div>
                <div className="p-3 bg-muted/40 rounded-xl">
                  <div className="text-2xl font-bold text-primary">{feedback.facultyRating}</div>
                  <div className="text-xs text-muted-foreground mt-1">Faculty</div>
                </div>
                <div className="p-3 bg-muted/40 rounded-xl">
                  <div className="text-2xl font-bold text-primary">{feedback.placementRating}</div>
                  <div className="text-xs text-muted-foreground mt-1">Placement</div>
                </div>
                <div className="p-3 bg-muted/40 rounded-xl">
                  <div className="text-2xl font-bold text-primary">{feedback.infrastructureRating}</div>
                  <div className="text-xs text-muted-foreground mt-1">Infrastructure</div>
                </div>
              </div>
            </Panel>
          )}
        </TabsContent>

        {/* Tab 10: Department Comparative */}
        <TabsContent value="departments" className="space-y-4">
          {departments && (
            <Panel title="Departmental Alumni Performance Comparison">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border/40">
                    <tr>
                      <th className="p-3">Department</th>
                      <th className="p-3">Total Alumni</th>
                      <th className="p-3">Employment Rate</th>
                      <th className="p-3">Higher Studies</th>
                      <th className="p-3">Entrepreneurs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {departments.departments.map((d, idx) => (
                      <tr key={idx} className="hover:bg-muted/20">
                        <td className="p-3 font-semibold text-foreground">{d.department}</td>
                        <td className="p-3">{d.totalAlumni}</td>
                        <td className="p-3 text-emerald-500 font-bold">{d.employmentRate}%</td>
                        <td className="p-3">{d.higherStudies}</td>
                        <td className="p-3">{d.entrepreneurs}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AlumniAnalyticsPage;
