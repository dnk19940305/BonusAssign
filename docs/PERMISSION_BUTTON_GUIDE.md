**PermissionButton 使用规范**

- **目的**: 用可复用组件在模板层统一对操作按钮做权限校验，避免每个页面重复写 `v-if="userStore.hasAnyPermission([...])"`。
- **组件路径**: [frontend/src/components/PermissionButton.vue](frontend/src/components/PermissionButton.vue)
- **Props**:
  - `permissions: string[]` — 需要满足任一权限（数组内用 or 逻辑），默认 `['admin','*']`。
- **使用示例**:

  - 简单替换单个按钮:

    ```vue
    <PermissionButton :permissions="['menu:create','admin']" type="primary" @click="onCreate">新增</PermissionButton>
    ```

  - 包裹表格行操作:

    ```vue
    <template #default="{ row }">
      <PermissionButton :permissions="['menu:view','admin']" link @click="view(row)">查看</PermissionButton>
      <PermissionButton :permissions="['menu:edit','admin']" link @click="edit(row)">编辑</PermissionButton>
    </template>
    ```

- **注意事项**:
  - `permissions` 数组内部为 or 逻辑；若需 and，请在方法层再次校验或扩展组件。
  - 组件内部依赖 `useUserStore().hasAnyPermission`，确保页面已正确引入用户 store。
  - 该组件默认隐藏按钮（`v-if`），不会渲染 DOM。

- **推荐迁移策略**:
  1. 先为 `system` 下的关键管理页面替换按钮（`MenuManagement.vue`、`RoleManagement.vue`、`WeightConfigManagement.vue`、`SystemConfig.vue`）。
  2. 运行应用并手工验证按钮显示与隐藏行为。
  3. 依次覆盖其它页面，优先修复可造成越权的重要操作。

生成时间: 2026-01-05
