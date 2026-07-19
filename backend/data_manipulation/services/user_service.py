"""
this is for user related services, mainly user management, authentication, and authorization.
It provides functions to create, update, delete, and retrieve user information, as well as manage user roles and permissions.
chief/deputy ombudsman is the highest authority in the system, and monitoring officers are responsible for overseeing and monitoring activities within the system.
chief/deputy ombudsman can create monitoring officer users, and monitoring officers can create regular users. 
"""
from django.contrib.auth.models import User

# creating monitoring officer user
def create_monitoring_officer(full_name, password, email, phone_number):
    user = User.objects.create_user(
        username=email,
        password=password,
        email=email,
        first_name=full_name.split()[0],
        last_name=" ".join(full_name.split()[1:]),
    )
    user.phone_number = phone_number
    user.role = "monitoring_officer"
    user.save()
    return user

# assigning monitoring officer to a specific administrative location to monitor
def assign_monitoring_officer_to_location(monitoring_officer, location):
    monitoring_officer.assigned_location = location
    monitoring_officer.save()
    return monitoring_officer