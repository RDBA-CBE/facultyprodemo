import { useState } from "react";
import dynamic from "next/dynamic";


const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

const RevenueDashboard = (props) => {
  const { reportData } = props;

  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "₹0.00";
    return `₹${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // State for active tab
  const [activeTab, setActiveTab] = useState("overview");

  // Safely prepare data for charts with null checks
  const customerRevenueData =
    reportData?.revenueByEachCustomer
      ?.filter((item) => item?.total_revenue > 0)
      ?.sort((a, b) => (b?.total_revenue || 0) - (a?.total_revenue || 0))
      ?.slice(0, 10) || [];

  const mentorRevenueData =
    reportData?.revenueByEachMentor
      ?.filter((item) => item?.total_revenue > 0)
      ?.sort((a, b) => (b?.total_revenue || 0) - (a?.total_revenue || 0)) || [];

  const categoryRevenueData =
    reportData?.revenueByEachCategory
      ?.filter((item) => item?.total_revenue !== null)
      ?.sort((a, b) => (b?.total_revenue || 0) - (a?.total_revenue || 0)) || [];

  const bookingChartOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "45%", borderRadius: 4 },
    },
    dataLabels: { enabled: true },
    xaxis: {
      categories: ["Booking Summary"], // Single x-axis category
    },
    yaxis: { title: { text: "Count / Amount (₹)" } },
    colors: ["#4f46e5", "#10b981", "#f59e0b"],
    legend: { position: "bottom" },
  };
  const bookingSummary = reportData?.revenueByEachBookings || {
    total_reservations: 0,
    total_revenue: 0,
    total_discount: 0,
  };

  const bookingChartSeries = [
    { name: "Reservations", data: [bookingSummary.total_reservations] },
    { name: "Revenue", data: [bookingSummary.total_revenue] },
    { name: "Discount", data: [bookingSummary.total_discount] },
  ];

  // Chart options
  const customerChartOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories:
        customerRevenueData?.map((item) =>
          item?.customer && item.customer.length > 20
            ? item.customer.substring(0, 20) + "..."
            : item?.customer || "Unknown"
        ) || [],
      title: {
        text: "Revenue (₹)",
      },
    },
    yaxis: {
      title: {
        text: "Customers",
      },
    },
    colors: ["#4f46e5"],
  };

  const customerChartSeries = [
    {
      name: "Revenue",
      data: customerRevenueData?.map((item) => item?.total_revenue || 0) || [0],
    },
  ];

  const mentorChartOptions = {
    chart: {
      type: "donut",
      height: 350,
    },
    labels: mentorRevenueData?.map((item) =>
      item?.moderator
        ? item.moderator.length > 15
          ? item.moderator.substring(0, 15) + "..."
          : item.moderator
        : "Unknown"
    ) || ["No Data"],
    legend: {
      position: "bottom",
    },
    colors: ["#4f46e5", "#10b981", "#f59e0b", "#ef4444"],
  };

  const mentorChartSeries = mentorRevenueData?.map(
    (item) => item?.total_revenue || 0
  ) || [0];

  const categoryChartOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "45%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories:
        categoryRevenueData?.map((item) =>
          item?.category && item.category.length > 15
            ? item.category.substring(0, 15) + "..."
            : item?.category || "Unknown"
        ) || [],
    },
    yaxis: {
      title: {
        text: "Revenue (₹)",
      },
    },
    colors: ["#10b981"],
  };

  const categoryChartSeries = [
    {
      name: "Revenue",
      data: categoryRevenueData?.map((item) => item?.total_revenue || 0) || [0],
    },
  ];

  // Check if data is loading or empty
  if (!reportData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading revenue data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="">
        {/* Summary Cards */}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "overview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("customers")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "customers"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Customers
              </button>
              <button
                onClick={() => setActiveTab("mentors")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "mentors"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Mentors
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "categories"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Categories
              </button>
              <button
                onClick={() => setActiveTab("booking")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "booking"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Booking
              </button>
            </nav>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeTab === "overview" && (
            <>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Booking Summary
                </h2>
                {ReactApexChart && categoryRevenueData.length > 0 && (
                  <ReactApexChart
                    options={bookingChartOptions}
                    series={bookingChartSeries}
                    type="bar"
                    height={350}
                  />
                )}
                {categoryRevenueData.length === 0 && (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No category revenue data available
                  </div>
                )}
              </div>
              <div className="bg-white rounded-lg shadow p-6 ">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Revenue by Mentors
                </h2>
                {ReactApexChart && mentorRevenueData.length > 0 && (
                  <ReactApexChart
                    options={mentorChartOptions}
                    series={mentorChartSeries}
                    type="donut"
                    height={350}
                  />
                )}
                {mentorRevenueData.length === 0 && (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No mentor revenue data available
                  </div>
                )}
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Revenue by Categories
                </h2>
                {ReactApexChart && categoryRevenueData.length > 0 && (
                  <ReactApexChart
                    options={categoryChartOptions}
                    series={categoryChartSeries}
                    type="bar"
                    height={350}
                  />
                )}
                {categoryRevenueData.length === 0 && (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No category revenue data available
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Revenue by Customers
                </h2>
                {ReactApexChart && customerRevenueData.length > 0 && (
                  <ReactApexChart
                    options={customerChartOptions}
                    series={customerChartSeries}
                    type="bar"
                    height={350}
                  />
                )}
                {customerRevenueData.length === 0 && (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    No customer revenue data available
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "customers" && (
            <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Customer Revenue Details
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reservations
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Discount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData?.revenueByEachCustomer?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {item?.customer || "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {item?.total_reservations || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {formatCurrency(item?.total_revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {formatCurrency(item?.total_discount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "mentors" && (
            <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Mentor Revenue Details
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mentor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reservations
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Discount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData?.revenueByEachMentor?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {item?.moderator || "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {item?.total_reservations || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {formatCurrency(item?.total_revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {formatCurrency(item?.total_discount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "categories" && (
            <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Category Revenue Details
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reservations
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Discount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData?.revenueByEachCategory?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {item?.category || "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {item?.total_reservations || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {formatCurrency(item?.total_revenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {formatCurrency(item?.total_discount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === "booking" && (
            <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Booking Revenue Summary
              </h2>
              {reportData?.revenueByEachBookings ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Reservations
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Revenue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Discount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {reportData.revenueByEachBookings
                            .total_reservations || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {formatCurrency(
                            reportData.revenueByEachBookings.total_revenue
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                          {formatCurrency(
                            reportData.revenueByEachBookings.total_discount
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-32 flex items-center justify-center text-gray-500">
                  No booking revenue data
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenueDashboard;
