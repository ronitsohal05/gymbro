import { useContext } from "react"
import { AuthContext } from "./contexts/AuthContext"
import AuthenticatedNavbar from "./AuthenticatedNavbar"

export default function Navbar() {
  const { isAuthenticated } = useContext(AuthContext)

  return isAuthenticated ? <AuthenticatedNavbar /> : <></>
}
