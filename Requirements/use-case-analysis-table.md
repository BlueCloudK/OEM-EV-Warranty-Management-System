# Use Case Analysis Table - OEM EV Warranty Management System

## Complete Use Case Analysis

| # | Actor | Use Case | Use Case ID | Include Relations | Extend Relations | Main Activities |
|---|-------|----------|-------------|-------------------|------------------|-----------------|
| 1 | Customer | Schedule maintenance/warranty appointment | UC_CUS_001 | - | ← UC_CUS_004 (feedback after service) | • Select service type<br>• Choose appointment time<br>• Confirm booking |
| 2 | Customer | View warranty results | UC_CUS_002 | - | - | • Query warranty status<br>• View repair details<br>• Download reports |
| 3 | Customer | View warranty & parts history | UC_CUS_003 | - | - | • Search by VIN<br>• View timeline<br>• Export history |
| 4 | Customer | Submit service feedback | UC_CUS_004 | - | → UC_CUS_001 (only after service completion within N days) | • Rate service quality<br>• Submit comments<br>• Upload images |
| 5 | SC Staff | Register vehicle by VIN | UC_SC_001 | - | - | • Input VIN number<br>• Validate vehicle<br>• Create vehicle profile |
| 6 | SC Staff | Create warranty claim | UC_SC_002 | → UC_SC_003 (upload inspection report) | ← UC_COM_001 (missing evidence) | • Enter claim details<br>• Validate data<br>• Submit claim |
| 7 | SC Staff | Upload inspection report & images | UC_SC_003 | ← UC_SC_002 (mandatory) | - | • Upload files<br>• Validate formats<br>• Store evidence |
| 8 | SC Staff, Tech, EVM | Track claim status | UC_TRACK | - | - | • View dashboard<br>• Monitor progress<br>• Receive notifications |
| 9 | SC Staff | Manage customer profiles | UC_SC_005 | - | - | • Update customer info<br>• Manage history<br>• Sync data |
| 10 | SC Staff | Send periodic reports to EVM | UC_SC_006 | - | - | • Generate reports<br>• Export data<br>• Send reports |
| 11 | Technician | Receive claim from SC Staff | UC_TEC_001 | - | ← UC_COM_001 (missing information) | • Receive assignment<br>• Review claim<br>• Accept/Reject |
| 12 | Technician | Perform vehicle inspection | UC_TEC_002 | - | → UC_TEC_003 (if repair needed) | • Inspect vehicle<br>• Diagnose issues<br>• Document findings |
| 13 | Technician | Perform repair/parts replacement | UC_TEC_003 | → UC_TEC_004 (record parts history) | ← UC_TEC_002 (after diagnosis) | • Execute repair<br>• Replace parts<br>• Test functionality |
| 14 | Technician | Record vehicle & parts history | UC_TEC_004 | ← UC_TEC_003 (mandatory) | - | • Log parts used<br>• Update history<br>• Generate records |
| 15 | Technician | Confirm warranty completion | UC_TEC_005 | - | - | • Final inspection<br>• Customer sign-off<br>• Close ticket |
| 16 | EVM Staff | Manage warranty policies | UC_EVM_001 | - | - | • Define policies<br>• Update rules<br>• Validate coverage |
| 17 | EVM Staff | Approve/reject claims | UC_EVM_002 | → UC_COM_002 (check policy compliance) | ← UC_COM_001 (insufficient documents) | • Review claims<br>• Validate policies<br>• Make decisions |
| 18 | EVM Staff | Manage product & parts database | UC_EVM_003 | - | - | • Manage product DB<br>• Update parts catalog<br>• Set pricing |
| 19 | EVM Staff | Track parts replacement history by VIN | UC_EVM_004 | - | - | • Query by VIN<br>• Analyze patterns<br>• Generate insights |
| 20 | EVM Staff | Analyze data & report common issues | UC_EVM_005 | - | - | • Data mining<br>• Trend analysis<br>• Create reports |
| 21 | Admin | Manage accounts & permissions | UC_ADM_001 | - | - | • User management<br>• Role assignment<br>• Access control |
| 22 | Admin | Configure system workflows | UC_ADM_002 | - | - | • Configure flows<br>• Set business rules<br>• Test workflows |
| 23 | Admin | Manage logs & alerts | UC_ADM_003 | - | - | • Monitor system logs<br>• Set up alerts<br>• Handle incidents |
| 24 | Admin | Generate periodic activity reports | UC_ADM_004 | - | - | • Create reports<br>• Schedule delivery<br>• Archive data |
| 25 | Multi-Actor | Request additional information/documents | UC_COM_001 | - | → UC_SC_002, UC_TEC_001, UC_EVM_002 | • Request documents<br>• Validate information<br>• Follow up |
| 26 | EVM Staff | Check warranty policy compliance | UC_COM_002 | ← UC_EVM_002 (mandatory) | - | • Validate policy rules<br>• Check coverage<br>• Generate compliance report |

## Relationship Summary

| Relationship Type | Count | Details |
|-------------------|-------|---------|
| **Include** | 3 | UC_SC_002 → UC_SC_003<br>UC_TEC_003 → UC_TEC_004<br>UC_EVM_002 → UC_COM_002 |
| **Extend** | 5 | UC_CUS_004 → UC_CUS_001<br>UC_TEC_003 → UC_TEC_002<br>UC_COM_001 → UC_SC_002<br>UC_COM_001 → UC_TEC_001<br>UC_COM_001 → UC_EVM_002 |
| **Shared Use Cases** | 1 | UC_TRACK (used by SC Staff, Technician, EVM Staff) |
| **Multi-Actor Use Cases** | 1 | UC_COM_001 (involves Customer, SC Staff, Technician, EVM Staff) |

## Priority Activities Requiring Further Design

| Use Case ID | Use Case Name | Activity Diagram Needed | Sequence Diagram Needed | Complexity Level |
|-------------|---------------|-------------------------|-------------------------|------------------|
| UC_SC_002 | Create warranty claim | ✅ **High** | ✅ | Complex |
| UC_EVM_002 | Approve/reject claims | ✅ **High** | ✅ | Complex |
| UC_TEC_003 | Perform repair/replacement | ✅ **High** | ✅ | Complex |
| UC_TRACK | Track claim status | ✅ **Medium** | ✅ | Medium |
| UC_COM_001 | Request additional information | ✅ **Medium** | ✅ | Medium |