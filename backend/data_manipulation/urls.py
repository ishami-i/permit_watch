from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView

from .auth_views import CustomTokenObtainPairView

urlpatterns = [
    # Auth
    path("auth/login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", views.current_user_view, name="current_user"),
    path("auth/change-password/", views.change_password_view, name="change_password"),

    # Permits
    path("permits/", views.all_permit_data_view, name="permits"),
    path("permits/full/", views.all_full_permit_data_view, name="full_permits"),
    path("permits/<int:permit_id>/", views.permit_data_view, name="permit"),
    path("permits/full/<int:permit_id>/", views.full_permit_data_view, name="full_permit"),
    path("permits/flagged/", views.flagged_permits_list, name="flagged_permits_list"),
    path("permits/<int:permit_id>/check/", views.trigger_permit_flag_check, name="check_permit"),

    # Projects
    path("projects/flagged/", views.flagged_projects_list, name="flagged_projects_list"),
    path("dashboard/summary/", views.dashboard_summary_view, name="dashboard_summary"),
    path("projects/", views.all_projects_view, name="projects"),
    path("applicants/", views.all_applicants_view, name="applicants"),
    path("applicants/<int:applicant_id>/", views.applicant_detail_view, name="applicant"),
    path("projects/<str:project_id>/", views.project_detail_view, name="project"),
    path("permits/pending/", views.pending_permit_data_view, name="pending_permits"),
    path("alerts/", views.alerts_list_view, name="alerts"),
    path("alerts/<int:alert_id>/", views.alert_detail_view, name="alert"),
    path("alerts/<int:alert_id>/resolve/", views.resolve_alert_view, name="resolve_alert"),
    path("auth/logout/", views.logout_view, name="logout"),

    path("officers/assigned/", views.assigned_officers_view, name="officers_assigned"),
    path("officers/unassigned/", views.unassigned_officers_view, name="officers_unassigned"),
    path("officers/district-coverage/", views.district_coverage_view, name="district_coverage"),
    path("officers/", views.create_officer_view, name="create_officer"),
    path("officers/<int:officer_id>/", views.officer_detail_view, name="officer_detail"),
    path("officers/<int:officer_id>/assign/", views.assign_officer_view, name="assign_officer"),
    path("officers/<int:officer_id>/unassign/", views.unassign_officer_view, name="unassign_officer"),
]
