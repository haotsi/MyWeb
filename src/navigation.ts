export type CampusModuleId = 'about' | 'projects' | 'logic' | 'ai' | 'notes' | 'links'

export type CampusModule = {
  id: CampusModuleId
  title: string
  subtitle: string
  path: string
  index: string
  sceneTarget: [number, number, number]
  cameraPosition: [number, number, number]
}

export const campusModules: CampusModule[] = [
  { id: 'about', title: '钟楼序言', subtitle: '关于我', path: '/about', index: '01', sceneTarget: [0, 3.5, -1.9], cameraPosition: [12, 10, 15] },
  { id: 'projects', title: '青砖造物', subtitle: '项目与作品', path: '/projects', index: '02', sceneTarget: [4.5, 1.2, -1.8], cameraPosition: [14, 8, 11] },
  { id: 'logic', title: '塔下演绎', subtitle: '数学与逻辑', path: '/logic', index: '03', sceneTarget: [-3.7, 1.1, -1.8], cameraPosition: [9, 8, 14] },
  { id: 'ai', title: '北园智研', subtitle: 'AI 学习与实验', path: '/ai', index: '04', sceneTarget: [3.9, 0.6, 3.8], cameraPosition: [14, 9, 16] },
  { id: 'notes', title: '藤墙手记', subtitle: '文章与笔记', path: '/notes', index: '05', sceneTarget: [-4.6, 1.0, -1.4], cameraPosition: [10, 7, 16] },
  { id: 'links', title: '中轴之外', subtitle: 'GitHub 与链接', path: '/links', index: '06', sceneTarget: [0, 0.4, 5.8], cameraPosition: [12, 9, 19] },
]

export const moduleByPath = Object.fromEntries(campusModules.map((item) => [item.path, item])) as Record<string, CampusModule>
