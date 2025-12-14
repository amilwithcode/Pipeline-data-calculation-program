 "use client";
 import { useEffect } from "react";
 import { usePathname } from "next/navigation";

 const NotFound = () => {
   const pathname = usePathname();

   useEffect(() => {
     if (pathname) console.error("404 Error:", pathname);
   }, [pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Səhifə tapılmadı</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Ana səhifəyə qayıt
        </a>
      </div>
    </div>
  );
};

export default NotFound;
