import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/logo";
import { HostelService, HostelRegistrationApplicant } from "./HostelService";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const ROOM_OPTIONS = [
  {
    id: "ac_double",
    name: "AC Double Sharing",
    type: "AC Double",
    price: "85,000",
    block: "Block B (Boys)",
    floor: "Floor 1",
    roomNumber: "101",
    occupancy: "1/2",
    occupancyRate: 50,
    image: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800&auto=format&fit=crop&q=80",
    features: ["Air Conditioned", "Attached Washroom", "Twin Study Units", "Personal Lockers", "High-speed Wi-Fi"],
  },
  {
    id: "ac_single",
    name: "AC Single Deluxe",
    type: "AC Single",
    price: "1,10,000",
    block: "Block B (Boys)",
    floor: "Floor 2",
    roomNumber: "201",
    occupancy: "0/1",
    occupancyRate: 0,
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&auto=format&fit=crop&q=80",
    features: ["Air Conditioned", "Private Bathroom", "Executive Workstation", "Balcony", "24/7 Power Backup"],
  },
  {
    id: "non_ac_double",
    name: "Non-AC Double",
    type: "Non-AC Double",
    price: "65,000",
    block: "Block B (Boys)",
    floor: "Floor 1",
    roomNumber: "105",
    occupancy: "1/2",
    occupancyRate: 50,
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&auto=format&fit=crop&q=80",
    features: ["Natural Ventilation", "Twin Study Desks", "Ceiling Fan", "Shared Bathroom", "RO Drinking Water"],
  },
  {
    id: "ac_triple",
    name: "AC Triple Sharing",
    type: "AC Triple",
    price: "70,000",
    block: "Block B (Boys)",
    floor: "Floor 3",
    roomNumber: "302",
    occupancy: "2/3",
    occupancyRate: 66,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80",
    features: ["Centralized AC", "3 Study Tables", "Attached Washroom", "3 Individual Wardrobes"],
  },
];

const STEPS = [
  { id: 1, label: "Personal Info" },
  { id: 2, label: "Contact Info" },
  { id: 3, label: "Academic Info" },
  { id: 4, label: "Medical Info" },
  { id: 5, label: "Hostel Info" },
  { id: 6, label: "Terms & Conditions" },
];

export function HostelRegistrationPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedApp, setSubmittedApp] = useState<HostelRegistrationApplicant | null>(null);

  const [selectedRoom, setSelectedRoom] = useState<string>("ac_double");
  const [showRoomPreview, setShowRoomPreview] = useState<boolean>(true);

  // Form Fields
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    fullName: "",
    registrationNumber: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    profilePhoto: "",

    // Step 2: Contact Information
    mobileNumber: "",
    email: "",
    permanentAddress: "",
    city: "",
    district: "",
    state: "",
    pincode: "",
    parentName: "",
    parentContact: "",
    parentEmail: "",
    emergencyContact: "",

    // Step 3: Academic Information
    college: "MVGR College of Engineering",
    course: "",
    department: "",
    yearOfStudy: "",
    semester: "",
    section: "A",
    admissionNumber: "",

    // Step 4: Medical Information
    medicalConditions: "",
    allergies: "",
    emergencyMedicalInfo: "",
    specialRequirements: "",
    medications: "",

    // Step 5: Hostel Information
    hostelRequired: "Yes",
    preferredBlock: "Boys Hostel",
    roomTypePreference: "AC Double Sharing",
    specialAccommodationReq: "",

    // Step 6: Terms & Conditions
    agreeTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photoPreview, setPhotoPreview] = useState<string>("");

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image (JPG or PNG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      setPhotoPreview(src);
      handleChange("profilePhoto", src);
      toast.success("Profile photo uploaded!");
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPhotoPreview("");
    handleChange("profilePhoto", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Step Validation
  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName.trim()) errs.fullName = "Full Name is required.";
      if (!formData.registrationNumber.trim()) errs.registrationNumber = "Registration Number is required.";
      if (!formData.dateOfBirth) errs.dateOfBirth = "Date of Birth is required.";
      if (!formData.gender) errs.gender = "Please select gender.";
      if (!photoPreview && !formData.profilePhoto) errs.profilePhoto = "Profile photo is required.";
    }

    if (step === 2) {
      if (!formData.mobileNumber.trim() || !/^[6-9]\d{9}$/.test(formData.mobileNumber.trim())) {
        errs.mobileNumber = "Valid 10-digit mobile number is required.";
      }
      if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
        errs.email = "Valid email address is required.";
      }
      if (!formData.permanentAddress.trim()) errs.permanentAddress = "Permanent Address is required.";
      if (!formData.city.trim()) errs.city = "City is required.";
      if (!formData.district.trim()) errs.district = "District is required.";
      if (!formData.state) errs.state = "State is required.";
      if (!formData.pincode.trim() || !/^\d{6}$/.test(formData.pincode.trim())) errs.pincode = "Valid 6-digit PIN code is required.";
      if (!formData.parentName.trim()) errs.parentName = "Parent/Guardian name is required.";
      if (!formData.parentContact.trim() || !/^[6-9]\d{9}$/.test(formData.parentContact.trim())) {
        errs.parentContact = "Valid 10-digit parent mobile number is required.";
      }
      if (!formData.emergencyContact.trim() || !/^[6-9]\d{9}$/.test(formData.emergencyContact.trim())) {
        errs.emergencyContact = "Valid emergency contact is required.";
      }
    }

    if (step === 3) {
      if (!formData.college.trim()) errs.college = "College name is required.";
      if (!formData.course) errs.course = "Please select course / program.";
      if (!formData.department) errs.department = "Please select department / branch.";
      if (!formData.yearOfStudy) errs.yearOfStudy = "Please select year of study.";
      if (!formData.semester) errs.semester = "Please select semester.";
    }

    if (step === 6) {
      if (!formData.agreeTerms) errs.agreeTerms = "You must agree to the terms and regulations to submit.";
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      const firstKey = Object.keys(errs)[0];
      toast.error(`Please complete: ${errs[firstKey]}`);
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 6) {
        setCurrentStep((p) => p + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((p) => p - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(6)) return;

    setIsSubmitting(true);
    try {
      const selectedRoomData = ROOM_OPTIONS.find((r) => r.id === selectedRoom) || ROOM_OPTIONS[0];

      // Auto generate clean Application ID: e.g. HOSTEL2026CSE001
      const deptCode = (formData.department || "GEN").replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();
      const randomSeq = Math.floor(100 + Math.random() * 900);
      const generatedAppId = `HOSTEL2026${deptCode}${randomSeq}`;

      const payload = {
        applicationId: generatedAppId,
        fullName: formData.fullName.trim(),
        registrationNumber: formData.registrationNumber.trim().toUpperCase(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        profilePhoto: photoPreview || formData.profilePhoto,
        permanentAddress: formData.permanentAddress.trim(),
        city: formData.city.trim(),
        district: formData.district.trim(),
        state: formData.state,
        pincode: formData.pincode.trim(),

        mobileNumber: formData.mobileNumber.trim(),
        email: formData.email.trim(),
        parentName: formData.parentName.trim(),
        parentContact: formData.parentContact.trim(),
        parentEmail: formData.parentEmail.trim(),
        emergencyContact: formData.emergencyContact.trim(),

        college: formData.college.trim(),
        course: formData.course,
        department: formData.department,
        yearOfStudy: formData.yearOfStudy,
        semester: formData.semester,
        section: formData.section,
        admissionNumber: formData.admissionNumber.trim(),

        medicalConditions: formData.medicalConditions.trim(),
        allergies: formData.allergies.trim(),
        emergencyMedicalInfo: formData.emergencyMedicalInfo.trim(),
        specialRequirements: formData.specialRequirements.trim(),
        medications: formData.medications.trim(),

        hostelRequired: formData.hostelRequired === "Yes",
        preferredBlock: formData.preferredBlock,
        roomTypePreference: selectedRoomData.name,
        specialAccommodationReq: formData.specialAccommodationReq.trim(),
        status: "PENDING_ALLOCATION" as const,
        agreeTerms: formData.agreeTerms,
      };

      const result = await HostelService.submitRegistration(payload);
      if (result.success && result.data) {
        setSubmittedApp({
          ...result.data,
          applicationId: generatedAppId,
          status: "PENDING_ALLOCATION",
        });
        toast.success("Hostel Registration submitted! Queued for Warden allocation.");
      } else {
        toast.error(result.error || "Failed to submit registration.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeRoomObj = ROOM_OPTIONS.find((r) => r.id === selectedRoom) || ROOM_OPTIONS[0];

  return (
    <div className="campusstay-root">
      {/* ── EMBEDDED EXACT CAMPUSSTAY CSS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700&display=swap');

        .campusstay-root {
          font-family: 'Urbanist', sans-serif;
          background-color: #f8fafc;
          min-height: 100vh;
          padding: 2.5rem 1rem;
          color: #1e293b;
        }

        .campusstay-container {
          max-width: 920px;
          margin: 0 auto;
        }

        .campusstay-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .campusstay-logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .campusstay-logo-icon {
          width: 36px;
          height: 36px;
          background: #2563eb;
          color: #ffffff;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.25rem;
          box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
        }

        .campusstay-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.025em;
          margin: 0;
        }

        .campusstay-subtitle {
          color: #64748b;
          font-size: 0.95rem;
          margin: 0 0 1.75rem 0;
        }

        /* ── PROGRESS STEPPER ── */
        .campusstay-stepper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 720px;
          margin: 0 auto 2.5rem auto;
        }

        .campusstay-stepper-line {
          position: absolute;
          top: 18px;
          left: 30px;
          right: 30px;
          height: 2px;
          background-color: #e2e8f0;
          z-index: 1;
        }

        .campusstay-stepper-fill {
          height: 100%;
          background-color: #0f172a;
          transition: width 0.3s ease;
        }

        .campusstay-step-item {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0;
        }

        .campusstay-step-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid #e2e8f0;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .campusstay-step-item.active .campusstay-step-circle {
          background: #0f172a;
          border-color: #0f172a;
          color: #ffffff;
          box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.1);
        }

        .campusstay-step-item.completed .campusstay-step-circle {
          background: #10b981;
          border-color: #10b981;
          color: #ffffff;
        }

        .campusstay-step-label {
          margin-top: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          white-space: nowrap;
        }

        .campusstay-step-item.active .campusstay-step-label {
          color: #0f172a;
          font-weight: 700;
        }

        /* ── CARD & SECTIONS ── */
        .campusstay-card {
          background: #ffffff;
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
        }

        .campusstay-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 2rem;
        }

        .campusstay-section-header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .campusstay-section-icon {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #eff6ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }

        .campusstay-section-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .campusstay-section-desc {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0.2rem 0 0 0;
        }

        /* Photo upload circular zone */
        .campusstay-photo-zone {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .campusstay-photo-circle {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border: 2px dashed #93c5fd;
          background: #f8fafc;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.2s;
        }

        .campusstay-photo-circle:hover {
          background: #eff6ff;
          border-color: #2563eb;
        }

        .campusstay-photo-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: #0f172a;
          margin-top: 0.5rem;
        }

        .campusstay-photo-preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .campusstay-photo-remove {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          color: #ffffff;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
          cursor: pointer;
        }

        .campusstay-photo-circle:hover .campusstay-photo-remove {
          opacity: 1;
        }

        /* Form Grid & Inputs */
        .campusstay-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        @media (max-width: 640px) {
          .campusstay-grid {
            grid-template-columns: 1fr;
          }
          .campusstay-card {
            padding: 1.5rem;
          }
          .campusstay-section-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1.5rem;
          }
        }

        .campusstay-field {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .campusstay-field.full-width {
          grid-column: 1 / -1;
        }

        .campusstay-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #334155;
        }

        .campusstay-required {
          color: #ef4444;
          font-weight: 700;
        }

        .campusstay-input, .campusstay-select, .campusstay-textarea {
          width: 100%;
          padding: 0.65rem 0.9rem;
          font-family: inherit;
          font-size: 0.875rem;
          color: #1e293b;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .campusstay-input:focus, .campusstay-select:focus, .campusstay-textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
        }

        .campusstay-input::placeholder, .campusstay-textarea::placeholder {
          color: #94a3b8;
        }

        .campusstay-input.error, .campusstay-select.error, .campusstay-textarea.error {
          border-color: #ef4444;
          background-color: #fef2f2;
        }

        .campusstay-err-msg {
          font-size: 0.75rem;
          font-weight: 600;
          color: #ef4444;
        }

        /* ── BUTTONS ── */
        .campusstay-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #f1f5f9;
        }

        .campusstay-btn-back {
          padding: 0.65rem 1.5rem;
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 600;
          color: #475569;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .campusstay-btn-back:hover:not(:disabled) {
          background: #f8fafc;
          color: #1e293b;
        }

        .campusstay-btn-back:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .campusstay-btn-next {
          padding: 0.65rem 2rem;
          font-family: inherit;
          font-size: 0.875rem;
          font-weight: 700;
          color: #ffffff;
          background: #0f172a;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .campusstay-btn-next:hover:not(:disabled) {
          background: #1e293b;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
        }

        /* ── ROOM SELECTION CARDS ── */
        .campusstay-room-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }

        .campusstay-room-card {
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 1rem;
          cursor: pointer;
          background: #ffffff;
          transition: all 0.2s;
        }

        .campusstay-room-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
        }

        .campusstay-room-card.selected {
          border-color: #2563eb;
          background: #eff6ff;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
        }

        .campusstay-room-number {
          font-size: 1rem;
          font-weight: 700;
          color: #0f172a;
        }

        .campusstay-room-occupancy {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 0.25rem;
        }

        .campusstay-room-price {
          font-size: 0.85rem;
          font-weight: 700;
          color: #2563eb;
          margin-top: 0.5rem;
        }

        .campusstay-room-block, .campusstay-room-floor {
          font-size: 0.75rem;
          color: #475569;
          margin-top: 0.15rem;
        }

        .campusstay-room-preview {
          margin-top: 1.5rem;
          padding: 1.25rem;
          border-radius: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        @media (min-width: 640px) {
          .campusstay-room-preview {
            flex-direction: row;
            align-items: center;
          }
        }

        .campusstay-room-preview-img {
          width: 100%;
          max-width: 240px;
          height: 140px;
          object-fit: cover;
          border-radius: 12px;
        }

        /* ── TERMS BOX ── */
        .campusstay-terms-box {
          max-height: 260px;
          overflow-y: auto;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.25rem;
          font-size: 0.825rem;
          color: #475569;
          line-height: 1.6;
        }

        .campusstay-terms-box h4 {
          font-size: 0.875rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0.75rem 0 0.25rem 0;
        }
        .campusstay-terms-box h4:first-child {
          margin-top: 0;
        }

        .campusstay-doc-note {
          background-color: #fff8e1;
          padding: 1rem;
          border-radius: 8px;
          border-left: 4px solid #ffc107;
          margin-top: 1rem;
        }

        .campusstay-terms-check {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-top: 1.25rem;
          padding: 1rem;
          background: #eff6ff;
          border: 1px solid #dbeafe;
          border-radius: 12px;
        }

        .campusstay-terms-check input {
          margin-top: 0.2rem;
          width: 1rem;
          height: 1rem;
          cursor: pointer;
        }

        .campusstay-terms-check label {
          font-size: 0.8rem;
          color: #334155;
          cursor: pointer;
          line-height: 1.5;
        }
      `}</style>

      <div className="campusstay-container">
        {/* ── HEADER WITH LOGO ── */}
        <div className="campusstay-header">
          <div className="campusstay-logo-container flex items-center justify-center gap-3">
            <Logo showName className="h-11 w-auto" />
          </div>
          <p className="campusstay-subtitle">
            Complete your hostel accommodation application by filling out the form below
          </p>

          {/* ── PROGRESS STEPPER (1 to 6) ── */}
          <div className="campusstay-stepper">
            <div className="campusstay-stepper-line">
              <div
                className="campusstay-stepper-fill"
                style={{ width: `${((currentStep - 1) / 5) * 100}%` }}
              />
            </div>
            {STEPS.map((s) => {
              const isCurrent = currentStep === s.id;
              const isPassed = currentStep > s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    if (s.id < currentStep) setCurrentStep(s.id);
                  }}
                  disabled={s.id > currentStep}
                  className={`campusstay-step-item ${isCurrent ? "active" : ""} ${isPassed ? "completed" : ""}`}
                >
                  <div className="campusstay-step-circle">
                    {isPassed ? "✓" : s.id}
                  </div>
                  <span className="campusstay-step-label">{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── CONFIRMATION / SUCCESS VIEW ── */}
        {submittedApp ? (
          <div className="campusstay-card" style={{ textAlign: "center" }}>
            <div style={{ width: "64px", height: "64px", background: "#d1fae5", color: "#059669", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem auto", fontSize: "2rem" }}>
              ✓
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0f172a", margin: "0 0 0.5rem 0" }}>
              Student Registered Successfully!
            </h2>
            <p style={{ color: "#059669", fontSize: "0.95rem", fontWeight: 700, margin: "0 0 1.25rem 0" }}>
              ✓ Student login account created automatically in User Management.
            </p>

            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "1.5rem", maxWidth: "520px", margin: "0 auto 1.5rem auto", textAlign: "left", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "0.75rem", marginBottom: "0.75rem" }}>
                <div>
                  <div style={{ color: "#64748b", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>Student ID</div>
                  <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#2563eb", margin: "0.15rem 0" }}>
                    {submittedApp.registrationNumber || submittedApp.applicationId || submittedApp.id}
                  </div>
                </div>
                <div style={{ background: "#fef3c7", color: "#92400e", padding: "0.3rem 0.8rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700 }}>
                  PENDING ROOM ALLOCATION
                </div>
              </div>

              <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "1.05rem" }}>{submittedApp.fullName}</div>
              <div style={{ color: "#475569", marginTop: "0.25rem" }}>Course / Dept: <strong>{submittedApp.course || "B.Tech"} &bull; {submittedApp.department}</strong></div>

              {/* Auto Generated Credentials Box */}
              <div style={{ marginTop: "1rem", background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "12px", padding: "1rem" }}>
                <div style={{ fontWeight: 800, color: "#065f46", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                  🔐 Generated Student Login Credentials
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem", fontSize: "0.85rem" }}>
                  <span style={{ color: "#047857" }}>Login Email:</span>
                  <strong style={{ color: "#064e3b", fontFamily: "monospace" }}>
                    {submittedApp.email || `${submittedApp.fullName.split(' ')[0].toLowerCase()}@vignan_student.edu.in`}
                  </strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem", fontSize: "0.85rem" }}>
                  <span style={{ color: "#047857" }}>Default Password:</span>
                  <strong style={{ color: "#064e3b", fontFamily: "monospace" }}>password123</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                  <span style={{ color: "#047857" }}>First Name Login:</span>
                  <strong style={{ color: "#064e3b" }}>{submittedApp.fullName.split(' ')[0]}</strong>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => window.open("/student/login", "_blank")}
                className="campusstay-btn-next"
                style={{ background: "#059669", padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}
              >
                Go to Student Login →
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="campusstay-btn-back"
                style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}
              >
                Print Slip
              </button>
              <button
                type="button"
                onClick={() => {
                  setSubmittedApp(null);
                  setCurrentStep(1);
                  setFormData({
                    fullName: "",
                    registrationNumber: "",
                    dateOfBirth: "",
                    gender: "",
                    bloodGroup: "",
                    profilePhoto: "",
                    permanentAddress: "",
                    city: "",
                    district: "",
                    state: "",
                    pincode: "",
                    mobileNumber: "",
                    email: "",
                    parentName: "",
                    parentContact: "",
                    parentEmail: "",
                    emergencyContact: "",
                    college: "MVGR College of Engineering",
                    course: "",
                    department: "",
                    yearOfStudy: "",
                    semester: "",
                    section: "A",
                    admissionNumber: "",
                    medicalConditions: "",
                    allergies: "",
                    emergencyMedicalInfo: "",
                    specialRequirements: "",
                    medications: "",
                    hostelRequired: "Yes",
                    preferredBlock: "Boys Hostel",
                    roomTypePreference: "AC Double Sharing",
                    specialAccommodationReq: "",
                    agreeTerms: false,
                  });
                  setPhotoPreview("");
                }}
                className="campusstay-btn-back"
              >
                Submit Another Application
              </button>
            </div>
          </div>
        ) : (
          /* ── MAIN FORM CARD ── */
          <form onSubmit={handleSubmit} className="campusstay-card">
            {/* ═════════ STEP 1: PERSONAL INFORMATION ═════════ */}
            {currentStep === 1 && (
              <div>
                <div className="campusstay-section-header">
                  <div className="campusstay-section-header-left">
                    <div className="campusstay-section-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                      </svg>
                    </div>
                    <div>
                      <h2 className="campusstay-section-title">Personal Information</h2>
                      <p className="campusstay-section-desc">Provide your personal details as they appear on your official documents</p>
                    </div>
                  </div>

                  {/* Profile Photo Upload */}
                  <div className="campusstay-photo-zone">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoChange}
                      accept="image/jpeg,image/png"
                      style={{ display: "none" }}
                    />
                    <div
                      className="campusstay-photo-circle"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {photoPreview ? (
                        <>
                          <img src={photoPreview} alt="Profile" className="campusstay-photo-preview-img" />
                          <button type="button" onClick={removePhoto} className="campusstay-photo-remove" title="Remove Photo">
                            🗑️
                          </button>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="#2563eb" viewBox="0 0 16 16" style={{ marginBottom: "2px" }}>
                            <path d="M15 12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1.172a2 2 0 0 0 1.414-.586l.828-.828A2 2 0 0 1 7.828 3h.344a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 11.828 5H13a1 1 0 0 1 1 1zM2 4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.172a1 1 0 0 1-.707-.293l-.828-.828A1 1 0 0 0 8.172 2H7.828a1 1 0 0 0-.707.293l-.828.828A1 1 0 0 1 5.172 4z"/>
                            <path d="M8 11a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5m0 1a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M3 6.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0"/>
                          </svg>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "#1e293b" }}>Upload</span>
                          <span style={{ fontSize: "9px", color: "#94a3b8" }}>Photo</span>
                        </>
                      )}
                    </div>
                    <span className="campusstay-photo-label">
                      Profile Photo <span className="campusstay-required">*</span>
                    </span>
                    {errors.profilePhoto && (
                      <span className="campusstay-err-msg">{errors.profilePhoto}</span>
                    )}
                  </div>
                </div>

                <div className="campusstay-grid">
                  <div className="campusstay-field">
                    <label className="campusstay-label">
                      Full Name <span className="campusstay-required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`campusstay-input ${errors.fullName ? "error" : ""}`}
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={(e) => handleChange("fullName", e.target.value)}
                    />
                    {errors.fullName && <span className="campusstay-err-msg">{errors.fullName}</span>}
                  </div>

                  <div className="campusstay-field">
                    <label className="campusstay-label">
                      Registration Number <span className="campusstay-required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`campusstay-input ${errors.registrationNumber ? "error" : ""}`}
                      placeholder="Enter your Registration number (e.g. 24331A1253)"
                      maxLength={10}
                      value={formData.registrationNumber}
                      onChange={(e) => handleChange("registrationNumber", e.target.value.toUpperCase())}
                    />
                    {errors.registrationNumber && <span className="campusstay-err-msg">{errors.registrationNumber}</span>}
                  </div>

                  <div className="campusstay-field">
                    <label className="campusstay-label">
                      Date of Birth <span className="campusstay-required">*</span>
                    </label>
                    <input
                      type="date"
                      className={`campusstay-input ${errors.dateOfBirth ? "error" : ""}`}
                      value={formData.dateOfBirth}
                      onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                    />
                    {errors.dateOfBirth && <span className="campusstay-err-msg">{errors.dateOfBirth}</span>}
                  </div>

                  <div className="campusstay-field">
                    <label className="campusstay-label">
                      Gender <span className="campusstay-required">*</span>
                    </label>
                    <select
                      className={`campusstay-select ${errors.gender ? "error" : ""}`}
                      value={formData.gender}
                      onChange={(e) => {
                        handleChange("gender", e.target.value);
                        if (e.target.value === "Female") handleChange("preferredBlock", "Girls Hostel");
                        else if (e.target.value === "Male") handleChange("preferredBlock", "Boys Hostel");
                      }}
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.gender && <span className="campusstay-err-msg">{errors.gender}</span>}
                  </div>

                  <div className="campusstay-field">
                    <label className="campusstay-label">Blood Group</label>
                    <select
                      className="campusstay-select"
                      value={formData.bloodGroup}
                      onChange={(e) => handleChange("bloodGroup", e.target.value)}
                    >
                      <option value="">Select blood group</option>
                      {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ═════════ STEP 2: CONTACT INFORMATION ═════════ */}
            {currentStep === 2 && (
              <div>
                <div className="campusstay-section-header">
                  <div className="campusstay-section-header-left">
                    <div className="campusstay-section-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path fillRule="evenodd" d="M1.885.511a1.745 1.745 0 0 1 2.61.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z"/>
                      </svg>
                    </div>
                    <div>
                      <h2 className="campusstay-section-title">Contact Information</h2>
                      <p className="campusstay-section-desc">Provide direct student contact, home address, and parent emergency numbers</p>
                    </div>
                  </div>
                </div>

                <div className="campusstay-grid">
                  <div className="campusstay-field">
                    <label className="campusstay-label">
                      Student Mobile Number <span className="campusstay-required">*</span>
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      className={`campusstay-input ${errors.mobileNumber ? "error" : ""}`}
                      placeholder="Enter 10-digit mobile number"
                      value={formData.mobileNumber}
                      onChange={(e) => handleChange("mobileNumber", e.target.value)}
                    />
                    {errors.mobileNumber && <span className="campusstay-err-msg">{errors.mobileNumber}</span>}
                  </div>

                  <div className="campusstay-field">
                    <label className="campusstay-label">
                      Email Address <span className="campusstay-required">*</span>
                    </label>
                    <input
                      type="email"
                      className={`campusstay-input ${errors.email ? "error" : ""}`}
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                    {errors.email && <span className="campusstay-err-msg">{errors.email}</span>}
                  </div>

                  <div className="campusstay-field full-width">
                    <label className="campusstay-label">
                      Permanent Address <span className="campusstay-required">*</span>
                    </label>
                    <textarea
                      rows={2}
                      className={`campusstay-textarea ${errors.permanentAddress ? "error" : ""}`}
                      placeholder="House / Door No., Street, Landmark"
                      value={formData.permanentAddress}
                      onChange={(e) => handleChange("permanentAddress", e.target.value)}
                    />
                    {errors.permanentAddress && <span className="campusstay-err-msg">{errors.permanentAddress}</span>}
                  </div>

                  <div className="campusstay-field">
                    <label className="campusstay-label">
                      City <span className="campusstay-required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`campusstay-input ${errors.city ? "error" : ""}`}
                      placeholder="Enter city"
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                    />
                    {errors.city && <span className="campusstay-err-msg">{errors.city}</span>}
                  </div>

                  <div className="campusstay-field">
                    <label className="campusstay-label">
                      District <span className="campusstay-required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`campusstay-input ${errors.district ? "error" : ""}`}
                      placeholder="Enter district (e.g. Vizianagaram)"
                      value={formData.district}
                      onChange={(e) => handleChange("district", e.target.value)}
                    />
                    {errors.district && <span className="campusstay-err-msg">{errors.district}</span>}
                  </div>

                  <div className="campusstay-field">
                    <label className="campusstay-label">
                      State <span className="campusstay-required">*</span>
                    </label>
                    <select
                      className={`campusstay-select ${errors.state ? "error" : ""}`}
                      value={formData.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                    >
                      <option value="">Select your state</option>
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                    {errors.state && <span className="campusstay-err-msg">{errors.state}</span>}
                  </div>

                  <div className="campusstay-field">
                    <label className="campusstay-label">
                      PIN Code <span className="campusstay-required">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      className={`campusstay-input ${errors.pincode ? "error" : ""}`}
                      placeholder="Enter 6-digit PIN code"
                      value={formData.pincode}
                      onChange={(e) => handleChange("pincode", e.target.value)}
                    />
                    {errors.pincode && <span className="campusstay-err-msg">{errors.pincode}</span>}
                  </div>

                  <div className="campusstay-field">
                    <label className="campusstay-label">
                      Parent / Guardian Name <span className="campusstay-required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`campusstay-input ${errors.parentName ? "error" : ""}`}
                      placeholder="Enter parent or guardian full name"
                      value={formData.parentName}
                      onChange={(e) => handleChange("parentName", e.target.value)}
                    />
                    {errors.parentName && <span className="campusstay-err-msg">{errors.parentName}</span>}
                  </div>

                  <div className="campusstay-field">
                    <label className="campusstay-label">
                      Parent / Guardian Mobile Number <span className="campusstay-required">*</span>
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      className={`campusstay-input ${errors.parentContact ? "error" : ""}`}
                      placeholder="Enter parent 10-digit mobile number"
                      value={formData.parentContact}
                      onChange={(e) => handleChange("parentContact", e.target.value)}
                    />
                    {errors.parentContact && <span className="campusstay-err-msg">{errors.parentContact}</span>}
                  </div>

                  <div className="campusstay-field">
                    <label className="campusstay-label">Parent / Guardian Email</label>
                    <input
                      type="email"
                      className="campusstay-input"
                      placeholder="Enter parent email address"
                      value={formData.parentEmail}
                      onChange={(e) => handleChange("parentEmail", e.target.value)}
                    />
                  </div>

                  <div className="campusstay-field">
                    <label className="campusstay-label">
                      Emergency Contact Number <span className="campusstay-required">*</span>
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      className={`campusstay-input ${errors.emergencyContact ? "error" : ""}`}
                      placeholder="Enter emergency contact number"
                      value={formData.emergencyContact}
                      onChange={(e) => handleChange("emergencyContact", e.target.value)}
                    />
                    {errors.emergencyContact && <span className="campusstay-err-msg">{errors.emergencyContact}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* ═════════ STEP 3: ACADEMIC INFORMATION ═════════ */}
            {currentStep === 3 && (
              <div>
                <div className="campusstay-section-header">
                  <div className="campusstay-section-header-left">
                    <div className="campusstay-section-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8.211 2.047a.5.5 0 0 0-.422 0l-7.5 3.5a.5.5 0 0 0 .025.917l7.5 3a.5.5 0 0 0 .372 0L14 7.14V13a1 1 0 0 0-1 1v2h3v-2a1 1 0 0 0-1-1V6.739l.686-.275a.5.5 0 0 0 .025-.917z"/>
                        <path d="M4.179 13.819A4.989 4.989 0 0 1 8 13c1.314 0 2.485.509 3.32 1.332.062.061.12.126.177.194A1 1 0 0 0 12 14v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1a1 1 0 0 0 .179-.181"/>
                      </svg>
                    </div>
                    <div>
                      <h2 className="campusstay-section-title">Academic Information</h2>
                      <p className="campusstay-section-desc">Provide details about your enrolled program, branch, year and section</p>
                    </div>
                  </div>
                </div>

                <div className="campusstay-grid">
                  <div className="campusstay-field full-width">
                    <label className="campusstay-label">
                      College / Institution <span className="campusstay-required">*</span>
                    </label>
                    <input
                      type="text"
                      className="campusstay-input"
                      placeholder="e.g. MVGR College of Engineering"
                      value={formData.college}
                      onChange={(e) => handleChange("college", e.target.value)}
                    />
                  </div>

                  <div className="campusstay-field">
                    <label className="campusstay-label">
                      Course / Program <span className="campusstay-required">*</span>
                    </label>
                    <select
                      className={`campusstay-select ${errors.course ? "error" : ""}`}
                      value={formData.course}
                      onChange={(e) => handleChange("course", e.target.value)}
                    >
                      <option value="">Select course / program</option>
                      <option value="B.Tech">B.Tech</option>
                      <option value="M.Tech">M.Tech</option>
                      <option value="MCA">MCA</option>
                      <option value="MBA">MBA</option>
                      <option value="B.Pharm">B.Pharm</option>
                    </select>
                    {errors.course && <span className="campusstay-err-msg">{errors.course}</span>}
                  </div>

                  <div className="campusstay-field">
                    <label className="campusstay-label">
                      Department / Branch <span className="campusstay-required">*</span>
                    </label>
                    <select
                      className={`campusstay-select ${errors.department ? "error" : ""}`}
                      value={formData.department}
                      onChange={(e) => handleChange("department", e.target.value)}
                    >
                      <option value="">Select department / branch</option>
                      <option value="Computer Science & Engineering">Computer Science & Engineering (CSE)</option>
                      <option value="Artificial Intelligence & Data Science">Artificial Intelligence & Data Science (AI & DS)</option>
                      <option value="Electronics & Communication Engineering">Electronics & Communication Engineering (ECE)</option>
                      <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering (EEE)</option>
                      <option value="Mechanical Engineering">Mechanical Engineering (ME)</option>
                      <option value="Civil Engineering">Civil Engineering (CE)</option>
                      <option value="Information Technology">Information Technology (IT)</option>
                      <option value="Chemical Engineering">Chemical Engineering</option>
                    </select>
                    {errors.department && <span className="campusstay-err-msg">{errors.department}</span>}
                  </div>

                  <div className="campusstay-field">
                    <label className="campusstay-label">
                      Year <span className="campusstay-required">*</span>
                    </label>
                    <select
                      className={`campusstay-select ${errors.yearOfStudy ? "error" : ""}`}
                      value={formData.yearOfStudy}
                      onChange={(e) => handleChange("yearOfStudy", e.target.value)}
                    >
                      <option value="">Select year</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                    {errors.yearOfStudy && <span className="campusstay-err-msg">{errors.yearOfStudy}</span>}
                  </div>

                  <div className="campusstay-field">
                    <label className="campusstay-label">
                      Semester <span className="campusstay-required">*</span>
                    </label>
                    <select
                      className={`campusstay-select ${errors.semester ? "error" : ""}`}
                      value={formData.semester}
                      onChange={(e) => handleChange("semester", e.target.value)}
                    >
                      <option value="">Select semester</option>
                      <option value="1st Semester">1st Semester</option>
                      <option value="2nd Semester">2nd Semester</option>
                      <option value="3rd Semester">3rd Semester</option>
                      <option value="4th Semester">4th Semester</option>
                      <option value="5th Semester">5th Semester</option>
                      <option value="6th Semester">6th Semester</option>
                      <option value="7th Semester">7th Semester</option>
                      <option value="8th Semester">8th Semester</option>
                    </select>
                    {errors.semester && <span className="campusstay-err-msg">{errors.semester}</span>}
                  </div>

                  <div className="campusstay-field">
                    <label className="campusstay-label">Section</label>
                    <select
                      className="campusstay-select"
                      value={formData.section}
                      onChange={(e) => handleChange("section", e.target.value)}
                    >
                      <option value="A">Section A</option>
                      <option value="B">Section B</option>
                      <option value="C">Section C</option>
                      <option value="D">Section D</option>
                    </select>
                  </div>

                  <div className="campusstay-field">
                    <label className="campusstay-label">Admission Number</label>
                    <input
                      type="text"
                      className="campusstay-input"
                      placeholder="e.g. ADM2026-042"
                      value={formData.admissionNumber}
                      onChange={(e) => handleChange("admissionNumber", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ═════════ STEP 4: MEDICAL INFORMATION ═════════ */}
            {currentStep === 4 && (
              <div>
                <div className="campusstay-section-header">
                  <div className="campusstay-section-header-left">
                    <div className="campusstay-section-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"/>
                      </svg>
                    </div>
                    <div>
                      <h2 className="campusstay-section-title">Medical Information</h2>
                      <p className="campusstay-section-desc">Disclose relevant medical history or allergy alerts for campus health and safety</p>
                    </div>
                  </div>
                </div>

                <div className="campusstay-grid">
                  <div className="campusstay-field full-width">
                    <label className="campusstay-label">Medical Conditions</label>
                    <textarea
                      rows={2}
                      className="campusstay-textarea"
                      placeholder="List any existing medical conditions (e.g. Asthma, Diabetes) or write 'None'"
                      value={formData.medicalConditions}
                      onChange={(e) => handleChange("medicalConditions", e.target.value)}
                    />
                  </div>

                  <div className="campusstay-field full-width">
                    <label className="campusstay-label">Allergies</label>
                    <textarea
                      rows={2}
                      className="campusstay-textarea"
                      placeholder="List any known food or drug allergies (e.g. Penicillin, Peanuts) or write 'None'"
                      value={formData.allergies}
                      onChange={(e) => handleChange("allergies", e.target.value)}
                    />
                  </div>

                  <div className="campusstay-field full-width">
                    <label className="campusstay-label">Emergency Medical Information</label>
                    <textarea
                      rows={2}
                      className="campusstay-textarea"
                      placeholder="Emergency contact notes or blood transfusion preferences"
                      value={formData.emergencyMedicalInfo}
                      onChange={(e) => handleChange("emergencyMedicalInfo", e.target.value)}
                    />
                  </div>

                  <div className="campusstay-field full-width">
                    <label className="campusstay-label">Any Special Requirements / Regular Medications</label>
                    <textarea
                      rows={2}
                      className="campusstay-textarea"
                      placeholder="List regular daily medications or physical assistance requirements"
                      value={formData.specialRequirements}
                      onChange={(e) => handleChange("specialRequirements", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ═════════ STEP 5: HOSTEL INFORMATION ═════════ */}
            {currentStep === 5 && (
              <div>
                <div className="campusstay-section-header">
                  <div className="campusstay-section-header-left">
                    <div className="campusstay-section-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M3 2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v13h1.5a.5.5 0 0 1 0 1h-13a.5.5 0 0 1 0-1H3zm1 13h8V2H4z"/>
                        <path d="M9 9a1 1 0 1 0 2 0 1 1 0 0 0-2 0"/>
                      </svg>
                    </div>
                    <div>
                      <h2 className="campusstay-section-title">Hostel Information & Preferences</h2>
                      <p className="campusstay-section-desc">Select your preferred hostel accommodation tier and special requests</p>
                    </div>
                  </div>
                </div>

                <div className="campusstay-grid" style={{ marginBottom: "1.5rem" }}>
                  <div className="campusstay-field">
                    <label className="campusstay-label">Hostel Required?</label>
                    <select
                      className="campusstay-select"
                      value={formData.hostelRequired}
                      onChange={(e) => handleChange("hostelRequired", e.target.value)}
                    >
                      <option value="Yes">Yes, Hostel Accommodation Required</option>
                      <option value="No">No (Day Scholar)</option>
                    </select>
                  </div>

                  <div className="campusstay-field">
                    <label className="campusstay-label">Preferred Block / Hostel</label>
                    <select
                      className="campusstay-select"
                      value={formData.preferredBlock}
                      onChange={(e) => handleChange("preferredBlock", e.target.value)}
                    >
                      <option value="Boys Hostel">Boys Hostel (Block B)</option>
                      <option value="Girls Hostel">Girls Hostel (Block G)</option>
                    </select>
                  </div>

                  <div className="campusstay-field full-width">
                    <label className="campusstay-label">Any Special Accommodation Requirement</label>
                    <textarea
                      rows={2}
                      className="campusstay-textarea"
                      placeholder="Ground floor preference for mobility, quiet study room, etc."
                      value={formData.specialAccommodationReq}
                      onChange={(e) => handleChange("specialAccommodationReq", e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label className="campusstay-label" style={{ display: "block", marginBottom: "0.75rem" }}>
                    Select Room Preference Tier <span className="campusstay-required">*</span>
                  </label>
                  <div className="campusstay-room-grid">
                    {ROOM_OPTIONS.map((room) => {
                      const isSelected = selectedRoom === room.id;
                      return (
                        <div
                          key={room.id}
                          className={`campusstay-room-card ${isSelected ? "selected" : ""}`}
                          onClick={() => {
                            setSelectedRoom(room.id);
                            handleChange("roomTypePreference", room.name);
                            setShowRoomPreview(true);
                          }}
                        >
                          <div className="campusstay-room-number">{room.name}</div>
                          <div className="campusstay-room-occupancy">Standard: {room.occupancy} Beds</div>
                          <div className="campusstay-room-price">₹{room.price} / Sem</div>
                          <div className="campusstay-room-block">{room.block}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {showRoomPreview && (
                  <div className="campusstay-room-preview">
                    <img
                      src={activeRoomObj.image}
                      alt="Room Preview"
                      className="campusstay-room-preview-img"
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
                        {activeRoomObj.name}
                      </h4>
                      <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.85rem", color: "#64748b" }}>
                        Estimated Fee: <strong style={{ color: "#2563eb" }}>₹{activeRoomObj.price} / Semester</strong>
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.75rem" }}>
                        {activeRoomObj.features.map((f, i) => (
                          <span key={i} style={{ background: "#ffffff", border: "1px solid #e2e8f0", padding: "0.2rem 0.6rem", borderRadius: "12px", fontSize: "0.75rem", color: "#334155" }}>
                            &bull; {f}
                          </span>
                        ))}
                      </div>
                      <div style={{ background: "#fef3c7", borderLeft: "3px solid #f59e0b", padding: "0.5rem 0.75rem", borderRadius: "6px", fontSize: "0.75rem", color: "#92400e" }}>
                        📌 <strong>Important:</strong> Actual room and bed will not be assigned during registration. Room allocation will be conducted later by the Warden at the hostel desk.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ═════════ STEP 6: TERMS & CONDITIONS ═════════ */}
            {currentStep === 6 && (
              <div>
                <div className="campusstay-section-header">
                  <div className="campusstay-section-header-left">
                    <div className="campusstay-section-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
                        <path d="M4.5 12.5A.5.5 0 0 1 5 12h3a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5m0-2A.5.5 0 0 1 5 10h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5m0-2A.5.5 0 0 1 5 8h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5"/>
                      </svg>
                    </div>
                    <div>
                      <h2 className="campusstay-section-title">Terms & Conditions</h2>
                      <p className="campusstay-section-desc">Please read and accept the hostel discipline rules before submitting your application</p>
                    </div>
                  </div>
                </div>

                <div className="campusstay-terms-box">
                  <h4>1. General Discipline & Cleanliness</h4>
                  <p>Residents must maintain strict cleanliness in their rooms and wing corridors. Quiet hours are enforced between 10:30 PM and 06:00 AM. Any property damage will be billed directly.</p>

                  <h4>2. Visitors & Curfew Timings</h4>
                  <p>Visitors are permitted only in designated lounge areas until 07:30 PM. All students must complete biometric turnstile entry before 08:30 PM.</p>

                  <h4>3. Zero-Tolerance Anti-Ragging Policy</h4>
                  <p>Ragging in any form is a severe criminal offense punishable under UGC regulations and IPC. Offenders will face immediate hostel expulsion and legal police action.</p>

                  <h4>4. Payment of Fees & Allocation</h4>
                  <p>Hostel fees must be settled prior to room key handover. Room and bed transfers can only be authorized by the Chief Warden office.</p>

                  <h4>5. Document Submission Notice</h4>
                  <div className="campusstay-doc-note">
                    <p style={{ fontWeight: 700, color: "#0f172a", marginBottom: "0.25rem" }}>Required Documents to Present at Hostel Office:</p>
                    <ul style={{ marginTop: "0.5rem", marginBottom: 0, paddingLeft: "1.25rem" }}>
                      <li>Signed Parent / Guardian Consent Undertaking</li>
                      <li>2 Passport-sized Photographs</li>
                      <li>Self-Attested Aadhaar Card Photocopy</li>
                      <li>Anti-Ragging Undertaking signed by Student & Parent</li>
                    </ul>
                    <p style={{ marginTop: "0.5rem", marginBottom: 0, fontSize: "0.8rem", color: "#dc2626", fontWeight: 600 }}>
                      ⚠️ Final room keys will be handed over only after physical verification by the Warden.
                    </p>
                  </div>
                </div>

                <div className="campusstay-terms-check">
                  <input
                    type="checkbox"
                    id="agree_terms"
                    checked={formData.agreeTerms}
                    onChange={(e) => handleChange("agreeTerms", e.target.checked)}
                  />
                  <label htmlFor="agree_terms">
                    I declare that all information furnished in this application is accurate and true. I have read, understood, and agree to abide by the rules and regulations of the College Hostel, and agree that room allocation is subject to Warden approval.
                  </label>
                </div>
                {errors.agreeTerms && <span className="campusstay-err-msg" style={{ display: "block", marginTop: "0.5rem" }}>{errors.agreeTerms}</span>}
              </div>
            )}

            {/* ── BOTTOM ACTIONS ── */}
            <div className="campusstay-actions">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="campusstay-btn-back"
              >
                Back
              </button>

              {currentStep < 6 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="campusstay-btn-next"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="campusstay-btn-next"
                  style={{ background: "#2563eb" }}
                >
                  {isSubmitting ? "Submitting Application..." : "Submit Application"}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
