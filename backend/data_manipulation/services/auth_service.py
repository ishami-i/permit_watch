from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError


def change_password(user, current_password, new_password):
    """
    Change a user's password after verifying their current password.

    Args:
        user: the authenticated user (request.user)
        current_password: the password the user claims to currently have
        new_password: the password to change to

    Raises:
        rest_framework.exceptions.ValidationError: if the current password
        is wrong, the new password matches the old one, or the new password
        fails Django's configured password validators.
    """
    if not user.check_password(current_password):
        raise ValidationError({"current_password": "Current password is incorrect."})

    if current_password == new_password:
        raise ValidationError(
            {"new_password": "New password must be different from the current password."}
        )

    try:
        validate_password(new_password, user=user)
    except DjangoValidationError as exc:
        raise ValidationError({"new_password": list(exc.messages)})

    user.set_password(new_password)
    user.save(update_fields=["password"])
    return user