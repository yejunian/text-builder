import { Card, CardContent } from "@/components/ui/card";

export default function BeforeLoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="overflow-hidden">
            <CardContent className="grid p-0">{children}</CardContent>
          </Card>

          {/* <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline hover:[&_a]:text-primary">
            By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
            and <a href="#">Privacy Policy</a>.
          </div> */}
        </div>
      </div>
    </div>
  );
}
