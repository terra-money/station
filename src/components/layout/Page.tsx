/*
 * @Author: lmk
 * @Date: 2022-05-25 11:23:10
 * @LastEditTime: 2022-06-06 16:47:25
 * @LastEditors: lmk
 * @Description:
 */
import { PropsWithChildren, ReactNode } from "react"
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

const Page = (props: PropsWithChildren<Props>) => {
  const { children, small, sub, mainClassName } = props

  return (
    <WithFetching {...props}>
      {(progress, wrong) => (
        <>
          {progress}

          <article className={cx(styles.page, { sub, small })}>
            <Container className={styles.grid}>
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
