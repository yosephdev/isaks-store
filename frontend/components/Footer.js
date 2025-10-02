import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-background border-t py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between">
        <span className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Isaks Store. All rights reserved.</span>
        <Link href="/" className="text-black hover:underline text-sm mt-2 sm:mt-0">
          Back to Home
        </Link>
      </div>
    </footer>
  );
}
