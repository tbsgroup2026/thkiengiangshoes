"use client";

import React from "react";
import { usePermission } from "@/hooks/usePermission";
import { Permission } from "@/lib/permissions";

/**
 * SECURITY NOTE / BẢO MẬT:
 * Component <Can> chỉ phục vụ kiểm soát giao diện Client UI.
 * TODO: Server action / API Route vẫn phải validate lại permission tương ứng ở phía backend.
 */

interface CanProps {
  permission: Permission | Permission[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function Can({ permission, fallback = null, children }: CanProps) {
  const { can, canAny } = usePermission();

  const isAllowed = Array.isArray(permission)
    ? canAny(permission)
    : can(permission);

  return isAllowed ? <>{children}</> : <>{fallback}</>;
}

export default Can;
