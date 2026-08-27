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
  "KG 1",
  "KG 2",
  "KG 3",
  "HTĐ KG",
  "VP KV KG",
];

export function isKienGiangFactory(factory: string): boolean {
  if (!factory) return true;
  const normalized = factory.trim().toLowerCase();
  return (
    normalized.includes("kiên giang") ||
    normalized.includes("kg") ||
    normalized.includes("htđ") ||
    normalized.includes("vp kv")
  );
}

export const INITIAL_ORG_TREE: OrgNodeMap = {
  "Kiên Giang 1": {
    "Xưởng Đế KG1": {
      "Line Ép 1": {
        "Chuyền Cán Ép 1": ["Tổ Cán Ép A", "Tổ Cán Ép B"],
        "Chuyền Ép Dán 1": ["Tổ Ép Dán 1", "Tổ Ép Dán 2"],
      },
      "Line Ép 2": {
        "Chuyền Cán Ép 2": ["Tổ Cán Ép C"],
      },
    },
    "Xưởng Mũi KG1": {
      "Line May Mũi 1": {
        "Chuyền May 1": ["Tổ Chặt Mũi", "Tổ Chuẩn Bị 1", "Tổ May 1A", "Tổ May 1B"],
        "Chuyền May 2": ["Tổ May 2A", "Tổ May 2B"],
      },
      "Line May Mũi 2": {
        "Chuyền May 3": ["Tổ May 3A", "Tổ May 3B"],
      },
    },
    "Xưởng Gò KG1": {
      "Line Gò Thành Phẩm": {
        "Chuyền Gò 1": ["Tổ Gò 1A", "Tổ Gò 1B"],
        "Chuyền Gò 2": ["Tổ Gò 2A", "Tổ Gò 2B"],
      },
    },
  },

  "Kiên Giang 2": {
    "Xưởng Mũi KG2": {
      "Line May 1": {
        "Chuyền May KG2-1": ["Tổ May 1", "Tổ May 2"],
      },
    },
    "Xưởng Gò KG2": {
      "Line Gò 1": {
        "Chuyền Gò KG2-1": ["Tổ Gò 1", "Tổ Gò 2"],
      },
    },
  },

  "Kiên Giang 3": {
    "Xưởng Tổng Hợp KG3": {
      "Line Tự Động": {
        "Chuyền Tự Động 1": ["Tổ Vận Hành 1", "Tổ Vận Hành 2"],
      },
    },
  },

  "HTĐ KG": {
    "Xưởng Hoàn Thiện Đế": {
      "Line Sơn & Ép": {
        "Chuyền Sơn Đế": ["Tổ Phun Sơn 1", "Tổ Phun Sơn 2"],
        "Chuyền Ép Thành Phẩm": ["Tổ Ép Đế 1"],
      },
    },
  },

  "VP KV KG": {
    "Văn Phòng Khu Vực": {
      "Khối Kỹ Thuật & CI": {
        "Chuyền CI": ["Tổ Kaizen 1"],
      },
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
