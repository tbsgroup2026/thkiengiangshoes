"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  IconBuilding,
  IconChevronDown,
  IconCheck,
  IconFilter,
  IconLayersLinked,
  IconGitBranch,
  IconUsersGroup,
  IconBuildingFactory,
} from "@tabler/icons-react";
import {
  INITIAL_ORG_TREE,
  getWorkshopsForFactories,
  getLinesForWorkshops,
  getChuyensForLines,
  getTosForChuyens,
  OrgNodeMap,
} from "./organizationTree";

export interface CascadingFilterState {
  factories: string[];
  workshops: string[];
  lines: string[];
  chuyens: string[];
  tos: string[];
}

interface CascadingOrgFilterProps {
  tree?: OrgNodeMap;
  value?: CascadingFilterState;
  onChange?: (newState: CascadingFilterState) => void;
}

export default function CascadingOrgFilter({
  tree = INITIAL_ORG_TREE,
  value,
  onChange,
}: CascadingOrgFilterProps) {
  // Local state if uncontrolled
  const [internalState, setInternalState] = useState<CascadingFilterState>({
    factories: [],
    workshops: [],
    lines: [],
    chuyens: [],
    tos: [],
  });

  const state = value || internalState;

  const updateState = (updater: (prev: CascadingFilterState) => CascadingFilterState) => {
    const newState = updater(state);
    if (!value) setInternalState(newState);
    if (onChange) onChange(newState);
  };

  // Dropdown open states
  const [openDropdown, setOpenDropdown] = useState<"factories" | "workshops" | "lines" | "chuyens" | "tos" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // LEVEL 1: FACTORIES
  const availableFactories = useMemo(() => Object.keys(tree), [tree]);

  // LEVEL 2: WORKSHOPS
  const groupedWorkshops = useMemo(
    () => getWorkshopsForFactories(state.factories, tree),
    [state.factories, tree]
  );
  const totalWorkshops = useMemo(
    () => groupedWorkshops.flatMap((g) => g.workshops),
    [groupedWorkshops]
  );

  // LEVEL 3: LINES
  const groupedLines = useMemo(
    () => getLinesForWorkshops(state.factories, state.workshops, tree),
    [state.factories, state.workshops, tree]
  );
  const totalLines = useMemo(
    () => groupedLines.flatMap((g) => g.lines),
    [groupedLines]
  );

  // LEVEL 4: CHUYỂN
  const groupedChuyens = useMemo(
    () => getChuyensForLines(state.factories, state.workshops, state.lines, tree),
    [state.factories, state.workshops, state.lines, tree]
  );
  const totalChuyens = useMemo(
    () => groupedChuyens.flatMap((g) => g.chuyens),
    [groupedChuyens]
  );

  // LEVEL 5: TỔ
  const groupedTos = useMemo(
    () => getTosForChuyens(state.factories, state.workshops, state.lines, state.chuyens, tree),
    [state.factories, state.workshops, state.lines, state.chuyens, tree]
  );
  const totalTos = useMemo(
    () => groupedTos.flatMap((g) => g.tos),
    [groupedTos]
  );

  // Toggle Handlers with Automatic Sub-Level Reset
  const toggleFactory = (factory: string) => {
    updateState((prev) => {
      const nextFactories = prev.factories.includes(factory)
        ? prev.factories.filter((f) => f !== factory)
        : [...prev.factories, factory];
      // Reset sub-levels
      return {
        factories: nextFactories,
        workshops: [],
        lines: [],
        chuyens: [],
        tos: [],
      };
    });
  };

  const selectAllFactories = () => {
    updateState(() => ({
      factories: [],
      workshops: [],
      lines: [],
      chuyens: [],
      tos: [],
    }));
  };

  const toggleWorkshop = (ws: string) => {
    updateState((prev) => {
      const nextWorkshops = prev.workshops.includes(ws)
        ? prev.workshops.filter((w) => w !== ws)
        : [...prev.workshops, ws];
      return {
        ...prev,
        workshops: nextWorkshops,
        lines: [],
        chuyens: [],
        tos: [],
      };
    });
  };

  const selectAllWorkshops = () => {
    updateState((prev) => ({
      ...prev,
      workshops: [],
      lines: [],
      chuyens: [],
      tos: [],
    }));
  };

  const toggleLine = (ln: string) => {
    updateState((prev) => {
      const nextLines = prev.lines.includes(ln)
        ? prev.lines.filter((l) => l !== ln)
        : [...prev.lines, ln];
      return {
        ...prev,
        lines: nextLines,
        chuyens: [],
        tos: [],
      };
    });
  };

  const selectAllLines = () => {
    updateState((prev) => ({
      ...prev,
      lines: [],
      chuyens: [],
      tos: [],
    }));
  };

  const toggleChuyen = (ch: string) => {
    updateState((prev) => {
      const nextChuyens = prev.chuyens.includes(ch)
        ? prev.chuyens.filter((c) => c !== ch)
        : [...prev.chuyens, ch];
      return {
        ...prev,
        chuyens: nextChuyens,
        tos: [],
      };
    });
  };

  const selectAllChuyens = () => {
    updateState((prev) => ({
      ...prev,
      chuyens: [],
      tos: [],
    }));
  };

  const toggleTo = (toItem: string) => {
    updateState((prev) => {
      const nextTos = prev.tos.includes(toItem)
        ? prev.tos.filter((t) => t !== toItem)
        : [...prev.tos, toItem];
      return {
        ...prev,
        tos: nextTos,
      };
    });
  };

  const selectAllTos = () => {
    updateState((prev) => ({
      ...prev,
      tos: [],
    }));
  };

  // Button Labels
  const factoryLabel = useMemo(() => {
    if (state.factories.length === 0) return "Tất cả nhà máy";
    if (state.factories.length === 1) return state.factories[0];
    return `Đã chọn ${state.factories.length} nhà máy`;
  }, [state.factories]);

  const workshopLabel = useMemo(() => {
    if (state.workshops.length === 0) return "Tất cả xưởng";
    if (state.workshops.length === 1) return state.workshops[0];
    return `Đã chọn ${state.workshops.length} xưởng`;
  }, [state.workshops]);

  const lineLabel = useMemo(() => {
    if (state.lines.length === 0) return "Tất cả line";
    if (state.lines.length === 1) return state.lines[0];
    return `Đã chọn ${state.lines.length} line`;
  }, [state.lines]);

  const chuyenLabel = useMemo(() => {
    if (state.chuyens.length === 0) return "Tất cả chuyền";
    if (state.chuyens.length === 1) return state.chuyens[0];
    return `Đã chọn ${state.chuyens.length} chuyền`;
  }, [state.chuyens]);

  const toLabel = useMemo(() => {
    if (state.tos.length === 0) return "Tất cả tổ";
    if (state.tos.length === 1) return state.tos[0];
    return `Đã chọn ${state.tos.length} tổ`;
  }, [state.tos]);

  return (
    <div className="flex flex-wrap items-center gap-2" ref={containerRef}>
      {/* LEVEL 1: DROPDOWN NHÀ MÁY (Always Visible) */}
      <div className="relative">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-600 px-2 flex items-center gap-1">
            <IconBuilding size={14} className="text-[#006838]" />
            Nhà Máy:
          </span>
          <button
            type="button"
            onClick={() => setOpenDropdown(openDropdown === "factories" ? null : "factories")}
            className="bg-white px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 border border-slate-300 hover:border-[#006838] transition-all flex items-center gap-1.5 cursor-pointer min-w-[130px] justify-between shadow-2xs"
          >
            <span className="truncate max-w-[120px]">{factoryLabel}</span>
            <IconChevronDown
              size={14}
              className={`text-slate-500 transition-transform ${openDropdown === "factories" ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {openDropdown === "factories" && (
          <div className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-xl border border-slate-200 shadow-xl z-50 p-2.5 animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-1">
              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <IconFilter size={14} className="text-[#006838]" />
                Chọn Nhà Máy
              </span>
              {state.factories.length > 0 && (
                <button
                  type="button"
                  onClick={selectAllFactories}
                  className="text-[11px] font-bold text-[#006838] hover:underline cursor-pointer"
                >
                  Bỏ chọn hết
                </button>
              )}
            </div>

            <div className="space-y-0.5 max-h-60 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={selectAllFactories}
                className={`w-full text-left flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  state.factories.length === 0 ? "bg-emerald-50 text-[#006838]" : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                    state.factories.length === 0 ? "bg-[#006838] border-[#006838] text-white" : "border-slate-300 bg-white"
                  }`}
                >
                  {state.factories.length === 0 && <IconCheck size={12} strokeWidth={3} />}
                </div>
                <span>Tất cả nhà máy</span>
              </button>

              <div className="my-1 border-t border-slate-100" />

              {availableFactories.map((fac) => {
                const isChecked = state.factories.includes(fac);
                return (
                  <button
                    type="button"
                    key={fac}
                    onClick={() => toggleFactory(fac)}
                    className={`w-full text-left flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                      isChecked ? "bg-emerald-50 text-[#006838] font-bold" : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                        isChecked ? "bg-[#006838] border-[#006838] text-white" : "border-slate-300 bg-white"
                      }`}
                    >
                      {isChecked && <IconCheck size={12} strokeWidth={3} />}
                    </div>
                    <span className="truncate">{fac}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* LEVEL 2: DROPDOWN XƯỞNG (Visible ONLY if Factory is Selected & Has Child Workshops) */}
      {state.factories.length > 0 && totalWorkshops.length > 0 && (
        <div className="relative animate-in fade-in duration-200">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-600 px-2 flex items-center gap-1">
              <IconBuildingFactory size={14} className="text-blue-600" />
              Xưởng:
            </span>
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === "workshops" ? null : "workshops")}
              className="bg-white px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 border border-slate-300 hover:border-blue-600 transition-all flex items-center gap-1.5 cursor-pointer min-w-[130px] justify-between shadow-2xs"
            >
              <span className="truncate max-w-[120px]">{workshopLabel}</span>
              <IconChevronDown
                size={14}
                className={`text-slate-500 transition-transform ${openDropdown === "workshops" ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {openDropdown === "workshops" && (
            <div className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-xl border border-slate-200 shadow-xl z-50 p-2.5 animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-1">
                <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <IconFilter size={14} className="text-blue-600" />
                  Chọn Xưởng
                </span>
                {state.workshops.length > 0 && (
                  <button
                    type="button"
                    onClick={selectAllWorkshops}
                    className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Bỏ chọn hết
                  </button>
                )}
              </div>

              <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={selectAllWorkshops}
                  className={`w-full text-left flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    state.workshops.length === 0 ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                      state.workshops.length === 0 ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 bg-white"
                    }`}
                  >
                    {state.workshops.length === 0 && <IconCheck size={12} strokeWidth={3} />}
                  </div>
                  <span>Tất cả xưởng</span>
                </button>

                {groupedWorkshops.map((group) => (
                  <div key={group.factory} className="pt-1">
                    {groupedWorkshops.length > 1 && (
                      <div className="px-2 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50 rounded-md mb-1">
                        Xưởng thuộc {group.factory}
                      </div>
                    )}
                    {group.workshops.map((ws) => {
                      const isChecked = state.workshops.includes(ws);
                      return (
                        <button
                          type="button"
                          key={ws}
                          onClick={() => toggleWorkshop(ws)}
                          className={`w-full text-left flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                            isChecked ? "bg-blue-50 text-blue-700 font-bold" : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                              isChecked ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 bg-white"
                            }`}
                          >
                            {isChecked && <IconCheck size={12} strokeWidth={3} />}
                          </div>
                          <span className="truncate">{ws}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* LEVEL 3: DROPDOWN LINE (Visible ONLY if Workshop is Selected & Has Child Lines) */}
      {state.workshops.length > 0 && totalLines.length > 0 && (
        <div className="relative animate-in fade-in duration-200">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-600 px-2 flex items-center gap-1">
              <IconLayersLinked size={14} className="text-purple-600" />
              Line:
            </span>
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === "lines" ? null : "lines")}
              className="bg-white px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 border border-slate-300 hover:border-purple-600 transition-all flex items-center gap-1.5 cursor-pointer min-w-[130px] justify-between shadow-2xs"
            >
              <span className="truncate max-w-[120px]">{lineLabel}</span>
              <IconChevronDown
                size={14}
                className={`text-slate-500 transition-transform ${openDropdown === "lines" ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {openDropdown === "lines" && (
            <div className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-xl border border-slate-200 shadow-xl z-50 p-2.5 animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-1">
                <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <IconFilter size={14} className="text-purple-600" />
                  Chọn Line
                </span>
                {state.lines.length > 0 && (
                  <button
                    type="button"
                    onClick={selectAllLines}
                    className="text-[11px] font-bold text-purple-600 hover:underline cursor-pointer"
                  >
                    Bỏ chọn hết
                  </button>
                )}
              </div>

              <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={selectAllLines}
                  className={`w-full text-left flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    state.lines.length === 0 ? "bg-purple-50 text-purple-700" : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                      state.lines.length === 0 ? "bg-purple-600 border-purple-600 text-white" : "border-slate-300 bg-white"
                    }`}
                  >
                    {state.lines.length === 0 && <IconCheck size={12} strokeWidth={3} />}
                  </div>
                  <span>Tất cả line</span>
                </button>

                {groupedLines.map((group) => (
                  <div key={group.workshop} className="pt-1">
                    {groupedLines.length > 1 && (
                      <div className="px-2 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50 rounded-md mb-1">
                        Line thuộc {group.workshop}
                      </div>
                    )}
                    {group.lines.map((ln) => {
                      const isChecked = state.lines.includes(ln);
                      return (
                        <button
                          type="button"
                          key={ln}
                          onClick={() => toggleLine(ln)}
                          className={`w-full text-left flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                            isChecked ? "bg-purple-50 text-purple-700 font-bold" : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                              isChecked ? "bg-purple-600 border-purple-600 text-white" : "border-slate-300 bg-white"
                            }`}
                          >
                            {isChecked && <IconCheck size={12} strokeWidth={3} />}
                          </div>
                          <span className="truncate">{ln}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* LEVEL 4: DROPDOWN CHUYỀN (Visible ONLY if Line is Selected & Has Child Chuyển) */}
      {state.lines.length > 0 && totalChuyens.length > 0 && (
        <div className="relative animate-in fade-in duration-200">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-600 px-2 flex items-center gap-1">
              <IconGitBranch size={14} className="text-amber-600" />
              Chuyền:
            </span>
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === "chuyens" ? null : "chuyens")}
              className="bg-white px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 border border-slate-300 hover:border-amber-600 transition-all flex items-center gap-1.5 cursor-pointer min-w-[130px] justify-between shadow-2xs"
            >
              <span className="truncate max-w-[120px]">{chuyenLabel}</span>
              <IconChevronDown
                size={14}
                className={`text-slate-500 transition-transform ${openDropdown === "chuyens" ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {openDropdown === "chuyens" && (
            <div className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-xl border border-slate-200 shadow-xl z-50 p-2.5 animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-1">
                <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <IconFilter size={14} className="text-amber-600" />
                  Chọn Chuyền
                </span>
                {state.chuyens.length > 0 && (
                  <button
                    type="button"
                    onClick={selectAllChuyens}
                    className="text-[11px] font-bold text-amber-600 hover:underline cursor-pointer"
                  >
                    Bỏ chọn hết
                  </button>
                )}
              </div>

              <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={selectAllChuyens}
                  className={`w-full text-left flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    state.chuyens.length === 0 ? "bg-amber-50 text-amber-800" : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                      state.chuyens.length === 0 ? "bg-amber-600 border-amber-600 text-white" : "border-slate-300 bg-white"
                    }`}
                  >
                    {state.chuyens.length === 0 && <IconCheck size={12} strokeWidth={3} />}
                  </div>
                  <span>Tất cả chuyền</span>
                </button>

                {groupedChuyens.map((group) => (
                  <div key={group.line} className="pt-1">
                    {groupedChuyens.length > 1 && (
                      <div className="px-2 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50 rounded-md mb-1">
                        Chuyền thuộc {group.line}
                      </div>
                    )}
                    {group.chuyens.map((ch) => {
                      const isChecked = state.chuyens.includes(ch);
                      return (
                        <button
                          type="button"
                          key={ch}
                          onClick={() => toggleChuyen(ch)}
                          className={`w-full text-left flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                            isChecked ? "bg-amber-50 text-amber-800 font-bold" : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                              isChecked ? "bg-amber-600 border-amber-600 text-white" : "border-slate-300 bg-white"
                            }`}
                          >
                            {isChecked && <IconCheck size={12} strokeWidth={3} />}
                          </div>
                          <span className="truncate">{ch}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* LEVEL 5: DROPDOWN TỔ (Visible ONLY if Chuyền is Selected & Has Child Tổ) */}
      {state.chuyens.length > 0 && totalTos.length > 0 && (
        <div className="relative animate-in fade-in duration-200">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-600 px-2 flex items-center gap-1">
              <IconUsersGroup size={14} className="text-sky-600" />
              Tổ:
            </span>
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === "tos" ? null : "tos")}
              className="bg-white px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 border border-slate-300 hover:border-sky-600 transition-all flex items-center gap-1.5 cursor-pointer min-w-[130px] justify-between shadow-2xs"
            >
              <span className="truncate max-w-[120px]">{toLabel}</span>
              <IconChevronDown
                size={14}
                className={`text-slate-500 transition-transform ${openDropdown === "tos" ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {openDropdown === "tos" && (
            <div className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-xl border border-slate-200 shadow-xl z-50 p-2.5 animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-1">
                <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <IconFilter size={14} className="text-sky-600" />
                  Chọn Tổ
                </span>
                {state.tos.length > 0 && (
                  <button
                    type="button"
                    onClick={selectAllTos}
                    className="text-[11px] font-bold text-sky-600 hover:underline cursor-pointer"
                  >
                    Bỏ chọn hết
                  </button>
                )}
              </div>

              <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
                <button
                  type="button"
                  onClick={selectAllTos}
                  className={`w-full text-left flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    state.tos.length === 0 ? "bg-sky-50 text-sky-800" : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                      state.tos.length === 0 ? "bg-sky-600 border-sky-600 text-white" : "border-slate-300 bg-white"
                    }`}
                  >
                    {state.tos.length === 0 && <IconCheck size={12} strokeWidth={3} />}
                  </div>
                  <span>Tất cả tổ</span>
                </button>

                {groupedTos.map((group) => (
                  <div key={group.chuyen} className="pt-1">
                    {groupedTos.length > 1 && (
                      <div className="px-2 py-1 text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50 rounded-md mb-1">
                        Tổ thuộc {group.chuyen}
                      </div>
                    )}
                    {group.tos.map((toItem) => {
                      const isChecked = state.tos.includes(toItem);
                      return (
                        <button
                          type="button"
                          key={toItem}
                          onClick={() => toggleTo(toItem)}
                          className={`w-full text-left flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                            isChecked ? "bg-sky-50 text-sky-800 font-bold" : "hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                              isChecked ? "bg-sky-600 border-sky-600 text-white" : "border-slate-300 bg-white"
                            }`}
                          >
                            {isChecked && <IconCheck size={12} strokeWidth={3} />}
                          </div>
                          <span className="truncate">{toItem}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
