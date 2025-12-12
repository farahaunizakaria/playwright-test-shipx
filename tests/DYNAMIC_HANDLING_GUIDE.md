# Dynamic Handling Guide for Multiple Jobs/Trips/Legs

## The Challenge
When adding multiple jobs, trips, and legs dynamically, the DOM elements multiply and selectors like `.first()` won't work because they always select the first occurrence.

## Solution Approaches

### 1. **Array Index Method (Recommended)**
Use `nth()` with calculated indexes based on job/trip position.

```typescript
// Example: Adding Trip #2 to Job #1
async addTrip(tripData: TripData, jobIndex: number, tripIndex: number) {
    // Click "Add Trip" button for specific job
    await this.page.getByRole('button', { name: 'plus' }).nth(jobIndex).click();
    
    // Calculate dropdown index
    // If Job #1 has 2 trips, Job #2 Trip #1 would be index 2
    const dropdownIndex = (jobIndex * maxTripsPerJob) + tripIndex;
    
    // Select From Company using calculated index
    await this.page.locator('.from-company-dropdown').nth(dropdownIndex).click();
}
```

### 2. **Test ID Method (Best Practice)**
If you have control over the application, ask developers to add data-testid attributes:

```html
<!-- In your app -->
<select data-testid="job-0-trip-1-from-company">...</select>
<select data-testid="job-0-trip-1-to-company">...</select>
```

```typescript
// In your test
async addTrip(jobIndex: number, tripIndex: number) {
    await this.page.locator(`[data-testid="job-${jobIndex}-trip-${tripIndex}-from-company"]`).click();
    await this.page.locator(`[data-testid="job-${jobIndex}-trip-${tripIndex}-to-company"]`).click();
}
```

### 3. **Container Scoping Method**
Scope your selectors to specific job/trip containers:

```typescript
async addTrip(tripData: TripData, jobIndex: number, tripIndex: number) {
    // Get the specific job container
    const jobContainer = this.page.locator(`#job-${jobIndex}`);
    
    // Get the specific trip container within that job
    const tripContainer = jobContainer.locator(`.trip-${tripIndex}`);
    
    // Now select dropdowns within that specific trip
    await tripContainer.locator('.from-company-dropdown').click();
    await tripContainer.locator('.to-company-dropdown').click();
}
```

## Practical Implementation

### Test Structure
```typescript
test('should handle multiple jobs and trips', async ({ page }) => {
    const trackingPage = new TrackingPageCodegen(page);
    
    // Job #1
    await trackingPage.addJob({ jobType: 'DOMESTIC', ... }, 0);
    await trackingPage.addTrip({ fromCompany: 'ABC', toCompany: 'XYZ' }, 0, 0); // Job 0, Trip 0
    await trackingPage.addTrip({ fromCompany: 'DEF', toCompany: 'UVW' }, 0, 1); // Job 0, Trip 1
    
    // Job #2
    await trackingPage.addJob({ jobType: 'DOMESTIC', ... }, 1);
    await trackingPage.addTrip({ fromCompany: 'GHI', toCompany: 'RST' }, 1, 0); // Job 1, Trip 0
    await trackingPage.addTrip({ fromCompany: 'JKL', toCompany: 'OPQ' }, 1, 1); // Job 1, Trip 1
});
```

### Using Data Arrays
```typescript
test('should create booking with multiple jobs from data array', async ({ page }) => {
    const trackingPage = new TrackingPageCodegen(page);
    
    const jobs = [
        { 
            jobType: 'DOMESTIC', 
            trips: [
                { fromCompany: 'Company A', toCompany: 'Company B' },
                { fromCompany: 'Company B', toCompany: 'Company C' }
            ]
        },
        { 
            jobType: 'INTERNATIONAL', 
            trips: [
                { fromCompany: 'Company D', toCompany: 'Company E' }
            ]
        }
    ];
    
    // Loop through jobs
    for (let jobIndex = 0; jobIndex < jobs.length; jobIndex++) {
        await trackingPage.addJob(jobs[jobIndex], jobIndex);
        
        // Loop through trips in each job
        for (let tripIndex = 0; tripIndex < jobs[jobIndex].trips.length; tripIndex++) {
            await trackingPage.addTrip(jobs[jobIndex].trips[tripIndex], jobIndex, tripIndex);
        }
    }
});
```

## Debugging Tips

1. **Use page.pause()** to inspect the page state
```typescript
await this.page.pause(); // Opens Playwright Inspector
```

2. **Count elements** before selecting
```typescript
const dropdownCount = await this.page.locator('.from-company-dropdown').count();
console.log(`Found ${dropdownCount} dropdowns`);
```

3. **Log the index** you're targeting
```typescript
console.log(`Selecting dropdown at index: ${dropdownIndex}`);
await this.page.locator('.from-company-dropdown').nth(dropdownIndex).click();
```

4. **Take screenshots** at each step
```typescript
await this.page.screenshot({ path: `step-job${jobIndex}-trip${tripIndex}.png` });
```

## Common Pitfalls

❌ **Don't use `.first()` for dynamic content**
```typescript
await this.page.locator('.from-company-dropdown').first().click(); // Always selects Job #1
```

✅ **Do use indexed selection**
```typescript
await this.page.locator('.from-company-dropdown').nth(dropdownIndex).click();
```

❌ **Don't hardcode array positions**
```typescript
await this.page.getByText('From Company').nth(3).click(); // Breaks if structure changes
```

✅ **Do calculate positions dynamically**
```typescript
const position = (jobIndex * 2) + tripIndex;
await this.page.locator('.from-company').nth(position).click();
```

## Performance Considerations

For testing with **many jobs/trips**:

1. **Use efficient waits**
   - Avoid `waitForTimeout` where possible
   - Use `waitForLoadState` or element visibility instead

2. **Batch operations**
   - Add all jobs first, then all trips, rather than alternating

3. **Parallel test execution**
   - Split tests by number of jobs (1 job, 3 jobs, 10 jobs)
   - Run them in parallel with `test.describe.configure({ mode: 'parallel' })`

4. **Use test data builders**
```typescript
function createJobsData(count: number): JobData[] {
    return Array.from({ length: count }, (_, i) => ({
        jobType: 'DOMESTIC',
        trips: [
            { fromCompany: `Company ${i}A`, toCompany: `Company ${i}B` }
        ]
    }));
}

const jobs = createJobsData(10); // Creates 10 jobs
```


# Array Index Guide: Dynamic Jobs/Trips

## Your Friend's Advice: "Use Unique IDs or Array Indexes"

Your friend is correct! Here are **both approaches** explained:

---

## Option 1: Array Indexes (What We're Using Now) ✅

### How It Works
- Each dropdown has a position number (0, 1, 2, 3...)
- We calculate which position based on job/trip numbers
- Use `.nth(calculatedIndex)` to select the right one

### The Formula

```typescript
// For "From Company" dropdowns (every even index: 0, 2, 4, 6...)
const fromIndex = (totalPreviousTrips * 2) + (currentTripIndex * 2);

// For "To Company" dropdowns (every odd index: 1, 3, 5, 7...)
const toIndex = (totalPreviousTrips * 2) + (currentTripIndex * 2) + 1;

// Select it
await page.locator('.from-company-dropdown').nth(fromIndex).click();
```

### Real Example

```
Your booking has:
- Job #1: 1 trip (created automatically)
- Job #2: 2 trips (you add)
- Job #3: 1 trip (you add)

Dropdown positions:
┌─────────┬─────────┬───────────┬──────────┐
│ Job     │ Trip    │ From (nth)│ To (nth) │
├─────────┼─────────┼───────────┼──────────┤
│ Job #1  │ Trip #1 │     0     │    1     │
│ Job #2  │ Trip #1 │     2     │    3     │
│ Job #2  │ Trip #2 │     4     │    5     │
│ Job #3  │ Trip #1 │     6     │    7     │
└─────────┴─────────┴───────────┴──────────┘

To select "From Company" for Job #2, Trip #2:
- Previous trips: 2 (Job #1 has 1, Job #2 Trip #1 = 1)
- Index = 2 * 2 = 4
- Use: .nth(4)
```

### Code Implementation

```typescript
// In TrackingPageCodegen.ts
async addTrip(tripData: TripData, jobIndex: number = 0, tripIndex: number = 0) {
    // Step 1: Click "Add New Trip" for this job
    await this.page.getByLabel('Add New Job')
        .getByRole('button', { name: 'plus', exact: true })
        .nth(jobIndex)
        .click();
    
    // Step 2: Calculate absolute position
    // Assumption: max 10 trips per job
    const absoluteTripIndex = (jobIndex * 10) + tripIndex;
    
    // Step 3: Select From Company (even indexes)
    const fromCompanyDropdowns = this.page.locator('.ant-select.ant-select-outlined...');
    await fromCompanyDropdowns.nth(absoluteTripIndex * 2).click();
    await this.selectDropdownOption(tripData.fromCompany, 1500);
    
    // Step 4: Select To Company (odd indexes)
    const toCompanyDropdowns = this.page.locator('.ant-select.ant-select-outlined...');
    await toCompanyDropdowns.nth(absoluteTripIndex * 2 + 1).click();
    await this.selectDropdownOption(tripData.toCompany, 1500);
}
```

### Test Usage

```typescript
// Creating Job #2 with 2 trips
await trackingPage.addJob(jobData);

// First trip of Job #2 (jobIndex=1 because Job #1 exists)
await trackingPage.addTrip({
    fromCompany: 'Company A',
    toCompany: 'Company B'
}, 1, 0); // jobIndex=1, tripIndex=0

// Second trip of Job #2
await trackingPage.addTrip({
    fromCompany: 'Company C',
    toCompany: 'Company D'
}, 1, 1); // jobIndex=1, tripIndex=1
```

---

## Option 2: Unique Test IDs (Better, But Requires Developer Help) 🎯

### How It Works
- Developers add `data-testid` attributes to each dropdown
- Each ID includes job and trip numbers
- No calculation needed - super clear!

### What Developers Need to Add

```html
<!-- In the application code -->
<select 
    class="ant-select" 
    data-testid="job-0-trip-1-from-company">
    <!-- options -->
</select>

<select 
    class="ant-select" 
    data-testid="job-0-trip-1-to-company">
    <!-- options -->
</select>
```

### Your Test Code Would Be Simpler

```typescript
async addTrip(tripData: TripData, jobIndex: number = 0, tripIndex: number = 0) {
    // Much clearer! No calculation needed
    await this.page.locator(`[data-testid="job-${jobIndex}-trip-${tripIndex}-from-company"]`).click();
    await this.selectDropdownOption(tripData.fromCompany, 1500);
    
    await this.page.locator(`[data-testid="job-${jobIndex}-trip-${tripIndex}-to-company"]`).click();
    await this.selectDropdownOption(tripData.toCompany, 1500);
}
```

### Pros and Cons

| Approach      | Pros ✅ | Cons ❌ |
|---------------|---------|---------|
| **Array Index** | - Works right now<br>- No developer help needed<br>- Easy to implement | - Fragile if UI changes<br>- Hard to debug<br>- Calculation can be complex |
| **Test IDs** | - Very stable<br>- Easy to read<br>- Clear intent<br>- Easy debugging | - Requires developers to add IDs<br>- Takes time to implement<br>- May not be approved |

---

## My Recommendation 💡

**Start with Array Indexes (Option 1)** because:
1. ✅ Works immediately
2. ✅ Already implemented in your code
3. ✅ You can test while waiting for test IDs

**Then request Test IDs (Option 2)** by:
1. Showing your team this document
2. Explaining: "Array indexes break when UI changes"
3. Proposing: "Test IDs make tests more stable and maintainable"

---
## Real Examples from Your Code

```
Job #1, Trip #1:
  jobIndex=0, tripIndex=0
  absoluteIndex = (0 * 10) + 0 = 0
  From: .nth(0), To: .nth(1)

Job #1, Trip #2:
  jobIndex=0, tripIndex=1
  absoluteIndex = (0 * 10) + 1 = 1
  From: .nth(2), To: .nth(3)

Job #2, Trip #1:
  jobIndex=1, tripIndex=0
  absoluteIndex = (1 * 10) + 0 = 10  ← Notice the jump!
  From: .nth(20), To: .nth(21)

Job #2, Trip #2:
  jobIndex=1, tripIndex=1
  absoluteIndex = (1 * 10) + 1 = 11
  From: .nth(22), To: .nth(23)
```

---