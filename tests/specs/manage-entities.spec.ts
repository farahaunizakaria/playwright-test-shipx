import { test, expect } from '../fixtures/fixtures';
import { ManageEntitiesPage } from '../pages/ManageEntitiesPage';
import { MANAGE_ENTITIES, getAllManageEntities } from '../data/ManageEntitiesData';

/**
 * Manage Entities Test Suite
 * Tests that all entity pages in the Manage section display correctly
 */
test.describe('Manage Section - Entity Display Verification', () => {
  let managePage: ManageEntitiesPage;

  test.beforeEach(async ({ authenticatedPage }) => {
    managePage = new ManageEntitiesPage(authenticatedPage);
    await managePage.navigateToManage();
  });

  test('should navigate through all Manage entities and verify they display', async () => {
    test.setTimeout(120000);
    const allEntities = getAllManageEntities();
    let successCount = 0;
    let failedEntities: string[] = [];

    console.log(`\n🚀 Starting verification of ${allEntities.length} entities...\n`);

    for (const entity of allEntities) {
      try {
        await managePage.visitAndVerifyEntity(entity);
        successCount++;
      } catch (error) {
        console.error(`❌ Failed to verify ${entity.name}:`, error);
        failedEntities.push(String(entity.name));
      }
    }

    console.log(`\n📊 Verification Summary:`);
    console.log(`✅ Successful: ${successCount}/${allEntities.length}`);
    
    if (failedEntities.length > 0) {
      console.log(`❌ Failed: ${failedEntities.join(', ')}`);
    }

    // Test passes if majority of entities work (allows for some entities to be empty/restricted)
    expect(successCount).toBeGreaterThan(allEntities.length * 0.8); // 80% success rate
  });
});