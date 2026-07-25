import moment from "moment";
import { useState } from "react";
import Swal, { SweetAlertPosition } from "sweetalert2";

export const useSetState = (initialState: any) => {
  const [state, setState] = useState(initialState);

  const newSetState = (newState: any) => {
    setState((prevState: any) => ({ ...prevState, ...newState }));
  };
  return [state, newSetState];
};

export const Success = (message: string, positions?: SweetAlertPosition) => {
  const toast = Swal.mixin({
    toast: true,
    position: positions || "top",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: "#000",
    // width: "95vw", // ✅ make it wide
    padding: "10px 14px",

    customClass: {
      popup: "custom-toast",
      title: "custom-toast-title",
      icon: "custom-toast-icon",
    },

    didOpen: (toast) => {
      const title = toast.querySelector(".swal2-title");
      if (title) {
        title.classList.add("text-white", "text-xs", "font-normal");
      }
    },
  });

  toast.fire({
    icon: "success",
    title: message,
  });
};

// export const Failure = (message: string, positions?: SweetAlertPosition) => {
//   const toast = Swal.mixin({
//     toast: true,
//     position: positions || "top",
//     showConfirmButton: false,
//     timer: 3000,
//     timerProgressBar: true,
//     background: "#000000",
//     customClass: {
//       popup: "custom-success-toast",
//       title: "custom-success-title",
//       icon: "custom-success-icon",
//     },
//     didOpen: (toast) => {
//       // Ensure text is white and medium font weight
//       const title = toast.querySelector(".swal2-title");
//       if (title) {
//         title.classList.add("text-white", "font-medium");
//       }
//     },
//   });
//   toast.fire({
//     icon: "error",
//     title: message,
//     padding: "10px 20px",
//   });
// };

export const Failure = (message: string, positions?: SweetAlertPosition) => {
  const toast = Swal.mixin({
    toast: true,
    position: positions || "top", // ✅ keep top center
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: "#000",
    // width: "95vw",
    padding: "10px 14px",

    customClass: {
      popup: "custom-toast error-toast",
      title: "custom-toast-title",
      icon: "custom-toast-icon",
    },

    didOpen: (toast) => {
      const title = toast.querySelector(".swal2-title");
      if (title) {
        title.classList.add("text-white", "text-xs", "font-normal"); // ✅ smaller text
      }
    },
  });

  toast.fire({
    icon: "error",
    title: message,
  });
};

export const objIsEmpty = (obj: object) => {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) return false;
  }
  return true;
};

export const capitalizeFLetter = (string = "") => {
  if (string.length > 0) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  return string;
};

export const Dropdown = (arr: any, label: string) => {
  const array = arr?.map((item: any) => ({
    value: item?.id,
    label: item[label],
  }));
  return array;
};

export const MultiDropdown = (arr: any, label: string) => {
  const array = arr?.map((item: any) => ({
    value: item?.id,
    name: item[label],
  }));
  return array;
};

export const UserDropdown = (arr: any, labelFn: (item: any) => string) => {
  const array = arr?.map((item: any) => ({
    value: item?.id,
    label: labelFn(item),
  }));
  return array;
};

export const getFileNameFromUrl = (url: string) => {
  const urlObject = new URL(url);
  const pathname = urlObject.pathname;
  const filename = pathname.substring(pathname.lastIndexOf("/") + 1);
  return filename;
};

export const convertUrlToFile = async (url: any, filename: any) => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
};

export const buildResumeFile = async (url: any, filename: any) => {
  if (!url) return null;

  const response = await fetch(url);
  const blob = await response.blob();

  return new File([blob], `${filename}.pdf`, {
    type: blob.type,
    lastModified: Date.now(),
  });
};

export const isValidImageUrl = (url: string) => {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
  return imageExtensions.some((ext) => url?.toLowerCase().endsWith(ext));
};

export const getTimeOnly = (date: Date | null) => {
  return date ? new Date(0, 0, 0, date.getHours(), date.getMinutes()) : null;
};

export const createTime = (date: Date | string | number | null) => {
  const source = date ? new Date(date) : new Date(); // ensure it's a Date object

  if (isNaN(source.getTime())) {
    // fallback in case the date is invalid
    const now = new Date();
    return new Date(0, 0, 0, now.getHours(), now.getMinutes());
  }

  return new Date(0, 0, 0, source.getHours(), source.getMinutes());
};

export const isToday = (date: Date | null) => {
  if (!date) return false;
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const generateCalendar = (currentMonth) => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();

  const days = [];

  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }

  return days;
};

export const formatDate = (date) => {
  if (!date) return "";
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
};

export const formatNumber = (num) => {
  return Number(num) % 1 === 0 ? parseInt(num) : Number(num);
};

export const transformSlots = (data) => {
  return Object.entries(data).map(([date, slots]) => ({
    date,
    slot: slots,
  }));
};

export const timeFormat = (time) => {
  return time.length > 5 ? time.slice(0, 5) : time;
};

export const getUnmatchedSlots = (firstArr: any[], secondArr: any[]) => {
  return secondArr?.flatMap((event) => {
    const matchedDate = firstArr?.find((f) => f.date === event.date);

    if (!matchedDate) {
      return event.slots?.filter((slot) => !slot.booked);
    }

    const unmatchedSlots = event.slots?.filter((slot) => {
      if (slot.booked) return false;
      const slotTime = slot.start_time?.slice(0, 5);
      return !matchedDate.slot?.includes(slotTime);
    });

    return unmatchedSlots;
  });
};

export const formatTime = (minutes) => {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} Hr${hours > 1 ? "s" : ""}`;
    } else {
      return `${hours} Hr${hours > 1 ? "s" : ""} ${remainingMinutes} Min${
        remainingMinutes > 1 ? "s" : ""
      }`;
    }
  } else {
    return `${minutes} Min${minutes > 1 ? "s" : ""}`;
  }
};

export const formatTimeRange = (date, time, intervalMinutes) => {
  // Combine date + time into one datetime string
  const start = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm:ss");
  const end = moment(start).add(intervalMinutes, "minutes");

  return `${start.format("MMMM D, YYYY")} at ${start.format(
    "h:mm A",
  )} - ${end.format("h:mm A")}`;
};

export const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

export const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

export const isPastEvent = (event) => {
  const end = new Date(`${event.end_date}T${event.end_time}`);
  const now = new Date();
  return end < now;
};

export const isOngoingEvent = (event) => {
  const start = new Date(`${event.start_date}T${event.start_time}`);
  const end = new Date(`${event.end_date}T${event.end_time}`);
  const now = new Date();
  return now >= start && now <= end;
};

export const isFutureEvent = (event) => {
  const start = new Date(`${event.start_date}T${event.start_time}`);
  const now = new Date();
  return start > now;
};

export const extractZoomMeetingId = (url) => {
  if (!url || typeof url !== "string") return null;

  // try using the URL API if it's an absolute URL
  try {
    const u = new URL(url);

    // common pattern: /j/<meetingId>  (meetingId can include hyphens)
    let m = u.pathname.match(/\/j\/([0-9\-]+)/);
    if (m && m[1]) return m[1].replace(/\D/g, ""); // strip non-digits

    // sometimes meeting id sits directly in path segments (rare)
    m =
      u.pathname.match(/\/meeting\/([0-9\-]+)/) ||
      u.pathname.match(/\/m\/([0-9\-]+)/);
    if (m && m[1]) return m[1].replace(/\D/g, "");

    // fallback: look for a long digit sequence anywhere (9-13 digits)
    m = url.match(/([0-9]{9,13})/);
    return m ? m[1] : null;
  } catch (err) {
    // If URL() failed (maybe a partial string), fall back to regex on raw string
    let m = url.match(/\/j\/([0-9\-]+)/);
    if (m && m[1]) return m[1].replace(/\D/g, "");
    m = url.match(/([0-9]{9,13})/);
    return m ? m[1] : null;
  }
};

export const buildFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    // Arrays
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        formData.append(
          `${key}`,
          item instanceof File || item instanceof Blob ? item : String(item),
        );
      });
    }
    // Files / Blobs
    else if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
    }
    // Objects → stringify
    else if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
    }
    // Primitives
    else {
      formData.append(key, String(value));
    }
  });

  return formData;
};

export const getTimeZone = (time) => {
  const tz = time.split(")")[1].trim();
  return tz;
};

export const getTime = (startDate, startTime) => {
  const date = new Date(startDate);
  const time = new Date(startTime);

  // Extract date components from the first date
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // Extract time components from the second date
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();
  const milliseconds = time.getMilliseconds();

  // Create new date with combined values
  const combinedDate = new Date(
    year,
    month,
    day,
    hours,
    minutes,
    seconds,
    milliseconds,
  );
  return combinedDate;
};

export const extractTimeFromDateTime = (dateTimeString) => {
  if (!dateTimeString) return null;

  const timeMatch = dateTimeString.match(/(\d{1,2}):(\d{2}):(\d{2})/);
  if (timeMatch) {
    const [hours, minutes, seconds] = timeMatch[0].split(":").map(Number);
    const timeDate = new Date();
    timeDate.setHours(hours, minutes, seconds, 0);
    return timeDate;
  }

  return null;
};

export const formatToINR = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0, // Remove decimal places
  }).format(amount);
};

export const formattedNoDecimal = (number) => {
  return Math.round(number).toLocaleString("en-IN");
};

export const TimeAgo = (dateString: string | Date) => {
  const now = new Date();
  const past = new Date(dateString);
  const diff = (now.getTime() - past.getTime()) / 1000; // difference in seconds

  if (diff < 10) return "Now";
  if (diff < 60) return `${Math.floor(diff)} Sec ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} Min ago`;
  if (diff < 86400)
    return `${Math.floor(diff / 3600)} Hour${
      Math.floor(diff / 3600) > 1 ? "s" : ""
    } ago`;
  if (diff < 2592000)
    return `${Math.floor(diff / 86400)} Day${
      Math.floor(diff / 86400) > 1 ? "s" : ""
    } ago`;
  if (diff < 31104000)
    return `${Math.floor(diff / 2592000)} Month${
      Math.floor(diff / 2592000) > 1 ? "s" : ""
    } ago`;
  return `${Math.floor(diff / 31104000)} Year${
    Math.floor(diff / 31104000) > 1 ? "s" : ""
  } ago`;
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return "";

  const cleaned = phone.toString().replace(/\D/g, "");

  if (cleaned.startsWith("91") && cleaned.length === 12) {
    return `+91 ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }

  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }

  return phone;
};

export const removePlus = (data) => {
  return data.replaceAll("+", "");
};

export const formatToINRS = (price: number | string): string => {
  const numericPrice = typeof price === "string" ? parseFloat(price) : price;

  if (isNaN(numericPrice)) return "Price not available";

  if (numericPrice >= 10000000) {
    const crValue = numericPrice / 10000000;
    return `₹${crValue % 1 === 0 ? crValue.toFixed(0) : crValue.toFixed(1)} Cr`;
  } else if (numericPrice >= 100000) {
    const lValue = numericPrice / 100000;
    return `₹${lValue % 1 === 0 ? lValue.toFixed(0) : lValue.toFixed(1)} L`;
  } else if (numericPrice >= 1000) {
    const kValue = numericPrice / 1000;
    return `₹${kValue % 1 === 0 ? kValue.toFixed(0) : kValue.toFixed(1)}K`;
  } else {
    return `₹${numericPrice.toLocaleString("en-IN")}`;
  }
};

export const formatPriceRange = (
  minPrice: number | string | null,
  maxPrice: number | string | null,
): string => {
  if (minPrice === null && maxPrice === null) {
    return "Price on request";
  }

  if (minPrice === null) {
    return `Max: ${formatToINRS(maxPrice)}`;
  }

  if (maxPrice === null) {
    return `Min: ${formatToINRS(minPrice)}`;
  }

  const numericMin =
    typeof minPrice === "string" ? parseFloat(minPrice) : minPrice;
  const numericMax =
    typeof maxPrice === "string" ? parseFloat(maxPrice) : maxPrice;

  if (isNaN(numericMin) || isNaN(numericMax)) return "Contact for price";

  const formattedMin = formatToINRS(numericMin).replace("₹", "");
  const formattedMax = formatToINRS(numericMax).replace("₹", "");

  return `${formattedMin} - ${formattedMax}`;
};

export const generateMockJobs = (jobs: any[], total: number) => {
  const result = [];

  for (let i = 1; i <= total; i++) {
    const baseJob = jobs[(i - 1) % jobs.length];

    result.push({
      ...baseJob,
      id: i.toString(), // ✅ ONLY ID changes
    });
  }

  return result;
};

export const getAvatarColor = (name: string) => {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  const firstLetter = name?.charAt(0).toUpperCase() || "A";
  return colors[firstLetter.charCodeAt(0) % colors.length];
};

export const DateFormat = (date, type = "dateTime") => {
  if (!date) return "-";

  const m = moment(date);
  if (!m.isValid()) return "-";

  switch (type) {
    case "api":
      return m.format("YYYY-MM-DD");

    case "dateSlash":
      return m.format("DD/MM/YYYY");
    // 02/12/2020 ✅

    case "date":
      return m.format("DD MMM YYYY"); // 09 Feb 2026

    case "time":
      return m.format("hh:mm A"); // 11:49 AM

    case "relative":
      return m.fromNow(); // 2 hours ago

    case "full":
      return m.format("dddd, DD MMM YYYY, hh:mm A");
    // Monday, 09 Feb 2026, 11:49 AM

    case "iso":
      return m.toISOString();

    case "dateTime":
    default:
      return m.format("DD MMM YYYY, hh:mm A");
  }
};

export const CharSlice = (text, limit) => {
  if (!text) return "";
  return text.length > limit ? text.slice(0, limit) + "..." : text;
};

export const formatScheduleDateTime = (date, time) => {
  const d = new Date(date);

  if (time) {
    const [hours, minutes] = time.split(":");
    d.setHours(hours);
    d.setMinutes(minutes);
  }

  return d.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

export const job_title = (job) => {
  if (job?.roles?.length > 0) {
    return job?.roles?.[0]?.role_name;
  } else if (job?.job_title) {
    return job?.job_title;
  }
};
