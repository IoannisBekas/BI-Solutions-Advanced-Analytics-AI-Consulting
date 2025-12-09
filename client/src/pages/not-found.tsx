import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white text-black p-4">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-8xl font-bold font-heading tracking-tighter">404</h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-gray-500 leading-relaxed">
          The page you are looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="pt-4">
          <Link href="/">
            <Button className="rounded-full px-8 h-12 gap-2 bg-black hover:bg-gray-800 text-white transition-all hover:pr-6">
              <MoveLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
