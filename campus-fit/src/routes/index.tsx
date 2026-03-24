import { Route, Routes } from 'react-router-dom'
import GoalsPage from '../features/goals/pages/GoalsPage'

const DasboardRoutes = () => {
    return (
        <Routes>
            <Route path="/goals" element={<GoalsPage />} />
        </Routes>
    )
}

export default DasboardRoutes