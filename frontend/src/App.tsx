import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import RootLayout from "./components/layout/RootLayout"
import Login from "./pages/Login"
import Register from "./pages/Register"

import UploadTest from "./pages/UploadTest"
import Profile from "./pages/Profile"

// Placeholder pages for routing
const Chat = () => <div className="p-8">Chat Interface Content</div>
const Tests = () => <div className="p-8">Test Engine Interface Content</div>
const Analytics = () => <div className="p-8">Analytics Dashboard Content</div>

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="neri-ui-theme">
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application Routes (wrapped in RootLayout) */}
          <Route path="/" element={<RootLayout />}>
            <Route index element={<Chat />} />
            <Route path="tests" element={<Tests />} />
            <Route path="upload" element={<UploadTest />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App
