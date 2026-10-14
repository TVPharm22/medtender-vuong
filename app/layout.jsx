import './globals.css';

export const metadata = {
  title: 'MedTender Vương',
  description: 'Giá trúng thầu và thị phần vật tư tim mạch, mạch máu ngoại biên',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
