import { PropsWithChildren, ReactNode } from "react"
import classNames from "classnames/bind"
import { useNavigate } from "react-router-dom"
import { ArrowBack } from "@mui/icons-material"
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
  invisible?: boolean // used as a page in a page with no margin
  backButtonPath?: string
}

const Page = (props: PropsWithChildren<Props>) => {
  const navigate = useNavigate()
  const {
    title,
    extra,
    children,
    small,
    sub,
    invisible,
    mainClassName,
    backButtonPath,
  } = props

  return (
    <WithFetching {...props}>
      {(progress, wrong) => (
        <>
          {progress}

          <article className={cx(styles.page, { sub, small, invisible })}>
            <Container className={styles.grid}>
              {title && (
                <header className={styles.header}>
                  <div className={styles.titleWrapper}>
                    {backButtonPath && (
                      <ArrowBack onClick={() => navigate(backButtonPath)} />
                    )}
                    <h1 className={styles.title}>{title}</h1>
                  </div>
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
