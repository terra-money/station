import { ReactNode } from 'react'

type Props<T extends string | number | symbol> = Record<T, () => ReactNode> & {
  value: T
}

export function ConditionalRender<T extends string | number | symbol>(
  props: Props<T>
) {
  const render = props[props.value]

  return <>{render()}</>
}
