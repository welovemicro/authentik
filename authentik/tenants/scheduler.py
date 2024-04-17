"""Tenant-aware Celery beat scheduler"""

from django_celery_beat.schedulers import DatabaseScheduler, ModelEntry
from tenant_schemas_celery.scheduler import TenantAwareScheduleEntry, TenantAwareSchedulerMixin


class SchedulerEntry(ModelEntry, TenantAwareScheduleEntry):
    pass


class TenantAwarePersistentScheduler(TenantAwareSchedulerMixin, DatabaseScheduler):
    """Tenant-aware Celery beat scheduler"""

    Entry = SchedulerEntry

    @classmethod
    def get_queryset(cls):
        return super().get_queryset().filter(ready=True)
