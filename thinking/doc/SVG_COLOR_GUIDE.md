# SVG 颜色调整指南

## 🎨 基础知识

SVG 中的颜色主要通过以下属性控制：
- `fill`: 填充颜色（形状内部）
- `stroke`: 描边颜色（形状边框）
- `stop-color`: 渐变色的停止点颜色

## 📝 方法 1：直接修改属性值

### 修改单色 SVG
```xml
<!-- 原始（金色） -->
<path fill="#D5A64E" d="..." />

<!-- 改成蓝色 -->
<path fill="#3B82F6" d="..." />

<!-- 改成红色 -->
<path fill="#EF4444" d="..." />
```

### 修改描边颜色
```xml
<circle stroke="#000000" stroke-width="2" fill="none" />
```

## 📝 方法 2：使用 CSS 类

```xml
<svg xmlns="http://www.w3.org/2000/svg">
  <style>
    .primary { fill: #3B82F6; }
    .secondary { fill: #10B981; }
    .accent { fill: #F59E0B; }
  </style>
  
  <path class="primary" d="..." />
  <circle class="secondary" cx="50" cy="50" r="20" />
</svg>
```

## 📝 方法 3：使用 CSS 变量（推荐）

```xml
<svg xmlns="http://www.w3.org/2000/svg">
  <style>
    :root {
      --primary-color: #3B82F6;
      --secondary-color: #10B981;
    }
    .icon { fill: var(--primary-color); }
  </style>
  
  <path class="icon" d="..." />
</svg>
```

### 在 HTML 中动态修改
```html
<style>
  svg {
    --primary-color: #3B82F6;
  }
  svg:hover {
    --primary-color: #EF4444;
  }
</style>
```

## 📝 方法 4：使用 currentColor

```xml
<svg xmlns="http://www.w3.org/2000/svg">
  <path fill="currentColor" d="..." />
</svg>
```

```css
/* 在 CSS 中控制颜色 */
svg {
  color: #3B82F6;
}
```

## 🌈 常用颜色参考

### Tailwind CSS 颜色
```
蓝色系:
- #3B82F6 (blue-500)
- #2563EB (blue-600)
- #1D4ED8 (blue-700)

绿色系:
- #10B981 (green-500)
- #059669 (green-600)
- #047857 (green-700)

红色系:
- #EF4444 (red-500)
- #DC2626 (red-600)
- #B91C1C (red-700)

黄色系:
- #F59E0B (amber-500)
- #D97706 (amber-600)
- #B45309 (amber-700)

紫色系:
- #8B5CF6 (violet-500)
- #7C3AED (violet-600)
- #6D28D9 (violet-700)
```

## 🎯 实际示例：修改 at.svg

### 原始文件
```xml
<path fill="#D5A64E" d="..." />
```

### 改成蓝色
```xml
<path fill="#3B82F6" d="..." />
```

### 改成渐变
```xml
<svg>
  <defs>
    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3B82F6" />
      <stop offset="100%" style="stop-color:#1D4ED8" />
    </linearGradient>
  </defs>
  <path fill="url(#blueGradient)" d="..." />
</svg>
```

## 🔧 批量修改工具

### 使用文本编辑器
1. 打开 SVG 文件
2. 查找 `fill="#D5A64E"`
3. 替换为 `fill="#3B82F6"`

### 使用命令行（macOS/Linux）
```bash
# 替换单个文件
sed -i '' 's/#D5A64E/#3B82F6/g' at.svg

# 批量替换目录下所有 SVG
find . -name "*.svg" -exec sed -i '' 's/#D5A64E/#3B82F6/g' {} \;
```

### 使用 Node.js 脚本
```javascript
const fs = require('fs');

const svgContent = fs.readFileSync('at.svg', 'utf8');
const newContent = svgContent.replace(/#D5A64E/g, '#3B82F6');
fs.writeFileSync('at-blue.svg', newContent);
```

## 💡 高级技巧

### 1. 多色 SVG
```xml
<svg>
  <path fill="#3B82F6" d="..." />  <!-- 蓝色部分 -->
  <path fill="#10B981" d="..." />  <!-- 绿色部分 -->
  <path fill="#F59E0B" d="..." />  <!-- 黄色部分 -->
</svg>
```

### 2. 透明度控制
```xml
<!-- 使用 RGBA -->
<path fill="rgba(59, 130, 246, 0.5)" d="..." />

<!-- 使用 opacity 属性 -->
<path fill="#3B82F6" opacity="0.5" d="..." />

<!-- 使用 fill-opacity -->
<path fill="#3B82F6" fill-opacity="0.5" d="..." />
```

### 3. 动态主题切换
```html
<style>
  [data-theme="light"] svg {
    --icon-color: #1F2937;
  }
  [data-theme="dark"] svg {
    --icon-color: #F9FAFB;
  }
</style>

<svg>
  <path fill="var(--icon-color)" d="..." />
</svg>
```

## 🛠️ 在线工具

- **SVGOMG**: https://jakearchibald.github.io/svgomg/
  - 优化 SVG 文件
  - 可视化编辑颜色
  
- **SVG Editor**: https://svg-edit.github.io/svgedit/
  - 在线编辑 SVG
  - 直接修改颜色

- **Figma / Illustrator**
  - 专业设计工具
  - 导出时选择颜色

## 📚 总结

| 方法 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| 直接修改属性 | 简单直接 | 不灵活 | 静态图标 |
| CSS 类 | 可复用 | 需要修改 SVG | 多个相同样式 |
| CSS 变量 | 最灵活 | 浏览器兼容性 | 动态主题 |
| currentColor | 继承文本颜色 | 只能单色 | 跟随文本颜色 |

## 🎓 最佳实践

1. **使用 CSS 变量**：便于主题切换
2. **使用 currentColor**：图标跟随文本颜色
3. **优化 SVG**：移除不必要的属性
4. **使用语义化命名**：如 `--primary-color` 而非 `--blue`
5. **保持一致性**：项目中使用统一的颜色管理方式
