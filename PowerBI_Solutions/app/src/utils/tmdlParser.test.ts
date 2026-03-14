import { describe, expect, it } from 'vitest';
import { analyzeTMDL, parseTMDL } from '@/utils/tmdlParser';

const sampleTmdl = `model "Sales Model"
  table "Sales Table"
    column "Sale ID"
      dataType: int64
    column "Amount"
      dataType: double
    column "Hidden Notes"
      dataType: string
      isHidden: true
    column "Hidden Reason"
      dataType: string
      isHidden: true
    column "Internal Comment"
      dataType: string
      isHidden: true
    measure "Complex Margin"
      table: "Sales Table"
      expression: \`\`\`
      DIVIDE([Profit], [Revenue], 0)
      \`\`\`
  relationship "Sales Customers"
    fromTable: "Sales Table"
    fromColumn: "Customer ID"
    toTable: Customers
    toColumn: CustomerID
    cardinality: manyToMany
  table Customers
    column CustomerID
      dataType: int64
  table "Staging Table"
    column RawID
      dataType: int64`;

describe('parseTMDL', () => {
  it('parses tables, relationships, and multiline measure expressions', () => {
    const model = parseTMDL(sampleTmdl);

    expect(model).not.toBeNull();
    expect(model?.name).toBe('Sales Model');
    expect(model?.tables).toHaveLength(3);
    expect(model?.tables[0]?.name).toBe('Sales Table');
    expect(model?.tables[0]?.columns).toHaveLength(5);
    expect(model?.measures).toHaveLength(1);
    expect(model?.measures[0]?.name).toBe('Complex Margin');
    expect(model?.measures[0]?.expression).toContain('DIVIDE([Profit], [Revenue], 0)');
    expect(model?.relationships[0]).toMatchObject({
      name: 'Sales Customers',
      fromTable: 'Sales Table',
      toTable: 'Customers',
      cardinality: 'manyToMany',
    });
  });
});

describe('analyzeTMDL', () => {
  it('summarizes the model and flags common modeling issues', () => {
    const analysis = analyzeTMDL(sampleTmdl);
    const recommendationIds = analysis.recommendations.map((recommendation) => recommendation.id);

    expect(analysis.summary).toEqual({
      tableCount: 3,
      columnCount: 7,
      measureCount: 1,
      relationshipCount: 1,
    });
    expect(recommendationIds).toEqual(
      expect.arrayContaining([
        'rel-Staging Table',
        'hidden-Sales Table',
        'format-strings',
        'many-to-many',
        'naming-tables',
      ]),
    );
  });
});
