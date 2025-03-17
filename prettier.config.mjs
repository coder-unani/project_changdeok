/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  arrowParens: 'always', // always: 화살표 함수 매개변수 하나인 경우: 괄호 항상 포함, avoid: 화살표 함수 매개변수 하나인 경우: 괄호 생략
  bracketSameLine: false, // 괄호(>) 배치 위치. true: 줄 마지막에 배치, false: 새 줄에 배치
  bracketSpacing: true, // 객체 리터럴에서 괄호에 공백 삽입 여부
  embeddedLanguageFormatting: 'auto', // 코드 블록 내부의 포맷팅 여부. auto: 자동, off: 끔, on: 켬
  htmlWhitespaceSensitivity: 'css', // HTML 파일의 공백 민감도. css: CSS 속성에 따름, strict: 엄격하게 따름
  insertPragma: false, // 파일 상단에 @format 주석 삽입 여부
  jsxSingleQuote: true, // JSX 속성에 따옴표 사용 여부
  printWidth: 120, // 줄 바꿈 길이
  proseWrap: 'always', // 텍스트 줄 바꿈 여부. always: 항상, never: 절대로, preserve: 유지
  quoteProps: 'as-needed', // 객체 속성에 따옴표 사용 여부. as-needed: 필요한 경우에만, consistent: 일관되게, preserve: 유지
  requirePragma: false, // @format 주석이 있을 때만 포맷팅 여부
  semi: true, // 세미콜론 사용 여부
  singleAttributePerLine: false, // 여러 속성을 한 줄에 작성 여부
  singleQuote: true, // 문자열에 따옴표 사용 여부
  tabWidth: 2, // 탭 너비
  trailingComma: 'es5', // 여러 줄의 배열, 객체 속성 뒤에 쉼표 사용 여부. none: 사용 안 함, es5: ES5에서 사용, all: 항상 사용
  useTabs: false, // 탭 사용 여부
  vueIndentScriptAndStyle: false, // Vue 파일에서 <script>와 <style> 태그 들여쓰기 여부
  // TODO: dotenv.config() 맨 위로 위치해야 해서 주석처리. 확인 필요
  // plugins: ['@trivago/prettier-plugin-sort-imports', 'prettier-plugin-tailwindcss'], // 사용할 플러그인
  plugins: ['prettier-plugin-tailwindcss'], // 사용할 플러그인
  importOrder: ['^[^./(@/)]', '^(@/)', '^[./]'], // import 순서
  importOrderSeparation: true, // import 그룹 사이에 빈 줄 삽입 여부
  importOrderSortSpecifiers: true, // import 구문에서 명시자 정렬 여부
  importOrderTypeScriptVersion: '5.0.0', // TypeScript 버전
};

export default config;
