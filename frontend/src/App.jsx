import './App.css'
import AlertLogs from './components/AlertLogs'
import LiveFeed from './components/LIveFeed'
import AlertPopup from './components/AlertPopup'
import GenderDistribution from './components/GenderDistribution'
import Heatmap from './components/Heatmap'

function App() {
 

  return (
    <>
      <LiveFeed/>
      <AlertPopup/>
      <GenderDistribution/>
      <Heatmap/>
      <AlertLogs/>
    </>
  )
}

export default App
