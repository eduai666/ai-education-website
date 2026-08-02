import rawCellDemo from "../../../docs/markdown/生物学习/00-可复现基线/cell-demo-v1.json";
import rawAiFixture from "../../../docs/markdown/生物学习/00-可复现基线/fixtures/ai/plan-fixture-v1.json";
import {
  CELL_STRUCTURE_IDS,
  type CellAiFixture,
  type CellDemoContent,
  type CellStructureId,
} from "./types";

function assertVersionedContent() {
  if (rawCellDemo.schemaVersion !== "cell-demo.schema.v1") {
    throw new Error("Unsupported cell demo schema version.");
  }

  if (rawAiFixture.schemaVersion !== "cell-ai-fixture.schema.v1") {
    throw new Error("Unsupported AI fixture schema version.");
  }

  const actualIds = rawCellDemo.structures.map((structure) => structure.id);
  const expectedIds = new Set<string>(CELL_STRUCTURE_IDS);

  if (
    actualIds.length !== CELL_STRUCTURE_IDS.length ||
    new Set(actualIds).size !== CELL_STRUCTURE_IDS.length ||
    actualIds.some((id) => !expectedIds.has(id))
  ) {
    throw new Error("Cell demo must contain exactly the three fixed structure IDs.");
  }

  const sourceIds = new Set(rawCellDemo.sources.map((source) => source.id));
  if (
    rawCellDemo.structures.some((structure) =>
      structure.sourceIds.some((sourceId) => !sourceIds.has(sourceId)),
    )
  ) {
    throw new Error("Every structure source must resolve to the source registry.");
  }

  if (
    rawAiFixture.demoVersion !== rawCellDemo.demoVersion ||
    rawAiFixture.requirementsVersion !== rawCellDemo.requirementsVersion ||
    rawAiFixture.factsVersion !== rawCellDemo.factsVersion
  ) {
    throw new Error("AI fixture versions must match the cell demo content.");
  }
}

assertVersionedContent();

export const cellDemo = rawCellDemo as CellDemoContent;
export const cellAiFixture = rawAiFixture as CellAiFixture;

export function getCellStructure(id: CellStructureId) {
  const structure = cellDemo.structures.find((item) => item.id === id);

  if (!structure) {
    throw new Error(`Unknown cell structure: ${id}`);
  }

  return structure;
}
