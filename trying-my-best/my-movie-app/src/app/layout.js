import './globals.css'

export const metadata = {
  title: 'Totally Cats',
  description: 'Movie search application',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}