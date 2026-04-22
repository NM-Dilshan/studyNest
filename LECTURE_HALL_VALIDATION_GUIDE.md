# Lecture Hall Code Validation - Implementation Guide

## Overview
Strict validation for lecture hall codes in the StudyNest Volunteer page. The system enforces a specific format: `[A-G][0-9]{4}` (e.g., A0103, G1210, F1203).

## Format Rules
- **Total Length**: Exactly 5 characters
- **First Character**: Single uppercase letter (A-G only)
- **Next 4 Characters**: Digits (0-9) only
- **Case**: Automatically converted to uppercase

### Valid Examples
- A0103 ✅
- G1210 ✅
- F1203 ✅
- C0326 ✅
- B2405 ✅

### Invalid Examples
- H1234 ❌ (H is outside A-G range)
- A123 ❌ (Too short - missing 1 digit)
- AA123 ❌ (Two letters instead of one)
- A12B3 ❌ (Contains letter B in digit position)
- 12345 ❌ (Missing first letter)
- Z9999 ❌ (Z is outside A-G range)

## File Structure
```
src/
├── lib/
│   └── validations/
│       └── hallCodeValidation.ts (new - utility functions)
├── components/
│   └── volunteer/
│       └── VolunteerHallForm.tsx (updated - uses validation)
└── app/
    └── api/
        └── lecture-halls/
            └── search/
                └── route.ts (updated - enforces validation)
```

## Validation Functions

### `isValidHallCode(code: string): boolean`
Validates a complete lecture hall code (5 characters).

**Example:**
```typescript
isValidHallCode('A0103')  // true
isValidHallCode('H1234')  // false
isValidHallCode('A010')   // false (incomplete)
```

### `isValidPartialHallCode(code: string): boolean`
Validates partial input while typing (allows 1-5 characters).

**Examples:**
```typescript
isValidPartialHallCode('A')       // true
isValidPartialHallCode('A0')      // true
isValidPartialHallCode('A01')     // true
isValidPartialHallCode('A010')    // true
isValidPartialHallCode('A0103')   // true
isValidPartialHallCode('H')       // false
isValidPartialHallCode('A0B')     // false
isValidPartialHallCode('AA')      // false
```

### `sanitizeHallCodeInput(input: string): string`
Cleans user input by:
1. Converting to uppercase
2. Removing invalid characters
3. Enforcing character restrictions

**Examples:**
```typescript
sanitizeHallCodeInput('a0103')    // 'A0103'
sanitizeHallCodeInput('g')        // 'G'
sanitizeHallCodeInput('f1210')    // 'F1210'
sanitizeHallCodeInput('h1234')    // '' (empty - H is invalid)
sanitizeHallCodeInput('a0b3')     // 'A0' (B is removed)
sanitizeHallCodeInput('a01234')   // 'A0123' (extra digit removed)
```

### `shouldTriggerSearch(code: string): boolean`
Determines if search API should be called.

**Rules:**
- Code must be at least 1 character
- Code must match the partial pattern
- Triggers search dropdown

**Examples:**
```typescript
shouldTriggerSearch('A')       // true - search for halls starting with A
shouldTriggerSearch('A0')      // true - search for halls starting with A0
shouldTriggerSearch('A0103')   // true - search for halls starting with A0103
shouldTriggerSearch('H')       // false - invalid first letter
shouldTriggerSearch('')        // false - empty input
```

### `isCompleteHallCode(code: string): boolean`
Checks if code is complete (exactly 5 chars) and valid.

**Examples:**
```typescript
isCompleteHallCode('A0103')   // true
isCompleteHallCode('A010')    // false (incomplete)
isCompleteHallCode('H1234')   // false (invalid format)
```

### `getFormatHelpText(): string`
Returns help text for displaying format requirements.

**Returns:**
```
"Format: A0103 (A-G + 4 digits)"
```

### `getValidationErrorMessage(input: string): string`
Returns user-friendly error message for invalid input.

**Examples:**
```typescript
getValidationErrorMessage('H1234')
// "Lecture hall code must start with A-G (received: H)"

getValidationErrorMessage('A12B3')
// "Characters after the first letter must be digits only"

getValidationErrorMessage('A010')
// "Incomplete code (1 digit remaining)"
```

## Frontend Behavior (VolunteerHallForm)

### Input Constraints
- **Max Length**: 5 characters (enforced via `maxLength={5}`)
- **Auto Convert**: Lowercase letters converted to uppercase automatically
- **Auto Filter**: Invalid characters removed in real-time
- **First Char**: Only A-G allowed
- **Remaining Chars**: Only digits (0-9) allowed

### User Experience
1. **As User Types**:
   - Input is automatically sanitized
   - If first char is invalid (H-Z), input becomes empty
   - Non-digit characters after first letter are removed
   - Input is uppercase

2. **Valid Partial Code**:
   - Dropdown appears with matching halls
   - Helper text shows "N digits remaining"
   - Search icon or spinner indicates loading

3. **Complete Code** (5 chars):
   - Green checkmark appears if valid
   - Exact match searched in database
   - If found, added to dropdown
   - If not found, "No matching halls" message

4. **Invalid Format**:
   - Red border around input
   - Error message displayed
   - Dropdown hidden
   - Form submission prevented

### Error Messages
- **Invalid First Character**: "Lecture hall code must start with A-G followed by 4 digits"
- **Too Long**: "Lecture hall code must be exactly 5 characters (A + 4 digits)"
- **Invalid Characters**: "Characters after the first letter must be digits only"
- **Incomplete**: "Incomplete code (N digit(s) remaining)"
- **Not Found**: "No lecture halls match "A0103""

## Backend Behavior (API Route)

### Validation
```typescript
// Input is validated before database query
if (!isValidPartialHallCode(query)) {
  return NextResponse.json([])  // Empty array
}
```

### Search Logic
1. **Partial Code** (1-4 digits):
   - Filter active halls where `hall_name` starts with query
   - Sort by relevance and alphabetically
   - Return up to 15 results

2. **Complete Code** (5 characters):
   - Look for exact match only
   - If found, return single result
   - If not found, return empty array

### Query Example
```
GET /api/lecture-halls/search?q=A0&limit=15

Response:
[
  {
    "hall_id": "uuid-1",
    "hall_name": "A0103",
    "building": "Building A",
    "floor": 1,
    "capacity": 50
  },
  {
    "hall_id": "uuid-2",
    "hall_name": "A0205",
    "building": "Building A",
    "floor": 2,
    "capacity": 60
  }
]
```

## Form Submission Validation

### Pre-Submission Check
```typescript
if (!formData.hallId || !isValidHallCode(formData.hallName)) {
  setErrors({ hallId: 'Invalid lecture hall code format. Format: A0103 (A-G + 4 digits)' })
  return false
}
```

### Valid Submission
- User must select a hall from dropdown (ensures hall exists in DB)
- Selected hall name must match valid format
- Hall ID is verified against database

## Testing Checklist

### Valid Inputs ✅
- [ ] User types "A" → dropdown shows halls starting with A
- [ ] User types "A0" → dropdown filters to halls starting with A0
- [ ] User types "A0103" → exact match found and displayed
- [ ] User types "g1210" → auto-converts to G1210
- [ ] User selects "F1203" → form shows selected hall with green checkmark

### Invalid Inputs ✅
- [ ] User types "H" → input becomes empty, no dropdown
- [ ] User types "A0B3" → "B" removed automatically, shows A0 results
- [ ] User types "AA0" → second "A" removed, shows A results
- [ ] User types "A01234" → extra "4" removed, shows A0123 results
- [ ] Form rejects submission with unselected hall

### Validation Messages ✅
- [ ] Helper text shows "Format: A0103 (A-G + 4 digits)"
- [ ] "X digits remaining" appears during typing
- [ ] Green checkmark appears for valid 5-char code
- [ ] Red border and error message for invalid input
- [ ] "No lecture halls match" for code not in database

### Keyboard Navigation ✅
- [ ] ArrowDown/Up navigates dropdown
- [ ] Enter selects highlighted item
- [ ] Escape closes dropdown
- [ ] MaxLength prevents typing beyond 5 chars

## Example Usage in VolunteerHallForm

```typescript
import {
  isValidHallCode,
  isValidPartialHallCode,
  sanitizeHallCodeInput,
  getValidationErrorMessage,
  getFormatHelpText,
  shouldTriggerSearch,
  isCompleteHallCode,
} from '@/lib/validations/hallCodeValidation'

function VolunteerHallForm() {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    
    // Automatically sanitize input
    value = sanitizeHallCodeInput(value)
    
    setSearchQuery(value)
    
    // Only trigger search for valid partial codes
    if (shouldTriggerSearch(value)) {
      setShowDropdown(true)
      // Fetch from API
    } else {
      setShowDropdown(false)
    }
  }

  const validateForm = (): boolean => {
    if (!formData.hallName || !isValidHallCode(formData.hallName)) {
      setErrors({
        hallId: `Invalid lecture hall code format. ${getFormatHelpText()}`
      })
      return false
    }
    return true
  }

  return (
    <input
      value={searchQuery}
      onChange={handleSearchChange}
      maxLength={5}
      placeholder={`Enter lecture hall code (e.g., A0103)`}
      // ...
    />
  )
}
```

## Migration Notes
- Existing volunteer submissions are not affected
- Search API maintains backward compatibility (returns empty for invalid queries)
- Form validation is only enforced on new submissions
- Invalid hall codes in form will be rejected with clear error message

## Future Enhancements
1. Add search by building location (e.g., search "A" to show all Building A halls)
2. Add search by capacity/amenities
3. Add favorite hall shortcuts
4. Add recently used halls in dropdown
5. Add hall occupancy status in search results
