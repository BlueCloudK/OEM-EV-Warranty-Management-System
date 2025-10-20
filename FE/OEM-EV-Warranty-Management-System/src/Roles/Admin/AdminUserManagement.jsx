import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { adminUsersApi, adminAuthApi } from "../../api/adminUsers";

const AdminUserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchRole, setSearchRole] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    address: "",
    roleId: 2, // Default to SC_STAFF
  });
  const [formErrors, setFormErrors] = useState({});
  const [registering, setRegistering] = useState(false);

  // Role mapping based on API guide
  const roles = [
    { id: 1, name: "ADMIN", display: "Administrator" },
    { id: 2, name: "SC_STAFF", display: "Service Center Staff" },
    { id: 3, name: "SC_TECHNICIAN", display: "Service Center Technician" },
    { id: 4, name: "EVM_STAFF", display: "EVM Staff" },
    { id: 5, name: "CUSTOMER", display: "Customer" },
  ];

  // Local persistence for created users so they remain after refresh
  const LOCAL_USERS_KEY = "admin_local_users";
  const loadLocalUsers = () => {
    try {
      const raw = localStorage.getItem(LOCAL_USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };
  const saveLocalUsers = (list) => {
    try {
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(list));
    } catch {}
  };
  // Session fallback to increase persistence in some browsers/contexts
  const SESSION_USERS_KEY = "admin_local_users_session";
  const loadSessionUsers = () => {
    try {
      const raw = sessionStorage.getItem(SESSION_USERS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };
  const saveSessionUsers = (list) => {
    try {
      sessionStorage.setItem(SESSION_USERS_KEY, JSON.stringify(list));
    } catch {}
  };
  const loadPersistedUsers = () => {
    const a = loadLocalUsers();
    const b = loadSessionUsers();
    return mergeUsersUnique(a, b);
  };
  const savePersistedUsers = (list) => {
    saveLocalUsers(list);
    saveSessionUsers(list);
  };

  const mergeUsersUnique = (serverUsers, localUsers) => {
    const byKey = new Map();
    [...serverUsers, ...localUsers].forEach((u) => {
      const key = `${u.id ?? ""}-${u.username ?? u.email ?? ""}`;
      if (!byKey.has(key)) byKey.set(key, u);
    });
    return Array.from(byKey.values());
  };

  // Mock users data for demo
  const mockUsers = [
    {
      id: 1,
      username: "admin_user",
      email: "admin@oem-ev.com",
      roleId: 1,
      roleName: "ADMIN",
      address: "Head Office, District 1, Ho Chi Minh City",
      createdAt: "2024-01-15T08:30:00",
      isActive: true,
    },
    {
      id: 2,
      username: "sc_manager",
      email: "manager@service.com",
      roleId: 2,
      roleName: "SC_STAFF",
      address: "Service Center A, District 3, Ho Chi Minh City",
      createdAt: "2024-02-10T09:15:00",
      isActive: true,
    },
    {
      id: 3,
      username: "tech_nguyen",
      email: "nguyen.tech@service.com",
      roleId: 3,
      roleName: "SC_TECHNICIAN",
      address: "Service Center A, District 3, Ho Chi Minh City",
      createdAt: "2024-03-05T14:20:00",
      isActive: true,
    },
    {
      id: 4,
      username: "evm_staff",
      email: "evm@warranty.com",
      roleId: 4,
      roleName: "EVM_STAFF",
      address: "EVM Office, District 7, Ho Chi Minh City",
      createdAt: "2024-03-20T11:45:00",
      isActive: true,
    },
  ];

  const didInit = useRef(false);

  // Filter users based on search term and role
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (searchRole) {
      filtered = filtered.filter(
        (user) =>
          user.roleName === searchRole ||
          getRoleDisplay(normalizeRoleConst(user)) === searchRole
      );
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, searchRole]);

  useEffect(() => {
    if (didInit.current) return; // avoid double fetch in React StrictMode DEV
    didInit.current = true;
    // Fetch users from API
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Use Admin Users API per guide
        const data = await adminUsersApi.getAllUsers({ page: 0, size: 50 });

        const arrayData = Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data)
          ? data
          : [];
        // Normalize various possible backend shapes
        const normalized = arrayData.map((user) => {
          const roleIdNum =
            user.roleId !== undefined
              ? Number(user.roleId)
              : roles.find(
                  (r) =>
                    r.name === (user.roleName || user.role || user.roleType)
                )?.id;
          const roleNameNorm =
            user.roleName ||
            user.role ||
            user.roleType ||
            (roleIdNum ? getRoleNameById(roleIdNum) : "UNKNOWN");
          return {
            id: user.id ?? user.userId ?? null,
            username:
              user.username ??
              user.userName ??
              (user.email ? user.email.split("@")[0] : ""),
            email: user.email ?? "",
            roleId: roleIdNum,
            roleName: roleNameNorm,
            address: user.address ?? "",
            createdAt: user.createdAt || new Date().toISOString(),
            isActive: user.active !== undefined ? user.active : true,
          };
        });

        const locals = loadPersistedUsers();
        const merged = mergeUsersUnique(normalized, locals);
        const sorted = [...merged].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setUsers(sorted);
        setFilteredUsers(sorted);
        setLoading(false);
      } catch (error) {
        console.error("❌ Error fetching users:", error);

        // Fallback: hiển thị mock + users đã lưu local để không mất sau F5
        console.log("🔄 Falling back to mock data");
        const locals = loadPersistedUsers();
        const merged = mergeUsersUnique(mockUsers, locals);
        const sorted = [...merged].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setUsers(sorted);
        setFilteredUsers(sorted);
        setLoading(false);

        // Optional: Show user-friendly error message
        // alert('Unable to load users from server. Showing demo data.');
      }
    };

    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "roleId" ? Number(value) : value,
    }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = "Username is required";
    } else if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email format is invalid";
    }

    if (!formData.password.trim()) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (!formData.address.trim()) {
      errors.address = "Address is required";
    }

    if (!formData.roleId) {
      errors.roleId = "Role is required";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setRegistering(true);

    try {
      const apiUser = await adminAuthApi.createUser(formData);

      const createdUser = {
        id: apiUser?.id || apiUser?.userId,
        username: apiUser?.username || formData.username,
        email: apiUser?.email || formData.email,
        roleId: apiUser?.roleId || formData.roleId,
        roleName:
          apiUser?.roleName ||
          roles.find((r) => r.id === (apiUser?.roleId || formData.roleId))
            ?.name ||
          "UNKNOWN",
        address: apiUser?.address || formData.address,
        createdAt: apiUser?.createdAt || new Date().toISOString(),
        isActive: apiUser?.active !== undefined ? apiUser.active : true,
      };

      const locals = loadPersistedUsers();
      const updatedLocals = [createdUser, ...locals];
      savePersistedUsers(updatedLocals);
      setUsers((prev) => [createdUser, ...prev]);
      setFilteredUsers((prev) => [createdUser, ...prev]);

      setFormData({
        username: "",
        email: "",
        password: "",
        address: "",
        roleId: 2,
      });
      setShowRegisterForm(false);
      alert("User registered successfully!");
    } catch (error) {
      console.error("Registration error:", error);
      alert(error?.message || "Registration failed");
    }

    setRegistering(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleNameById = (roleId) => {
    return roles.find((r) => r.id === roleId)?.name || "UNKNOWN";
  };

  const getRoleDisplay = (roleName) => {
    return roles.find((r) => r.name === roleName)?.display || roleName;
  };

  // Chuẩn hóa role từ nhiều nguồn (roleName/role/roleType/roleId)
  const normalizeRoleConst = (user) => {
    const fromName = user.roleName || user.role || user.roleType;
    if (fromName && roles.find((r) => r.name === fromName)) return fromName;
    if (user.roleId !== undefined) return getRoleNameById(Number(user.roleId));
    return "UNKNOWN";
  };

  const refreshUsers = async () => {
    setLoading(true);
    try {
      const data = await adminUsersApi.getAllUsers({ page: 0, size: 50 });
      const arrayData = Array.isArray(data?.content)
        ? data.content
        : Array.isArray(data)
        ? data
        : [];
      const transformedUsers = arrayData.map((user) => ({
        id: user.id ?? user.userId,
        username: user.username,
        email: user.email,
        roleId: user.roleId,
        roleName: user.roleName || getRoleNameById(user.roleId),
        address: user.address,
        createdAt: user.createdAt || new Date().toISOString(),
        isActive: user.active !== undefined ? user.active : true,
      }));
      setUsers(transformedUsers);
      setFilteredUsers(transformedUsers);
    } catch (error) {
      console.error("Error refreshing users:", error);
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
    }

    setLoading(false);
  };

  const getRoleBadgeClass = (roleName) => {
    switch (roleName) {
      case "ADMIN":
        return "role-badge admin";
      case "SC_STAFF":
        return "role-badge sc-staff";
      case "SC_TECHNICIAN":
        return "role-badge sc-tech";
      case "EVM_STAFF":
        return "role-badge evm-staff";
      case "CUSTOMER":
        return "role-badge customer";
      default:
        return "role-badge";
    }
  };

  if (loading) {
    return (
      <div className="admin-user-management">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-user-management">
      <div className="page-header">
        <div className="header-left">
          <button
            className="btn btn-back"
            onClick={() => navigate("/admin")}
            title="Back to Admin Dashboard"
          >
            <i className="fas fa-arrow-left"></i>
            Quay lại
          </button>
          <div className="header-title">
            <h2>Quản Lý Người Dùng & Vai Trò</h2>
            <p className="header-subtitle">
              Quản lý tài khoản người dùng và quyền truy cập
            </p>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={refreshUsers}
            disabled={loading}
            title="Refresh Users List"
          >
            <i className={`fas fa-sync-alt ${loading ? "fa-spin" : ""}`}></i>
            Refresh
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowRegisterForm(!showRegisterForm)}
          >
            <i className="fas fa-plus"></i>
            {showRegisterForm ? "Cancel" : "Register New User"}
          </button>
        </div>
      </div>

      {showRegisterForm && (
        <div className="register-form-section">
          <div className="register-card">
            <div className="card-header">
              <div className="header-icon">
                <i className="fas fa-user-plus"></i>
              </div>
              <h3>Create New User Account</h3>
              <p>Fill in the information below to register a new user</p>
            </div>

            <form onSubmit={handleSubmit} className="register-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="username">
                    <i className="fas fa-user"></i>
                    Username
                    <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className={formErrors.username ? "error" : ""}
                      placeholder="Enter unique username"
                    />
                    {formErrors.username && (
                      <span className="error-message">
                        {formErrors.username}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    <i className="fas fa-envelope"></i>
                    Email Address
                    <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={formErrors.email ? "error" : ""}
                      placeholder="user@example.com"
                    />
                    {formErrors.email && (
                      <span className="error-message">{formErrors.email}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="password">
                    <i className="fas fa-lock"></i>
                    Password
                    <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={formErrors.password ? "error" : ""}
                      placeholder="Min. 6 characters"
                    />
                    {formErrors.password && (
                      <span className="error-message">
                        {formErrors.password}
                      </span>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="roleId">
                    <i className="fas fa-user-shield"></i>
                    User Role
                    <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <select
                      id="roleId"
                      name="roleId"
                      value={formData.roleId}
                      onChange={handleInputChange}
                      className={formErrors.roleId ? "error" : ""}
                    >
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.display}
                        </option>
                      ))}
                    </select>
                    {formErrors.roleId && (
                      <span className="error-message">{formErrors.roleId}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="address">
                  <i className="fas fa-map-marker-alt"></i>
                  Full Address
                  <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={formErrors.address ? "error" : ""}
                    placeholder="Enter complete address including district and city"
                    rows="3"
                  />
                  {formErrors.address && (
                    <span className="error-message">{formErrors.address}</span>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={() => setShowRegisterForm(false)}
                  disabled={registering}
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-submit"
                  disabled={registering}
                >
                  {registering ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus"></i>
                      Create User Account
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="users-table-section">
        <div className="table-header">
          <h3>
            <i className="fas fa-users"></i>
            All Users ({filteredUsers.length})
          </h3>

          {/* Search and Filter Controls */}
          <div className="search-controls">
            <div className="search-input-group">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search by username, email, or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select
              value={searchRole}
              onChange={(e) => setSearchRole(e.target.value)}
              className="role-filter"
            >
              <option value="">All Roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.display}>
                  {role.display}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                setSearchTerm("");
                setSearchRole("");
              }}
              className="btn btn-clear"
              title="Clear filters"
            >
              <i className="fas fa-times"></i>
              Clear
            </button>
          </div>

          {filteredUsers.length === 0 && !loading && (
            <div className="empty-state">
              <i className="fas fa-users"></i>
              <p>
                {searchTerm || searchRole
                  ? "No users match your search criteria"
                  : "No users found"}
              </p>
              <small>Try refreshing or check your connection</small>
            </div>
          )}
        </div>

        {filteredUsers.length > 0 && (
          <div className="table-responsive">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Address</th>
                  <th>Created Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={`${user.id}-${user.username}`}>
                    <td>{user.id}</td>
                    <td className="username">{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      {(() => {
                        const roleConst = normalizeRoleConst(user);
                        return (
                          <span className={getRoleBadgeClass(roleConst)}>
                            {getRoleDisplay(roleConst)}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="address" title={user.address}>
                      {user.address}
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-action edit" title="Edit User">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn-action delete"
                          title="Delete User"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .admin-user-management {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e0e0e0;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .header-title h2 {
          color: #333;
          margin: 0 0 5px 0;
        }

        .header-subtitle {
          color: #666;
          margin: 0;
          font-size: 14px;
        }

        .header-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .header-actions .btn {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .table-header h3 {
          color: #333;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .search-controls {
          display: flex;
          gap: 30px;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          width: 100%;
        }

        .search-input-group {
          position: relative;
          flex: 1;
          min-width: 300px;
        }

        .search-input-group i {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
          z-index: 1;
        }

        .search-input {
          width: 100%;
          padding: 10px 12px 10px 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.3s;
        }

        .search-input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        .role-filter {
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          background: white;
          min-width: 280px;
          flex-shrink: 0;
        }

        .btn-clear {
          padding: 10px 20px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: background-color 0.3s;
          flex-shrink: 0;
          white-space: nowrap;
          min-width: 100px;
          justify-content: center;
        }

        .btn-clear:hover {
          background: #5a6268;
        }

        @media (max-width: 768px) {
          .search-controls {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
          
          .search-input-group {
            min-width: 100%;
            max-width: 100%;
          }
          
          .role-filter {
            min-width: 100%;
            max-width: 100%;
          }
          
          .btn-clear {
            width: 100%;
            justify-content: center;
          }
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #666;
        }

        .empty-state i {
          font-size: 3em;
          margin-bottom: 15px;
          color: #ddd;
        }

        .empty-state p {
          margin: 0 0 5px 0;
          font-size: 18px;
          font-weight: 500;
        }

        .empty-state small {
          color: #999;
        }

        .register-form-section {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 16px;
          padding: 0;
          margin-bottom: 40px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .register-card {
          background: white;
          margin: 3px;
          border-radius: 13px;
          overflow: hidden;
        }

        .card-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
          position: relative;
        }

        .header-icon {
          font-size: 3em;
          margin-bottom: 15px;
          opacity: 0.9;
        }

        .card-header h3 {
          font-size: 1.8em;
          margin: 0 0 10px 0;
          font-weight: 600;
        }

        .card-header p {
          margin: 0;
          opacity: 0.8;
          font-size: 1em;
        }

        .register-form {
          padding: 40px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
          margin-bottom: 25px;
        }

        .form-group.full-width {
          margin-bottom: 25px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #2c3e50;
          font-size: 14px;
        }

        .form-group label i {
          margin-right: 8px;
          color: #667eea;
          width: 16px;
          text-align: center;
        }

        .required {
          color: #e74c3c;
          margin-left: 4px;
        }

        .input-wrapper {
          position: relative;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #e8ecef;
          border-radius: 10px;
          font-size: 16px;
          transition: all 0.3s ease;
          background: #fafbfc;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #667eea;
          background: white;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          transform: translateY(-2px);
        }

        .form-group input.error,
        .form-group textarea.error,
        .form-group select.error {
          border-color: #e74c3c;
          background: #fff5f5;
        }

        .error-message {
          color: #e74c3c;
          font-size: 13px;
          margin-top: 6px;
          display: block;
          font-weight: 500;
        }

        .form-actions {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-top: 40px;
          padding-top: 30px;
          border-top: 1px solid #eee;
        }

        .btn-cancel {
          padding: 12px 30px;
          border: 2px solid #6c757d;
          background: white;
          color: #6c757d;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-cancel:hover {
          background: #6c757d;
          color: white;
          transform: translateY(-2px);
        }

        .btn-submit {
          padding: 12px 30px;
          border: none;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .btn-submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .users-table-section h3 {
          color: #333;
          margin-bottom: 20px;
        }

        .table-responsive {
          overflow-x: auto;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .users-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }

        .users-table th,
        .users-table td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
        }

        .users-table th {
          background: #f5f5f5;
          font-weight: 600;
          color: #333;
        }

        .users-table tr:hover {
          background-color: #f8f9fa;
        }

        .username {
          font-weight: 600;
          color: #007bff;
        }

        .address {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .role-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          white-space: nowrap; /* tránh xuống dòng xấu cho nhãn dài */
          display: inline-flex;
          align-items: center;
          line-height: 1;
        }

        .role-badge.admin { background: #dc3545; color: white; }
        .role-badge.sc-staff { background: #28a745; color: white; }
        .role-badge.sc-tech { background: #17a2b8; color: white; }
        .role-badge.evm-staff { background: #fd7e14; color: white; }
        .role-badge.customer { background: #6c757d; color: white; }


        .action-buttons {
          display: flex;
          gap: 5px;
        }

        .btn-action {
          background: none;
          border: none;
          padding: 6px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-action.edit { color: #007bff; }
        .btn-action.edit:hover { background: #e3f2fd; }

        .btn-action.delete { color: #dc3545; }
        .btn-action.delete:hover { background: #ffebee; }


        .loading {
          text-align: center;
          padding: 50px;
        }

        .loading-spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007bff;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.2s;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-primary:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #6c757d;
          color: white;
        }

        .btn-secondary:hover {
          background: #545b62;
        }

        .btn-back {
          background: #17a2b8;
          color: white;
        }

        .btn-back:hover {
          background: #138496;
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            gap: 15px;
            align-items: flex-start;
          }

          .header-left {
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
            width: 100%;
          }

          .header-actions {
            flex-direction: column;
            width: 100%;
          }

          .header-actions .btn {
            width: 100%;
            justify-content: center;
          }
          
          .form-row {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .register-form {
            padding: 25px;
          }

          .form-actions {
            flex-direction: column;
          }

          .btn-cancel, .btn-submit {
            width: 100%;
            justify-content: center;
          }
          
          .address {
            max-width: 120px;
          }
          
          .action-buttons {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminUserManagement;
