import prisma from "./prisma";

export type SecurityEventCategory = "AUTHENTICATION" | "AUTHORIZATION" | "COURSE_ACCESS" | "SYSTEM_INTEGRITY" | "THREAT_DETECTION";
export type SecuritySeverity = "INFO" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export async function logSecurityEvent({
    userId,
    event_type,
    description,
    severity = "INFO",
    ip_address,
    user_agent,
}: {
    userId?: number;
    event_type: string;
    description: string;
    severity?: SecuritySeverity;
    ip_address?: string;
    user_agent?: string;
}) {
    try {
        await prisma.securityEvent.create({
            data: {
                user_id: userId,
                event_type,
                description,
                severity: severity.toLowerCase(),
                ip_address,
                user_agent,
            },
        });
    } catch (error) {
        console.error("Failed to log security event:", error);
    }
}

export async function logAuditAction({
    userId,
    action,
    resource,
    details,
    ip_address,
}: {
    userId: number;
    action: string;
    resource: string;
    details?: string;
    ip_address?: string;
}) {
    try {
        await prisma.auditLog.create({
            data: {
                user_id: userId,
                action,
                resource,
                details,
                ip_address,
            },
        });
    } catch (error) {
        console.error("Failed to log audit action:", error);
    }
}
