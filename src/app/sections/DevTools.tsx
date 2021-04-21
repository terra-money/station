import { useQueryClient } from "react-query"
import { debug } from "utils/env"
import { Button } from "components/general"

const DevTools = () => {
  const queryClient = useQueryClient()
  if (!debug.query) return null

  const list = [
    {
      children: "Refetch",
      onClick: () => queryClient.invalidateQueries(),
    },
    {
      children: "Refresh",
      onClick: () => queryClient.resetQueries(),
    },
  ]

  return (
    <>
      {list.map((attrs) => (
        <Button {...attrs} size="small" outline key={attrs.children} />
      ))}
    </>
  )
}

export default DevTools
