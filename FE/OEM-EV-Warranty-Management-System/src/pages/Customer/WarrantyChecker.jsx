import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styled from 'styled-components';
import WarrantyChecker from '../../components/WarrantyChecker';
import vehiclesApi from '../../api/vehicles';
import installedPartsApi from '../../api/installedParts';
import { FaShieldAlt, FaCar, FaCog, FaArrowLeft, FaSpinner } from 'react-icons/fa';

/**
 * Customer Warranty Checker Page
 *
 * Allows customers to check warranty status for their vehicles and parts
 */
const WarrantyCheckerPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [myVehicles, setMyVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [installedParts, setInstalledParts] = useState([]);
  const [selectedInstalledPartId, setSelectedInstalledPartId] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkMode, setCheckMode] = useState('vehicle'); // 'vehicle' or 'part'

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    fetchMyVehicles();
  }, []);

  const fetchMyVehicles = async () => {
    setLoading(true);
    try {
      const response = await vehiclesApi.getMyVehicles();
      setMyVehicles(response.content || response || []);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleChange = async (e) => {
    const vehicleId = e.target.value;
    setSelectedVehicleId(vehicleId);
    setSelectedInstalledPartId('');

    if (vehicleId && checkMode === 'part') {
      try {
        setLoading(true);
        const parts = await installedPartsApi.getPartsByVehicle(vehicleId);
        setInstalledParts(parts || []);
      } catch (error) {
        console.error('Error fetching installed parts:', error);
        setInstalledParts([]);
      } finally {
        setLoading(false);
      }
    }
  };

  if (authLoading || loading) {
    return (
      <LoadingState>
        <FaSpinner />
        <p>Đang tải...</p>
      </LoadingState>
    );
  }

  return (
    <PageContainer>
      <ContentWrapper>
        <Header>
          <BackButton onClick={() => navigate('/customer/dashboard')}>
            <FaArrowLeft /> Quay lại
          </BackButton>
          <HeaderContent>
            <HeaderTitle><FaShieldAlt /> Kiểm Tra Bảo Hành</HeaderTitle>
            <HeaderSubtitle>
              Kiểm tra tình trạng bảo hành cho xe và linh kiện của bạn
            </HeaderSubtitle>
          </HeaderContent>
        </Header>

        <SelectionSection>
          <ModeSelector>
            <ModeButton
              active={checkMode === 'vehicle'}
              onClick={() => {
                setCheckMode('vehicle');
                setSelectedInstalledPartId('');
              }}
            >
              <FaCar /> Kiểm tra Bảo hành Xe
            </ModeButton>
            <ModeButton
              active={checkMode === 'part'}
              onClick={() => setCheckMode('part')}
            >
              <FaCog /> Kiểm tra Bảo hành Linh kiện
            </ModeButton>
          </ModeSelector>

          <SelectionForm>
            <FormGroup>
              <Label htmlFor="vehicle">Chọn xe của bạn *</Label>
              <Select
                id="vehicle"
                value={selectedVehicleId}
                onChange={handleVehicleChange}
              >
                <option value="">-- Chọn xe --</option>
                {myVehicles.map(vehicle => (
                  <option key={vehicle.vehicleId} value={vehicle.vehicleId}>
                    {vehicle.vehicleName} ({vehicle.vehicleVin})
                  </option>
                ))}
              </Select>
            </FormGroup>

            {checkMode === 'part' && selectedVehicleId && (
              <FormGroup>
                <Label htmlFor="installedPart">Chọn linh kiện đã lắp đặt *</Label>
                <Select
                  id="installedPart"
                  value={selectedInstalledPartId}
                  onChange={(e) => setSelectedInstalledPartId(e.target.value)}
                  disabled={!selectedVehicleId}
                >
                  <option value="">-- Chọn linh kiện --</option>
                  {installedParts.map(part => (
                    <option key={part.installedPartId} value={part.installedPartId}>
                      {part.partName} (Lắp đặt: {new Date(part.installationDate).toLocaleDateString('vi-VN')})
                    </option>
                  ))}
                </Select>
              </FormGroup>
            )}
          </SelectionForm>
        </SelectionSection>

        {/* Warranty Checker Component */}
        {selectedVehicleId && (checkMode === 'vehicle' || selectedInstalledPartId) && (
          <WarrantyChecker
            vehicleId={checkMode === 'vehicle' ? selectedVehicleId : null}
            installedPartId={checkMode === 'part' ? selectedInstalledPartId : null}
            onWarrantyChecked={(info) => {
              console.log('Warranty info:', info);
            }}
          />
        )}

        {!selectedVehicleId && (
          <InfoBox>
            <FaShieldAlt style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.5 }} />
            <h3>Chọn xe để kiểm tra bảo hành</h3>
            <p>Vui lòng chọn xe từ danh sách trên để xem thông tin bảo hành chi tiết.</p>
          </InfoBox>
        )}
      </ContentWrapper>
    </PageContainer>
  );
};

// ========== STYLED COMPONENTS ==========

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #f0f0f0;
  border: none;
  border-radius: 8px;
  color: #333;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #e0e0e0;
    transform: translateX(-4px);
  }
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const HeaderTitle = styled.h1`
  margin: 0 0 8px 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 2rem;

  svg {
    color: #667eea;
  }
`;

const HeaderSubtitle = styled.p`
  margin: 0;
  color: #666;
  font-size: 1rem;
`;

const SelectionSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

const ModeSelector = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 16px;
`;

const ModeButton = styled.button`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 24px;
  border: 2px solid ${props => props.active ? '#667eea' : '#e0e0e0'};
  background: ${props => props.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'white'};
  color: ${props => props.active ? 'white' : '#666'};
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  svg {
    font-size: 1.5rem;
  }
`;

const SelectionForm = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #333;
  font-size: 1rem;
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s;
  background: white;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }
`;

const InfoBox = styled.div`
  background: white;
  border-radius: 12px;
  padding: 48px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  color: #666;

  h3 {
    margin: 0 0 12px 0;
    color: #333;
    font-size: 1.5rem;
  }

  p {
    margin: 0;
    font-size: 1rem;
  }

  svg {
    color: #667eea;
  }
`;

const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  color: white;
  font-size: 1.2rem;

  svg {
    font-size: 3rem;
    margin-bottom: 16px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export default WarrantyCheckerPage;
