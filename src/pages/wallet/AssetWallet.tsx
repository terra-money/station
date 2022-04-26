import AssetWalletActions from "./AssetWalletActions"
import styles from "./Asset.module.scss"

export interface Props {
  handshakeTopic: string
  peerMeta: {
    name: string
    url?: string
    icons?: string[]
  }
}

const AssetWallet = (props: Props) => {
  const {
    handshakeTopic,
    peerMeta: { name, url, icons },
  } = props

  return (
    <article className={styles.asset} key={handshakeTopic}>
      <section className={styles.details}>
        <img src={icons?.[0] || ""} alt={name} width={22} height={22} />

        <div>
          <h1 className={styles.symbol}>{name}</h1>
          <p className={styles.value}>{url}</p>
        </div>
      </section>

      <AssetWalletActions {...props} />
    </article>
  )
}

export default AssetWallet
