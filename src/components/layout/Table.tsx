import { CSSProperties, ReactNode, useMemo, useState } from "react"
import { path } from "ramda"
import classNames from "classnames/bind"
import { ReactComponent as DropUpIcon } from "styles/images/icons/DropUp.svg"
import { ReactComponent as DropDownIcon } from "styles/images/icons/DropDown.svg"
import { TooltipIcon } from "components/display"
import Grid from "./Grid"
import PaginationButtons from "./PaginationButtons"
import styles from "./Table.module.scss"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"

const cx = classNames.bind(styles)

type SortOrder = "desc" | "asc"
type Sorter<T> = (a: T, b: T) => number

interface Column<T> {
  title?: string | ReactNode
  tooltip?: string
  dataIndex?: string | string[]
  defaultSortOrder?: SortOrder
  sorter?: Sorter<T>
  render?: (value: any, record: T, index: number) => ReactNode
  key?: string

  align?: "left" | "center" | "right"
  hidden?: boolean
}

interface Props<T> {
  columns: Column<T>[]
  dataSource: T[]
  filter?: (record: T) => boolean
  sorter?: (a: T, b: T) => number
  rowKey?: (record: T) => string
  initialSorterKey?: string
  onSort?: () => void
  extra?: (data: T) => ReactNode

  className?: string
  size?: "default" | "small"
  bordered?: boolean
  style?: CSSProperties
  pagination?: number
}

function Table<T>({ dataSource, filter, rowKey, ...props }: Props<T>) {
  const { initialSorterKey, size = "default", bordered, style } = props
  const { pagination, className, extra } = props
  const columns = props.columns.filter(({ hidden }) => !hidden)

  /* helpers */
  const getClassName = ({ align }: Column<T>) => cx(align)

  /* pagination */
  const [page, setPage] = useState(1)
  const renderPagination = () => {
    if (!pagination) return null
    const total = Math.ceil(dataSource.length / pagination)
    if (!total || total === 1) return null
    const prevPage = page > 1 ? () => setPage((p) => p - 1) : undefined
    const nextPage = page < total ? () => setPage((p) => p + 1) : undefined

    return (
      <footer className={styles.pagination}>
        <PaginationButtons
          current={page}
          total={total}
          onPrev={prevPage}
          onNext={nextPage}
        />
      </footer>
    )
  }

  const range = useMemo(() => {
    if (!pagination) return []
    const start = (page - 1) * pagination
    const end = page * pagination
    return [start, end] as const
  }, [page, pagination])

  /* sort */
  const initIndex = () => {
    if (!initialSorterKey) return
    const index = columns.findIndex(({ key }) => key === initialSorterKey)
    if (index > -1) return index
  }

  const initOrder = () => {
    const index = initIndex()
    if (typeof index === "number" && index > -1)
      return columns[index].defaultSortOrder
  }

  const [sorterIndex, setSorterIndex] = useState<number | undefined>(initIndex)
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(initOrder)
  const [extraActive, setActive] = useState<number | undefined>()

  const sorter = useMemo(() => {
    if (typeof sorterIndex !== "number") return
    const { sorter } = columns[sorterIndex]
    if (!sorter) throw new Error()

    return (a: T, b: T) => {
      return (sortOrder === "desc" ? -1 : 1) * sorter(a, b)
    }
  }, [columns, sortOrder, sorterIndex])

  const sort = (index: number) => {
    const { defaultSortOrder } = columns[index]
    const opposite = { asc: "desc" as const, desc: "asc" as const }
    const next =
      sorterIndex === index && sortOrder
        ? opposite[sortOrder]
        : defaultSortOrder

    setSorterIndex(index)
    setSortOrder(next)
    props.onSort?.()
  }

  return (
    <div
      className={classNames(cx(styles.container, { bordered }), className)}
      style={style}
    >
      <table className={cx(styles.table, size)}>
        {columns.some((col) => !!col.title) && (
          <thead>
            <tr>
              {extra && <th></th>}
              {columns.map((column, index) => {
                const { title, tooltip, sorter, defaultSortOrder } = column

                const getCaretAttrs = (key: SortOrder) => {
                  const active = sorterIndex === index && sortOrder === key
                  return {
                    className: cx(styles.caret, { active }),
                    width: 6,
                    height: 3,
                  }
                }

                return (
                  <th className={getClassName(column)} key={index}>
                    {sorter && defaultSortOrder ? (
                      <button
                        className={styles.sorter}
                        onClick={() => sort(index)}
                      >
                        {tooltip ? (
                          <TooltipIcon content={tooltip}>{title}</TooltipIcon>
                        ) : (
                          title
                        )}

                        <Grid gap={4}>
                          <DropUpIcon {...getCaretAttrs("asc")} />
                          <DropDownIcon {...getCaretAttrs("desc")} />
                        </Grid>
                      </button>
                    ) : (
                      title
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
        )}

        <tbody>
          {dataSource
            .filter((data) => filter?.(data) ?? true)
            .sort((a, b) => props.sorter?.(a, b) || sorter?.(a, b) || 0)
            .slice(...range)
            .map((data, index) => (
              <>
                <tr key={index} className={styles.row}>
                  {extra && (
                    <td className={styles.extra__tooltip}>
                      <button
                        onClick={() =>
                          setActive((i) => (i !== index ? index : undefined))
                        }
                        className={extraActive === index ? styles.active : ""}
                      >
                        <KeyboardArrowRightIcon />
                      </button>
                    </td>
                  )}
                  {columns.map((column, columnIndex) => {
                    const { dataIndex, render } = column
                    const value: any =
                      typeof dataIndex === "string"
                        ? data[dataIndex as keyof T]
                        : dataIndex
                        ? path(dataIndex, data)
                        : undefined

                    const children = render?.(value, data, index) ?? value

                    return (
                      <td className={getClassName(column)} key={columnIndex}>
                        {children}
                      </td>
                    )
                  })}
                </tr>

                {extra && (
                  <tr
                    className={classNames(
                      styles.extra__content,
                      extraActive !== index && styles.extra__content__disabled
                    )}
                  >
                    <td colSpan={columns.length + 1}>
                      {extraActive === index && extra(data)}
                    </td>
                  </tr>
                )}
              </>
            ))}
        </tbody>
      </table>

      {renderPagination()}
    </div>
  )
}

export default Table
