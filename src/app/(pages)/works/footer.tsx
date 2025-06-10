export default function Footer() {
  return (
    <footer className="bg-muted/10 border-t py-6">
      <div className="container px-4">
        <div className="flex flex-col items-center justify-between space-y-2 sm:flex-row sm:space-y-0">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} Text Builder. All rights reserved.
          </p>

          {/* <div className="flex space-x-4 text-sm">
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-foreground"
            >
              이용약관
            </Link>
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground"
            >
              개인정보처리방침
            </Link>
            <Link
              href="/support"
              className="text-muted-foreground hover:text-foreground"
            >
              고객지원
            </Link>
          </div> */}
        </div>
      </div>
    </footer>
  );
}
