"use client";
import React from "react";
import { DataTable } from "@/components/ui/dataTable";
import { FRONTEND_URL } from "@/utils/constant.utils";
import { capitalizeFLetter } from "@/utils/function.utils";
import { Loader } from "lucide-react";
import moment from "moment";

const HrRequestTable = ({ invites, onSubmit, btnLoading }) => {
  const columns = [
    {
      accessor: "sender",
      Header: "Recruiter",
      Cell: ({ row }: any) => (
        <div>
          <p className="font-semibold text-gray-900 whitespace-nowrap">
            {capitalizeFLetter(row.raw?.sender?.username)}
          </p>
          <p className="text-xs text-gray-400">{row.raw?.sender?.email}</p>
        </div>
      ),
    },
    {
      accessor: "institution",
      Header: "Institution",
      Cell: ({ row }: any) => (
        <p className="text-sm text-gray-700 whitespace-nowrap">
          {row.raw?.job?.institution_detail?.institution_name || "-"}
        </p>
      ),
    },
    {
      accessor: "message",
      Header: "Message",
      
      Cell: ({ row }: any) => (
        <p className="text-sm text-gray-700 max-w-xs truncate" title={row.raw?.message}>
          {row.raw?.message || "-"}
        </p>
      ),
    },
    {
      accessor: "job_link",
      Header: "Job Link",
      Cell: ({ row }: any) =>
        row.raw?.job?.id ? (
          <a
            href={`${FRONTEND_URL}jobs?slug=${row.raw?.job?.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#1E3786] underline whitespace-nowrap"
          >
            View Job
          </a>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        ),
    },
    {
      accessor: "date",
      Header: "Date",
      Cell: ({ row }: any) => (
        <p className="text-xs text-gray-400 whitespace-nowrap">
          {moment(row.raw?.created_at).format("DD-MM-YYYY HH:mm a")}
        </p>
      ),
    },
    {
      accessor: "status",
      Header: "Status",
      Cell: ({ row }: any) =>
        row.raw?.is_response ? (
          row.raw?.is_interested ? (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600 whitespace-nowrap">
              Accepted
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 whitespace-nowrap">
              Rejected
            </span>
          )
        ) : (
          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-600 whitespace-nowrap">
            Pending
          </span>
        ),
    },
    {
      accessor: "actions",
      Header: "Actions",
      Cell: ({ row }: any) =>
        !row.raw?.is_response ? (
          <div className="flex gap-2">
            <button
              onClick={() => onSubmit("accept", row.raw)}
              className="px-3 py-1 text-xs bg-green-600 text-white rounded whitespace-nowrap"
            >
              {btnLoading ? <Loader className="w-3 h-3 animate-spin" /> : "Accept"}
            </button>
            <button
              onClick={() => onSubmit("reject", row.raw)}
              className="px-3 py-1 text-xs bg-red-500 text-white rounded whitespace-nowrap"
            >
              {btnLoading ? <Loader className="w-3 h-3 animate-spin" /> : "Reject"}
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        ),
    },
  ];

  const data = invites.map((invite) => ({
    sender: invite.sender?.username,
    institution: invite.job?.institution_detail?.institution_name,
    message: invite.message,
    job_link: invite.job?.id,
    date: invite.created_at,
    status: invite.is_response,
    actions: invite.id,
    raw: invite,
  }));

  return <DataTable columns={columns} data={data} />;
};

export default HrRequestTable;
