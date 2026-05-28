import "./globals.css";

export const metadata = {
  title: "Speed-to-Lead | How Fast Do You Respond?",
  description:
    "Test your business lead response time. See your score and learn how to close more deals by responding faster.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0a] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
