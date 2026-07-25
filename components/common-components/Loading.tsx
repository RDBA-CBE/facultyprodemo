"use client"

import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex h-[100vh] w-full items-center  justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-12 w-12 animate-spin text-gray-500 dark:text-gray-400" />
        {/* <p className="text-gray-500 dark:text-gray-400">Loading...</p> */}
        <Loader2 className="spin" />
      </div>
    </div>
  )
}