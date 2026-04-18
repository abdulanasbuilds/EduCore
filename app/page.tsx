import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold text-primary mb-4">EduCore</h1>
      <p className="text-lg text-muted-foreground mb-8 text-center max-w-lg">
        School Management System
      </p>
      <div className="flex gap-4">
        <Link 
          href="/login" 
          className="bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
        >
          Login to Portal
        </Link>
      </div>
    </div>
  );
}
