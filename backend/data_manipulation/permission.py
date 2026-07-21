from rest_framework.permissions import BasePermission
from .models import Role

# Custom permission class to check if the user is a Chief or Deputy Ombudsman
class IsChiefOrDeputyOmbudsman(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.user_role.role_name in {
                Role.RoleNames.CHIEF_OMBUDSMAN,
                Role.RoleNames.DEPUTY_OMBUDSMAN,
            }
        )