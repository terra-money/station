import { useEffect, useRef } from "react"
import Box from "@mui/material/Box"
import { useTheme } from "@mui/material/styles"
import { lighten } from "@mui/material"
import { Button } from "components/general"
import Tools from "./tools"
import useMakeEditor from "./editor"
import { EditorContent, JSONContent } from "@tiptap/react"
import {
  getEditorValue,
  removeEditorValue,
  storeEditorValue,
} from "utils/localStorage/nostr"
import { Send } from "@mui/icons-material"

const ChatInput = (props: {
  senderFn: (message: string, mentions: string[]) => Promise<any>
}) => {
  const { senderFn } = props
  const theme = useTheme()
  const inputRef = useRef<HTMLDivElement | null>(null)
  const storageKey = "chat-input"

  const save = () => {
    const val = editor?.getHTML()
    if (!val) {
      removeEditorValue(storageKey)
      return
    }
    storeEditorValue(storageKey, val)
  }

  const editor = useMakeEditor({
    content: getEditorValue(storageKey) || "",
    onUpdate: save,
  })

  useEffect(() => {
    editor?.commands.setContent(getEditorValue(storageKey) || "")
    editor?.commands.focus()
  }, [storageKey])

  function getMentions(data: JSONContent): string[] {
    const mentions = (data.content || []).flatMap(getMentions)
    if (data.type === "mention" && data.attrs?.id) {
      mentions.push(data.attrs.id)
    }
    return [...new Set(mentions)]
  }

  const send = () => {
    const message = editor?.getText()
    if (!message) return
    const json = editor?.getJSON()
    const mentions = json ? getMentions(json) : []
    editor?.commands.setContent("")
    removeEditorValue(storageKey)
    return senderFn(message, mentions)
  }

  const insert = (text: string) => {
    editor?.commands.insertContent(text)
    editor?.commands.focus()
  }

  return (
    <Box
      sx={{
        p: `10px 10px 14px`,
        flexGrow: 0,
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          background: theme.palette.divider,
          borderRadius: theme.shape.borderRadius,
        }}
      >
        <Box sx={{ p: "1em" }}>
          <EditorContent
            editor={editor}
            onKeyDown={(e) => {
              if (!e.shiftKey && e.key === "Enter") {
                send()
              }
            }}
          />
        </Box>
        <Box
          sx={{
            borderTop: `1px solid ${lighten(theme.palette.divider, 0.6)}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "6px",
            height: "60px",
          }}
        >
          <Box
            sx={{
              pl: "12px",
              display: "flex",
              alignItems: "center",
              gap: "0.75em",
            }}
          >
            <Tools
              inputRef={inputRef}
              senderFn={(message: string) => {
                return props.senderFn(message, [])
              }}
              insertFn={insert}
            />
          </Box>
          <Button color="primary" onClick={send}>
            <Send height={32} />
          </Button>
        </Box>
      </Box>
    </Box>
  )
}

export default ChatInput
