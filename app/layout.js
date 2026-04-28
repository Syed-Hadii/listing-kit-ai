import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata = {
  metadataBase: new URL("https://listingkitsai.com/"),
  title: "Listing Kit AI — Turn Any Listing Into a Full Marketing Campaign",
  description:
    "Listing Kit AI helps real estate agents generate captions, reels, emails, ads, and listing copy from one simple property form. Powered by Saad's Production.",

  icons: {
    icon: "/images/favicon.png",
  },
  openGraph: {
    title: "Listing Kit AI",
    description:
      "AI-powered marketing kits for real estate agents. Generate a full campaign in under 30 seconds.",
    images: [
      {
        url: "/images/favicon.png",
        alt: "Listing Kit AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Listing Kit AI",
    description:
      "AI-powered marketing kits for real estate agents. Generate a full campaign in under 30 seconds.",
    images: ["/images/favicon.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#0B1437",
              color: "#fff",
              borderRadius: "12px",
              fontSize: "14px",
              padding: "12px 16px",
            },
            success: {
              iconTheme: { primary: "#D4AF37", secondary: "#0B1437" },
            },
          }}
        />
      </body>
    </html>
  );
}
