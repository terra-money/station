import { Route, Routes } from "react-router-dom"

/* connect */
import UnlockPage from "./select/UnlockPage"
import AccessWithLedgerPage from "../ledger/AccessWithLedgerPage"

/* create */
import NewWalletPage from "./create/NewWalletPage"
import RecoverWalletPage from "./create/RecoverWalletPage"
import ImportWalletPage from "./create/ImportWalletPage"
import NewMultisigWalletPage from "./create/NewMultisigWalletPage"

/* manage */
import ManageWallets from "./manage/ManageWallets"
import ExportWalletPage from "./manage/ExportWalletPage"
import ChangePasswordPage from "./manage/ChangePasswordPage"
import DeleteWalletPage from "./manage/DeleteWalletPage"

const Auth = () => {
  return (
    <Routes>
      <Route index element={<ManageWallets />} />

      {/* connect */}
      <Route path="unlock/:name" element={<UnlockPage />} />
      <Route path="ledger" element={<AccessWithLedgerPage />} />

      {/* create */}
      <Route path="new" element={<NewWalletPage />} />
      <Route path="recover" element={<RecoverWalletPage />} />
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
