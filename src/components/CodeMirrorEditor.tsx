'use client'

import { useEffect, useRef } from 'react'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { javascript } from '@codemirror/lang-javascript'

interface CodeMirrorEditorProps {
  value: string
  onChange: (value: string) => void
  language: 'html' | 'css' | 'javascript'
}

export default function CodeMirrorEditor({ value, onChange, language }: CodeMirrorEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)

  useEffect(() => {
    if (!editorRef.current) return

    // Get the appropriate language extension
    const getLanguageExtension = () => {
      switch (language) {
        case 'html':
          return html()
        case 'css':
          return css()
        case 'javascript':
          return javascript()
        default:
          return []
      }
    }

    // Create editor state
    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        getLanguageExtension(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChange(update.state.doc.toString())
          }
        }),
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

    // Create editor view
    const view = new EditorView({
      state,
      parent: editorRef.current
    })

    viewRef.current = view

    return () => {
      view.destroy()
    }
  }, [language, value, onChange])

  // Update editor content when value prop changes (but not from internal edits)
  useEffect(() => {
    if (viewRef.current && viewRef.current.state.doc.toString() !== value) {
      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: value
        }
      })
    }
  }, [value])

  return (
    <div
      ref={editorRef}
      className="w-full h-full min-h-[400px] border-0"
      style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace' }}
    />
  )
}