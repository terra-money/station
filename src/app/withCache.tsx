/*
 * @Author: lmk
 * @Date: 2022-05-26 17:21:39
 * @LastEditTime: 2022-05-26 17:24:05
 * @LastEditors: lmk
 * @Description: 
 */
// Freeze 是利用 Suspense 把组件 display: none; 了而已
import React from 'react'
import { Freeze } from 'react-freeze'
import { useOutlet } from 'react-router-dom'
export const Cache = (props:{children:React.ReactElement}) => {
  // useOutlet 会返回匹配到的下级页面，如果 element !== null，那说明访问到了 Detail 页面， List 就可以收起来了
  const element = useOutlet()
  const freeze = !!element
  return (
    <>
      <Freeze freeze={freeze}>{props.children}</Freeze>
      {element}
    </>
  )
}

export function withCache(Component:React.FC) {
  return (props:any) => (
    <Cache>
      <Component {...props} />
    </Cache>
  )
}
