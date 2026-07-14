import { FRONTEND_URL } from "@/utils/constant.utils";
import { capitalizeFLetter } from "@/utils/function.utils";
import { Loader } from "lucide-react";
import moment from "moment";
import React, { useState } from "react";

const InviteCard = (props) => {
  const { invite, submit, btnLoading } = props;
  console.log("✌️invite --->", invite);
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm flex flex-col gap-2">
      {/* Top */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold text-gray-900">
              {capitalizeFLetter(invite.sender?.username)}
            </p>
            {invite?.is_response ? (
              invite?.is_interested ? (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-600">
                  Accepted
                </span>
              ) : (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                  Rejected
                </span>
              )
            ) : null}
          </div>
          <p className="text-sm text-gray-500">{invite.company}</p>
          <p className="text-xs text-gray-400">{invite.sender?.email}</p>
          {invite.job?.institution_detail?.institution_name && (
            <p className="text-xs text-gray-400">
              {invite.job?.institution_detail?.institution_name}
            </p>
          )}
        </div>

        <span className="text-xs text-gray-400">
          {moment(invite.created_at).format("DD-MM-YYYY HH:mm a")}
        </span>
      </div>

      {/* Message */}
      <p className="text-sm text-gray-700">{invite.message}</p>
      {invite?.job?.id && (
        <a
          target="_blank"
          href={`${FRONTEND_URL}${invite?.job?.slug ? `jobs?slug=${invite?.job?.slug}` : `jobs/${invite?.job?.id}`}`}
          className="text-sm text-gray-700  underline"
        > View Job</a>
      )}
      {!invite?.is_response && (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => submit("accept")}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded"
          >
            {btnLoading ? <Loader className="animate spin-2" /> : "Accept"}
          </button>

          <button
            onClick={() => submit("reject")}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded"
          >
            {btnLoading ? <Loader className="animate spin-2" /> : "Reject"}
          </button>
        </div>
      )}
    </div>
  );
};

export default InviteCard;
