import { useTranslation } from "react-i18next"
import qs from "qs"
import { ReactComponent as Binance } from "styles/images/exchanges/Binance.svg"
import { ReactComponent as KuCoin } from "styles/images/exchanges/KuCoin.svg"
import { ReactComponent as Huobi } from "styles/images/exchanges/Huobi.svg"
import Kado from "styles/images/exchanges/Kado.svg"
import { useAddress } from "data/wallet"

const exchanges = [
  {
    children: "Binance",
    href: "https://www.binance.com/en/trade/LUNA_USDT",
    icon: <Binance width={24} height={24} />,
  },
  {
    children: "Huobi",
    href: "https://www.huobi.com/en-us/exchange/luna_usdt/",
    icon: <Huobi width={24} height={24} />,
  },
  {
    children: "KuCoin",
    href: "https://trade.kucoin.com/LUNA-USDT",
    icon: <KuCoin width={24} height={24} />,
  },
]

const KADO_API_KEY = "c22391a1-594f-4354-a742-187adb1b91bf"
const getKadoLink = (address?: string) => {
  const KADO_URL = "https://app.kado.money"
  const queryString = qs.stringify(
    {
      apiKey: KADO_API_KEY,
      onPayCurrency: "USD",
      onPayAmount: 200,
      onRevCurrency: "USDC",
      network: "TERRA",
      onToAddress: address,
      product: "BUY",
      offPayCurrency: "USDC",
      offRevCurrency: "USD",
    },
    { skipNulls: true }
  )

  return {
    children: "Kado",
    href: `${KADO_URL}/?${queryString}`,
    icon: <img src={Kado} alt="Kado Ramp" width={24} height={24} />,
  }
}

export const useBuyList = (symbol: string) => {
  const { t } = useTranslation()
  const address = useAddress()

  if (symbol === "Luna") return [{ title: t("Exchanges"), list: exchanges }]

  if (symbol === "axlUSDC")
    return [{ title: t("Fiat"), list: [getKadoLink(address)] }]

  return
}
