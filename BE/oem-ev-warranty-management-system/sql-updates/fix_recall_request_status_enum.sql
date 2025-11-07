-- Fix RecallRequestStatus ENUM to add COMPLETED value
-- Run this SQL script in your MySQL database

-- Check current ENUM values
SHOW COLUMNS FROM recall_requests LIKE 'status';

-- ALTER TABLE to add COMPLETED to ENUM
ALTER TABLE recall_requests 
MODIFY COLUMN status ENUM(
    'PENDING_ADMIN_APPROVAL',
    'APPROVED_BY_ADMIN',
    'REJECTED_BY_ADMIN',
    'WAITING_CUSTOMER_CONFIRM',
    'COMPLETED',
    'REJECTED_BY_CUSTOMER',
    'ACCEPTED_BY_CUSTOMER',
    'CLAIM_CREATED'
) NOT NULL;

-- Verify the change
SHOW COLUMNS FROM recall_requests LIKE 'status';
