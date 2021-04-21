import { truncate } from "@terra.kitchen/utils"
import classNames from "classnames/bind"
import AuthButton from "../../components/AuthButton"
import useAuth from "../../hooks/useAuth"
import styles from "./SwitchWallet.module.scss"

const cx = classNames.bind(styles)

const SwitchWallet = () => {
  const { wallet, wallets, connect } = useAuth()

  return !wallets.length ? null : (
    <ul className={styles.list}>
      {wallets.map(({ name, address }) => {
        const active = name === wallet?.name

        return (
          <li key={name}>
            <AuthButton
              className={cx(styles.wallet)}
              onClick={() => connect(name)}
              active={active}
            >
              <strong>{name}</strong>
              {truncate(address)}
            </AuthButton>
          </li>
        )
      })}
    </ul>
  )
}

export default SwitchWallet
