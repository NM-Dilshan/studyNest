# Volunteer Module Quick Start Guide

## Getting Started

### 1. Access the Volunteer Page
Open your browser and navigate to:
```
http://localhost:3000/volunteer
```

### 2. What You'll See
- **Header**: Navigation and logout button
- **Welcome Message**: Personalized greeting for logged-in volunteer
- **Submission Form**: Create new hall submissions
- **Quick Tips**: Best practices sidebar
- **Status Guide**: Explanation of status codes
- **My Submissions**: List of your submissions with countdown timers

## How to Submit a Hall Update

### Step 1: Select a Lecture Hall
1. Click the "Lecture Hall" dropdown
2. Choose from available halls (showing building, floor, and capacity)

### Step 2: Choose Availability Status
Select one of:
- **Free** - Hall is completely available
- **Partially Busy** - Some classes running, some seats free
- **Busy** - Hall is fully occupied

### Step 3: Set Occupancy Level
Choose from:
- **Empty** - No one is there
- **Low** - Few people (less than 25%)
- **Medium** - Moderate occupancy (25-75%)
- **High** - Mostly full (75-99%)
- **Full** - Completely occupied

### Step 4: (Optional) Add Available Seats
Enter the number of available seats:
- Must be 0 or positive number
- Cannot exceed hall capacity
- If occupancy is "Full", this should be 0

### Step 5: (Optional) Add Notes
Write any additional information:
- "Temporary closure for maintenance"
- "Ongoing exam, available after 2 PM"
- "Projector broken, not recommended"

### Step 6: Set Expiry Duration
Choose how long your submission is valid:
- **30 Minutes** - For frequent updates
- **1 Hour** - Standard duration
- **2 Hours** - For longer-term updates
- **Custom** - Pick exact expiration date/time (must be in the future)

### Step 7: Submit
Click the "Submit Update" button

You'll see a success message if the submission was created successfully.

## Managing Your Submissions

### View Your Submissions
Your submissions appear in the "My Submissions" section below the form, showing:
- Hall name and building
- Status and occupancy level
- Available seats
- When created and expires
- **Time remaining** (countdown)
- Active/Expired status badge

### Edit a Submission
1. Find the submission in your list
2. Click the blue **Edit** button
3. Form will open with pre-filled values
4. Make your changes
5. Click **Update Submission**

**Note**: Cannot edit expired submissions - delete and create new one instead

### Delete a Submission
1. Find the submission in your list
2. Click the red **Delete** button
3. Confirm deletion (required for safety)
4. Submission removed from database

### About Expiry
- After expiry time passes, submission shows as "Expired"
- Edit and Delete buttons disappear for expired submissions
- Expired submissions stay in your history for reference
- You can create a new submission once one expires

## Tips for Accurate Updates

✅ **DO:**
- Update when you're currently in or just leaving the hall
- Be honest about occupancy levels
- Set appropriate expiry times based on how long the information will be accurate
- Update again if conditions have changed before expiry
- Use the notes field for important context

❌ **DON'T:**
- Submit outdated information
- Guess about occupancy levels
- Set expiry far in the future if conditions might change
- Create multiple submissions for the same hall (edit instead)
- Submit during break times without verification

## Common Questions

### Q: What if I make a mistake?
A: Use the Edit button to correct it. Edited submissions reset the expiry timer.

### Q: Can I update the same hall twice?
A: Only once per 15 minutes. Use the Edit button to update existing submissions instead, or wait 15 minutes to create a new one.

### Q: What happens when time expires?
A: The submission automatically becomes inactive. It won't show in student-facing results, but stays in your history. Create a new submission to update.

### Q: How long should I set the expiry?
A: Set it based on how long the information will be accurate:
- **30 minutes**: If situation changes frequently
- **1 hour**: Standard for typical conditions
- **2 hours**: If hall conditions are stable
- **Custom**: For specific events or maintenance windows

### Q: What do the colors mean?
A: 
- 🟢 **Green**: Free/Low occupancy - Good for studying
- 🟡 **Yellow**: Medium occupancy - Moderate crowding
- 🟠 **Orange**: High occupancy - Getting crowded
- 🔴 **Red**: Busy/Full - Not available

### Q: Can students see my name?
A: No. Your submissions appear anonymously to students. Only your volunteer status gets tracked.

## Troubleshooting

### Form Won't Submit
1. Check that all required fields are filled in red
2. Verify available seats (if filled) are valid
3. If custom expiry, ensure date is in the future
4. Try refreshing the page and submitting again

### Can't See Form or List
1. Make sure you're logged in as a volunteer
2. Check URL is `http://localhost:3000/volunteer`
3. If still blank, check browser console for errors (F12)

### Countdown Not Updating
1. Countdown updates automatically every second
2. If stuck, refresh the page
3. Check if submission has already expired

### Cooldown Error When Submitting
1. This means you submitted for this hall less than 15 minutes ago
2. Solution: Use the Edit button on your existing submission instead
3. Editing resets the expiry time without triggering cooldown
4. Or wait 15 minutes and create a brand new submission

## Keyboard Shortcuts

- `Enter` in any form field = Submit form
- `Delete` key in confirmation = Confirm delete
- `Escape` key = Cancel edit

## Data Privacy

- Your submissions are only stored in the StudyNest database
- Not shared with third parties
- You can delete any submission at any time
- Expired submissions are not shared with students

## Next Steps

- 📖 Read the detailed [VOLUNTEER_MODULE_DOCS.md](./VOLUNTEER_MODULE_DOCS.md) for technical details
- 🔗 Visit the [HOME PAGE](/home) to see how students use your data
- 📊 Check the [DASHBOARD](/Sunera/volunteer) to view your volunteer statistics
- ❓ Contact support if you have questions

---

**Happy volunteering!** Your updates help students find study spaces faster. 🎓📚

Last Updated: March 24, 2024
