import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAuthApi } from '../api/adminUsers';

/**
 * @description Custom Hook for Create Customer Account page logic.
 * Handles form state, validation, and API submission.
 */
export const useCreateCustomerAccount = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', address: '', name: '', phone: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', or 'error'
  const [createdCustomer, setCreatedCustomer] = useState(null);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim() || formData.name.length < 5) errors.name = 'Họ và tên là bắt buộc và phải có ít nhất 5 ký tự';
    if (!formData.username.trim() || formData.username.length < 3) errors.username = 'Tên đăng nhập là bắt buộc và phải có ít nhất 3 ký tự';
    if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) errors.username = 'Tên đăng nhập chỉ được chứa chữ cái, số, gạch dưới và gạch ngang';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Email không hợp lệ';
    if (!formData.password || formData.password.length < 6) errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    if (!formData.phone.trim() || !/^(0|\+84)[3|5|7|8|9][0-9]{8}$/.test(formData.phone)) errors.phone = 'Số điện thoại Việt Nam không hợp lệ';
    if (!formData.address.trim() || formData.address.length < 10) errors.address = 'Địa chỉ là bắt buộc và phải có ít nhất 10 ký tự';
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    setSubmitStatus(null);
    setCreatedCustomer(null);

    try {
      const result = await adminAuthApi.staffRegisterCustomer(formData);
      if (result && result.success) {
        setSubmitStatus('success');
        setCreatedCustomer(result.customer);
        setFormData({ username: '', email: '', password: '', address: '', name: '', phone: '' });
        setTimeout(() => navigate('/scstaff/customers'), 3000);
      } else {
        throw new Error(result.message || 'Tạo tài khoản thất bại với lỗi không xác định.');
      }
    } catch (error) {
      setSubmitStatus('error');
      const errorMessage = error.message || 'Lỗi kết nối. Vui lòng thử lại.';
      if (errorMessage.includes('Username already exists')) {
        setFormErrors({ username: 'Tên đăng nhập đã tồn tại' });
      } else if (errorMessage.includes('Email is already in use')) {
        setFormErrors({ email: 'Email đã được sử dụng' });
      } else {
        setFormErrors({ general: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  return {
    loading,
    formData,
    formErrors,
    submitStatus,
    createdCustomer,
    showPassword: false, // This state can be managed locally in the component
    handleInputChange,
    handleSubmit,
  };
};
