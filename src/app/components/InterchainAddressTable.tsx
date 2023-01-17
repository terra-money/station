import WithSearchInput from "pages/custom/WithSearchInput"
import AddressTable from "app/components/AddressTable"
import { useTranslation } from "react-i18next"

const InterchainAddressTable = () => {
  const { t } = useTranslation()

  return (
    <WithSearchInput gap={10} placeholder={t("Search for a chain...")}>
      {(keyword: string) => <AddressTable keyword={keyword} />}
    </WithSearchInput>
  )
}

export default InterchainAddressTable
