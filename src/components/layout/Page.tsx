import { PropsWithChildren, ReactNode } from "react"
import classNames from "classnames/bind"
import { ErrorBoundary, WithFetching } from "../feedback"
import Container from "./Container"
import Card from "./Card"
import styles from "./Page.module.scss"
import { isWallet } from "auth"

const cx = classNames.bind(styles)

interface Props extends QueryState {
  title?: string
  modalType?: string
  extra?: ReactNode
  className?: string
  mainClassName?: string
  small?: boolean
  sub?: boolean // used as a page in a page
  hideProgress?: boolean
}

const Page = (props: PropsWithChildren<Props>) => {
  const {
    title,
    extra,
    children,
    small,
    sub,
    mainClassName,
    className,
    hideProgress,
  } = props

  return (
    <WithFetching {...props}>
      {(progress, wrong) => (
        <>
          {hideProgress ? null : progress}

          <article className={cx(styles.page, className, { sub, small })}>
            <Container className={styles.grid}>
              {title && (
                <header className={styles.header}>
                  <h1 className={styles.title}>{title}</h1>
                  {extra}
                </header>
              )}

              {isWallet.mobile() && !title && extra && (
                <div className={styles.extraMobile}>{extra}</div>
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
