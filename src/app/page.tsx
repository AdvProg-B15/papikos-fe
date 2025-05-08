import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-teal-600">
          Welcome to PapiKos
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Find the perfect boarding house (kost) for your needs or list your
          property to reach potential tenants.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/search">
            <Button size="lg" className="w-full sm:w-auto">
              Search Properties
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              List Your Property
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
