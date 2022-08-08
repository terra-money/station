import {
  ForwardedRef,
  forwardRef,
  SelectHTMLAttributes,
  useEffect,
  Dispatch,
  SetStateAction,
  useState,
  useMemo,
  useRef,
} from "react"
import classNames from "classnames/bind"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import styles from "./Select.module.scss"
import { isWallet } from "auth"
import { Grid, Flex } from "components/layout"
import { RadioGroup } from "components/form"
import { ModalButton, ModalRef, Mode } from "components/feedback"
import { WithTokenItem } from "../../data/token"

const cx = classNames.bind(styles)

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  small?: boolean
  before?: boolean
  handleChange?: Dispatch<SetStateAction<any>>
  currentValue?: string
  isToken?: boolean
}

const Select = forwardRef(
  (
    { small, before, handleChange, currentValue, isToken, ...attrs }: Props,
    ref: ForwardedRef<HTMLSelectElement>
  ) => {
    const className = cx(styles.select, { small, before })
    const [mobileList, setMobileList] = useState<
      { value: string; label: string }[]
    >([])
    const selectorRef = useRef<ModalRef>({
      open: () => {},
      close: () => {},
    })

    useEffect(() => {
      if (isWallet.mobile()) {
        // @ts-ignore
        const list = attrs.children.map((item) => {
          if (item.props.hasOwnProperty("token")) {
            return {
              value: item?.props.token,
              label: item?.props.token,
              tokenValue: item?.props.token,
            }
          } else {
            return {
              value: item?.props.value,
              label: item?.props.children,
            }
          }
        })
        setMobileList(list)
      }
    }, [])

    const selectedValue = useMemo(() => {
      const value = mobileList.find(
        (item) => item.value === (attrs.value ?? currentValue)
      )
      return value?.label
    }, [attrs.value, mobileList, currentValue])

    return isWallet.mobile() ? (
      <ModalButton
        ref={selectorRef}
        modalType={Mode.SELECT}
        renderButton={(open) => (
          <div
            className={classNames(styles.wrapper, attrs.className)}
            onClick={open}
          >
            <div className={className}>
              <Flex gap={4} className={styles.flex}>
                <div className={styles.label}>
                  {isToken && currentValue ? (
                    <WithTokenItem token={currentValue as string}>
                      {({ symbol }) => symbol}
                    </WithTokenItem>
                  ) : (
                    `${selectedValue}`
                  )}
                </div>
                <ArrowDropDownIcon style={{ fontSize: 18 }} />
              </Flex>
            </div>
          </div>
        )}
      >
        <Grid gap={20}>
          <RadioGroup
            options={mobileList}
            value={(attrs.value as any) ?? currentValue}
            onChange={(value) => {
              // @ts-ignore
              handleChange && handleChange(value)
              selectorRef.current?.close()
            }}
            mobileModal={true}
          />
        </Grid>
      </ModalButton>
    ) : (
      <div className={classNames(styles.wrapper, attrs.className)}>
        <select {...attrs} className={className} ref={ref} />
        <ArrowDropDownIcon style={{ fontSize: 18 }} className={styles.caret} />
      </div>
    )
  }
)

export default Select
