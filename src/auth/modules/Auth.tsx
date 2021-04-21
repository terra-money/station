import { Route, Routes } from "react-router-dom"

/* create */
import NewWallet from "./create/NewWallet"
import RecoverWallet from "./create/RecoverWallet"

/* manage */
import ManageWallets from "./manage/ManageWallets"
import ExportWallet from "./manage/ExportWallet"
import ChangePassword from "./manage/ChangePassword"
import DeleteWallet from "./manage/DeleteWallet"
import Disconnect from "./manage/Disconnect"

const Auth = () => {
  return (
    <Routes>
      <Route index element={<ManageWallets />} />

      {/* create */}
      <Route path="new" element={<NewWallet />} />
      <Route path="recover" element={<RecoverWallet />} />

      {/* manage */}
      <Route path="export" element={<ExportWallet />} />
      <Route path="password" element={<ChangePassword />} />
      <Route path="delete" element={<DeleteWallet />} />
      <Route path="disconnect" element={<Disconnect />} />
    </Routes>
  )
}

export default Auth
