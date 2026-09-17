import { lazy, Suspense, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const CampusCanvas = lazy(() => import('./scene/CampusCanvas'))

function ArchivePanel({ onClose }: { onClose: () => void }) {
  return (
    <motion.aside
      className="archive-panel"
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 28 }}
      aria-label="个人档案"
    >
      <button className="close-button" type="button" onClick={onClose} aria-label="关闭个人档案">×</button>
      <p className="archive-index">ARCHIVE / 01</p>
      <h2>在理解之前，<br />先动手构建。</h2>
      <p>我是 haotsi，一名南京大学学生。这里记录我对 Web、人工智能与计算机基础的学习和实践。</p>
      <div className="archive-links">
        <a href="https://haotsi.github.io/AI_Learning_Helper/" target="_blank" rel="noreferrer">
          <span>AI Learning Helper</span><small>在线体验 ↗</small>
        </a>
        <a href="https://github.com/haotsi/AI_Learning_Helper" target="_blank" rel="noreferrer">
          <span>学习助手源码</span><small>GitHub ↗</small>
        </a>
        <a href="https://github.com/haotsi/course-advanced-programming" target="_blank" rel="noreferrer">
          <span>Advanced Programming</span><small>课程实践 ↗</small>
        </a>
        <a href="https://github.com/haotsi" target="_blank" rel="noreferrer">
          <span>更多项目</span><small>GitHub ↗</small>
        </a>
      </div>
    </motion.aside>
  )
}

export default function App() {
  const [introVisible, setIntroVisible] = useState(true)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [quality, setQuality] = useState<'high' | 'low'>('high')

  useEffect(() => {
    const timer = window.setTimeout(() => setIntroVisible(false), 2100)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <main className="campus-shell">
      <a className="skip-link" href="#scene-description">跳过 3D 场景</a>

      <div className="ambient ambient-left" aria-hidden="true" />
      <div className="ambient ambient-right" aria-hidden="true" />

      <Suspense fallback={<div className="canvas-fallback" aria-hidden="true" />}>
        <CampusCanvas quality={quality} onQualityDecline={() => setQuality('low')} />
      </Suspense>

      <header className="site-mark" aria-label="网站名称">
        <span className="mark-seal">H</span>
        <div><strong>haotsi</strong><small>DIGITAL CAMPUS</small></div>
      </header>

      <section className="scene-title" aria-labelledby="campus-title">
        <p><span>南京 · 鼓楼</span><i /></p>
        <h1 id="campus-title">北大楼<br />数字校园</h1>
        <div className="title-meta"><span>AI</span><span>数学</span><span>逻辑</span><span>代码</span></div>
      </section>

      <div className="scene-controls" aria-label="场景操作提示">
        <span className="mouse-icon" aria-hidden="true" />
        <p>拖动旋转 · 滚轮缩放</p>
      </div>

      <button className="archive-button" type="button" onClick={() => setArchiveOpen(true)}>
        <span>个人档案</span><b aria-hidden="true">↗</b>
      </button>

      <AnimatePresence>{archiveOpen && <ArchivePanel onClose={() => setArchiveOpen(false)} />}</AnimatePresence>

      <section className="sr-description" id="scene-description">
        <h2>北大楼数字校园</h2>
        <p>一个以南京大学北大楼为精神地标的三维学术空间，承载学习、项目、文章与思考。</p>
      </section>

      <AnimatePresence>
        {introVisible && (
          <motion.div className="intro-screen" exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <span className="intro-seal">H</span>
              <p>haotsi · 数字校园</p>
              <i><b /></i>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
