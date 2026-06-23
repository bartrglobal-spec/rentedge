import './globals.css'

import { ReactNode } from 'react'

import RouteShell from '../components/layout/RouteShell'

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">

      <body>

        <RouteShell>

          {children}

        </RouteShell>

      </body>

    </html>
  )
}