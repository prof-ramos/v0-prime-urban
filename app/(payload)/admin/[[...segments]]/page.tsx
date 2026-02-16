import { generatePageMetadata, RootPage } from '@payloadcms/next/views'
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

const Page = async ({ params, searchParams }: Args) => {
  return (
    <RootPage
      config={config}
      importMap={importMap}
      params={params}
      searchParams={searchParams}
    />
  )
}

export default Page
