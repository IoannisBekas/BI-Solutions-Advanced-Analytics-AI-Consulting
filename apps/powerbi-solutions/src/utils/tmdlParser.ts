import type { TMDLModel, TMDLTable, TMDLColumn, TMDLMeasure, TMDLRelationship, Recommendation, AnalysisResult } from '@/types';

type CurrentObject = TMDLTable | TMDLColumn | TMDLMeasure | TMDLRelationship | null;

function isMeasure(obj: CurrentObject): obj is TMDLMeasure {
  return obj !== null && 'expression' in obj && 'table' in obj;
}

function isRelationship(obj: CurrentObject): obj is TMDLRelationship {
  return obj !== null && 'fromTable' in obj && 'toTable' in obj;
}

export function parseTMDL(tmdlText: string): TMDLModel | null {
  if (!tmdlText || !tmdlText.trim()) return null;

  try {
    const model: TMDLModel = {
      name: '',
      tables: [],
      relationships: [],
      measures: []
    };

    const lines = tmdlText.split(/\r?\n/);
    let currentTable: TMDLTable | null = null;
    let currentObject: CurrentObject = null;
    let inMultilineExpression = false;
    let multilineExpression = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith('//')) continue;

      // Handle multiline expression blocks (``` delimited)
      if (inMultilineExpression) {
        if (trimmedLine === '```') {
          // End of multiline block
          inMultilineExpression = false;
          if (currentObject && 'expression' in currentObject) {
            currentObject.expression = multilineExpression.trim();
          }
          multilineExpression = '';
          continue;
        }
        multilineExpression += (multilineExpression ? '\n' : '') + trimmedLine;
        continue;
      }

      // Check for start of multiline expression block
      if (trimmedLine === '```') {
        inMultilineExpression = true;
        multilineExpression = '';
        continue;
      }

      const parts = trimmedLine.split(/\s+/);
      const keyword = parts[0].toLowerCase();

      if (keyword === 'createorreplace') {
        continue;
      }

      // Top level: Model
      if (keyword === 'model') {
        if (parts.length > 1) model.name = parts.slice(1).join(' ').replace(/"/g, '');
        currentTable = null;
        currentObject = null;
        continue;
      }

      // Table
      if (keyword === 'table') {
        const tableName = parts.slice(1).join(' ').replace(/"/g, '');
        currentTable = {
          name: tableName,
          columns: []
        };
        model.tables.push(currentTable);
        currentObject = currentTable;
        continue;
      }

      // Column (inside table)
      if (keyword === 'column' && currentTable) {
        const columnName = parts.slice(1).join(' ').replace(/"/g, '');
        const column: TMDLColumn = {
          name: columnName,
          dataType: 'string',
          isHidden: false
        };
        currentTable.columns.push(column);
        currentObject = column;
        continue;
      }

      // Measure
      if (keyword === 'measure') {
        const eqIndex = trimmedLine.indexOf('=');
        let namePart = '';
        let expressionPart = '';

        if (eqIndex !== -1) {
          const afterKeyword = trimmedLine.substring(keyword.length).trim();
          const eqRelIndex = afterKeyword.indexOf('=');
          namePart = afterKeyword.substring(0, eqRelIndex).trim();
          expressionPart = afterKeyword.substring(eqRelIndex + 1).trim();
        } else {
          namePart = parts.slice(1).join(' ');
        }

        namePart = namePart.replace(/"/g, '').replace(/'/g, '');

        // Strip ``` wrapper from inline expressions
        if (expressionPart.startsWith('```')) {
          expressionPart = expressionPart.substring(3);
        }
        if (expressionPart.endsWith('```')) {
          expressionPart = expressionPart.substring(0, expressionPart.length - 3);
        }

        const measure: TMDLMeasure = {
          name: namePart,
          expression: expressionPart.trim(),
          table: currentTable ? currentTable.name : ''
        };

        model.measures.push(measure);
        currentObject = measure;
        continue;
      }

      // Relationship
      if (keyword === 'relationship') {
        const relName = parts.slice(1).join(' ').replace(/"/g, '');
        const relationship: TMDLRelationship = {
          name: relName,
          fromTable: '',
          fromColumn: '',
          toTable: '',
          toColumn: '',
          cardinality: 'manyToOne'
        };
        model.relationships.push(relationship);
        currentObject = relationship;
        currentTable = null;
        continue;
      }

      // Properties (key: value)
      if (trimmedLine.includes(':') && currentObject) {
        const colonIndex = trimmedLine.indexOf(':');
        const key = trimmedLine.substring(0, colonIndex).trim();
        let value = trimmedLine.substring(colonIndex + 1).trim();

        // Remove quotes from value
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }

        const cleanValue = value.replace(/"/g, '');

        switch (key) {
          case 'dataType':
            if ('dataType' in currentObject) currentObject.dataType = value;
            break;
          case 'isHidden':
            if ('isHidden' in currentObject) currentObject.isHidden = value.toLowerCase() === 'true';
            break;
          case 'expression':
            if ('expression' in currentObject) {
              if (value === '' || value === '```') {
                // Multiline expression follows
                inMultilineExpression = true;
                multilineExpression = '';
              } else {
                currentObject.expression = value;
              }
            }
            break;
          case 'formatString':
            if (isMeasure(currentObject)) currentObject.formatString = value;
            break;
          case 'displayFolder':
            if (isMeasure(currentObject)) currentObject.displayFolder = value;
            break;
          case 'table':
            if (isMeasure(currentObject)) currentObject.table = cleanValue;
            break;
          case 'fromTable':
            if (isRelationship(currentObject)) currentObject.fromTable = cleanValue;
            break;
          case 'toTable':
            if (isRelationship(currentObject)) currentObject.toTable = cleanValue;
            break;
          case 'fromColumn':
            if (isRelationship(currentObject)) currentObject.fromColumn = cleanValue;
            break;
          case 'toColumn':
            if (isRelationship(currentObject)) currentObject.toColumn = cleanValue;
            break;
          case 'cardinality':
            if (isRelationship(currentObject)) currentObject.cardinality = value;
            break;
        }
      }
    }

    return model;
  } catch (error) {
    console.error('Error parsing TMDL:', error);
    return null;
  }
}

export function generateRecommendations(model: TMDLModel | null): Recommendation[] {
  const recommendations: Recommendation[] = [];

  if (!model) return recommendations;

  // Check for tables without relationships
  const tablesWithRelationships = new Set<string>();
  model.relationships.forEach(rel => {
    tablesWithRelationships.add(rel.fromTable);
    tablesWithRelationships.add(rel.toTable);
  });

  model.tables.forEach(table => {
    if (!tablesWithRelationships.has(table.name) && model.tables.length > 1) {
      recommendations.push({
        id: `rel-${table.name}`,
        type: 'warning',
        title: `Table "${table.name}" has no relationships`,
        description: `The table "${table.name}" is not connected to any other tables in the model. This may cause issues with cross-table calculations.`,
        severity: 'medium',
        affectedItems: [table.name],
        suggestion: 'Consider creating relationships to connect this table with other tables in your model.'
      });
    }
  });

  // Check for hidden columns
  model.tables.forEach(table => {
    const hiddenColumns = table.columns.filter(col => col.isHidden);
    if (hiddenColumns.length > table.columns.length * 0.5) {
      recommendations.push({
        id: `hidden-${table.name}`,
        type: 'best-practice',
        title: `High number of hidden columns in "${table.name}"`,
        description: `More than 50% of columns in "${table.name}" are hidden. Consider removing unused columns from the model to improve performance.`,
        severity: 'low',
        affectedItems: hiddenColumns.map(col => `${table.name}.${col.name}`),
        suggestion: 'Remove columns that are not used in reports to reduce model size and improve refresh performance.'
      });
    }
  });

  // Check for measures without format strings
  const measuresWithoutFormat = model.measures.filter(m => !m.formatString);
  if (measuresWithoutFormat.length > 0) {
    recommendations.push({
      id: 'format-strings',
      type: 'best-practice',
      title: 'Measures missing format strings',
      description: `${measuresWithoutFormat.length} measure(s) do not have format strings defined. This may result in inconsistent number formatting in reports.`,
      severity: 'low',
      affectedItems: measuresWithoutFormat.map(m => `${m.table}.${m.name}`),
      suggestion: 'Add appropriate format strings to measures (e.g., "#,##0.00" for currency, "0.00%" for percentages).'
    });
  }

  // Check for potential performance issues
  const largeTables = model.tables.filter(t => t.columns.length > 50);
  largeTables.forEach(table => {
    recommendations.push({
      id: `perf-${table.name}`,
      type: 'performance',
      title: `Large table detected: "${table.name}"`,
      description: `Table "${table.name}" has ${table.columns.length} columns, which may impact query performance and model size.`,
      severity: 'medium',
      affectedItems: [table.name],
      suggestion: 'Consider removing unused columns or splitting the table into smaller, more focused tables.'
    });
  });

  // Check for relationship cardinality issues
  const manyToManyRels = model.relationships.filter(r => r.cardinality === 'manyToMany');
  if (manyToManyRels.length > 0) {
    recommendations.push({
      id: 'many-to-many',
      type: 'performance',
      title: 'Many-to-many relationships detected',
      description: `${manyToManyRels.length} many-to-many relationship(s) found. These can significantly impact query performance.`,
      severity: 'high',
      affectedItems: manyToManyRels.map(r => r.name),
      suggestion: 'Consider creating bridge tables to avoid many-to-many relationships, or ensure proper indexing is in place.'
    });
  }

  // Check for naming conventions
  const tablesWithSpaces = model.tables.filter(t => t.name.includes(' '));
  if (tablesWithSpaces.length > 0) {
    recommendations.push({
      id: 'naming-tables',
      type: 'best-practice',
      title: 'Table names contain spaces',
      description: `${tablesWithSpaces.length} table(s) have spaces in their names. This is not recommended for best practices.`,
      severity: 'low',
      affectedItems: tablesWithSpaces.map(t => t.name),
      suggestion: 'Use PascalCase or underscores instead of spaces in table names (e.g., "SalesData" or "sales_data").'
    });
  }

  return recommendations;
}

export function analyzeTMDL(tmdlText: string): AnalysisResult {
  const model = parseTMDL(tmdlText);
  const recommendations = generateRecommendations(model);

  const summary = {
    tableCount: model?.tables.length || 0,
    columnCount: model?.tables.reduce((acc, t) => acc + t.columns.length, 0) || 0,
    measureCount: model?.measures.length || 0,
    relationshipCount: model?.relationships.length || 0
  };

  return {
    model,
    recommendations,
    summary
  };
}

export function answerQuestion(question: string, model: TMDLModel | null): string {
  if (!model) {
    return "Please upload a TMDL file first so I can analyze your model and answer questions about it.";
  }

  const lowerQuestion = question.toLowerCase();

  // Table-related questions
  if (lowerQuestion.includes('table') && (lowerQuestion.includes('how many') || lowerQuestion.includes('count'))) {
    return `Your model contains **${model.tables.length} table(s)**.\n\n${model.tables.map(t => `- ${t.name} (${t.columns.length} columns)`).join('\n')}`;
  }

  if (lowerQuestion.includes('list') && lowerQuestion.includes('table')) {
    return `Here are all the tables in your model:\n\n${model.tables.map(t => `- **${t.name}** (${t.columns.length} columns)`).join('\n')}`;
  }

  // Column-related questions
  if (lowerQuestion.includes('column') && (lowerQuestion.includes('how many') || lowerQuestion.includes('count'))) {
    const totalColumns = model.tables.reduce((acc, t) => acc + t.columns.length, 0);
    return `Your model contains **${totalColumns} columns** across all tables.`;
  }

  // Measure-related questions
  if (lowerQuestion.includes('measure') && (lowerQuestion.includes('how many') || lowerQuestion.includes('count'))) {
    if (model.measures.length === 0) {
      return "Your model doesn't contain any measures.";
    }
    return `Your model contains **${model.measures.length} measure(s)**.\n\n${model.measures.slice(0, 10).map(m => `- ${m.table}.${m.name}`).join('\n')}${model.measures.length > 10 ? '\n... and more' : ''}`;
  }

  if (lowerQuestion.includes('list') && lowerQuestion.includes('measure')) {
    if (model.measures.length === 0) {
      return "Your model doesn't contain any measures.";
    }
    return `Here are all the measures in your model:\n\n${model.measures.map(m => `- **${m.table}.${m.name}**${m.formatString ? ` (format: ${m.formatString})` : ''}`).join('\n')}`;
  }

  // Relationship questions
  if (lowerQuestion.includes('relationship') && (lowerQuestion.includes('how many') || lowerQuestion.includes('count'))) {
    if (model.relationships.length === 0) {
      return "Your model doesn't contain any relationships.";
    }
    return `Your model contains **${model.relationships.length} relationship(s)**.\n\n${model.relationships.map(r => `- ${r.name}: ${r.fromTable}.${r.fromColumn} → ${r.toTable}.${r.toColumn} (${r.cardinality})`).join('\n')}`;
  }

  // Specific table questions
  const tableMatch = model.tables.find(t => lowerQuestion.includes(t.name.toLowerCase()));
  if (tableMatch) {
    return `**Table: ${tableMatch.name}**\n\n- **Columns:** ${tableMatch.columns.length}\n- **Column List:**\n${tableMatch.columns.map(c => `  - ${c.name} (${c.dataType})${c.isHidden ? ' [Hidden]' : ''}`).join('\n')}`;
  }

  // General model info
  if (lowerQuestion.includes('model') || lowerQuestion.includes('summary') || lowerQuestion.includes('overview')) {
    return `**Model Overview: ${model.name || 'Unnamed Model'}**\n\n- **Tables:** ${model.tables.length}\n- **Total Columns:** ${model.tables.reduce((acc, t) => acc + t.columns.length, 0)}\n- **Measures:** ${model.measures.length}\n- **Relationships:** ${model.relationships.length}`;
  }

  // Default response
  return `I can help you understand your Power BI model. Here are some things you can ask:\n\n- "How many tables are in the model?"\n- "List all tables"\n- "How many measures?"\n- "What relationships exist?"\n- "Tell me about [table name]"\n- "Give me a model summary"`;
}
