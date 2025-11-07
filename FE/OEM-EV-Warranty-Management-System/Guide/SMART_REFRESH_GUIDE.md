# 🔄 Smart Auto-Refresh Implementation Guide

## ✅ What's Been Implemented

### Core Infrastructure (DONE)
1. **`hooks/useSmartRefresh.js`** - Reusable hook for smart refresh logic
2. **`components/RefreshIndicator.jsx`** - UI component showing refresh status
3. **AdminRecallManagement** - Full smart refresh ✅
4. **EVMRecallRequests** - Full smart refresh ✅
5. **AdminWarrantyClaimsManagement** - Full smart refresh ✅

---

## 📋 Remaining Components to Update

### Priority 1: CRITICAL (Need polling)
- [ ] `pages/SCStaff/WarrantyClaimsManagement.jsx`
- [ ] `pages/Customer/CustomerRecalls.jsx`

### Priority 2: MEDIUM (Visibility-refresh only)
- [ ] `pages/Admin/AdminDashboard.jsx`
- [ ] `pages/Customer/CustomerDashboard.jsx` / `CustomerDashboardNew.jsx`
- [ ] `pages/SCStaff/SCStaffDashboard.jsx`
- [ ] `pages/Admin/AdminFeedbackManagement.jsx`
- [ ] `pages/SCStaff/SCStaffFeedbackManagement.jsx`

### Priority 3: LOW (Add manual refresh button only)
- [ ] `pages/Admin/AdminPartsManagement.jsx`
- [ ] `pages/Admin/AdminVehicleManagement.jsx`
- [ ] `pages/Admin/AdminCustomerManagement.jsx`
- [ ] `pages/SCStaff/CustomerManagement.jsx`
- [ ] `pages/SCStaff/VehicleManagement.jsx`

---

## 🎯 Implementation Pattern

### Pattern A: Component with Custom Hook (Most common)

**Example:** AdminWarrantyClaimsManagement, EVMRecallRequests

#### Step 1: Update the custom hook

```javascript
// In hooks/useYourHook.js

import { useSmartRefresh } from './useSmartRefresh';

// 1. Modify fetchFunction to accept 'silent' parameter
const fetchData = useCallback(async (silent = false) => {
  try {
    if (!silent) {
      setLoading(true); // Only show loader for manual refresh
    }
    // ... fetch logic ...
  } finally {
    if (!silent) {
      setLoading(false);
    }
  }
}, [dependencies]);

// 2. Add useSmartRefresh
const { lastUpdated, autoRefreshing, getTimeAgo } = useSmartRefresh(fetchData, {
  shouldPoll: () => data.some(item =>
    item.status === 'PENDING' || item.status === 'WAITING'
  ),
  pollingInterval: 30000, // 30s
  enablePolling: true,
  enableVisibilityRefresh: true,
});

// 3. Return new props
return {
  // ... existing returns
  lastUpdated,
  autoRefreshing,
  getTimeAgo,
};
```

#### Step 2: Update the component

```javascript
// In pages/YourComponent.jsx

import RefreshIndicator from '../../components/RefreshIndicator';

const YourComponent = () => {
  const {
    data,
    loading,
    refreshData,
    // Add these 👇
    lastUpdated,
    autoRefreshing,
    getTimeAgo
  } = useYourHook();

  // Calculate if polling is active
  const isPollingActive = data.some(item =>
    item.status === 'PENDING' || item.status === 'WAITING'
  );

  return (
    <Container>
      <Header>
        <div>
          <Title>Your Page Title</Title>
          <RefreshIndicator
            lastUpdated={lastUpdated}
            autoRefreshing={autoRefreshing}
            getTimeAgo={getTimeAgo}
            isPollingActive={isPollingActive}
          />
        </div>
        <Button onClick={refreshData}>
          <FaSyncAlt /> Làm mới
        </Button>
      </Header>
      {/* ... rest of component */}
    </Container>
  );
};
```

---

### Pattern B: Component WITHOUT Custom Hook (Direct state management)

**Example:** Simple dashboard components

#### Step 1: Add useSmartRefresh directly in component

```javascript
import { useState, useEffect, useCallback } from 'react';
import { useSmartRefresh } from '../../hooks/useSmartRefresh';
import RefreshIndicator from '../../components/RefreshIndicator';

const YourDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Modify fetch to accept silent parameter
  const fetchData = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await api.getData();
      setData(response);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // 2. Add useSmartRefresh
  const { lastUpdated, autoRefreshing, getTimeAgo } = useSmartRefresh(fetchData, {
    shouldPoll: () => false, // Dashboards usually don't need polling
    enablePolling: false,
    enableVisibilityRefresh: true, // Only visibility refresh
  });

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Container>
      <Header>
        <div>
          <Title>Dashboard</Title>
          <RefreshIndicator
            lastUpdated={lastUpdated}
            autoRefreshing={autoRefreshing}
            getTimeAgo={getTimeAgo}
            isPollingActive={false}
          />
        </div>
        <Button onClick={() => fetchData()}>
          <FaSyncAlt /> Làm mới
        </Button>
      </Header>
      {/* ... rest */}
    </Container>
  );
};
```

---

### Pattern C: Add Manual Refresh Button Only

**For:** Master data management pages (Parts, Vehicles, Users, etc.)

```javascript
import { FaSyncAlt } from 'react-icons/fa';

const YourManagementPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.getData();
      setData(response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>Management Page</Title>
        <Button onClick={fetchData} disabled={loading}>
          <FaSyncAlt style={{
            animation: loading ? 'spin 1s linear infinite' : 'none'
          }} />
          Làm mới
        </Button>
      </Header>
      {/* ... rest */}
    </Container>
  );
};
```

---

## 🎛️ Configuration Options

### useSmartRefresh Options

```javascript
{
  // Function that returns true when polling should be active
  shouldPoll: () => boolean,

  // Interval in milliseconds (default: 30000 = 30s)
  pollingInterval: number,

  // Min time before visibility refresh (default: 30000 = 30s)
  visibilityThreshold: number,

  // Enable smart polling (default: true)
  enablePolling: boolean,

  // Enable visibility-based refresh (default: true)
  enableVisibilityRefresh: boolean,
}
```

### Common Configurations

**For Warranty Claims / Recalls (high priority):**
```javascript
{
  shouldPoll: () => items.some(i => i.status === 'SUBMITTED' || i.status === 'PENDING'),
  pollingInterval: 30000,
  enablePolling: true,
  enableVisibilityRefresh: true,
}
```

**For Dashboards (low priority):**
```javascript
{
  shouldPoll: () => false,
  enablePolling: false,
  enableVisibilityRefresh: true,
}
```

**For Feedback (medium priority):**
```javascript
{
  shouldPoll: () => feedbacks.some(f => f.status === 'PENDING_REVIEW'),
  pollingInterval: 60000, // 1 minute (less urgent)
  enablePolling: true,
  enableVisibilityRefresh: true,
}
```

---

## 🎨 UI Best Practices

### 1. Header Layout
```javascript
<Header style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
}}>
  <div>
    <Title><Icon /> Page Title</Title>
    <RefreshIndicator {...refreshProps} />
  </div>
  <ButtonGroup>
    <FilterSelect />
    <RefreshButton />
  </ButtonGroup>
</Header>
```

### 2. RefreshIndicator Styling
The component is already styled, but you can customize:
```javascript
<RefreshIndicator
  lastUpdated={lastUpdated}
  autoRefreshing={autoRefreshing}
  getTimeAgo={getTimeAgo}
  isPollingActive={isActive}
  style={{ marginTop: '8px' }} // Optional
/>
```

### 3. Spinner Button
```javascript
<Button onClick={refresh} disabled={loading}>
  <FaSyncAlt style={{
    animation: loading ? 'spin 1s linear infinite' : 'none'
  }} />
  Làm mới
</Button>
```

---

## 🐛 Troubleshooting

### Issue: Polling never stops
**Solution:** Check your `shouldPoll` function. It should return false when done.

```javascript
// ❌ Bad
shouldPoll: () => true

// ✅ Good
shouldPoll: () => items.some(i => i.status === 'PENDING')
```

### Issue: Too many API calls
**Solution:** Adjust `pollingInterval` or disable polling

```javascript
// Increase interval for less critical data
pollingInterval: 60000, // 1 minute instead of 30s

// Or disable polling completely
enablePolling: false,
```

### Issue: Component not updating after fetch
**Solution:** Make sure you update state AND call `setLastUpdated`

```javascript
const { setLastUpdated } = useSmartRefresh(fetchData, options);

const fetchData = async () => {
  const data = await api.getData();
  setData(data);
  setLastUpdated(new Date()); // Don't forget this!
};
```

---

## 📊 Summary

### What You Get:
✅ Automatic updates when user returns to tab
✅ Smart polling only when needed
✅ User awareness (timestamp + polling indicator)
✅ Minimal server load
✅ Consistent UX across all pages
✅ Easy to customize per component

### Current Status:
- ✅ **5 components done** (Recall Management x2, Admin Warranty Claims)
- ⏳ **2 high-priority remaining** (SC_STAFF Warranty, Customer Recalls)
- ⏳ **6 medium-priority remaining** (Dashboards, Feedback)
- ⏳ **5 low-priority remaining** (Master data pages)

### Estimated Time per Component:
- **With hook:** 5-10 minutes
- **Without hook:** 10-15 minutes
- **Manual button only:** 2 minutes

---

## 🚀 Quick Start Checklist

For each component:

1. [ ] Identify if it uses a custom hook or not
2. [ ] Decide: Smart polling, visibility-only, or manual-only?
3. [ ] Update fetch function to accept `silent` parameter
4. [ ] Add `useSmartRefresh` (in hook or component)
5. [ ] Import `RefreshIndicator` component
6. [ ] Add indicator to UI
7. [ ] Test: Check console for polling logs
8. [ ] Verify: Timestamp updates, polling starts/stops correctly

---

## 💬 Need Help?

Check existing implementations:
- **Full example:** `pages/Admin/AdminRecallManagement.jsx`
- **Hook example:** `hooks/useAdminWarrantyClaims.js`
- **Reusable hook:** `hooks/useSmartRefresh.js`
- **UI component:** `components/RefreshIndicator.jsx`

The pattern is consistent across all components!
