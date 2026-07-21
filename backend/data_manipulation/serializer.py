"""
file for model serializer
"""
from rest_framework import serializers
from .models import (
    Applicant,
    Permit,
    Project,
    Professional,
    Property,
    FinancialData,
    Timeline,
    Supervisor,
)

# Serializer for Applicant model
class ApplicantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Applicant
        fields = "__all__"

# Serializer for Permit model
class PermitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permit
        fields = "__all__"

# Serializer for Project model
class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = "__all__"

# Serializer for Professional model
class ProfessionalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Professional
        fields = "__all__"

# Serializer for Property model
class PropertySerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        fields = "__all__"

# Serializer for FinancialData model
class FinancialDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialData
        fields = "__all__"

# Serializer for Timeline model
class TimelineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Timeline
        fields = "__all__"
# Serializer for Supervisor model
class SupervisorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supervisor
        fields = "__all__"

# full permit serializer that includes all related objects
class FullPermitSerializer(serializers.ModelSerializer):

    applicant = ApplicantSerializer(read_only=True)

    project = ProjectSerializer(read_only=True)

    architect = ProfessionalSerializer(read_only=True)

    engineer = ProfessionalSerializer(read_only=True)

    surveyor = ProfessionalSerializer(read_only=True)

    supervisor = SupervisorSerializer(read_only=True)
    
    class Meta:
        model = Permit

        fields = [
            "permitId",
            "external_permit_id",
            "applicant",
            "project",
            "architect",
            "engineer",
            "surveyor",
            "supervisor",
        ]