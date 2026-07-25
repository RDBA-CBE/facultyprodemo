import Link from "next/link";

export default function Breadcrumb() {
  return (
    <nav className="flex items-center space-x-2 text-xs text-gray-600">
      {/* Home */}
      <Link href="/" className="hover:text-black text-xs">
        Home
      </Link>

      <span className="text-xs">/</span>

      {/* Jobs */}

      <Link
        href="/jobs"
        className="hover:text-black text-xs"
        onClick={() => (window.location.href = "/jobs")}
      >
        Job
      </Link>
      {/* <Link
        href="/jobs"
        className="hover:text-black"
        // onClick={() => window.location.reload()}
      >
        Job
      </Link> */}

      <span className="text-xs">/</span>

      {/* Current Page */}
      <span className="font-medium text-black text-xs">Job Detail</span>
    </nav>
  );
}
