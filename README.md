# LibAI Admin Web

基于 Vue 3 + Element Plus 的后台管理系统前端项目。

## 技术栈

- Vue 3
- Vue Router
- Pinia
- Element Plus
- Axios
- Vite

## 前置要求

- Node.js >= 16
- npm 或 yarn
- 后端服务 libai-admin 已启动（端口：11010）

## 快速开始

### 1. 安装依赖

```bash
npm install
```

如果遇到网络问题，可以使用淘宝镜像：
```bash
npm install --registry=https://registry.npmmirror.com
```

### 2. 启动后端服务

确保后端服务已在运行：
```bash
cd /Users/kite/code/java/kite/libai
./gradlew :libai-admin:bootRun
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 4. 登录系统

使用数据库中已存在的管理员账号登录。

**登录参数说明：**
- `loginName`: 用户名
- `password`: 密码
- `channel`: 渠道标识（固定为 'web'）
- `type`: 登录类型（固定为 'pwd_login'，必填）

**重要提示：** 管理接口（用户、角色、权限）需要用户类型为 `USER`（内部用户）。如果提示“您暂无此操作权限”，请检查账号的 type 字段是否为 "user"。

## 常见问题

### 1. 端口被占用

如果 3000 端口被占用，Vite 会自动使用下一个可用端口（3001, 3002...）

或者手动修改 `vite.config.js` 中的端口：
```javascript
server: {
  port: 3001,  // 修改为你想要的端口
  ...
}
```

### 2. 登录失败
- 确认后端服务是否正常运行
- 检查浏览器控制台是否有错误信息
- 确认数据库中已有管理员账号
- 检查网络请求的响应状态码

### 3. API 请求失败
- 确认 vite.config.js 中的代理配置是否正确
- 确认后端服务地址和端口是否为 http://localhost:11010
- 检查浏览器控制台的 Network 标签，查看请求详情

### 4. 依赖安装失败

尝试清除缓存后重新安装：
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 多环境配置

项目支持 development、test、production 三种环境。

### 环境配置文件

- `.env.development` - 开发环境（API: http://localhost:11010）
- `.env.test` - 测试环境（API: http://test-api.libai.com）
- `.env.production` - 生产环境（API: https://api.libai.com）

### 常用命令

```bash
# 开发环境
npm run dev

# 构建测试环境
npm run build:test

# 构建生产环境
npm run build:prod
# 或
npm run build
```

### 在代码中使用环境变量

```javascript
import { ENV } from '@/config/env'

console.log(ENV.APP_TITLE)        // 应用标题
console.log(ENV.API_BASE_URL)     // API地址
console.log(ENV.isDevelopment)    // 是否开发环境
console.log(ENV.isTest)           // 是否测试环境
console.log(ENV.isProduction)     // 是否生产环境
```

## 项目结构

```
libai-web/
├── env/                  # 环境配置目录
│   ├── .env.development  # 开发环境配置
│   ├── .env.test         # 测试环境配置
│   └── .env.production   # 生产环境配置
├── src/
│   ├── api/              # API 接口定义
│   │   ├── auth.js       # 认证相关接口
│   │   ├── user.js       # 用户管理接口
│   │   ├── role.js       # 角色管理接口
│   │   └── permission.js # 权限管理接口
│   ├── config/           # 配置文件
│   │   └── env.js        # 环境配置工具
│   ├── directive/        # 自定义指令
│   │   └── permission.js # 权限指令
│   ├── router/           # 路由配置
│   ├── store/            # 状态管理
│   ├── utils/            # 工具函数
│   │   ├── request.js    # Axios 封装
│   │   └── permission.js # 权限工具函数
│   ├── views/            # 页面组件
│   │   ├── login/        # 登录页
│   │   ├── layout/       # 布局组件
│   │   ├── dashboard/    # 仪表盘
│   │   ├── user/         # 用户管理
│   │   ├── role/         # 角色管理
│   │   └── permission/   # 权限管理
│   ├── App.vue           # 根组件
│   └── main.js           # 入口文件
├── index.html
├── package.json
└── vite.config.js
```

## 功能模块

- ✅ 用户登录/登出
- ✅ 仪表盘
- ✅ 用户管理（增删改查、重置密码、状态切换）
- ✅ 角色管理（增删改查、权限分配）
- ✅ 权限管理（增删改查、树形结构展示）

## 权限控制

### 按钮级权限控制

系统实现了基于后端返回权限的按钮级权限控制，通过自定义指令 `v-permission` 实现。

#### 使用方法

**基础用法 - 单个权限：**
```vue
<el-button v-permission="'system:user:create'">
  新增用户
</el-button>
```

**多个权限（满足任一即可）：**
```vue
<el-button v-permission="['system:user:create', 'system:user:update']">
  操作按钮
</el-button>
```

**在表格操作列中使用：**
```vue
<el-table-column label="操作">
  <template #default="{ row }">
    <el-button @click="handleEdit(row)" v-permission="'system:user:update'">
      编辑
    </el-button>
    <el-button @click="handleDelete(row)" v-permission="'system:user:delete'">
      删除
    </el-button>
  </template>
</el-table-column>
```

**在脚本中判断权限：**
```javascript
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/utils/permission'

if (hasPermission('system:user:create')) {
  console.log('有创建用户权限')
}
```

#### 权限标识规范

建议采用以下命名规范：`模块:功能:操作`

示例：
- `system:user:create` - 系统模块-用户管理-创建
- `system:user:update` - 系统模块-用户管理-更新
- `system:user:delete` - 系统模块-用户管理-删除
- `system:role:assign` - 系统模块-角色管理-分配权限

#### 已配置的权限点

**用户管理 (system:user:*)**
- `system:user:create` - 新增用户
- `system:user:update` - 编辑用户
- `system:user:delete` - 删除用户
- `system:user:resetPassword` - 重置密码
- `system:user:updateStatus` - 更新状态

**角色管理 (system:role:*)**
- `system:role:create` - 新增角色
- `system:role:update` - 编辑角色
- `system:role:delete` - 删除角色
- `system:role:assign` - 分配权限

**权限管理 (system:permission:*)**
- `system:permission:create` - 新增权限
- `system:permission:update` - 编辑权限
- `system:permission:delete` - 删除权限

详细说明请参考：[BUTTON_PERMISSION.md](./BUTTON_PERMISSION.md)

### 权限树形结构

角色分配权限时，权限列表以树形结构显示，支持父子节点联动。

**核心特性：**
- ✅ 选中父节点 → 自动选中所有子节点
- ✅ 取消父节点 → 自动取消所有子节点
- ✅ 选中所有子节点 → 父节点自动变为选中状态
- ✅ 选中部分子节点 → 父节点显示为半选状态

**工作原理：**
后端返回扁平数组数据，前端通过 `buildPermissionTree` 函数转换为树形结构供 el-tree 组件使用。

## API 对接说明

### 代理配置

前端通过 Vite 代理将 `/api` 请求转发到后端服务：

- 前端地址：http://localhost:3000
- 后端地址：根据环境配置（见 .env.* 文件）
- 代理配置：`/api/*` → 后端 API 地址

### 响应格式

**成功响应：**
```json
{
  "code": 1,
  "msg": "请求成功",
  "data": {}
}
```

**分页响应：**
```json
{
  "code": 1,
  "msg": "请求成功",
  "data": {
    "records": [],
    "pageCount": 10,
    "total": 100
  }
}
```

**错误响应：**
```json
{
  "code": 200101,
  "msg": "您还未登录，请重新登录!",
  "data": null
}
```

### Token 传递

前端通过 `x-token` header 传递 Token：
```javascript
config.headers['x-token'] = token
```

### 未登录处理

当后端返回 code 为 401 或 200101 时，系统会自动清除用户信息并强制跳转到登录页。

## 常见问题

### 1. 登录失败 - type 字段验证错误

**错误信息：**
```
Validation failed... field 'type': rejected value [null]... default message [不能为null]
```

**解决方案：**
确保登录请求包含 `type: 'pwd_login'` 字段。

### 2. API 请求返回 code 不是 200

后端使用 `code: 1` 表示成功，而不是常见的 `code: 200`。前端已正确配置。

### 3. 用户列表显示异常

后端 `UserVo` 使用 `mobile` 字段（不是 `phone`），`status` 可能是字符串类型。前端已做兼容处理。

### 4. 权限管理页面报错

后端 `PermissionVo` 使用 `permission`（不是 `code`）、`orders`（不是 `sort`），且有 `parentId` 字段。前端已修正字段映射。

### 5. 后端服务连接失败

**检查步骤：**
1. 确认后端服务是否运行：`curl http://localhost:11010/api/admin/v1/security/auth`
2. 检查 vite.config.js 中的代理配置
3. 检查 Token 是否正确传递（使用 x-token header）

**启动后端服务：**
```bash
cd /Users/kite/code/java/kite/libai
./gradlew :libai-admin:bootRun
```

### 6. 依赖安装失败

使用淘宝镜像或清除缓存重新安装：
```bash
npm install --registry=https://registry.npmmirror.com
# 或
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### 7. 端口被占用

修改 vite.config.js 中的端口配置，或关闭占用端口的进程。

### 8. 登录后跳转但页面空白

检查 Token 是否正确保存、路由守卫配置、组件导入路径。

### 9. Element Plus 图标不显示

已在 main.js 中全局注册所有图标，如仍有问题请检查依赖是否正确安装。

### 10. 分页数据不显示

确保正确解析后端返回的 PageResult 对象：
```javascript
tableData.value = response.data?.records || []
pagination.total = response.data?.total || 0
```

## 快速诊断工具

运行检查脚本自动诊断常见问题：
```bash
./check.sh
```

该脚本会检查：
- ✅ Node.js 是否安装
- ✅ npm 是否可用
- ✅ 依赖是否安装
- ✅ 后端服务是否运行
- ✅ 配置文件是否存在

## 生产环境部署

### 构建生产版本

```bash
npm run build
```

构建完成后，dist 目录将包含所有静态文件。

### 预览生产构建

```bash
npm run preview
```

### 部署到服务器

将 `dist` 目录的内容部署到 Web 服务器（如 Nginx、Apache）。

**Nginx 配置示例：**
```nginx
server {
    listen 80;
    server_name admin.example.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理
    location /api/ {
        proxy_pass http://backend-server:11010;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 开发提示

### 热重载

开发模式下，代码修改会自动刷新浏览器，无需手动重启。

### Vue DevTools

建议安装 Vue DevTools 浏览器扩展，方便调试：
- Chrome: https://chrome.google.com/webstore/detail/vuejs-devtools
- Firefox: https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/

### 调试技巧

**开启详细日志：**
```javascript
// 在 utils/request.js 中添加
request.interceptors.request.use((config) => {
  console.log('请求:', config.method, config.url, config.data)
  return config
})

request.interceptors.response.use((response) => {
  console.log('响应:', response.status, response.data)
  return response
})
```

**检查 Vue 状态：**
安装 Vue DevTools 浏览器扩展，查看 Pinia store 状态。