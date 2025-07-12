/**
 * Prettier 配置文件
 * 官方配置文档：https://prettier.io/docs/en/options.html
 */

module.exports = {
  // ==============================
  // 基本格式设置
  // ==============================

  // 每行最大长度，超出自动换行（默认80）
  printWidth: 120,

  // 缩进空格数（默认2）
  tabWidth: 4,

  // 使用空格缩进而非 tab（默认false）
  useTabs: false,

  // 语句末尾加分号（默认true）
  semi: true,

  // 使用双引号而不是单引号（默认false）
  singleQuote: false,

  // 对象属性是否使用引号（"as-needed" 仅在必须时添加）
  quoteProps: "as-needed",

  // 在对象字面量中 key 与 value 之间添加空格（默认true）
  bracketSpacing: true,

  // 箭头函数参数是否使用括号
  // "avoid"：仅在必要时添加括号
  // "always"：始终添加括号
  arrowParens: "avoid",

  // 文件范围格式化的起始与结束位置（默认全文件）
  rangeStart: 0,
  rangeEnd: Infinity,

  // 行尾换行符类型（auto 代表跟随系统/原文件）
  endOfLine: "auto",

  // 是否格式化内嵌语言的内容（如 HTML 中的 <script>）
  embeddedLanguageFormatting: "auto",

  // ==============================
  // HTML / JSX 设置
  // ==============================

  // HTML 中的空格敏感性
  // "ignore"：忽略空格影响
  htmlWhitespaceSensitivity: "ignore",

  // 多行 JSX 标签的 > 是否放在最后一行末尾
  bracketSameLine: true, // 适用于所有 HTML/JSX
  jsxBracketSameLine: false, // 仅适用于 JSX，建议保持 false

  // JSX 属性中使用双引号（false 表示使用双引号）
  jsxSingleQuote: false,

  // 多行对象、数组、函数参数、调用等是否保留末尾逗号
  // "es5"：ES5 语法支持的地方添加（对象、数组等）
  trailingComma: "es5",

  // ==============================
  // 文件类型解析器覆盖
  // ==============================

  overrides: [
    {
      // Vue 文件使用 vue 解析器
      files: "*.vue",
      options: {
        parser: "vue",
      },
    },
    {
      // HTML 文件使用 html 解析器
      files: "*.html",
      options: {
        parser: "html",
      },
    },
    {
      // Markdown 文件使用 markdown 解析器
      files: "*.md",
      options: {
        parser: "markdown",
      },
    },
  ],

  // ==============================
  // 其他
  // ==============================

  // 指定默认解析器为 babel（可自动根据文件推断）
  parser: "babel",
};
