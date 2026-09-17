import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { campusModules, moduleByPath, type CampusModule, type CampusModuleId } from './navigation'

const CampusCanvas = lazy(() => import('./scene/CampusCanvas'))
const HOME_CAMERA: [number, number, number] = [18, 15, 20]
const HOME_TARGET: [number, number, number] = [0, 1.25, 0]

function NavigationCards({ active, onHover, onSelect }: {
  active: CampusModuleId | null
  onHover: (id: CampusModuleId | null) => void
  onSelect: (item: CampusModule) => void
}) {
  return (
    <nav className="campus-navigation" aria-label="数字校园导航">
      {campusModules.map((item) => (
        <motion.button
          key={item.id}
          type="button"
          className={`nav-card nav-card--${item.id}${active === item.id ? ' is-active' : ''}`}
          onMouseEnter={() => onHover(item.id)}
          onMouseLeave={() => onHover(null)}
          onFocus={() => onHover(item.id)}
          onBlur={() => onHover(null)}
          onClick={() => onSelect(item)}
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.98 }}
          aria-label={`${item.title}：${item.subtitle}`}
        >
          <span className="nav-card-index">{item.index}</span>
          <span className="nav-card-copy"><strong>{item.title}</strong><small>{item.subtitle}</small></span>
          <span className="nav-card-arrow" aria-hidden="true">↗</span>
        </motion.button>
      ))}
    </nav>
  )
}

const moduleContent: Record<CampusModuleId, { lead: string, meta: string, body: ReactNode }> = {
  about: {
    lead: '在理解之前，先动手构建。',
    meta: 'ABOUT / HAO TSI',
    body: <><p>我是 haotsi，一名南京大学学生。我喜欢从自己的学习需求出发，把抽象知识做成真正可以使用的工具。</p><dl className="profile-grid"><div><dt>所在学校</dt><dd>南京大学</dd></div><div><dt>当前身份</dt><dd>学生</dd></div><div><dt>关注方向</dt><dd>Web × AI</dd></div><div><dt>学习方式</dt><dd>Learning by building</dd></div></dl></>,
  },
  projects: {
    lead: '把知识，变成可以使用的东西。',
    meta: 'PROJECTS / BUILD',
    body: <div className="module-list"><a href="https://haotsi.github.io/AI_Learning_Helper/" target="_blank" rel="noreferrer"><span><b>AI Learning Helper</b><small>多学科学习助手 · PWA</small></span><em>在线体验 ↗</em></a><a href="https://github.com/haotsi/AI_Learning_Helper" target="_blank" rel="noreferrer"><span><b>AI Learning Helper Source</b><small>JavaScript · KaTeX · Responsive</small></span><em>源代码 ↗</em></a><a href="https://github.com/haotsi/course-advanced-programming" target="_blank" rel="noreferrer"><span><b>Advanced Programming</b><small>课程问题记录与代码练习</small></span><em>查看项目 ↗</em></a></div>,
  },
  logic: {
    lead: '沿着定义、推理与证明继续向前。',
    meta: 'LOGIC / PROOF',
    body: <div className="study-topics"><article><span>01</span><h3>数理逻辑</h3><p>命题、谓词、形式系统与证明方法。</p></article><article><span>02</span><h3>集合论</h3><p>从集合语言理解数学对象与结构。</p></article><article><span>03</span><h3>Lean</h3><p>用形式化工具重新审视证明过程。</p></article></div>,
  },
  ai: {
    lead: '理解模型，也理解模型之外的问题。',
    meta: 'AI / LEARNING',
    body: <div className="study-topics"><article><span>01</span><h3>学习笔记</h3><p>记录概念、方法以及尚未解决的问题。</p></article><article><span>02</span><h3>实践项目</h3><p>把模型能力放进真实、可测试的产品中。</p></article><article><span>03</span><h3>基础能力</h3><p>持续补充数学、算法和计算机基础。</p></article></div>,
  },
  notes: {
    lead: '一些写在学习过程边缘的文字。',
    meta: 'NOTES / MARGINS',
    body: <div className="notes-empty"><span>正在整理</span><p>这里将收录学习笔记、项目复盘和偶尔出现的随想。</p></div>,
  },
  links: {
    lead: '从这里离开校园，去往更多作品。',
    meta: 'LINKS / BEYOND',
    body: <div className="module-list"><a href="https://github.com/haotsi" target="_blank" rel="noreferrer"><span><b>GitHub</b><small>代码、项目与学习记录</small></span><em>haotsi ↗</em></a><a href="https://haotsi.github.io/AI_Learning_Helper/" target="_blank" rel="noreferrer"><span><b>AI Learning Helper</b><small>在线学习工具</small></span><em>打开 ↗</em></a></div>,
  },
}

function ModulePanel({ item, onClose }: { item: CampusModule, onClose: () => void }) {
  const content = moduleContent[item.id]
  return (
    <motion.section className="module-panel" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: .45, ease: [0.22, 1, 0.36, 1] }} aria-labelledby="module-title">
      <button className="module-back" type="button" onClick={onClose}><span aria-hidden="true">←</span> 返回校园</button>
      <div className="module-inner">
        <header><p>{content.meta}</p><div className="module-heading-row"><span>{item.index}</span><h1 id="module-title">{item.title}</h1></div><h2>{content.lead}</h2></header>
        <div className="module-body">{content.body}</div>
      </div>
    </motion.section>
  )
}

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const [introVisible, setIntroVisible] = useState(true)
  const [hoveredModule, setHoveredModule] = useState<CampusModuleId | null>(null)
  const [cameraFocus, setCameraFocus] = useState<CampusModuleId | null>(null)
  const [homeResetting, setHomeResetting] = useState(false)
  const [quality, setQuality] = useState<'high' | 'low'>('high')
  const navigationTimer = useRef<number | null>(null)
  const resetTimer = useRef<number | null>(null)
  const currentModule = moduleByPath[location.pathname]
  const activeSceneModule = hoveredModule ?? cameraFocus ?? currentModule?.id ?? null
  const focusId = cameraFocus ?? currentModule?.id ?? null
  const focusConfig = useMemo(() => campusModules.find((item) => item.id === focusId) ?? null, [focusId])

  useEffect(() => { const timer = window.setTimeout(() => setIntroVisible(false), 1900); return () => window.clearTimeout(timer) }, [])
  useEffect(() => { document.title = currentModule ? `${currentModule.title} · haotsi 数字校园` : 'haotsi · 数字校园'; if (currentModule) setCameraFocus(currentModule.id) }, [currentModule])
  useEffect(() => () => {
    if (navigationTimer.current) window.clearTimeout(navigationTimer.current)
    if (resetTimer.current) window.clearTimeout(resetTimer.current)
  }, [])

  const selectModule = (item: CampusModule) => {
    setHoveredModule(null)
    setHomeResetting(false)
    setCameraFocus(item.id)
    if (navigationTimer.current) window.clearTimeout(navigationTimer.current)
    navigationTimer.current = window.setTimeout(() => navigate(item.path), 650)
  }
  const returnHome = () => {
    navigate('/')
    setCameraFocus(null)
    setHomeResetting(true)
    if (resetTimer.current) window.clearTimeout(resetTimer.current)
    resetTimer.current = window.setTimeout(() => setHomeResetting(false), 1100)
  }

  return (
    <main className={`campus-shell${currentModule ? ' has-module-open' : ''}`}>
      <a className="skip-link" href="#scene-description">跳过 3D 场景</a>
      <div className="ambient ambient-left" aria-hidden="true" /><div className="ambient ambient-right" aria-hidden="true" />
      <Suspense fallback={<div className="canvas-fallback" aria-hidden="true" />}>
        <CampusCanvas
          quality={quality}
          onQualityDecline={() => setQuality('low')}
          activeModule={activeSceneModule}
          focusTarget={homeResetting ? HOME_TARGET : focusConfig?.sceneTarget ?? null}
          cameraPosition={homeResetting ? HOME_CAMERA : focusConfig?.cameraPosition ?? null}
          onModuleHover={setHoveredModule}
          onModuleSelect={selectModule}
          showNavigation={!currentModule}
        />
      </Suspense>
      <header className="site-mark" aria-label="网站名称"><button type="button" onClick={returnHome} aria-label="返回数字校园首页"><span className="mark-seal">H</span><span><strong>haotsi</strong><small>DIGITAL CAMPUS</small></span></button></header>
      <AnimatePresence>
        {!currentModule && <motion.div key="campus-home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <section className="scene-title" aria-labelledby="campus-title"><p><span>南京 · 鼓楼</span><i /></p><h1 id="campus-title">北大楼<br />数字校园</h1><div className="title-meta"><span>AI</span><span>数学</span><span>逻辑</span><span>代码</span></div></section>
          <NavigationCards active={hoveredModule} onHover={setHoveredModule} onSelect={selectModule} />
          <div className="scene-controls" aria-label="场景操作提示"><span className="mouse-icon" aria-hidden="true" /><p>拖动旋转 · 滚轮缩放</p></div>
        </motion.div>}
      </AnimatePresence>
      <AnimatePresence mode="wait">{currentModule && <ModulePanel key={currentModule.id} item={currentModule} onClose={returnHome} />}</AnimatePresence>
      <section className="sr-description" id="scene-description"><h2>北大楼数字校园</h2><p>一个以南京大学北大楼为精神地标的三维学术空间，承载学习、项目、文章与思考。</p></section>
      <AnimatePresence>{introVisible && <motion.div className="intro-screen" exit={{ opacity: 0 }} transition={{ duration: 0.7 }}><motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}><span className="intro-seal">H</span><p>haotsi · 数字校园</p><i><b /></i></motion.div></motion.div>}</AnimatePresence>
    </main>
  )
}
