import { ForwardedRef, forwardRef, TextareaHTMLAttributes } from "react"
import styles from "./TextArea.module.scss"

const TextArea = forwardRef(
  (
    attrs: TextareaHTMLAttributes<HTMLTextAreaElement>,
    ref: ForwardedRef<HTMLTextAreaElement>
  ) => {
    return (
      <textarea {...attrs} className={styles.textarea} rows={3} ref={ref} />
    )
  }
)

export default TextArea

/* editor */
export const EditorInput = forwardRef(
  (
    attrs: TextareaHTMLAttributes<HTMLTextAreaElement>,
    ref: ForwardedRef<HTMLTextAreaElement>
  ) => {
    return <textarea {...attrs} className={styles.editor} rows={6} ref={ref} />
  }
)
