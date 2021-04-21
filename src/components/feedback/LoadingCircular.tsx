import CircularProgress from "@mui/material/CircularProgress"
import { CircularProgressProps } from "@mui/material/CircularProgress"

const LoadingCircular = (props: CircularProgressProps) => {
  return <CircularProgress color="inherit" {...props} />
}

export default LoadingCircular
