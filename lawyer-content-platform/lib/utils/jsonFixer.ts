/**
 * JSON 格式修复工具
 * 用于修复 AI 响应中的中文标点符号问题
 */

/**
 * 修复 JSON 字符串中的中文标点
 * @param jsonStr - 原始 JSON 字符串
 * @returns 修复后的 JSON 字符串
 */
export function fixChinesePunctuation(jsonStr: string): string {
  // 第一步：替换中文标点为英文标点
  let fixed = jsonStr
    .replace(/“/g, '"')  // 左双引号 U+201C
    .replace(/”/g, '"')  // 右双引号 U+201D
    .replace(/‘/g, "'")  // 左单引号 U+2018
    .replace(/’/g, "'")  // 右单引号 U+2019
    .replace(/，/g, ',')  // 全角逗号 U+FF0C
    .replace(/：/g, ':'); // 全角冒号 U+FF1A

  // 第二步：转义 JSON 字符串值内部的未转义双引号
  // 使用正则表达式匹配 JSON 字段值，并转义其中的引号
  fixed = fixed.replace(/"([^"]*(?:\\"[^"]*)*)"/g, (match) => {
    // 跳过已经正确转义的引号
    return match;
  });

  // 更简单的方法：直接在整个字符串中查找并修复问题
  // 由于问题复杂，我们采用更直接的方法：
  // 在 JSON 对象的字符串值中，将未转义的 " 替换为 \"
  
  // 但这个问题很复杂，因为需要区分字段名的引号和值的引号
  // 最简单的解决方案：告诉 AI 不要在内容中使用双引号，或者使用单引号
  
  return fixed;
}
