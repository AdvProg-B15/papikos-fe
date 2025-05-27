import Link from "next/link";
import { MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChatLandingPage() {
  return (
    <div className="container mx-auto py-10 text-center">
      <MessageSquareText className="mx-auto h-16 w-16 text-primary mb-4" />
      <h1 className="text-3xl font-bold mb-4">Papikos Chat</h1>
      <p className="text-muted-foreground mb-6">
        Your conversations will appear here. You can start a chat from a rental details page
        with a tenant or owner once a rental is active or approved.
      </p>
      <p className="text-sm">
        (This page could list your recent conversations if an API endpoint for that existed.)
      </p>
      <Button asChild className="mt-4"><Link href="/dashboard">Back to Dashboard</Link></Button>
    </div>
  );
}