# 豫见河南前端实现计划

> **执行要求：** 实施时按任务顺序逐项完成，保持小步提交。

**目标：** 构建“豫见河南”中国风 PC Web 前端，完整演示“选点 -> 推荐 -> 路径 -> 行程输出”。

**架构：** 采用 Vue 3 + Vite 单页应用，使用 Vue Router 组织 5 个页面，Pinia 管理跨页状态。以本地 Mock 数据驱动推荐流程，并在路径详情页用 ECharts 拓扑图展示最短路径结果。

**技术栈：** Vue 3、TypeScript、Vite、Vue Router、Pinia、ECharts、Vitest、Vue Test Utils、Playwright

---

### 任务 1：项目初始化与测试框架

**文件：**
- 新建：`package.json`
- 新建：`tsconfig.json`
- 新建：`vite.config.ts`
- 新建：`index.html`
- 新建：`src/main.ts`
- 新建：`src/App.vue`
- 新建：`src/style.css`
- 测试：`tests/smoke/app.smoke.test.ts`

**步骤 1：先写失败测试**
```ts
import { describe, it, expect } from 'vitest'

describe('应用启动', () => {
  it('测试环境可运行', () => {
    expect(true).toBe(true)
  })
})
```

**步骤 2：运行并确认失败**
- 运行：`npm run test -- tests/smoke/app.smoke.test.ts`
- 预期：因依赖未安装或脚本未配置导致失败

**步骤 3：最小实现**
- 配置 Vite + Vue + Vitest 基础脚手架并补齐脚本

**步骤 4：再次运行并确认通过**
- 运行：`npm install && npm run test -- tests/smoke/app.smoke.test.ts`
- 预期：通过

**步骤 5：提交**
```bash
git add .
git commit -m "chore: 初始化 Vue3+Vite 与测试环境"
```

### 任务 2：搭建 5 页路由壳层

**文件：**
- 新建：`src/router/index.ts`
- 新建：`src/views/HomeView.vue`
- 新建：`src/views/SpotsView.vue`
- 新建：`src/views/RecommendView.vue`
- 新建：`src/views/RouteDetailView.vue`
- 新建：`src/views/ItineraryView.vue`
- 修改：`src/App.vue`
- 测试：`tests/router/routes.test.ts`

**步骤 1：先写失败测试**
- 断言存在 `home`、`spots`、`recommend`、`route-detail`、`itinerary` 五个路由

**步骤 2：运行并确认失败**
- 运行：`npm run test -- tests/router/routes.test.ts`

**步骤 3：最小实现**
- 新增路由并在 `App.vue` 放置主导航与 `RouterView`

**步骤 4：再次运行并确认通过**
- 运行：`npm run test -- tests/router/routes.test.ts`

**步骤 5：提交**
```bash
git add src/router src/views src/App.vue tests/router/routes.test.ts
git commit -m "feat: 搭建五页路由结构"
```

### 任务 3：中国风设计令牌与全局框架

**文件：**
- 新建：`src/styles/tokens.css`
- 新建：`src/components/AppHeader.vue`
- 修改：`src/style.css`
- 修改：`src/App.vue`
- 测试：`tests/ui/theme-token.test.ts`

**步骤 1：先写失败测试**
- 校验存在 `--color-daiqing`、`--color-zhusha`、`--color-mibai`、`--color-mohei`

**步骤 2：运行并确认失败**
- 运行：`npm run test -- tests/ui/theme-token.test.ts`

**步骤 3：最小实现**
- 建立中国风主色与间距、圆角、阴影变量
- 落地顶部导航、山水背景层、页面容器骨架

**步骤 4：再次运行并确认通过**
- 运行：`npm run test -- tests/ui/theme-token.test.ts`

**步骤 5：提交**
```bash
git add src/styles/tokens.css src/components/AppHeader.vue src/style.css src/App.vue tests/ui/theme-token.test.ts
git commit -m "feat: 建立中国风视觉基础"
```

### 任务 4：构建 Mock 数据层

**文件：**
- 新建：`src/types/domain.ts`
- 新建：`src/data/cities.ts`
- 新建：`src/data/edges.ts`
- 新建：`src/data/spots.ts`
- 测试：`tests/data/data-shape.test.ts`

**步骤 1：先写失败测试**
- 断言城市、边、景点数量达到演示阈值

**步骤 2：运行并确认失败**
- 运行：`npm run test -- tests/data/data-shape.test.ts`

**步骤 3：最小实现**
- 填充河南主要城市与景点数据
- 定义边权重（距离/时长/费用）

**步骤 4：再次运行并确认通过**
- 运行：`npm run test -- tests/data/data-shape.test.ts`

**步骤 5：提交**
```bash
git add src/types/domain.ts src/data tests/data/data-shape.test.ts
git commit -m "feat: 增加河南旅游图谱 Mock 数据"
```

### 任务 5：实现最短路径算法模块（Dijkstra）

**文件：**
- 新建：`src/utils/dijkstra.ts`
- 测试：`tests/algorithm/dijkstra.test.ts`

**步骤 1：先写失败测试**
- 输入起终点，断言返回路径序列与总距离

**步骤 2：运行并确认失败**
- 运行：`npm run test -- tests/algorithm/dijkstra.test.ts`

**步骤 3：最小实现**
- 先返回固定结构，再替换为完整 Dijkstra

**步骤 4：再次运行并确认通过**
- 运行：`npm run test -- tests/algorithm/dijkstra.test.ts`

**步骤 5：提交**
```bash
git add src/utils/dijkstra.ts tests/algorithm/dijkstra.test.ts
git commit -m "feat: 实现最短路径算法与测试"
```

### 任务 6：实现推荐流程状态管理（Pinia）

**文件：**
- 新建：`src/stores/plan.ts`
- 修改：`src/main.ts`
- 测试：`tests/store/plan-store.test.ts`

**步骤 1：先写失败测试**
- 断言可写入用户偏好并读取推荐摘要

**步骤 2：运行并确认失败**
- 运行：`npm run test -- tests/store/plan-store.test.ts`

**步骤 3：最小实现**
- 建立 `preference`、`candidates`、`selectedRoute`、`itinerary` 状态与动作

**步骤 4：再次运行并确认通过**
- 运行：`npm run test -- tests/store/plan-store.test.ts`

**步骤 5：提交**
```bash
git add src/stores/plan.ts src/main.ts tests/store/plan-store.test.ts
git commit -m "feat: 建立跨页推荐状态管理"
```

### 任务 7：景点总览页（美观重点）

**文件：**
- 新建：`src/components/SpotCard.vue`
- 新建：`src/components/SpotFilterPanel.vue`
- 修改：`src/views/SpotsView.vue`
- 测试：`tests/views/spots-view.test.ts`

**步骤 1：先写失败测试**
- 断言页面有“景点总览”标题、筛选区、卡片列表

**步骤 2：运行并确认失败**
- 运行：`npm run test -- tests/views/spots-view.test.ts`

**步骤 3：最小实现**
- 先渲染基础结构，再增强为中国风图卡与筛选交互

**步骤 4：再次运行并确认通过**
- 运行：`npm run test -- tests/views/spots-view.test.ts`

**步骤 5：提交**
```bash
git add src/components/SpotCard.vue src/components/SpotFilterPanel.vue src/views/SpotsView.vue tests/views/spots-view.test.ts
git commit -m "feat: 完成景点总览页与筛选功能"
```

### 任务 8：智能推荐页与路径详情页

**文件：**
- 新建：`src/components/PreferenceForm.vue`
- 新建：`src/components/RouteCandidateCard.vue`
- 新建：`src/components/RouteGraph.vue`
- 修改：`src/views/RecommendView.vue`
- 修改：`src/views/RouteDetailView.vue`
- 测试：`tests/views/recommend-route-detail.test.ts`

**步骤 1：先写失败测试**
- 断言页面包含“最短路径优先”策略文案和结果区

**步骤 2：运行并确认失败**
- 运行：`npm run test -- tests/views/recommend-route-detail.test.ts`

**步骤 3：最小实现**
- 串联“表单 -> 推荐 -> Dijkstra -> 拓扑图与明细”

**步骤 4：再次运行并确认通过**
- 运行：`npm run test -- tests/views/recommend-route-detail.test.ts`

**步骤 5：提交**
```bash
git add src/components/PreferenceForm.vue src/components/RouteCandidateCard.vue src/components/RouteGraph.vue src/views/RecommendView.vue src/views/RouteDetailView.vue tests/views/recommend-route-detail.test.ts
git commit -m "feat: 打通智能推荐与路径详情链路"
```

### 任务 9：行程结果页与异常回退

**文件：**
- 新建：`src/components/ItineraryTimeline.vue`
- 新建：`src/components/EmptyStatePanel.vue`
- 修改：`src/views/ItineraryView.vue`
- 修改：`src/views/RecommendView.vue`
- 测试：`tests/views/itinerary-fallbacks.test.ts`

**步骤 1：先写失败测试**
- 断言存在“行程结果”标题与时间轴区块

**步骤 2：运行并确认失败**
- 运行：`npm run test -- tests/views/itinerary-fallbacks.test.ts`

**步骤 3：最小实现**
- 渲染日程时间轴
- 补充无结果回退与一键放宽条件

**步骤 4：再次运行并确认通过**
- 运行：`npm run test -- tests/views/itinerary-fallbacks.test.ts`

**步骤 5：提交**
```bash
git add src/components/ItineraryTimeline.vue src/components/EmptyStatePanel.vue src/views/ItineraryView.vue src/views/RecommendView.vue tests/views/itinerary-fallbacks.test.ts
git commit -m "feat: 完成行程结果与异常回退"
```

### 任务 10：端到端演示验证与展示文档

**文件：**
- 新建：`playwright.config.ts`
- 新建：`tests/e2e/demo-flow.spec.ts`
- 新建：`docs/demo-script.md`
- 修改：`README.md`

**步骤 1：先写失败测试**
- 从首页开始断言“豫见河南”可见，再逐页点击至行程结果

**步骤 2：运行并确认失败**
- 运行：`npx playwright test tests/e2e/demo-flow.spec.ts`

**步骤 3：最小实现**
- 完成 Playwright 配置与链路断言

**步骤 4：再次运行并确认通过**
- 终端 1：`npm run dev`
- 终端 2：`npx playwright test tests/e2e/demo-flow.spec.ts`

**步骤 5：提交**
```bash
git add playwright.config.ts tests/e2e/demo-flow.spec.ts docs/demo-script.md README.md
git commit -m "test: 增加录课主链路 E2E 验证"
```

### 任务 11：最终质量门禁

**文件：**
- 修改：`package.json`
- 修改：`README.md`

**步骤 1：补齐验证脚本**
- 增加 `verify` 命令：统一执行测试与构建

**步骤 2：运行完整验证**
- 运行：`npm run verify`
- 预期：测试与构建全部通过

**步骤 3：提交**
```bash
git add package.json README.md
git commit -m "chore: 增加最终质量门禁脚本"
```

## 收尾检查
- `npm run test` 通过
- `npm run build` 通过
- E2E 主链路通过
- 视觉与中国风一致性通过人工验收
