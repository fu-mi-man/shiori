import { Routes, Route } from 'react-router-dom'
import CreatePage from './pages/CreatePage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="p-8 text-center">トップページ（後で実装）</div>} />
      <Route path="/create" element={<CreatePage />} />
      <Route path="/i/:id" element={<div className="p-8 text-center">表示画面（後で実装）</div>} />
      <Route path="/i/:id/edit" element={<div className="p-8 text-center">編集画面（後で実装）</div>} />
    </Routes>
  )
}

export default App
