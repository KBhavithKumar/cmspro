import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuthState, signOutUser } from '../firebase/auth'

export default function Navbar() {
  const navigate = useNavigate()
  const { user } = useAuthState()

  const handleLogout = async () => {
    await signOutUser()
    navigate('/login')
  }

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-primary-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container-max h-14 flex items-center justify-between">
        <Link to="/" className="font-semibold text-primary-700">CMS</Link>
        {user && (
          <div className="flex items-center gap-2">
            <NavLink to="/" className={linkClass}>Dashboard</NavLink>
            <NavLink to="/customers" className={linkClass}>Customers</NavLink>
            <NavLink to="/dues" className={linkClass}>Dues</NavLink>
            <NavLink to="/analytics" className={linkClass}>Analytics</NavLink>
            <button onClick={handleLogout} className="ml-2 px-3 py-2 text-sm rounded-md bg-gray-100 hover:bg-gray-200">Logout</button>
          </div>
        )}
      </div>
    </nav>
  )
}
