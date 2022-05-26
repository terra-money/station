import { ForwardedRef, PropsWithChildren, TextareaHTMLAttributes } from "react"
import { forwardRef } from "react"
import styles from "./TextArea.module.scss"

const TextArea = forwardRef(
  (
    attrs: TextareaHTMLAttributes<HTMLTextAreaElement>,
    ref: ForwardedRef<HTMLTextAreaElement>
  ) => {
    return (
      <textarea rows={3} {...attrs} className={styles.textarea} ref={ref} />
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

export const Value = ({ children }: PropsWithChildren<{}>) => {
  return <div className={styles.textarea}>{children}</div>
}
