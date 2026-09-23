import { lazy, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation, useNavigate } from 'react-router-dom'
import { campusModules, moduleByPath, type CampusModule, type CampusModuleId } from './navigation'

const CampusCanvas = lazy(() => import('./scene/CampusCanvas'))
const HOME_CAMERA: [number, number, number] = [18, 15, 20]
const HOME_TARGET: [number, number, number] = [0, 1.25, 0]
const LIBRARY_CAMERA: [number, number, number] = [18, 16, 22]
const LIBRARY_TARGET: [number, number, number] = [0, 2.9, 0]

function NavigationCards({ active, onHover, onSelect }: {
  active: CampusModuleId | null
  onHover: (id: CampusModuleId | null) => void
  onSelect: (item: CampusModule) => void
}) {
  return (
    <nav className="campus-navigation" aria-label="网站导航">
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
    body: <div className="module-list"><a href="https://haotsi.github.io/AI_Learning_Helper/" target="_blank" rel="noreferrer"><span><b>AI Learning Helper</b><small>多学科学习助手 · PWA</small></span><em>在线体验 ↗</em></a><a href="https://github.com/haotsi/AI_Learning_Helper" target="_blank" rel="noreferrer"><span><b>AI Learning Helper Source</b><small>JavaScript · KaTeX · Responsive</small></span><em>源代码 ↗</em></a><a href="https://github.com/haotsi/Teyvat_Tatics" target="_blank" rel="noreferrer"><span><b>Teyvat_Tatics</b><small>原神主题战术游戏原型 · C++ · CMake</small></span><em>查看项目 ↗</em></a><a href="https://github.com/haotsi/course-advanced-programming" target="_blank" rel="noreferrer"><span><b>Advanced Programming</b><small>课程问题记录与代码练习</small></span><em>查看项目 ↗</em></a></div>,
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
    lead: '学习有迹可循。',
    meta: 'NOTES / INDEX',
    body: <div className="note-index"><p>这是我的 Obsidian 笔记库目录预览。网站只展示课程与主题层级，不提供笔记正文或文件下载。</p><div className="note-tree" aria-label="学习笔记目录结构"><div className="note-tree-root">学习笔记 <span>/</span></div><div className="note-tree-group"><strong>1-2</strong><ul><li>人工智能导论大作业</li><li>数字系统</li><li>思政</li><li>英语</li><li>cpp</li></ul></div><div className="note-tree-group"><strong>2-1</strong><ul><li>逻辑与推理</li><li>CPL</li><li>DSA</li></ul></div><div className="note-tree-group"><strong>FERM</strong><span>专题笔记</span></div></div><small>仅展示目录；个人笔记内容未加入网站构建。</small></div>,
  },
  links: {
    lead: '继续了解我的作品与实践。',
    meta: 'LINKS / BEYOND',
    body: <div className="module-list"><a href="https://github.com/haotsi" target="_blank" rel="noreferrer"><span><b>GitHub</b><small>代码、项目与学习记录</small></span><em>haotsi ↗</em></a><a href="https://haotsi.github.io/AI_Learning_Helper/" target="_blank" rel="noreferrer"><span><b>AI Learning Helper</b><small>在线学习工具</small></span><em>打开 ↗</em></a></div>,
  },
}

function ModulePanel({ item, onClose }: { item: CampusModule, onClose: () => void }) {
  const content = moduleContent[item.id]
  return (
    <motion.section className="module-panel" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: .45, ease: [0.22, 1, 0.36, 1] }} aria-labelledby="module-title">
      <button className="module-back" type="button" onClick={onClose}><span aria-hidden="true">←</span> 返回首页</button>
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
  const [hoveredModule, setHoveredModule] = useState<CampusModuleId | null>(null)
  const [cameraFocus, setCameraFocus] = useState<CampusModuleId | null>(null)
  const [homeResetting, setHomeResetting] = useState(false)
  const [quality, setQuality] = useState<'high' | 'low'>('high')
  const [sceneVariant, setSceneVariant] = useState<'north' | 'library'>('north')
  const navigationTimer = useRef<number | null>(null)
  const resetTimer = useRef<number | null>(null)
  const currentModule = moduleByPath[location.pathname]
  const activeSceneModule = hoveredModule ?? cameraFocus ?? currentModule?.id ?? null
  const focusId = cameraFocus ?? currentModule?.id ?? null
  const focusConfig = useMemo(() => campusModules.find((item) => item.id === focusId) ?? null, [focusId])

  useEffect(() => { document.title = currentModule ? `${currentModule.title} · haotsi` : 'haotsi · 作品与学习'; if (currentModule) setCameraFocus(currentModule.id) }, [currentModule])
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
  const switchScene = (variant: 'north' | 'library') => {
    if (variant === sceneVariant) return
    setSceneVariant(variant)
    setHoveredModule(null)
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
          sceneVariant={sceneVariant}
          onQualityDecline={() => setQuality('low')}
          activeModule={activeSceneModule}
          focusTarget={homeResetting ? (sceneVariant === 'library' ? LIBRARY_TARGET : HOME_TARGET) : sceneVariant === 'library' ? null : focusConfig?.sceneTarget ?? null}
          cameraPosition={homeResetting ? (sceneVariant === 'library' ? LIBRARY_CAMERA : HOME_CAMERA) : sceneVariant === 'library' ? null : focusConfig?.cameraPosition ?? null}
          onModuleHover={setHoveredModule}
          onModuleSelect={selectModule}
          showNavigation={false}
        />
      </Suspense>
      <header className="site-mark" aria-label="网站名称"><button type="button" onClick={returnHome} aria-label="返回首页"><span className="mark-seal">H</span><span><strong>haotsi</strong><small>PORTFOLIO / LEARNING</small></span></button></header>
      <AnimatePresence>
        {!currentModule && <motion.div key="campus-home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <section className="scene-title" aria-labelledby="campus-title"><p><span>南京大学 · 学习与创造</span><i /></p><h1 id="campus-title">你好，我是<br /><em>haotsi.</em></h1><p className="hero-lead">我从自己的学习问题出发，做工具、写代码，也记录推理与探索的过程。</p><div className="hero-actions"><button type="button" onClick={() => selectModule(campusModules[1])}>看我的作品 <span aria-hidden="true">↗</span></button><button type="button" onClick={() => selectModule(campusModules[4])}>浏览笔记目录 <span aria-hidden="true">→</span></button></div><div className="hero-feature"><span>精选实践 / 01</span><strong>AI Learning Helper</strong><small>把学习过程做成可用的工具</small></div></section>
          <NavigationCards active={hoveredModule} onHover={setHoveredModule} onSelect={selectModule} />
          <div className="model-switcher" role="group" aria-label="选择三维建筑模型"><span>建筑模型</span><button type="button" aria-pressed={sceneVariant === 'north'} onClick={() => switchScene('north')}>鼓楼 · 北大楼</button><button type="button" aria-pressed={sceneVariant === 'library'} onClick={() => switchScene('library')}>苏州 · 图书馆</button></div>
          <div className="scene-controls" aria-label="场景操作提示"><span className="mouse-icon" aria-hidden="true" /><p>{sceneVariant === 'north' ? '南京大学北大楼' : '苏州校区图书馆 · 简化模型'} · 拖动旋转</p></div>
        </motion.div>}
      </AnimatePresence>
      <AnimatePresence mode="wait">{currentModule && <ModulePanel key={currentModule.id} item={currentModule} onClose={returnHome} />}</AnimatePresence>
      <section className="sr-description" id="scene-description"><h2>haotsi 的个人作品主页</h2><p>这里展示项目、学习方向与笔记目录。三维场景可切换南京大学鼓楼校区北大楼与苏州校区图书馆。</p></section>
    </main>
  )
}
