import { Route, Routes } from "react-router-dom"

/* connect */
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
import Disconnect from "./manage/Disconnect"

const Auth = () => {
  return (
    <Routes>
      <Route index element={<ManageWallets />} />

      {/* connect */}
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
      <Route path="disconnect" element={<Disconnect />} />
    </Routes>
  )
}

export default Auth
