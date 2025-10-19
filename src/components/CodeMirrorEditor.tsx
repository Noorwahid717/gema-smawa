'use client'

import { useEffect, useRef } from 'react'
import { EditorView, basicSetup } from 'codemirror'
import { Compartment, EditorState, Extension } from '@codemirror/state'
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'

interface CodeMirrorEditorProps {
  value: string
  onChange: (value: string) => void
  language: 'html' | 'css' | 'javascript'
}

type Language = CodeMirrorEditorProps['language']

const createLanguageExtension = (language: Language): Extension => {
  if (language === 'html') return html()
  if (language === 'css') return css()
  return javascript()
}

export default function CodeMirrorEditor({ value, onChange, language }: CodeMirrorEditorProps) {
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const languageCompartmentRef = useRef(new Compartment())
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (!editorContainerRef.current || viewRef.current) return

    const initialState = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        languageCompartmentRef.current.of(createLanguageExtension(language)),
        oneDark,
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString())
          }
        }),
        // Keep visual tweaks at the very end so they override bundled defaults
        EditorView.theme({
          '&': {
            height: '100%',
            fontSize: '14px',
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace'
          },
          '.cm-editor': {
            height: '100%',
            outline: 'none'
          },
          '.cm-focused': {
            outline: 'none'
          },
          '.cm-content': {
            padding: '16px'
          },
          '.cm-line': {
            padding: '0'
          }
        })
      ]
    })

    const view = new EditorView({
      state: initialState,
      parent: editorContainerRef.current
    })

    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [language, value])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return

    const currentDoc = view.state.doc.toString()
    if (currentDoc === value) return

    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: value
      }
    })
  }, [value])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return

    view.dispatch({
      effects: languageCompartmentRef.current.reconfigure(createLanguageExtension(language))
    })
  }, [language])

  return (
    <div
      ref={editorContainerRef}
      className="w-full h-full min-h-[400px] border-0"
      style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
    />
  )
}
