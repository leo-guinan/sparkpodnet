import {GetServerSideProps, GetStaticProps} from 'next'
import {useRouter} from 'next/router'

import {Layout} from '@components/Layout'
import {HeaderIndex} from '@components/HeaderIndex'
import {StickyNavContainer} from '@effects/StickyNavContainer'

import {processEnv} from '@lib/processEnv'
import {getAllSettings, GhostSettings} from '@lib/ghost'

import {BodyClass} from '@helpers/BodyClass'
import {SearchResult, SearchView} from "@components/SearchView";
import {useEffect, useState} from "react";

/**
 * Main index page (home page)
 *
 * Loads all posts from CMS
 *
 */

interface SearchData {
  settings: GhostSettings

  bodyClass: string
  searchResults: SearchResult[]
}

interface SearchProps {
  searchData: SearchData
}

export default function Search({searchData}: SearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const {settings, bodyClass, searchResults} = searchData

  if (router.isFallback) return <div>Loading...</div>

  const handleSearch = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    console.log('search')
    router.push(`/search?query=${query}`)
  }

  return (
    <>
      <StickyNavContainer
        throttle={300}
        activeClass="fixed-nav-active"
        render={(sticky) => (
          <Layout {...{bodyClass, sticky, settings, isHome: true}} header={<HeaderIndex {...{settings}} />}>
            <SearchView handleSearch={handleSearch} setQuery={setQuery} searchResults={searchResults}/>
          </Layout>
        )}
      />
    </>
  )
}

export async function getServerSideProps(context: any) {
  let settings
  let searchResults

  try {
    settings = await getAllSettings()
  } catch (error) {
    throw new Error('Search creation failed.')
  }
  const url = process.env.API_URL + "search/"
  const query = context.query.query
  if (query) {
    const results = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Api-Key ${process.env.API_KEY}`,
      },
      body: JSON.stringify({
        query,
      })
    })
    const raw_results = await results.json()
    searchResults = raw_results.response
    console.log(searchResults)
  } else {
    searchResults = []
  }
  console.time('Search - getServerSideProps')



  const searchData = {
    settings,
    searchResults,
    bodyClass: BodyClass({isHome: false}),
  }

  console.timeEnd('Search - getServerSideProps')

  return {
    props: {
      searchData,
    },
    ...(processEnv.isr.enable && {revalidate: processEnv.isr.revalidate}), // re-generate at most once every revalidate second
  }
}
