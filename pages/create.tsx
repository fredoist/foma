import * as React from 'react'
import type { NextPage } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import toast from 'react-hot-toast'
import { useUser } from '@auth0/nextjs-auth0'

import { EditorNavbar } from 'components/EditorNavbar'
import { EditorHeader } from 'components/EditorHeader'
import { EditablePage } from 'components/EditablePage'
import {
  blocksAtom,
  headerAtom,
  optionsAtom,
  styleAtom,
  titleAtom,
} from 'lib/atoms/form'
import { Sidebar } from 'components/Sidebar'

export const sidebarAtom = atomWithStorage('showSidebar', false)

const CreatePage: NextPage = () => {
  const [showSidebar, toggleSidebar] = useAtom(sidebarAtom)
  const [title] = useAtom(titleAtom)
  const [header] = useAtom(headerAtom)
  const [style] = useAtom(styleAtom)
  const [options] = useAtom(optionsAtom)
  const [blocks] = useAtom(blocksAtom)
  const { user } = useUser()
  const router = useRouter()

  return (
    <main className="leading-tight text-gray-800 w-screen h-screen overflow-hidden flex">
      <Head>
        <title>{title ? title : 'Untitled form'}</title>
        <link
          rel="icon"
          href={header.icon ? header.icon : '/img/defaultIcon.svg'}
        />
      </Head>
      <Sidebar show={showSidebar} />
      <section className="w-screen h-screen overflow-y-auto flex-1 shadow-lg ring-1 ring-black/10">
        <EditorNavbar
          title={title}
          icon={header.icon}
          style={style}
          options={options}
          toggleSidebar={toggleSidebar}
          onPublish={() => {
            const request = fetch(`/api/forms`, {
              method: 'POST',
              body: JSON.stringify({
                title: title,
                workspace: user?.sub,
                style: style,
                header: header,
                options: !user
                  ? { publicResponses: true, lockedResponses: false }
                  : options,
                blocks: blocks,
              }),
            })
            toast
              .promise(request, {
                loading: `Wait, we're publishing your form`,
                success: 'Redirecting to form view',
                error: 'Error creating form',
              })
              .then((res) => res.json())
              .then(({ id }) => {
                router.push(`/${id}/edit`)
              })
          }}
        />
        <EditorHeader header={header} style={style} />
        <EditablePage title={title} blocks={blocks} style={style} />
      </section>
    </main>
  )
}

export default CreatePage
