"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";
import { X } from "lucide-react";

interface SidebarProps {
  filters: any;
  onFilterChange: (newFilters: any) => void;
  filterList?: any;
  loading?: boolean;
}

const FilterSection = ({ title, items, selected, onToggle }: any) => (
  <div>
    <h3 className="text-md font-semibold mb-3 pt-[15px]">{title}</h3>
    <div className="space-y-2">
      {items.map((item: any) => (
        <label key={item.value} className="flex gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={selected?.includes(item.value)}
            onChange={() => onToggle(item.value)}
          />
          <span>{item.label}</span>
        </label>
      ))}
    </div>
  </div>
);

const FilterbarNew = ({ filters, onFilterChange, filterList }: SidebarProps) => {
  const [showCollegePopup, setShowCollegePopup] = useState(false);
  const [showDeptPopup, setShowDeptPopup] = useState(false);

  const [collegeSearch, setCollegeSearch] = useState("");
  const [deptSearch, setDeptSearch] = useState("");

  const [collegePopupPos, setCollegePopupPos] = useState({ top: 0, left: 0 });
  const [deptPopupPos, setDeptPopupPos] = useState({ top: 0, left: 0 });

  const collegeSectionRef = useRef<any>(null);
  const deptSectionRef = useRef<any>(null);

  const collegePopupRef = useRef<any>(null);
  const deptPopupRef = useRef<any>(null);

  const alphabetRefs = useRef<any>({});
  const [selectedAlphabet, setSelectedAlphabet] = useState("");

  const alphabets = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];

  // ✅ map API
  const mapped = useMemo(() => {
    return {
      colleges:
        filterList?.colleges?.map((c: any) => ({
          value: c.id,
          label: c.college_name,
        })) || [],
      departments:
        filterList?.departments?.map((d: any) => ({
          value: d.id,
          label: d.department_name,
        })) || [],
    };
  }, [filterList]);

  const toggleItem = (list: any[], item: any) =>
    list.includes(item) ? list.filter((i) => i !== item) : [...list, item];

  const filteredColleges = useMemo(() => {
    return mapped.colleges.filter((c: any) =>
      c.label.toLowerCase().includes(collegeSearch.toLowerCase())
    );
  }, [mapped.colleges, collegeSearch]);

  const filteredDepartments = useMemo(() => {
    return mapped.departments.filter((d: any) =>
      d.label.toLowerCase().includes(deptSearch.toLowerCase())
    );
  }, [mapped.departments, deptSearch]);

  // ✅ calculate popup position
  const calcCollegePos = () => {
    if (collegeSectionRef.current) {
      const rect = collegeSectionRef.current.getBoundingClientRect();
      setCollegePopupPos({
        top: rect.top + 10,
        left: rect.left,
      });
    }
  };

  const calcDeptPos = () => {
    if (deptSectionRef.current) {
      const rect = deptSectionRef.current.getBoundingClientRect();
      setDeptPopupPos({
        top: rect.top + 10,
        left: rect.left,
      });
    }
  };

  useEffect(() => {
    if (showCollegePopup) {
      calcCollegePos();
      window.addEventListener("scroll", calcCollegePos);
      window.addEventListener("resize", calcCollegePos);
    }
    return () => {
      window.removeEventListener("scroll", calcCollegePos);
      window.removeEventListener("resize", calcCollegePos);
    };
  }, [showCollegePopup]);

  useEffect(() => {
    if (showDeptPopup) {
      calcDeptPos();
      window.addEventListener("scroll", calcDeptPos);
      window.addEventListener("resize", calcDeptPos);
    }
    return () => {
      window.removeEventListener("scroll", calcDeptPos);
      window.removeEventListener("resize", calcDeptPos);
    };
  }, [showDeptPopup]);

  // ✅ click outside close
  useEffect(() => {
    const handleClick = (e: any) => {
      if (
        collegePopupRef.current &&
        !collegePopupRef.current.contains(e.target) &&
        !collegeSectionRef.current.contains(e.target)
      ) {
        setShowCollegePopup(false);
      }

      if (
        deptPopupRef.current &&
        !deptPopupRef.current.contains(e.target) &&
        !deptSectionRef.current.contains(e.target)
      ) {
        setShowDeptPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <aside className="p-4 w-full">

      {/* COLLEGE */}
      <div ref={collegeSectionRef}>
        <FilterSection
          title="Choose Colleges"
          items={filteredColleges.slice(0, 5)}
          selected={filters.colleges}
          onToggle={(v: any) =>
            onFilterChange({
              ...filters,
              colleges: toggleItem(filters.colleges, v),
            })
          }
        />
      </div>

      {filteredColleges.length > 5 && (
        <button
          onClick={() => setShowCollegePopup(true)}
          className="text-sm text-blue-600"
        >
          View more
        </button>
      )}

      {/* COLLEGE POPUP */}
      {showCollegePopup && (
        <div
          ref={collegePopupRef}
          className="fixed bg-white border shadow-xl z-50 p-4 w-[800px] h-[450px]"
          style={{
            top: collegePopupPos.top,
            left: collegePopupPos.left,
          }}
        >
          <div className="flex justify-between border-b pb-2">
            <input
              placeholder="Search..."
              value={collegeSearch}
              onChange={(e) => setCollegeSearch(e.target.value)}
              className="border px-2 py-1"
            />
            <X onClick={() => setShowCollegePopup(false)} />
          </div>

          <div className="overflow-auto mt-2">
            {filteredColleges.map((item: any) => (
              <label key={item.value} className="flex gap-2">
                <input
                  type="checkbox"
                  checked={filters.colleges.includes(item.value)}
                  onChange={() =>
                    onFilterChange({
                      ...filters,
                      colleges: toggleItem(filters.colleges, item.value),
                    })
                  }
                />
                {item.label}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* DEPARTMENT */}
      <div ref={deptSectionRef}>
        <FilterSection
          title="Choose Departments"
          items={filteredDepartments.slice(0, 5)}
          selected={filters.department}
          onToggle={(v: any) =>
            onFilterChange({
              ...filters,
              department: toggleItem(filters.department, v),
            })
          }
        />
      </div>

      {filteredDepartments.length > 5 && (
        <button
          onClick={() => setShowDeptPopup(true)}
          className="text-sm text-blue-600"
        >
          View more
        </button>
      )}

      {/* DEPT POPUP */}
      {showDeptPopup && (
        <div
          ref={deptPopupRef}
          className="fixed bg-white border shadow-xl z-50 p-4 w-[800px] h-[450px]"
          style={{
            top: deptPopupPos.top,
            left: deptPopupPos.left,
          }}
        >
          <div className="flex justify-between border-b pb-2">
            <input
              placeholder="Search..."
              value={deptSearch}
              onChange={(e) => setDeptSearch(e.target.value)}
              className="border px-2 py-1"
            />
            <X onClick={() => setShowDeptPopup(false)} />
          </div>

          <div className="overflow-auto mt-2">
            {filteredDepartments.map((item: any) => (
              <label key={item.value} className="flex gap-2">
                <input
                  type="checkbox"
                  checked={filters.department.includes(item.value)}
                  onChange={() =>
                    onFilterChange({
                      ...filters,
                      department: toggleItem(filters.department, item.value),
                    })
                  }
                />
                {item.label}
              </label>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

export default FilterbarNew;