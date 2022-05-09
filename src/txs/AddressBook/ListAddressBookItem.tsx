import { useTranslation } from "react-i18next"
import { truncate } from "@terra.kitchen/utils"
import { RenderButton } from "types/components"
import { useAddressBook } from "data/settings/AddressBook"
import { Grid } from "components/layout"
import { Empty, ModalButton, Mode, useModal } from "components/feedback"
import { InternalButton } from "components/general"
import CustomItem from "./CustomItem"
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined"
import is from "auth/scripts/is"
import AddAddressBookItem from "./AddAddressBookItem"

interface Props {
  onClick: (item: AddressBook) => void
}

const ListAddressBookItem = ({ onClick }: Props) => {
  const { t } = useTranslation()
  const close = useModal()
  const { list, remove } = useAddressBook()

  const renderAddModalButton = (renderButton: RenderButton) => (
    <ModalButton
      title={t("Add a new address")}
      renderButton={renderButton}
      modalType={is.mobile() ? Mode.FULL : Mode.DEFAULT}
    >
      <AddAddressBookItem />
    </ModalButton>
  )

  return !list.length ? (
    <Empty icon={<PersonAddOutlinedIcon fontSize="inherit" />}>
      {renderAddModalButton((open) => (
        <InternalButton onClick={open}>{t("Add an address")}</InternalButton>
      ))}
    </Empty>
  ) : (
    <Grid gap={12}>
      {list.map((item) => {
        const { name, recipient, memo } = item
        return (
          <CustomItem
            name={name}
            contents={[
              { title: t("Address"), desc: truncate(recipient) },
              { title: t("Memo"), desc: memo ?? "" },
            ]}
            onClick={() => {
              onClick(item)
              close()
            }}
            onDelete={() => remove(name)}
            key={name}
          />
        )
      })}
    </Grid>
  )
}

export default ListAddressBookItem
