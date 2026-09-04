import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import {
  fetchSuperAdminStats,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  bulkDeleteUsers,
  bulkUpdateUserStatus,
  fetchDepartments,
  createDepartment,
  deleteDepartment,
  fetchAuditLogs,
  fetchRolePermissions,
  updateRolePermission,
  fetchDelegationRules,
  updateDelegationRule,
  createDelegationRule,
  deleteDelegationRule,
  triggerBackup,
  fetchAcademicRetention,
  fetchAnomalies,
  mitigateAnomaly,
  sendEmergencyBroadcast,
  exportUsersRoster,
  type SuperAdminStats,
  type SuperAdminUser,
  type DepartmentItem,
  type AuditLogItem,
  type RolePermissionMatrixItem,
  type DelegationRule,
  type AcademicRetentionItem,
  type AnomalyItem,
  type EmergencyBroadcastPayload,
  MOCK_SUPER_ADMIN_STATS,
  MOCK_USERS,
  MOCK_DEPARTMENTS,
  MOCK_AUDIT_LOGS,
  MOCK_ROLE_PERMISSIONS,
  MOCK_DELEGATION_RULES,
} from "./SuperAdminService";

export type SuperAdminTab = "overview" | "users" | "departments" | "rbac" | "delegation" | "audit" | "ai";

export type SortField = "id" | "name" | "email" | "role" | "department" | "status" | "lastLogin" | "createdAt";
export type SortOrder = "asc" | "desc";

export function useSuperAdmin() {
  const [activeTab, setActiveTab] = useState<SuperAdminTab>("overview");
  const [stats, setStats] = useState<SuperAdminStats>(MOCK_SUPER_ADMIN_STATS);
  const [users, setUsers] = useState<SuperAdminUser[]>(MOCK_USERS);
  const [departments, setDepartments] = useState<DepartmentItem[]>(MOCK_DEPARTMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(MOCK_AUDIT_LOGS);
  const [rolePermissions, setRolePermissions] = useState<RolePermissionMatrixItem[]>(MOCK_ROLE_PERMISSIONS);
  const [delegationRules, setDelegationRules] = useState<DelegationRule[]>(MOCK_DELEGATION_RULES);
  const [retentionMetrics, setRetentionMetrics] = useState<AcademicRetentionItem[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);

  // Search, Filter, Sort & Pagination State
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState("All Departments");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All Statuses");

  const [sortField, setSortField] = useState<SortField>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Bulk Selection State
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Loading States
  const [loading, setLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [mitigateLoading, setMitigateLoading] = useState(false);

  // Modal Dialog States
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isViewUserOpen, setIsViewUserOpen] = useState(false);
  const [isAddDeptOpen, setIsAddDeptOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isMitigateModalOpen, setIsMitigateModalOpen] = useState(false);
  const [isAnomalyDetailsOpen, setIsAnomalyDetailsOpen] = useState(false);
  const [isAddDelegationOpen, setIsAddDelegationOpen] = useState(false);
  const [isEditDelegationOpen, setIsEditDelegationOpen] = useState(false);

  const [selectedUser, setSelectedUser] = useState<SuperAdminUser | null>(null);
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyItem | null>(null);
  const [selectedDelegationRule, setSelectedDelegationRule] = useState<DelegationRule | null>(null);

  // Forms State
  const [userFormData, setUserFormData] = useState<Partial<SuperAdminUser>>({
    name: "",
    email: "",
    role: "faculty",
    department: "Computer Science & Engineering",
    status: "Active",
  });

  const [deptFormData, setDeptFormData] = useState<Partial<DepartmentItem>>({
    name: "",
    code: "",
    hodName: "",
    studentsCount: 500,
    facultyCount: 30,
    accreditation: "NBA & NAAC A+",
    status: "Active",
  });

  const [broadcastFormData, setBroadcastFormData] = useState<EmergencyBroadcastPayload>({
    title: "",
    message: "",
    audience: "All Users",
    priority: "Emergency",
  });

  const [delegationFormData, setDelegationFormData] = useState<Partial<DelegationRule>>({
    moduleName: "",
    delegatedRole: "HOD",
    assignedPerson: "",
    scope: "",
    status: "Active Delegation",
    permissions: ["Read", "Approve"],
  });

  // Load data from service
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [sData, uData, dData, aData, rData, delData, retData, anoData] = await Promise.all([
        fetchSuperAdminStats(),
        fetchUsers(),
        fetchDepartments(),
        fetchAuditLogs(),
        fetchRolePermissions(),
        fetchDelegationRules(),
        fetchAcademicRetention(),
        fetchAnomalies(),
      ]);
      setStats(sData);
      setUsers(uData);
      setDepartments(dData);
      setAuditLogs(aData);
      setRolePermissions(rData);
      setDelegationRules(delData);
      setRetentionMetrics(retData);
      setAnomalies(anoData);
    } catch (err) {
      toast.error("Error loading Super Admin data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered & Sorted Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.id.toLowerCase().includes(search.toLowerCase()) ||
        u.department.toLowerCase().includes(search.toLowerCase());

      const matchesRole = selectedRole === "All Roles" || u.role === selectedRole;
      const matchesDepartment =
        selectedDepartmentFilter === "All Departments" || u.department === selectedDepartmentFilter;
      const matchesStatus =
        selectedStatusFilter === "All Statuses" || u.status === selectedStatusFilter;

      return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
    });
  }, [users, search, selectedRole, selectedDepartmentFilter, selectedStatusFilter]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const valA = (a[sortField] || "").toString().toLowerCase();
      const valB = (b[sortField] || "").toString().toLowerCase();
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredUsers, sortField, sortOrder]);

  // Pagination calculations
  const totalPages = useMemo(() => {
    return Math.ceil(sortedUsers.length / pageSize) || 1;
  }, [sortedUsers.length, pageSize]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedUsers.slice(startIndex, startIndex + pageSize);
  }, [sortedUsers, currentPage, pageSize]);

  // Reset to page 1 on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedRole, selectedDepartmentFilter, selectedStatusFilter, pageSize]);

  // Sorting Handler
  const handleSort = useCallback((field: SortField) => {
    setSortField((prevField) => {
      if (prevField === field) {
        setSortOrder((prevOrder) => (prevOrder === "asc" ? "desc" : "asc"));
        return field;
      } else {
        setSortOrder("asc");
        return field;
      }
    });
  }, []);

  // Bulk Selection Handlers
  const handleSelectAllOnPage = useCallback(
    (checked: boolean) => {
      if (checked) {
        const pageIds = paginatedUsers.map((u) => u.id);
        setSelectedUserIds((prev) => Array.from(new Set([...prev, ...pageIds])));
      } else {
        const pageIds = paginatedUsers.map((u) => u.id);
        setSelectedUserIds((prev) => prev.filter((id) => !pageIds.includes(id)));
      }
    },
    [paginatedUsers],
  );

  const handleSelectUser = useCallback((id: string, checked: boolean) => {
    if (checked) {
      setSelectedUserIds((prev) => [...prev, id]);
    } else {
      setSelectedUserIds((prev) => prev.filter((item) => item !== id));
    }
  }, []);

  // User CRUD Actions
  const handleOpenAddUser = useCallback(() => {
    setUserFormData({
      name: "",
      email: "",
      role: "faculty",
      department: "Computer Science & Engineering",
      status: "Active",
    });
    setIsAddUserOpen(true);
  }, []);

  const handleOpenEditUser = useCallback((user: SuperAdminUser) => {
    setSelectedUser(user);
    setUserFormData({ ...user });
    setIsEditUserOpen(true);
  }, []);

  const handleOpenViewUser = useCallback((user: SuperAdminUser) => {
    setSelectedUser(user);
    setIsViewUserOpen(true);
  }, []);

  const handleAddUserSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!userFormData.name || !userFormData.email) {
        toast.error("Please provide user full name and email.");
        return;
      }

      const created = await createUser(userFormData);
      setUsers((prev) => [created, ...prev]);
      setIsAddUserOpen(false);
      toast.success(`User ${created.name} (${created.role.toUpperCase()}) registered!`);
      loadData();
    },
    [userFormData, loadData],
  );

  const handleEditUserSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedUser) return;

      await updateUser(selectedUser.id, userFormData);
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? ({ ...u, ...userFormData } as SuperAdminUser) : u)),
      );
      setIsEditUserOpen(false);
      toast.success(`User ${userFormData.name} profile updated!`);
      loadData();
    },
    [selectedUser, userFormData, loadData],
  );

  const handleDeleteUser = useCallback(
    async (user: SuperAdminUser) => {
      if (confirm(`Are you sure you want to delete user account ${user.name} (${user.email})?`)) {
        await deleteUser(user.id);
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        setSelectedUserIds((prev) => prev.filter((id) => id !== user.id));
        toast.success(`User ${user.name} deleted.`);
        loadData();
      }
    },
    [loadData],
  );

  // Bulk Actions
  const handleBulkDelete = useCallback(async () => {
    if (selectedUserIds.length === 0) return;
    if (confirm(`Delete ${selectedUserIds.length} selected user accounts?`)) {
      await bulkDeleteUsers(selectedUserIds);
      setUsers((prev) => prev.filter((u) => !selectedUserIds.includes(u.id)));
      setSelectedUserIds([]);
      toast.success(`${selectedUserIds.length} user accounts deleted.`);
      loadData();
    }
  }, [selectedUserIds, loadData]);

  const handleBulkUpdateStatus = useCallback(
    async (status: "Active" | "Inactive" | "Suspended") => {
      if (selectedUserIds.length === 0) return;
      await bulkUpdateUserStatus(selectedUserIds, status);
      setUsers((prev) =>
        prev.map((u) => (selectedUserIds.includes(u.id) ? { ...u, status } : u)),
      );
      toast.success(`Set status '${status}' for ${selectedUserIds.length} users.`);
      loadData();
    },
    [selectedUserIds, loadData],
  );

  // Department Actions
  const handleOpenAddDept = useCallback(() => {
    setDeptFormData({
      name: "",
      code: "",
      hodName: "",
      studentsCount: 500,
      facultyCount: 30,
      accreditation: "NBA & NAAC A+",
      status: "Active",
    });
    setIsAddDeptOpen(true);
  }, []);

  const handleAddDeptSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!deptFormData.name || !deptFormData.code) {
        toast.error("Please fill in department name and department code.");
        return;
      }

      const created = await createDepartment(deptFormData);
      setDepartments((prev) => [...prev, created]);
      setIsAddDeptOpen(false);
      toast.success(`Department ${created.name} (${created.code}) created successfully!`);
      loadData();
    },
    [deptFormData, loadData],
  );

  // Privilege Matrix Toggle
  const handleTogglePermission = useCallback(
    async (role: string, flagKey: keyof RolePermissionMatrixItem, currentValue: boolean) => {
      const updated = await updateRolePermission(role, flagKey, !currentValue);
      setRolePermissions(updated);
      toast.success(`Updated permission flag '${String(flagKey)}' for role ${role.toUpperCase()}.`);
    },
    [],
  );

  // Backup Trigger with Confirmation Modal
  const handleOpenBackupModal = useCallback(() => {
    setIsBackupModalOpen(true);
  }, []);

  const handleConfirmBackup = useCallback(async () => {
    setBackupLoading(true);
    toast.info("Initializing system database backup snapshot...");
    const res = await triggerBackup();
    setBackupLoading(false);
    setIsBackupModalOpen(false);
    toast.success(res.message);
    loadData();
  }, [loadData]);

  // Emergency Broadcast Actions
  const handleOpenBroadcastModal = useCallback(() => {
    setBroadcastFormData({
      title: "",
      message: "",
      audience: "All Users",
      priority: "Emergency",
    });
    setIsBroadcastModalOpen(true);
  }, []);

  const handleBroadcastSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!broadcastFormData.title || !broadcastFormData.message) {
        toast.error("Please enter broadcast title and message content.");
        return;
      }
      setBroadcastLoading(true);
      const res = await sendEmergencyBroadcast(broadcastFormData);
      setBroadcastLoading(false);
      setIsBroadcastModalOpen(false);
      toast.success(res.message);
      loadData();
    },
    [broadcastFormData, loadData]
  );

  // Anomaly Actions
  const handleOpenMitigate = useCallback((anomaly: AnomalyItem) => {
    setSelectedAnomaly(anomaly);
    setIsMitigateModalOpen(true);
  }, []);

  const handleMitigateSubmit = useCallback(
    async (action: string) => {
      if (!selectedAnomaly) return;
      setMitigateLoading(true);
      const res = await mitigateAnomaly(selectedAnomaly.id, action);
      setMitigateLoading(false);
      setIsMitigateModalOpen(false);
      toast.success(res.message);
      loadData();
    },
    [selectedAnomaly, loadData]
  );

  const handleOpenAnomalyDetails = useCallback((anomaly: AnomalyItem) => {
    setSelectedAnomaly(anomaly);
    setIsAnomalyDetailsOpen(true);
  }, []);

  // Department Deletion with Referential Integrity Handling
  const handleDeleteDeptSubmit = useCallback(
    async (deptId: string, deptName: string) => {
      if (confirm(`Are you sure you want to delete department '${deptName}'?`)) {
        const res = await deleteDepartment(deptId);
        if (res.success) {
          toast.success(`Department '${deptName}' deleted successfully.`);
          loadData();
        } else {
          toast.error(res.message || `Cannot delete department '${deptName}'.`);
        }
      }
    },
    [loadData]
  );

  // Delegation Matrix Handlers
  const handleOpenAddDelegation = useCallback(() => {
    setDelegationFormData({
      moduleName: "",
      delegatedRole: "HOD",
      assignedPerson: "",
      scope: "",
      status: "Active Delegation",
      permissions: ["Read", "Approve"],
    });
    setIsAddDelegationOpen(true);
  }, []);

  const handleOpenEditDelegation = useCallback((rule: DelegationRule) => {
    setSelectedDelegationRule(rule);
    setDelegationFormData({ ...rule });
    setIsEditDelegationOpen(true);
  }, []);

  const handleAddDelegationSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!delegationFormData.moduleName || !delegationFormData.assignedPerson) {
        toast.error("Module name and assigned person are required.");
        return;
      }
      const updatedRules = await createDelegationRule(delegationFormData);
      setDelegationRules(updatedRules);
      setIsAddDelegationOpen(false);
      toast.success("Delegation rule created successfully.");
      loadData();
    },
    [delegationFormData, loadData]
  );

  const handleEditDelegationSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedDelegationRule) return;
      const updatedRules = await updateDelegationRule(selectedDelegationRule.id, delegationFormData);
      setDelegationRules(updatedRules);
      setIsEditDelegationOpen(false);
      toast.success("Delegation rule updated successfully.");
      loadData();
    },
    [selectedDelegationRule, delegationFormData, loadData]
  );

  const handleDeleteDelegationRuleSubmit = useCallback(
    async (id: string) => {
      if (confirm(`Delete operational delegation rule ${id}?`)) {
        const updatedRules = await deleteDelegationRule(id);
        setDelegationRules(updatedRules);
        toast.success(`Delegation rule ${id} deleted.`);
        loadData();
      }
    },
    [loadData]
  );

  // CSV Export
  const handleExportCSV = useCallback(async () => {
    toast.info("Preparing user roster export...");
    await exportUsersRoster();
    toast.success(`Exported ${sortedUsers.length} user records to CSV!`);
  }, [sortedUsers]);

  return {
    activeTab,
    setActiveTab,
    stats,
    users,
    departments,
    auditLogs,
    rolePermissions,
    delegationRules,
    retentionMetrics,
    anomalies,
    setDelegationRules,
    search,
    setSearch,
    selectedRole,
    setSelectedRole,
    selectedDepartmentFilter,
    setSelectedDepartmentFilter,
    selectedStatusFilter,
    setSelectedStatusFilter,
    sortField,
    sortOrder,
    handleSort,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    filteredUsers,
    sortedUsers,
    paginatedUsers,
    selectedUserIds,
    handleSelectAllOnPage,
    handleSelectUser,
    loading,
    backupLoading,
    broadcastLoading,
    mitigateLoading,
    isAddUserOpen,
    setIsAddUserOpen,
    isEditUserOpen,
    setIsEditUserOpen,
    isViewUserOpen,
    setIsViewUserOpen,
    isAddDeptOpen,
    setIsAddDeptOpen,
    isBackupModalOpen,
    setIsBackupModalOpen,
    isBroadcastModalOpen,
    setIsBroadcastModalOpen,
    isMitigateModalOpen,
    setIsMitigateModalOpen,
    isAnomalyDetailsOpen,
    setIsAnomalyDetailsOpen,
    isAddDelegationOpen,
    setIsAddDelegationOpen,
    isEditDelegationOpen,
    setIsEditDelegationOpen,
    selectedUser,
    selectedAnomaly,
    selectedDelegationRule,
    userFormData,
    setUserFormData,
    deptFormData,
    setDeptFormData,
    broadcastFormData,
    setBroadcastFormData,
    delegationFormData,
    setDelegationFormData,
    loadData,
    handleOpenAddUser,
    handleOpenEditUser,
    handleOpenViewUser,
    handleAddUserSubmit,
    handleEditUserSubmit,
    handleDeleteUser,
    handleBulkDelete,
    handleBulkUpdateStatus,
    handleOpenAddDept,
    handleAddDeptSubmit,
    handleDeleteDeptSubmit,
    handleTogglePermission,
    handleOpenBackupModal,
    handleConfirmBackup,
    handleOpenBroadcastModal,
    handleBroadcastSubmit,
    handleOpenMitigate,
    handleMitigateSubmit,
    handleOpenAnomalyDetails,
    handleOpenAddDelegation,
    handleOpenEditDelegation,
    handleAddDelegationSubmit,
    handleEditDelegationSubmit,
    handleDeleteDelegationRuleSubmit,
    handleExportCSV,
  };
}

