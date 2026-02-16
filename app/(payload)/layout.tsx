import React from 'react'
import { RootLayout } from '@payloadcms/next/layouts'

/* eslint-disable import/order */
import '@payloadcms/next/css'
import './custom.css'
/* eslint-enable import/order */

import config from '@payload-config'
import { importMap } from './admin/importMap.js'

interface LayoutProps {
  children: React.ReactNode
}

const Layout = ({ children }: LayoutProps) => (
  <RootLayout
    config={config}
    importMap={importMap}
    serverFunction={async () => {
      'use server'
      return null
    }}
  >
    {children}
  </RootLayout>
)

export default Layout
