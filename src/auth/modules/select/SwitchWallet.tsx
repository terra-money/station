import { truncate } from "@terra.kitchen/utils"
import classNames from "classnames/bind"
import { Flex } from "components/layout"
import AuthButton from "../../components/AuthButton"
import MultisigBadge from "../../components/MultisigBadge"
import useAuth from "../../hooks/useAuth"
import is from "../../scripts/is"
import styles from "./SwitchWallet.module.scss"

const cx = classNames.bind(styles)

const SwitchWallet = () => {
  const { connectedWallet, wallets, connect } = useAuth()

  return !wallets.length ? null : (
    <ul className={styles.list}>
      {wallets.map((wallet) => {
        const { name, address } = wallet
        const active = name === connectedWallet?.name

        return (
          <li key={name}>
            <AuthButton
              className={cx(styles.wallet)}
              onClick={() => connect(name)}
              active={active}
            >
              <Flex gap={4}>
                {is.multisig(wallet) && <MultisigBadge />}
                <strong>{name}</strong>
              </Flex>
              {truncate(address)}
            </AuthButton>
          </li>
        )
      })}
    </ul>
  )
}

export default SwitchWallet
