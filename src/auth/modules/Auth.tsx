import { Route, Routes } from "react-router-dom"
import { isWallet } from "auth"

/* connect */
import UnlockPage from "./select/UnlockPage"
import SelectLedgerPage from "../ledger/SelectLedgerPage"
import AddLedgerPage from "../ledger/AddLedgerPage"

/* create */
import NewWalletPage from "./create/NewWalletPage"
import RecoverWalletPage from "./create/RecoverWalletPage"
import ImportWalletPage from "./create/ImportWalletPage"
import NewMultisigWalletPage from "./create/NewMultisigWalletPage"
import RecoverBridgePage from "./create/RecoverBridgePage"

/* manage */
import ManageWallets from "./manage/ManageWallets"
import ExportWalletPage from "./manage/ExportWalletPage"
import ChangePasswordPage from "./manage/ChangePasswordPage"
import DeleteWalletPage from "./manage/DeleteWalletPage"
import AccessWithLedgerPage from "../ledger/AccessWithLedgerPage"

const Auth = () => {
  return (
    <Routes>
      <Route index element={<ManageWallets />} />

      {/* connect */}
      <Route path="unlock/:name" element={<UnlockPage />} />
      <Route
        path="ledger/device"
        element={
          isWallet.mobile() ? <SelectLedgerPage /> : <AccessWithLedgerPage />
        }
      />
      <Route path="ledger/add" element={<AddLedgerPage />} />

      {/* create */}
      <Route path="new" element={<NewWalletPage />} />
      <Route path="recover" element={<RecoverWalletPage />} />
      <Route path="recover-bridge" element={<RecoverBridgePage />} />
      <Route path="import" element={<ImportWalletPage />} />
      <Route path="multisig/new" element={<NewMultisigWalletPage />} />

      {/* manage */}
      <Route path="export" element={<ExportWalletPage />} />
      <Route path="password" element={<ChangePasswordPage />} />
      <Route path="delete" element={<DeleteWalletPage />} />
    </Routes>
  )
}

export default Auth
