/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* eslint-disable */
// @ts-nocheck
import type { Metadata } from 'next'

import config from '@payload-config'
import { RootPage } from '@payloadcms/next/views'
import { importMap } from '../importMap'

type Args = {
  params: Promise<{
    segments: string[]
  }>
  searchParams: Promise<{
    [key: string]: string | string[]
  }>
}

export const generateMetadata = ({ params }: Args): Promise<Metadata> => {
  return Promise.resolve({
    title: 'Payload Admin',
  })
}

const Page = ({ params, searchParams }: Args) => {
  return RootPage({ config, params, searchParams, importMap })
}

export default Page