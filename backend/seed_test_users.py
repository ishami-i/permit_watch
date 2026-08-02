# Seed script: creates Rwanda's districts, ensures roles exist, and creates
# test users (Chief, Deputy, Monitoring Officers per district).
# Run with: python manage.py shell < seed_test_users.py

from django.contrib.auth import get_user_model
from data_manipulation.models.role import Role
from data_manipulation.models.district import District

User = get_user_model()
TEST_PASSWORD = "Passw0rd!2026"

DISTRICTS_BY_PROVINCE = {
    'Kigali City': ['Gasabo', 'Kicukiro', 'Nyarugenge'],
    'Southern': ['Gisagara', 'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza', 'Nyaruguru', 'Ruhango'],
    'Western': ['Karongi', 'Ngororero', 'Nyabihu', 'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro'],
    'Northern': ['Burera', 'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo'],
    'Eastern': ['Bugesera', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Nyagatare', 'Rwamagana'],
}

def slugify_email(name):
    return name.lower().replace(' ', '').replace('-', '')

def get_or_create_role(role_enum_value):
    role, _ = Role.objects.get_or_create(
        role_name=role_enum_value,
        defaults={'role_description': f"{role_enum_value} role"},
    )
    return role

def create_user(email, name, role, district=None, phone=''):
    if User.objects.filter(user_email=email).exists():
        print(f"[skip] {email} already exists")
        return User.objects.get(user_email=email)
    
    user = User(
        username=slugify_email(email.split('@')[0]),
        user_email=email,
        user_name=name,
        user_phone=phone,
        user_role=role,
        user_status='active',
        assigned_district=district,
    )
    user.set_password(TEST_PASSWORD)
    user.save()
    print(f"[created] {email} (role={role.role_name}, district={district})")
    return user

def main():
    print("== Creating districts ==")
    district_objs = {}
    for province, names in DISTRICTS_BY_PROVINCE.items():
        for name in names:
            d, created = District.objects.get_or_create(name=name)
            district_objs[name] = d
            print(f"{'[created]' if created else '[exists]'} {name} ({province})")

    print("\n== Ensuring roles exist ==")
    chief_role = get_or_create_role(Role.RoleNames.CHIEF_OMBUDSMAN)
    deputy_role = get_or_create_role(Role.RoleNames.DEPUTY_OMBUDSMAN)
    officer_role = get_or_create_role(Role.RoleNames.MONITORING_OFFICER)
    print(f"chief={chief_role}, deputy={deputy_role}, officer={officer_role}")

    print("\n== Creating Chief Ombudsman == ")
    create_user('chief@permitwatch.rw', 'Chief Ombudsman', chief_role)

    print("\n== Creating Deputy Ombudsman == ")
    create_user('deputy@permitwatch.rw', 'Deputy Ombudsman', deputy_role)

    print("\n== Creating Monitoring Officers (one per district) == ")
    for name, district in district_objs.items():
        email = f"office.{slugify_email(name)}@permitwatch.rw"
        create_user(email, f"{name} Monitoring Officer", officer_role, district=district)

    print("\nDone. All test users share the password:", TEST_PASSWORD)

main()
