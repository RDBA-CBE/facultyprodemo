import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

const MultiSelectDropdown = ({
  options = [],
  placeholder = "Select...",
  value = [],
  onChange,
  loadMore,
  moreLoading,
  headerText,
  required,
  color,
  headerSize,
  size,
  title,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedOptions, setSelectedOptions] = useState([]);

  useEffect(() => {
    if (value?.length > 0) {
      const isValueArrayOfObjects = typeof value[0] === "object";
      const selected = isValueArrayOfObjects
        ? value
        : options.filter((opt) => value.includes(opt.value));
      setSelectedOptions(selected);
    } else {
      setSelectedOptions([]);
    }
  }, [value, options]);

  const dropdownRef = useRef(null);
  

      useEffect(() => {
      function handleClickOutside(event) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      }
  
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
    setSearch("")
  };

  const handleOptionSelect = (optionValue) => {
    const optionObj = options.find((opt) => opt.value === optionValue);
    const exists = selectedOptions.some((item) => item.value === optionValue);

    let updatedOptions;
    if (exists) {
      updatedOptions = selectedOptions.filter(
        (item) => item.value !== optionValue
      );
    } else {
      updatedOptions = [...selectedOptions, optionObj];
    }

    setSelectedOptions(updatedOptions);
    onChange(updatedOptions);
    setIsOpen(false);
    setSearch("");
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  const RenderFooter = () => {
    if (!moreLoading) return null;
    return (
      <div className="footer-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  };

  return (
    <div ref={dropdownRef}
      className="dropdown-wrapper"
      style={{ position: "relative" }}
    >
      <div ref={dropdownRef} className="dropdown-container">
        {title && (
          <label className="block text-sm font-bold text-gray-700 mb-2">
            {title} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        <div
          className="dropdown-toggle-btn"
          onClick={handleToggleDropdown}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => {
            if (e.key === "Enter") handleToggleDropdown();
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
            backgroundColor: "#fff",
            fontSize: "14px",
            marginTop: "8px",
          }}
        >
          <div className="selected-values">
            {selectedOptions.length === 0 ? (
              <span>{placeholder}</span>
            ) : (
              <div
                className="tags-container"
                style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}
              >
                {selectedOptions.map((option) => (
                  <div
                    key={option.value}
                    className="tag"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "2px 6px",
                      backgroundColor: "#e0e0e0",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                  >
                    <span>{option.label}</span>
                    <button
                      type="button"
                      className="remove-tag-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOptionSelect(option.value);
                      }}
                      style={{
                        marginLeft: "6px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "14px",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <span>
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4 opacity-50" />
            )}
          </span>
        </div>

        {isOpen && (
          <div
            className="dropdown-menu"
            style={{
              border: "1px solid #ccc",
              borderRadius: "4px",
              marginTop: "4px",
              backgroundColor: "#fff",
              maxHeight: "200px",
              overflowY: "auto",
              padding: "8px",
              zIndex: 9999,
              position: "absolute",
              width: "100%",
              
            }}
          >
            <input
              className="search-input"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "6px",
                marginBottom: "6px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />

            <div className="options-list overflow-y-auto max-h-52 [&::-webkit-scrollbar]:hidden scrollbar-hide">
              {filteredOptions.map((item) => (
                <div
                  key={item.value}
                  className="option-item"
                  onClick={() => handleOptionSelect(item.value)}
                  style={{
                    padding: "4px 6px",
                    cursor: "pointer",
                    backgroundColor: selectedOptions.some(
                      (opt) => opt.value === item.value
                    )
                      ? "#d0e0ff"
                      : "#fff",
                    color: selectedOptions.some(
                      (opt) => opt.value === item.value
                    )
                      ? "#007bff"
                      : "#000",
                    borderRadius: "4px",
                    marginBottom: "3px",
                    fontSize: "14px",
                  }}
                >
                  {item.label}
                </div>
              ))}
            </div>
            {loadMore && <RenderFooter />}
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelectDropdown;
