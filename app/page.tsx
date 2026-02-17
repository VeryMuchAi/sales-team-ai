import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Sales Team <span className="text-primary">AI</span>
        </h1>
        <p className="max-w-md text-lg text-muted-foreground">
          AI-powered lead generation and scoring. Define your ideal customer,
          generate matching leads, and close more deals.
        </p>
      </div>
      <div className="flex gap-4">
        <Button asChild size="lg">
          <Link href="/login">Get Started</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/signup">Sign Up</Link>
        </Button>
      </div>
    </div>
  );
}
