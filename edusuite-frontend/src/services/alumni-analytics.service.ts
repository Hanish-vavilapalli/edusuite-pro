const API_BASE_URL = "http://localhost:5000/api/admin/alumni/analytics";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token") || "super-admin-auth-token";
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };
}

export interface AlumniOverviewData {
  totalAlumni: number;
  activeProfiles: number;
  verifiedEmployment: number;
  employmentRate: number;
  higherStudies: number;
  entrepreneurs: number;
  activeMentors: number;
  referralRequests: number;
  referralPlacements: number;
  totalEvents: number;
  eventParticipants: number;
  totalDonors: number;
  totalDonations: number;
  countries: number;
  activeChapters: number;
  engagementRate: number;
}

export interface DemographicsData {
  alumniByBatch: { batch: string; count: number }[];
  alumniByDepartment: { department: string; count: number }[];
  alumniByCountry: { country: string; count: number }[];
  alumniByCity: { city: string; count: number }[];
  domesticVsInternational: { domestic: number; international: number };
  alumniByDegree: { degree: string; count: number }[];
}

export interface CareersData {
  employmentStatus: { status: string; count: number }[];
  topEmployers: { company: string; count: number }[];
  topIndustries: { industry: string; count: number }[];
  topDesignations: { designation: string; count: number }[];
  employmentRate: number;
  careerAlignment: number;
  higherStudies: number;
  entrepreneurship: number;
  jobSeeking: number;
  careerByDepartment: any[];
  careerByBatch: any[];
  dataAvailability: string;
}

export interface EngagementData {
  totalAnalyzed: number;
  highEngagement: number;
  mediumEngagement: number;
  lowEngagement: number;
  inactive: number;
  engagementBreakdown: { level: string; count: number }[];
}

export interface MentorshipData {
  totalMentors: number;
  activeMentors: number;
  requests: number;
  accepted: number;
  completedSessions: number;
  pendingRequests: number;
  averageRating: number;
  expertiseDistribution: { domain: string; count: number }[];
}

export interface ReferralsData {
  jobsPosted: number;
  referralRequests: number;
  acceptedReferrals: number;
  rejectedReferrals: number;
  studentsReferred: number;
  studentsPlaced: number;
  conversionRate: number;
  topCompanies: { company: string; count: number }[];
}

export interface DonationsData {
  totalDonations: number;
  totalDonors: number;
  firstTimeDonors: number;
  repeatDonors: number;
  averageDonation: number;
  largestDonation: number;
  donationsByPurpose: { purpose: string; totalAmount: number; donorCount: number }[];
}

export interface EventsData {
  totalEvents: number;
  upcomingEvents: number;
  registrations: number;
  attendance: number;
  attendanceRate: number;
  noShowRate: number;
  popularEventTypes: { category: string; count: number }[];
}

export interface FeedbackData {
  responseCount: number;
  curriculumRating: number;
  industryReadiness: number;
  facultyRating: number;
  placementRating: number;
  infrastructureRating: number;
}

export interface DepartmentAnalyticsData {
  departments: {
    department: string;
    totalAlumni: number;
    employmentRate: number;
    higherStudies: number;
    entrepreneurs: number;
  }[];
}

export async function fetchAnalyticsOverview(): Promise<AlumniOverviewData> {
  const res = await fetch(`${API_BASE_URL}/overview`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Unable to load alumni analytics.");
  return res.json();
}

export async function fetchDemographicsAnalytics(filters?: Record<string, string>): Promise<DemographicsData> {
  const query = new URLSearchParams(filters || {}).toString();
  const url = `${API_BASE_URL}/demographics${query ? `?${query}` : ""}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Unable to load alumni analytics.");
  return res.json();
}

export async function fetchCareersAnalytics(): Promise<CareersData> {
  const res = await fetch(`${API_BASE_URL}/careers`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Unable to load alumni analytics.");
  return res.json();
}

export async function fetchEngagementAnalytics(): Promise<EngagementData> {
  const res = await fetch(`${API_BASE_URL}/engagement`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Unable to load alumni analytics.");
  return res.json();
}

export async function fetchMentorshipAnalytics(): Promise<MentorshipData> {
  const res = await fetch(`${API_BASE_URL}/mentorship`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Unable to load alumni analytics.");
  return res.json();
}

export async function fetchReferralsAnalytics(): Promise<ReferralsData> {
  const res = await fetch(`${API_BASE_URL}/referrals`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Unable to load alumni analytics.");
  return res.json();
}

export async function fetchDonationsAnalytics(): Promise<DonationsData> {
  const res = await fetch(`${API_BASE_URL}/donations`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Unable to load alumni analytics.");
  return res.json();
}

export async function fetchEventsAnalytics(): Promise<EventsData> {
  const res = await fetch(`${API_BASE_URL}/events`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Unable to load alumni analytics.");
  return res.json();
}

export async function fetchFeedbackAnalytics(): Promise<FeedbackData> {
  const res = await fetch(`${API_BASE_URL}/feedback`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Unable to load alumni analytics.");
  return res.json();
}

export async function fetchDepartmentAnalytics(): Promise<DepartmentAnalyticsData> {
  const res = await fetch(`${API_BASE_URL}/departments`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Unable to load alumni analytics.");
  return res.json();
}

export function downloadAnalyticsCSV() {
  const token = localStorage.getItem("token") || "super-admin-auth-token";
  window.open(`${API_BASE_URL}/export/csv?token=${encodeURIComponent(token)}`, "_blank");
}
