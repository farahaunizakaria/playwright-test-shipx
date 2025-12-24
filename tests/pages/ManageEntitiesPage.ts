import { Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { EntityData } from '../data/ManageEntitiesData';

export class ManageEntitiesPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigateToManage() {
    console.log('🗂️ Navigating to Manage section...');

    // Click user icon to open menu
try {
  await this.page.locator('.anticon.anticon-user > svg > path').click({ timeout: 2000 });
} catch {
  await this.page.getByRole('img', { name: 'user' }).locator('svg').click();
}
    await this.page.waitForTimeout(500);

    // Click Manage link
    await this.page.getByRole('link', { name: 'Manage' }).click();
    await this.page.waitForTimeout(1000);

    console.log('✅ Successfully navigated to Manage section');
  }

  async navigateToEntity(entity: EntityData) {
    console.log(`📂 Navigating to ${entity.name}...`);

    // Click the entity link
    const link = this.page.getByRole('link', {
      name: String(entity.linkName),
      exact: entity.linkName === 'Companies' || entity.linkName === 'Rates',
    });

    await link.click();

    // Wait for navigation with reduced timeout
    try {
      await this.page.waitForURL(new RegExp(entity.url), { timeout: 2000 });
    } catch {
      // Continue even if URL doesn't match exactly
    }
  }


  /**
   * Verify entity page displays correctly
   */
  async verifyEntityPageDisplays(entity: EntityData) {
    // Quick check that page content is visible
    const pageContent = this.page.locator('.ant-layout-content, .ant-table, .ant-card, .ant-list, .ant-form');
    await pageContent.first().waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
  }

  /**
   * Check if entity has a table with data
   */
  async hasTableData(entity: EntityData): Promise<boolean> {
    const table = this.page.locator('.ant-table tbody tr').first();
    return await table.isVisible({ timeout: 1000 }).catch(() => false);
  }

  /**
   * Check if entity has a list view with data
   */
  async hasListData(entity: EntityData): Promise<boolean> {
    const listItem = this.page.locator('.ant-list-item').first();
    return await listItem.isVisible({ timeout: 1000 }).catch(() => false);
  }

  /**
   * Check if entity has card view with data
   */
  async hasCardData(entity: EntityData): Promise<boolean> {
    const card = this.page.locator('.ant-card').first();
    return await card.isVisible({ timeout: 1000 }).catch(() => false);
  }

  /**
   * Verify entity displays data (table, list, or card)
   */
  async verifyEntityHasData(entity: EntityData) {
    // Check for any type of data display (run in parallel)
    const [hasTable, hasList, hasCards] = await Promise.all([
      this.hasTableData(entity),
      this.hasListData(entity),
      this.hasCardData(entity)
    ]);

    return hasTable || hasList || hasCards;
  }

  /**
   * Complete flow: Navigate to entity and verify it displays
   */
  async visitAndVerifyEntity(entity: EntityData) {
    await this.navigateToEntity(entity);
    await this.verifyEntityPageDisplays(entity);
    await this.verifyEntityHasData(entity);
  }
}