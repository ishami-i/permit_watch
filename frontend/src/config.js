export const API_BASE_URL = "http://localhost:8000/api";

// Auth
export const LOGIN_URL = `${API_BASE_URL}/auth/login/`;
export const LOGOUT_URL = `${API_BASE_URL}/auth/logout/`;
export const FORGOT_PASSWORD_URL = `${API_BASE_URL}/auth/forgot-password/`;
export const CURRENT_USER_URL = `${API_BASE_URL}/auth/me/`;

// Permits
export const PERMIT_API_URL = `${API_BASE_URL}/permits/`;
export const PERMIT_API_FULL_URL = `${API_BASE_URL}/permits/full/`;
export const PERMIT_API_FULL_ID_URL = `${API_BASE_URL}/permits/full/{permit_id}/`;
export const PERMIT_API_ID_URL = `${API_BASE_URL}/permits/{permit_id}/`;
export const PERMIT_API_FLAGGED_URL = `${API_BASE_URL}/permits/flagged/`;
export const PERMIT_API_PENDING_URL = `${API_BASE_URL}/permits/pending/`;
export const PERMIT_API_CHECK_URL = `${API_BASE_URL}/permits/{permit_id}/check/`;

// Projects
export const PROJECT_API_URL = `${API_BASE_URL}/projects/`;
export const PROJECT_API_ID_URL = `${API_BASE_URL}/projects/{project_id}/`;
export const PROJECT_API_FLAGGED_URL = `${API_BASE_URL}/projects/flagged/`;

// Applicants
export const APPLICANT_API_URL = `${API_BASE_URL}/applicants/`;
export const APPLICANT_API_ID_URL = `${API_BASE_URL}/applicants/{applicant_id}/`;

// Alerts
export const ALERT_API_URL = `${API_BASE_URL}/alerts/`;
export const ALERT_API_ID_URL = `${API_BASE_URL}/alerts/{alert_id}/`;
export const ALERT_API_RESOLVE_URL = `${API_BASE_URL}/alerts/{alert_id}/resolve/`;

// Monitoring officers
export const OFFICER_API_URL = `${API_BASE_URL}/officers/`;
export const OFFICER_API_ID_URL = `${API_BASE_URL}/officers/{officer_id}/`;
export const OFFICER_API_ASSIGNED_URL = `${API_BASE_URL}/officers/assigned/`;
export const OFFICER_API_UNASSIGNED_URL = `${API_BASE_URL}/officers/unassigned/`;
export const OFFICER_API_ASSIGN_URL = `${API_BASE_URL}/officers/{officer_id}/assign/`;
export const DISTRICT_COVERAGE_URL = `${API_BASE_URL}/officers/district-coverage/`;

// Users
export const USER_API_URL = `${API_BASE_URL}/users/`;
export const USER_API_ID_URL = `${API_BASE_URL}/users/{user_id}/`;

// Audit
export const AUDIT_LOG_URL = `${API_BASE_URL}/audit-logs/`;

// Statistics / dashboard
export const STATISTICS_URL = `${API_BASE_URL}/statistics/`;
export const DASHBOARD_SUMMARY_URL = `${API_BASE_URL}/dashboard/summary/`;
