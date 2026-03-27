# gstack 使用说明、最佳实践与 SOP

## 1. 这是什么

gstack 不是单一命令，而是一套给 AI 编码代理用的“软件工厂工作流”。

它把常见的软件交付过程拆成一组专业技能，比如：

- 产品澄清：`office-hours`
- 方案评审：`plan-ceo-review`、`plan-eng-review`、`plan-design-review`
- 代码审查：`review`
- 调试定位：`investigate`
- 真机式浏览器测试：`qa`、`qa-only`、`browse`
- 发版与落地：`ship`、`land-and-deploy`
- 安全与保护：`cso`、`careful`、`freeze`、`guard`
- 复盘与文档：`retro`、`document-release`

核心价值很直接：

1. 让 AI 不只是“写代码”，而是按团队分工做事。
2. 把“想法 -> 计划 -> 实现 -> Review -> QA -> 发版”串成闭环。
3. 用真实浏览器和结构化检查，减少“看起来写完了，其实没验证”的情况。

## 2. 你这台机器上的安装状态

当前已经安装成功，关键路径如下：

- gstack 源码目录：`C:\Users\32118\gstack`
- Codex 技能目录：`C:\Users\32118\.codex\skills`
- 浏览器可执行文件：`C:\Users\32118\gstack\browse\dist\browse.exe`
- Bun：`C:\Users\32118\.bun\bin\bun.exe`

说明：

- 你安装的是 `--host codex`
- 这意味着 gstack 已经注册为 Codex 可发现的技能
- 在 Codex 里优先通过“点名 skill”的方式使用

## 3. 在 Codex 里怎么用

### 3.1 和 Claude 的区别

在 Claude Code 文档里，gstack 常写成 `/review`、`/qa`、`/ship` 这种 slash 命令。

但你现在装的是 Codex 版本。最稳妥的触发方式是直接在提示词里明确说出 skill 名称或任务目标。

建议写法：

- `使用 gstack-review skill 审查我当前分支的改动`
- `使用 gstack-qa skill 测试这个站点并修复发现的问题`
- `使用 gstack-ship skill 帮我准备提 PR`
- `使用 gstack-browse skill 打开这个页面并检查注册流程`
- `使用 gstack-investigate skill 定位这个报错的根因`

如果你想写得更自然，也可以这样说：

- `帮我做一次发布前代码审查，用 gstack-review`
- `帮我做 QA，用 gstack-qa 测一下 staging`
- `帮我走一遍发版流程，用 gstack-ship`

### 3.2 最常用的几个 skill

#### `gstack-review`

适合：

- 做 PR 前检查
- 评估当前 diff 是否有风险
- 找逻辑漏洞、边界条件、遗漏测试

示例：

```text
使用 gstack-review skill，审查我当前分支相对主分支的改动。
重点看：
1. 是否有潜在回归
2. 是否缺测试
3. 是否有会在生产出问题的边界情况
```

#### `gstack-qa`

适合：

- 页面功能测试
- UI 流程检查
- 自动发现 bug 并修复
- 针对 staging 环境做回归

示例：

```text
使用 gstack-qa skill，测试 https://staging.example.com 的登录、列表、详情、提交表单流程。
如果发现问题，直接修复并说明原因。
```

#### `gstack-browse`

适合：

- 纯浏览器巡检
- 验证页面状态
- 截图、看控制台、查交互
- 还没准备好让 AI 改代码，只想先“去看一眼”

示例：

```text
使用 gstack-browse skill，打开 staging 页面，检查首屏、导航、注册按钮和控制台报错。
```

#### `gstack-investigate`

适合：

- 一个 bug 反复改不对
- 错误原因不明确
- 想先定位根因，再决定修法

示例：

```text
使用 gstack-investigate skill，定位这个接口偶发 500 的根因。
先不要直接改，先给我原因链路和证据。
```

#### `gstack-ship`

适合：

- 分支已经差不多完成
- 想统一跑测试、补齐覆盖、整理 PR
- 做最终交付准备

示例：

```text
使用 gstack-ship skill，帮我把当前分支整理到可提 PR 的状态。
请检查测试、覆盖率、文档和发布风险。
```

## 4. 最推荐的使用方式

不要把 gstack 当成“命令列表”，要把它当成“固定节奏”。

最推荐的顺序是：

1. 先定义问题
2. 再做方案评审
3. 再实现
4. 再 review
5. 再 QA
6. 最后 ship

也就是这条主链路：

```text
office-hours -> plan-ceo-review / plan-eng-review -> 实现 -> review -> qa -> ship
```

如果你在 Codex 里实际执行，可以简化成下面这套。

## 5. 最佳实践

### 5.1 最佳实践一：明确目标，不要只说“帮我看看”

差的说法：

```text
你帮我看看这个项目
```

好的说法：

```text
使用 gstack-review skill，审查当前分支相对 main 的改动，重点看数据一致性、空值处理和测试缺口。
```

原因：

- gstack 很强，但它不是读心术
- 目标越具体，结果越接近你真正关心的风险

### 5.2 最佳实践二：让 Review 和 QA 分开

很多人会把“代码审查”和“页面测试”混成一件事。

其实最好拆开：

- `review` 负责看代码结构、边界和回归风险
- `qa` 负责看页面、交互、浏览器行为和真实运行结果

这两个步骤互相补位，不要二选一。

### 5.3 最佳实践三：优先让 AI 先调查，再修

遇到复杂 bug，不要上来就说“修一下”。

先用：

- `gstack-investigate`

等根因明确后，再进入修复。

这样能避免：

- 连续打补丁
- 修表面症状
- 一个 bug 改出三个新 bug

### 5.4 最佳实践四：浏览器问题尽量走 `browse` 或 `qa`

凡是和下面这些相关，都不要只靠“读代码猜”：

- 登录状态
- 页面跳转
- 表单提交流程
- 样式错位
- 控制台报错
- 空态、异常态

优先让 gstack 真正打开页面去看。

### 5.5 最佳实践五：把它放在“准备提交之前”

最实用的落点不是“什么都没做之前”，而是“你觉得自己已经做完了”的那个时刻。

建议每次在准备提交或提 PR 前固定跑：

1. `gstack-review`
2. `gstack-qa`
3. `gstack-ship`

这是收益最高的三连。

### 5.6 最佳实践六：对高风险目录加保护

如果你要处理：

- 生产配置
- 数据迁移
- 支付相关逻辑
- 删除脚本
- 大范围重构

建议打开：

- `gstack-careful`
- `gstack-freeze`
- `gstack-guard`

这样能减少误删、误改、误操作。

## 6. 标准 SOP

下面给你一个适合日常开发的标准 SOP。

### SOP A：新功能开发

适用场景：

- 新页面
- 新业务流程
- 新模块

步骤：

1. 明确需求
2. 让 AI 用 `office-hours` 或对应计划 skill 帮你梳理问题边界
3. 确认技术方案
4. 实现功能
5. 用 `gstack-review` 做代码审查
6. 用 `gstack-qa` 跑关键路径测试
7. 用 `gstack-ship` 整理成可提交状态

推荐提示词：

```text
我们要做一个新功能：XXX。
先帮我梳理需求边界和实现方案，再开始写代码。
方案确认后，用 gstack-review 和 gstack-qa 做完整收尾。
```

### SOP B：修一个线上或临近上线的 bug

适用场景：

- 问题复现不稳定
- 报错原因不清楚
- 怕误修

步骤：

1. 先复述现象
2. 用 `gstack-investigate` 找根因
3. 根因确认后再修
4. 用 `gstack-review` 检查是否引入副作用
5. 用 `gstack-qa` 验证修复
6. 必要时补回归测试

推荐提示词：

```text
使用 gstack-investigate skill 先定位根因，不要急着改。
确认原因后再修复，并用 gstack-review 和 gstack-qa 收尾。
```

### SOP C：提 PR 前的质量闸门

适用场景：

- 分支开发完成
- 准备合并

步骤：

1. 跑 `gstack-review`
2. 修复高优先级问题
3. 跑 `gstack-qa`
4. 确认关键流程、控制台、异常态都没问题
5. 跑 `gstack-ship`
6. 生成 PR 所需说明

推荐提示词：

```text
当前分支准备提 PR。
请按发布前质量闸门执行：
先 gstack-review，再 gstack-qa，最后 gstack-ship。
输出结论、剩余风险和建议的 PR 描述。
```

### SOP D：UI / 前端页面验收

适用场景：

- 新页面视觉验收
- 响应式检查
- 交互联调

步骤：

1. 用 `gstack-browse` 打开页面
2. 检查首屏、交互、表单、弹窗、滚动、响应式
3. 再用 `gstack-qa` 做系统化测试
4. 有问题就修
5. 修完后重新验证

推荐提示词：

```text
使用 gstack-browse 先看页面真实表现，再用 gstack-qa 做系统化测试。
重点检查移动端、弹窗、表单校验和控制台报错。
```

## 7. 推荐的日常提示词模板

### 模板 1：代码审查

```text
使用 gstack-review skill 审查当前分支改动。
请按严重程度输出：
1. 真实 bug
2. 潜在回归
3. 缺失测试
4. 可以接受但需要说明的风险
```

### 模板 2：测试并修复

```text
使用 gstack-qa skill 测试这个站点的核心流程，并直接修复发现的问题。
测试范围：登录、列表、详情、编辑、提交、错误提示。
```

### 模板 3：根因定位

```text
使用 gstack-investigate skill 定位这个问题的根因。
先给我证据链，再决定怎么修。
```

### 模板 4：发布前收尾

```text
当前分支已经开发完成。
请依次执行 gstack-review、gstack-qa、gstack-ship，帮我收尾到可提 PR 状态。
```

### 模板 5：仅浏览器检查

```text
使用 gstack-browse skill 打开这个页面，检查真实 UI、交互行为、控制台报错和关键按钮是否可用。
```

## 8. 一个最实用的落地流程

如果你只记一套流程，就记这一套：

### 日常开发三连

1. 开发完成后，先 `gstack-review`
2. 然后 `gstack-qa`
3. 最后 `gstack-ship`

对应的统一提示词：

```text
当前功能我已经开发完了。
请先用 gstack-review 做代码审查，再用 gstack-qa 做真实流程测试，最后用 gstack-ship 帮我整理到可提 PR 的状态。
```

这套流程的好处是：

- 它覆盖了代码层和运行层
- 它适合大多数 Web 项目
- 它比“我自己看一眼就提 PR”稳很多

## 9. 常见误区

### 误区 1：把 gstack 当作单次问答工具

不对。

它更像一套“阶段化工作流”。你越按阶段用，收益越高。

### 误区 2：只做 review，不做 qa

不够。

代码没问题，不代表页面、浏览器、登录态、交互就没问题。

### 误区 3：bug 一来就让 AI 直接改

这通常会让修复质量变差。

复杂问题先 investigate，再修。

### 误区 4：功能做完就直接合并

最容易出事的时刻，就是“你以为已经做完了”的时候。

所以才要在最后补上 `review -> qa -> ship`。

## 10. 什么时候用哪个 skill

| 场景 | 推荐 skill |
| --- | --- |
| 我要明确需求和产品方向 | `office-hours`、`plan-ceo-review` |
| 我要锁定技术方案 | `plan-eng-review` |
| 我要看 UI / 设计质量 | `plan-design-review`、`design-review` |
| 我要检查代码风险 | `gstack-review` |
| 我要排查复杂 bug | `gstack-investigate` |
| 我要跑浏览器测试 | `gstack-browse`、`gstack-qa` |
| 我要只出测试报告，不改代码 | `gstack-qa-only` |
| 我要准备提 PR | `gstack-ship` |
| 我要做安全审查 | `gstack-cso` |
| 我要做发版后复盘 | `gstack-retro` |

## 11. 我对你当前使用方式的建议

如果你主要是在 Codex 里做 Web 项目开发，我建议你固定采用下面这个 SOP：

1. 开发前，先把需求说清楚
2. 复杂需求，先让 AI 做一次 plan review
3. 开发完成后，固定跑 `gstack-review`
4. 页面相关改动，固定跑 `gstack-qa`
5. 准备合并前，固定跑 `gstack-ship`

一句话版：

```text
先想清楚，再写代码；写完先 review，再 qa，最后 ship。
```

这基本就是 gstack 最值钱的使用方式。

## 12. 附：你现在可以直接复制用的命令式提示词

```text
使用 gstack-review skill 审查当前分支改动，按严重程度列出问题并给出修复建议。
```

```text
使用 gstack-qa skill 测试 staging 环境的核心流程，发现问题就直接修复，并重新验证。
```

```text
使用 gstack-browse skill 打开这个页面，检查真实交互、控制台报错和关键按钮。
```

```text
使用 gstack-investigate skill 定位这个 bug 的根因，先不要直接修，先给证据链。
```

```text
使用 gstack-ship skill 帮我把当前分支整理到可提 PR 的状态，检查测试、覆盖和文档。
```

---

如果后面你愿意，我可以继续帮你补第二版，把这份文档改成更像团队内部规范的版本，比如：

- 面向个人开发者版
- 面向团队协作版
- 面向前端项目版
- 面向“上线前检查清单”版
