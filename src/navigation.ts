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
  { id: 'about', title: '关于我', subtitle: '我的方向', path: '/about', index: '01', sceneTarget: [0, 3.5, -1.9], cameraPosition: [12, 10, 15] },
  { id: 'projects', title: '项目作品', subtitle: '实践与创造', path: '/projects', index: '02', sceneTarget: [4.5, 1.2, -1.8], cameraPosition: [14, 8, 11] },
  { id: 'logic', title: '数学逻辑', subtitle: '推理与证明', path: '/logic', index: '03', sceneTarget: [-3.7, 1.1, -1.8], cameraPosition: [9, 8, 14] },
  { id: 'ai', title: 'AI 探索', subtitle: '学习与实验', path: '/ai', index: '04', sceneTarget: [3.9, 0.6, 3.8], cameraPosition: [14, 9, 16] },
  { id: 'notes', title: '学习笔记', subtitle: '目录一览', path: '/notes', index: '05', sceneTarget: [-4.6, 1.0, -1.4], cameraPosition: [10, 7, 16] },
  { id: 'links', title: '更多链接', subtitle: '找到我', path: '/links', index: '06', sceneTarget: [0, 0.4, 5.8], cameraPosition: [12, 9, 19] },
]

export const moduleByPath = Object.fromEntries(campusModules.map((item) => [item.path, item])) as Record<string, CampusModule>
