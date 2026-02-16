import { generatePageMetadata, NotFoundPage } from '@payloadcms/next/views'
import config from '@payload-config'
import { importMap } from '../importMap.js'

interface Args {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{ [key: string]: string | string[] }>
}

export const generateMetadata = async ({ params, searchParams }: Args) =>
  generatePageMetadata({ config, params, searchParams })

const NotFound = async ({ params, searchParams }: Args) => {
  return (
    <NotFoundPage
      config={config}
      importMap={importMap}
      params={params}
      searchParams={searchParams}
    />
  )
}

export default NotFound
