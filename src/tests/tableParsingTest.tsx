import React, { useState } from 'react';

/**
 * 一个用于测试Markdown表格解析逻辑的组件
 */
export default function TableParsingTest() {
  const [testTable, setTestTable] = useState(`
| 评估项目 | 模型A | 模型B | 模型C |
|---------|------|------|------|
| 相关性 | 8 | 7 | 9 |
| 准确性 | 7 | 9 | 8 |
| 信息量 | 8 | 7 | 9 |
| 流畅性 | 9 | 8 | 9 |
| 语法正确性 | 9 | 9 | 10 |
| 风格适配性 | 8 | 7 | 9 |
| 创新性 | 7 | 8 | 9 |
| 吸引力 | 8 | 7 | 8 |
| 偏见与公平性 | 9 | 9 | 9 |
| 内容安全 | 10 | 10 | 10 |
| 合规性 | 9 | 9 | 10 |
| 总分 | 92 | 90 | 100 |
  `);

  const [parseResult, setParseResult] = useState<any>(null);
  const [modelNames, setModelNames] = useState<string[]>(['模型A', '模型B', '模型C']);

  /**
   * 解析表格数据的测试函数
   */
  const testParseTable = () => {
    try {
      // 表格行正则表达式
      const tableRows = testTable.match(/\|[^\n]+\|/g) || [];
      
      console.log("找到表格行数:", tableRows.length);
      if (tableRows.length > 0) {
        console.log("第一行:", tableRows[0]);
      }
      
      // 构建表头到模型列索引的映射
      let columnIndices: Record<string, number> = {};
      
      // 查找表头行并解析列索引
      const headerRow = tableRows.find(row => 
        row.includes('| 评估项目 |') || 
        row.includes('|评估项目|') || 
        row.includes('内容质量') || 
        row.includes('相关性')
      );
      
      const results: Record<string, any> = {};
      
      if (headerRow) {
        console.log("找到表头行:", headerRow);
        
        // 分割表头并清理
        const columns = headerRow.split('|')
          .map(c => c.trim())
          .filter(c => c);
        
        console.log("表头列:", columns);
        
        // 为每个模型名称找到对应的列索引
        modelNames.forEach(name => {
          const exactMatchIndex = columns.findIndex(col => col === name);
          if (exactMatchIndex !== -1) {
            columnIndices[name] = exactMatchIndex;
            return;
          }
          
          // 尝试模糊匹配
          for (let i = 0; i < columns.length; i++) {
            if (columns[i].includes(name) || name.includes(columns[i])) {
              columnIndices[name] = i;
              break;
            }
          }
        });
        
        console.log("列索引映射:", columnIndices);
        
        // 定义分数提取函数
        const extractScoreFromTable = (criterionName: string, modelName: string): number => {
          // 查找包含该评估项的行
          const criterionRow = tableRows.find(row => 
            row.includes(`| ${criterionName} `) || 
            row.includes(`|${criterionName}|`) ||
            row.includes(`| - ${criterionName} `) || 
            row.includes(`|- ${criterionName}|`)
          );
          
          if (!criterionRow) {
            console.log(`未找到包含"${criterionName}"的行`);
            return 0;
          }
          
          console.log(`找到${criterionName}行:`, criterionRow);
          
          // 分割行并获取对应模型的分数
          const cells = criterionRow.split('|').map(c => c.trim()).filter(c => c);
          const columnIndex = columnIndices[modelName];
          
          if (columnIndex !== undefined && columnIndex < cells.length) {
            const scoreText = cells[columnIndex];
            console.log(`${modelName}的${criterionName}得分文本:`, scoreText);
            
            const scoreMatch = scoreText.match(/(\d+)/);
            if (scoreMatch) {
              return parseInt(scoreMatch[1]);
            }
          }
          
          return 0;
        };
        
        // 为每个模型名称提取分数
        for (const name of modelNames) {
          if (columnIndices[name] !== undefined) {
            const scores = {
              relevance: extractScoreFromTable('相关性', name),
              accuracy: extractScoreFromTable('准确性', name),
              information: extractScoreFromTable('信息量', name),
              fluency: extractScoreFromTable('流畅性', name),
              grammar: extractScoreFromTable('语法正确性', name),
              style: extractScoreFromTable('风格适配性', name),
              innovation: extractScoreFromTable('创新性', name),
              appeal: extractScoreFromTable('吸引力', name),
              fairness: extractScoreFromTable('偏见与公平性', name),
              safety: extractScoreFromTable('内容安全', name),
              compliance: extractScoreFromTable('合规性', name)
            };
            
            // 提取总分
            const totalScoreRow = tableRows.find(row => 
              row.includes('总分') || 
              row.includes('合计')
            );
            
            let totalScore = 0;
            
            if (totalScoreRow) {
              console.log(`找到总分行:`, totalScoreRow);
              
              const cells = totalScoreRow.split('|').map(c => c.trim()).filter(c => c);
              const columnIndex = columnIndices[name];
              
              if (columnIndex !== undefined && columnIndex < cells.length) {
                const scoreText = cells[columnIndex];
                console.log(`${name}的总分文本:`, scoreText);
                
                const scoreMatch = scoreText.match(/(\d+)/);
                if (scoreMatch) {
                  totalScore = parseInt(scoreMatch[1]);
                  console.log(`从表格中提取到${name}的总分: ${totalScore}`);
                }
              }
            }
            
            results[name] = {
              scores,
              totalScore
            };
          }
        }
      }
      
      setParseResult(results);
    } catch (error) {
      console.error("解析错误:", error);
      setParseResult({ error: String(error) });
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Markdown表格解析测试</h1>
      
      <div className="mb-4">
        <label className="block mb-2 font-medium">测试表格:</label>
        <textarea 
          value={testTable}
          onChange={(e) => setTestTable(e.target.value)}
          className="w-full h-64 p-2 border rounded"
        />
      </div>
      
      <div className="mb-4">
        <label className="block mb-2 font-medium">模型名称 (逗号分隔):</label>
        <input 
          type="text"
          value={modelNames.join(', ')}
          onChange={(e) => setModelNames(e.target.value.split(',').map(n => n.trim()))}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <button 
        onClick={testParseTable}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        测试解析
      </button>
      
      {parseResult && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">解析结果:</h2>
          <pre className="p-4 bg-gray-100 rounded overflow-auto">
            {JSON.stringify(parseResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
