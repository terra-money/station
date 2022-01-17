import { ButtonHTMLAttributes } from "react"
import { Link, LinkProps } from "react-router-dom"
import classNames from "classnames/bind"
import styles from "./AuthButton.module.scss"

const cx = classNames.bind(styles)

interface ButtonAttrs extends ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean
}

interface LinkAttrs extends LinkProps {
  active: boolean
}

type Props = ButtonAttrs | LinkAttrs

const AuthButton = ({ active, ...attrs }: Props) => {
  const className = cx(styles.button, { active }, attrs.className)
  if (active) return <span {...attrs} className={className} />
  if ("to" in attrs) return <Link {...attrs} className={className} />
  return <button {...attrs} type="button" className={className} />
}

export default AuthButton
