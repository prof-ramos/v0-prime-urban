import React from 'react'
import { RootLayout } from '@payloadcms/next/layouts'

import '@payloadcms/next/css'
import './custom.css'

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
    <div className="pu-admin-scope" data-pu-admin-scope>
      {children}
    </div>
  </RootLayout>
)

export default Layout
