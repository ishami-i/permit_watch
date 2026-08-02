


from django.db import migrations


ROLES = [
    (
        "Chief_Ombudsman",
        "Full administrative access, including user and role management.",
    ),
    (
        "Deputy_Ombudsman",
        "Administrative access, including user and role management.",
    ),
    (
        "Monitoring_Officer",
        "Field officer responsible for monitoring permits in an assigned district.",
    ),
]


def seed_roles(apps, schema_editor):
    Role = apps.get_model("data_manipulation", "Role")
    for role_name, description in ROLES:
        Role.objects.get_or_create(
            role_name=role_name,
            defaults={"role_description": description},
        )


def remove_roles(apps, schema_editor):
    Role = apps.get_model("data_manipulation", "Role")
    Role.objects.filter(role_name__in=[name for name, _ in ROLES]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("data_manipulation", "0002_alertcomment"),
    ]

    operations = [
        migrations.RunPython(seed_roles, remove_roles),
    ]