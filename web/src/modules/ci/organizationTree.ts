/**
 * ═══════════════════════════════════════════════════════════════════════════════════
 * CENTRALIZED ORGANIZATION TREE MAPPING (CẤU TRÚC PHÂN CẤP NHÀ MÁY → XƯỞNG → LINE → CHUYỀN → TỔ)
 * ═══════════════════════════════════════════════════════════════════════════════════
 * Single Source of Truth for 5-Level Cascading Organizational Filter.
 * Easily updateable when PO / User provides full organizational hierarchy.
 */

export interface OrgNodeMap {
  [factoryName: string]: {
    [workshopName: string]: {
      [lineName: string]: {
        [chuyenName: string]: string[]; // Array of Tổ names
      } | string[]; // Fallback array if no further sub-levels
    } | string[];
  } | string[];
}

export const KIEN_GIANG_FACTORIES = [
  "Kiên Giang 1",
  "Kiên Giang 2",
  "Kiên Giang 3",
  "Hoàn thiện đế",
  "Phòng kế hoạch",
  "Phòng CN-CI",
  "Phòng chất lượng",
  "Phòng nhân sự",
];

export function isKienGiangFactory(factory: string): boolean {
  if (!factory) return true;
  const normalized = factory.trim().toLowerCase();
  return (
    normalized.includes("kiên giang") ||
    normalized.includes("kg") ||
    normalized.includes("hoàn thiện đế") ||
    normalized.includes("htđ") ||
    normalized.includes("kế hoạch") ||
    normalized.includes("ci") ||
    normalized.includes("chất lượng") ||
    normalized.includes("nhân sự")
  );
}

export const INITIAL_ORG_TREE: OrgNodeMap = {
  // Kiên Giang 1/2/3 — danh sách Xưởng thật theo yêu cầu (không có Line/Chuyền/Tổ con, dropdown
  // "3. Line Sản Xuất" tự ẩn khi Xưởng là mảng phẳng như dưới đây — xem availableFormLines()).
  "Kiên Giang 1": ["Đầu vào", "May", "Gò"],
  "Kiên Giang 2": ["Đầu vào", "May", "Gò"],
  "Kiên Giang 3": ["Đầu vào", "Phụ trợ in ép", "May", "Gò"],

  "Hoàn thiện đế": {
    "Xưởng Hoàn Thiện Đế": {
      "Line Sơn & Ép": {
        "Chuyền Sơn Đế": ["Tổ Phun Sơn 1", "Tổ Phun Sơn 2"],
        "Chuyền Ép Thành Phẩm": ["Tổ Ép Đế 1"],
      },
    },
  },

  "Phòng kế hoạch": {
    "Bộ Phận Kế Hoạch Sản Xuất (PPC)": {
      "Tổ Lập Kế Hoạch": ["Bộ Phận PPC"],
    },
  },

  "Phòng CN-CI": {
    "Bộ Phận Chuyển Đổi Số & Kaizen": {
      "Tổ Cải Tiến CI": ["Bộ Phận CI"],
    },
  },

  "Phòng chất lượng": {
    "Bộ Phận Quản Lý Chất Lượng (QA/QC)": {
      "Tổ Kiểm Hàng QC": ["Bộ Phận QA/QC"],
    },
  },

  "Phòng nhân sự": {
    "Bộ Phận Nhân Sự & Hành Chính (HR)": {
      "Tổ Tuyển Dụng & Đào Tạo": ["Bộ Phận HR"],
    },
  },
};

/**
 * Helper to retrieve grouped workshops for selected factories
 */
export function getWorkshopsForFactories(selectedFactories: string[], tree: OrgNodeMap = INITIAL_ORG_TREE) {
  const result: { factory: string; workshops: string[] }[] = [];
  selectedFactories.forEach((factory) => {
    const fNode = tree[factory];
    if (fNode && typeof fNode === "object" && !Array.isArray(fNode)) {
      result.push({
        factory,
        workshops: Object.keys(fNode),
      });
    } else if (Array.isArray(fNode)) {
      result.push({ factory, workshops: fNode });
    }
  });
  return result;
}

/**
 * Helper to retrieve grouped lines for selected workshops
 */
export function getLinesForWorkshops(selectedFactories: string[], selectedWorkshops: string[], tree: OrgNodeMap = INITIAL_ORG_TREE) {
  const result: { workshop: string; lines: string[] }[] = [];
  selectedFactories.forEach((factory) => {
    const fNode = tree[factory];
    if (fNode && typeof fNode === "object" && !Array.isArray(fNode)) {
      selectedWorkshops.forEach((ws) => {
        const wsNode = fNode[ws];
        if (wsNode) {
          if (typeof wsNode === "object" && !Array.isArray(wsNode)) {
            result.push({ workshop: ws, lines: Object.keys(wsNode) });
          } else if (Array.isArray(wsNode)) {
            result.push({ workshop: ws, lines: wsNode });
          }
        }
      });
    }
  });
  return result;
}

/**
 * Helper to retrieve grouped chuyens for selected lines
 */
export function getChuyensForLines(
  selectedFactories: string[],
  selectedWorkshops: string[],
  selectedLines: string[],
  tree: OrgNodeMap = INITIAL_ORG_TREE
) {
  const result: { line: string; chuyens: string[] }[] = [];
  selectedFactories.forEach((factory) => {
    const fNode = tree[factory];
    if (fNode && typeof fNode === "object" && !Array.isArray(fNode)) {
      selectedWorkshops.forEach((ws) => {
        const wsNode = fNode[ws];
        if (wsNode && typeof wsNode === "object" && !Array.isArray(wsNode)) {
          selectedLines.forEach((ln) => {
            const lineNode = wsNode[ln];
            if (lineNode) {
              if (typeof lineNode === "object" && !Array.isArray(lineNode)) {
                result.push({ line: ln, chuyens: Object.keys(lineNode) });
              } else if (Array.isArray(lineNode)) {
                result.push({ line: ln, chuyens: lineNode });
              }
            }
          });
        }
      });
    }
  });
  return result;
}

/**
 * Helper to retrieve grouped tos for selected chuyens
 */
export function getTosForChuyens(
  selectedFactories: string[],
  selectedWorkshops: string[],
  selectedLines: string[],
  selectedChuyens: string[],
  tree: OrgNodeMap = INITIAL_ORG_TREE
) {
  const result: { chuyen: string; tos: string[] }[] = [];
  selectedFactories.forEach((factory) => {
    const fNode = tree[factory];
    if (fNode && typeof fNode === "object" && !Array.isArray(fNode)) {
      selectedWorkshops.forEach((ws) => {
        const wsNode = fNode[ws];
        if (wsNode && typeof wsNode === "object" && !Array.isArray(wsNode)) {
          selectedLines.forEach((ln) => {
            const lineNode = wsNode[ln];
            if (lineNode && typeof lineNode === "object" && !Array.isArray(lineNode)) {
              selectedChuyens.forEach((ch) => {
                const chuyenNode = lineNode[ch];
                if (chuyenNode && Array.isArray(chuyenNode)) {
                  result.push({ chuyen: ch, tos: chuyenNode });
                }
              });
            }
          });
        }
      });
    }
  });
  return result;
}
