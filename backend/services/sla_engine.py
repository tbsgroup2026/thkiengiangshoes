from datetime import datetime
from sqlalchemy.orm import Session
from models import Incident, SLAConfig, Machine, IncidentStatusEnum

def calculate_incident_sla(incident: Incident, db: Session):
    """Calculates response_time_sec, resolution_time_sec, and total_downtime_sec."""
    now = datetime.utcnow()

    if incident.accepted_at and incident.created_at:
        incident.response_time_sec = int((incident.accepted_at - incident.created_at).total_seconds())

    if incident.resolved_at and incident.created_at:
        incident.total_downtime_sec = int((incident.resolved_at - incident.created_at).total_seconds())

    if incident.resolved_at and incident.accepted_at:
        incident.resolution_time_sec = int((incident.resolved_at - incident.accepted_at).total_seconds())

    db.commit()

def get_sla_status(incident: Incident, db: Session) -> dict:
    """Checks whether an incident is breaching or has breached SLA targets."""
    sla = db.query(SLAConfig).filter(SLAConfig.priority_level == incident.priority).first()
    if not sla:
        return {"response_breached": False, "resolution_breached": False}

    now = datetime.utcnow()

    # Response check
    if incident.accepted_at:
        resp_sec = (incident.accepted_at - incident.created_at).total_seconds()
    else:
        resp_sec = (now - incident.created_at).total_seconds()

    response_breached = resp_sec > (sla.max_response_mins * 60)

    # Resolution check
    if incident.resolved_at:
        res_sec = (incident.resolved_at - incident.created_at).total_seconds()
    else:
        res_sec = (now - incident.created_at).total_seconds()

    resolution_breached = res_sec > (sla.max_resolution_mins * 60)

    return {
        "response_breached": response_breached,
        "resolution_breached": resolution_breached,
        "max_response_mins": sla.max_response_mins,
        "max_resolution_mins": sla.max_resolution_mins
    }

def calculate_bi_metrics(db: Session, branch_id: int = None):
    """Calculates MTTR, MTBF, top failing machines, and team performance."""
    inc_query = db.query(Incident).filter(Incident.status.in_([IncidentStatusEnum.RESOLVED.value, IncidentStatusEnum.CLOSED.value]))
    if branch_id:
        inc_query = inc_query.filter(Incident.branch_id == branch_id)
    incidents = inc_query.all()

    total_incidents = len(incidents)
    total_downtime = sum([inc.total_downtime_sec for inc in incidents]) if incidents else 0

    # MTTR (Mean Time To Repair in minutes)
    mttr_mins = round((total_downtime / 60.0 / total_incidents), 1) if total_incidents > 0 else 0

    # Total operating machines
    m_query = db.query(Machine)
    if branch_id:
        m_query = m_query.filter(Machine.branch_id == branch_id)

    total_machines = m_query.count()
    down_machines = m_query.filter(Machine.status == "DOWN").count()
    warning_machines = m_query.filter(Machine.status == "WARNING").count()
    operating_machines = m_query.filter(Machine.status == "OPERATING").count()
    maint_machines = m_query.filter(Machine.status == "MAINTENANCE").count()

    # MTBF (Mean Time Between Failures in hours, estimated based on operating machines & total failures)
    # Assumes standard 30-day operating month (720 hrs per machine)
    total_operating_hours = total_machines * 720
    mtbf_hours = round(total_operating_hours / total_incidents, 1) if total_incidents > 0 else 720.0

    return {
        "total_machines": total_machines,
        "operating_machines": operating_machines,
        "warning_machines": warning_machines,
        "down_machines": down_machines,
        "maint_machines": maint_machines,
        "total_incidents": total_incidents,
        "total_downtime_hours": round(total_downtime / 3600.0, 2),
        "mttr_mins": mttr_mins,
        "mtbf_hours": mtbf_hours,
        "availability_rate": round(((total_operating_hours - (total_downtime/3600.0)) / total_operating_hours) * 100, 2) if total_operating_hours > 0 else 100.0
    }
