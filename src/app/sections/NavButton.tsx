import { useRecoilState } from "recoil"
import { mobileIsMenuOpenState } from "components/layout"

import MenuIcon from "@mui/icons-material/Menu"
import CloseIcon from "@mui/icons-material/Close"
import styles from "./Nav.module.scss"

const NavButton = () => {
  const [isOpen, setIsOpen] = useRecoilState(mobileIsMenuOpenState)
  const toggle = () => setIsOpen((isOpen) => !isOpen)
  return (
    <button className={styles.toggle} onClick={toggle}>
      {isOpen ? <CloseIcon /> : <MenuIcon />}
    </button>
  )
}

export default NavButton
