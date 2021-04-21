import { FC, ReactNode } from "react"
import classNames from "classnames/bind"
import { ErrorBoundary, WithFetching } from "../feedback"
import Container from "./Container"
import Card from "./Card"
import styles from "./Page.module.scss"

const cx = classNames.bind(styles)

interface Props extends QueryState {
  title?: string
  extra?: ReactNode
  mainClassName?: string
  small?: boolean
  sub?: boolean // used as a page in a page
}

const Page: FC<Props> = ({ title, extra, children, small, sub, ...props }) => {
  const { mainClassName } = props

  return (
    <WithFetching {...props}>
      {(progress, wrong) => (
        <>
          {progress}

          <article className={cx(styles.page, { sub, small })}>
            <Container className={styles.grid}>
              {title && (
                <header className={styles.header}>
                  <h1 className={styles.title}>{title}</h1>
                  {extra}
                </header>
              )}

              <section className={classNames(styles.main, mainClassName)}>
                {wrong ? (
                  <Card>{wrong}</Card>
                ) : (
                  <ErrorBoundary>{children}</ErrorBoundary>
                )}
              </section>
            </Container>
          </article>
        </>
      )}
    </WithFetching>
  )
}

export default Page
