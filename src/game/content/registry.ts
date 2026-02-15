import type {
  BulletPatternDefinition,
  CharacterDefinition,
  ItemDefinition,
  UltimateDefinition
} from "./types";

export class ContentRegistry {
  private readonly characters = new Map<string, CharacterDefinition>();
  private readonly ultimates = new Map<string, UltimateDefinition>();
  private readonly patterns = new Map<string, BulletPatternDefinition>();
  private readonly items = new Map<string, ItemDefinition>();

  registerCharacter(def: CharacterDefinition): void {
    this.characters.set(def.id, def);
  }

  registerUltimate(def: UltimateDefinition): void {
    this.ultimates.set(def.id, def);
  }

  registerBulletPattern(def: BulletPatternDefinition): void {
    this.patterns.set(def.id, def);
  }

  registerItem(def: ItemDefinition): void {
    this.items.set(def.id, def);
  }

  getCharacter(id: string): CharacterDefinition {
    const result = this.characters.get(id);
    if (!result) {
      throw new Error(`Character not found: ${id}`);
    }
    return result;
  }

  getUltimate(id: string): UltimateDefinition {
    const result = this.ultimates.get(id);
    if (!result) {
      throw new Error(`Ultimate not found: ${id}`);
    }
    return result;
  }

  getBulletPattern(id: string): BulletPatternDefinition {
    const result = this.patterns.get(id);
    if (!result) {
      throw new Error(`Pattern not found: ${id}`);
    }
    return result;
  }

  getItems(): ItemDefinition[] {
    return [...this.items.values()];
  }

  getItem(id: string): ItemDefinition {
    const result = this.items.get(id);
    if (!result) {
      throw new Error(`Item not found: ${id}`);
    }
    return result;
  }
}
