"""
this is for user related services, mainly user management, authentication, and authorization.
It provides functions to create, update, delete, and retrieve user information, as well as manage user roles and permissions.
chief/deputy ombudsman is the highest authority in the system, and monitoring officers are responsible for overseeing and monitoring activities within the system.
chief/deputy ombudsman can create monitoring officer users, and monitoring officers can create regular users. 
"""
from ..models import User, Role

# creating monitoring officer user
def create_monitoring_officer(full_name, email, phone_number):
    role = Role.objects.get(role_name=Role.RoleNames.MONITORING_OFFICER)
    return User.objects.create(
        user_name=full_name,
        user_email=email,
        user_phone=phone_number,
        user_role=role,
    )

# assigning monitoring officer to a specific administrative location to monitor
def assign_monitoring_officer_to_location(monitoring_officer, location):
    monitoring_officer.assigned_location = location
    monitoring_officer.save()
    return monitoring_officer