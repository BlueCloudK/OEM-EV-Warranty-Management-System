import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminUserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    address: '',
    roleId: 2 // Default to SC_STAFF
  });
  const [formErrors, setFormErrors] = useState({});
  const [registering, setRegistering] = useState(false);

  // Role mapping based on API guide
  const roles = [
    { id: 1, name: 'ADMIN', display: 'Administrator' },
    { id: 2, name: 'SC_STAFF', display: 'Service Center Staff' },
    { id: 3, name: 'SC_TECHNICIAN', display: 'Service Center Technician' },
    { id: 4, name: 'EVM_STAFF', display: 'EVM Staff' },
    { id: 5, name: 'CUSTOMER', display: 'Customer' }
  ];

  // Mock users data for demo
  const mockUsers = [
    {
      id: 1,
      username: 'admin_user',
      email: 'admin@oem-ev.com',
      roleId: 1,
      roleName: 'ADMIN',
      address: 'Head Office, District 1, Ho Chi Minh City',
      createdAt: '2024-01-15T08:30:00',
      isActive: true
    },
    {
      id: 2,
      username: 'sc_manager',
      email: 'manager@service.com',
      roleId: 2,
      roleName: 'SC_STAFF',
      address: 'Service Center A, District 3, Ho Chi Minh City',
      createdAt: '2024-02-10T09:15:00',
      isActive: true
    },
    {
      id: 3,
      username: 'tech_nguyen',
      email: 'nguyen.tech@service.com',
      roleId: 3,
      roleName: 'SC_TECHNICIAN',
      address: 'Service Center A, District 3, Ho Chi Minh City',
      createdAt: '2024-03-05T14:20:00',
      isActive: true
    },
    {
      id: 4,
      username: 'evm_staff',
      email: 'evm@warranty.com',
      roleId: 4,
      roleName: 'EVM_STAFF',
      address: 'EVM Office, District 7, Ho Chi Minh City',
      createdAt: '2024-03-20T11:45:00',
      isActive: true
    }
  ];

  useEffect(() => {
    // Fetch users from API
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
        const token = localStorage.getItem('token');
        
        if (!token) {
          console.error('No token found, user not authenticated');
          setUsers(mockUsers);
          setLoading(false);
          return;
        }

        console.log('🔍 Using Customer API (admin/users not in API guide):', `${API_BASE_URL}/api/customers`);
        
        // Since /api/admin/users doesn't exist in API_GUIDE, use Customer API as alternative
        const response = await fetch(`${API_BASE_URL}/api/customers`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        });

        console.log('📊 API Response Status:', response.status);
        console.log('📊 API Response Headers:', response.headers);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Users fetched successfully:', data);

        // Transform API data to match our component structure
        const transformedUsers = data.map(user => ({
          id: user.id,
          username: user.username,
          email: user.email,
          roleId: user.roleId,
          roleName: user.roleName || getRoleNameById(user.roleId),
          address: user.address,
          createdAt: user.createdAt || new Date().toISOString(),
          isActive: user.active !== undefined ? user.active : true
        }));

        setUsers(transformedUsers);
        setLoading(false);
        
      } catch (error) {
        console.error('❌ Error fetching users:', error);
        
        // Fallback to mock data if API fails
        console.log('🔄 Falling back to mock data');
        setUsers(mockUsers);
        setLoading(false);
        
        // Optional: Show user-friendly error message
        // alert('Unable to load users from server. Showing demo data.');
      }
    };

    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email format is invalid';
    }
    
    if (!formData.password.trim()) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }
    
    if (!formData.roleId) {
      errors.roleId = 'Role is required';
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
      // TODO: Replace with actual API call
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/admin/create-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const newUser = await response.json();
        
        // Add new user to list
        setUsers(prev => [...prev, {
          ...newUser,
          roleName: roles.find(r => r.id === formData.roleId)?.name || 'UNKNOWN',
          createdAt: new Date().toISOString(),
          isActive: true
        }]);
        
        // Reset form
        setFormData({
          username: '',
          email: '',
          password: '',
          address: '',
          roleId: 2
        });
        setShowRegisterForm(false);
        
        alert('User registered successfully!');
      } else {
        const error = await response.json();
        alert(`Registration failed: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // For demo purposes, simulate successful registration
      const newUser = {
        id: users.length + 1,
        ...formData,
        roleName: roles.find(r => r.id === formData.roleId)?.name || 'UNKNOWN',
        createdAt: new Date().toISOString(),
        isActive: true
      };
      
      setUsers(prev => [...prev, newUser]);
      
      // Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
        address: '',
        roleId: 2
      });
      setShowRegisterForm(false);
      
      alert('User registered successfully! (Demo mode)');
    }
    
    setRegistering(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleNameById = (roleId) => {
    return roles.find(r => r.id === roleId)?.name || 'UNKNOWN';
  };

  const getRoleDisplay = (roleName) => {
    return roles.find(r => r.name === roleName)?.display || roleName;
  };

  const refreshUsers = async () => {
    setLoading(true);
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        setUsers(mockUsers);
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      const transformedUsers = data.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        roleId: user.roleId,
        roleName: user.roleName || getRoleNameById(user.roleId),
        address: user.address,
        createdAt: user.createdAt || new Date().toISOString(),
        isActive: user.active !== undefined ? user.active : true
      }));

      setUsers(transformedUsers);
      
    } catch (error) {
      console.error('Error refreshing users:', error);
      setUsers(mockUsers);
    }
    
    setLoading(false);
  };

  const getRoleBadgeClass = (roleName) => {
    switch (roleName) {
      case 'ADMIN': return 'role-badge admin';
      case 'SC_STAFF': return 'role-badge sc-staff';
      case 'SC_TECHNICIAN': return 'role-badge sc-tech';
      case 'EVM_STAFF': return 'role-badge evm-staff';
      case 'CUSTOMER': return 'role-badge customer';
      default: return 'role-badge';
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
            onClick={() => navigate('/admin')}
            title="Back to Admin Dashboard"
          >
            <i className="fas fa-arrow-left"></i>
            Quay lại
          </button>
          <div className="header-title">
            <h2>Quản Lý Người Dùng & Vai Trò</h2>
            <p className="header-subtitle">Quản lý tài khoản người dùng và quyền truy cập</p>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={refreshUsers}
            disabled={loading}
            title="Refresh Users List"
          >
            <i className={`fas fa-sync-alt ${loading ? 'fa-spin' : ''}`}></i>
            Refresh
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowRegisterForm(!showRegisterForm)}
          >
            <i className="fas fa-plus"></i>
            {showRegisterForm ? 'Cancel' : 'Register New User'}
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
                      className={formErrors.username ? 'error' : ''}
                      placeholder="Enter unique username"
                    />
                    {formErrors.username && <span className="error-message">{formErrors.username}</span>}
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
                      className={formErrors.email ? 'error' : ''}
                      placeholder="user@example.com"
                    />
                    {formErrors.email && <span className="error-message">{formErrors.email}</span>}
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
                      className={formErrors.password ? 'error' : ''}
                      placeholder="Min. 6 characters"
                    />
                    {formErrors.password && <span className="error-message">{formErrors.password}</span>}
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
                      className={formErrors.roleId ? 'error' : ''}
                    >
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>
                          {role.display}
                        </option>
                      ))}
                    </select>
                    {formErrors.roleId && <span className="error-message">{formErrors.roleId}</span>}
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
                    className={formErrors.address ? 'error' : ''}
                    placeholder="Enter complete address including district and city"
                    rows="3"
                  />
                  {formErrors.address && <span className="error-message">{formErrors.address}</span>}
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
            All Users ({users.length})
          </h3>
          {users.length === 0 && !loading && (
            <div className="empty-state">
              <i className="fas fa-users"></i>
              <p>No users found</p>
              <small>Try refreshing or check your connection</small>
            </div>
          )}
        </div>
        
        {users.length > 0 && (
          <div className="table-responsive">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Address</th>
                  <th>Created Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td className="username">{user.username}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={getRoleBadgeClass(user.roleName)}>
                        {getRoleDisplay(user.roleName)}
                      </span>
                    </td>
                    <td className="address" title={user.address}>{user.address}</td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                    <div className="action-buttons">
                      <button className="btn-action edit" title="Edit User">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="btn-action delete" title="Delete User">
                        <i className="fas fa-trash"></i>
                      </button>
                      <button 
                        className={`btn-action ${user.isActive ? 'deactivate' : 'activate'}`} 
                        title={user.isActive ? 'Deactivate User' : 'Activate User'}
                      >
                        <i className={`fas ${user.isActive ? 'fa-user-slash' : 'fa-user-check'}`}></i>
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

      <style jsx>{`
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
        }

        .role-badge.admin { background: #dc3545; color: white; }
        .role-badge.sc-staff { background: #28a745; color: white; }
        .role-badge.sc-tech { background: #17a2b8; color: white; }
        .role-badge.evm-staff { background: #fd7e14; color: white; }
        .role-badge.customer { background: #6c757d; color: white; }

        .status-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.active { background: #d4edda; color: #155724; }
        .status-badge.inactive { background: #f8d7da; color: #721c24; }

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

        .btn-action.deactivate { color: #fd7e14; }
        .btn-action.deactivate:hover { background: #fff3cd; }

        .btn-action.activate { color: #28a745; }
        .btn-action.activate:hover { background: #d4edda; }
5b62;
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