import "./globals.css";

export const metadata = {
  title: "FutureCo",
  description: "Discover FutureCo: the ultimate platform for visionary founders and top tech talent to connect, collaborate, and build groundbreaking startups. Create detailed profiles, showcase expertise, and find your ideal co-founder with ease. Join CoNext to turn your vision into reality!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
