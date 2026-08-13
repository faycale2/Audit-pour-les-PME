from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "ADMIN"


class IsConsultant(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "CONSULTANT"


class IsPME(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == "PME"