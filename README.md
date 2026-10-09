# Aishwarya Silam - Habit Tracker
## Assignment 2 

## Render link: ------

This application is a simple full-stack webpage that allows users to add/delete and edit personal habits that they want to track. Each habit can be logged with a description, frequency(in days), and the "next due date" of the habit. This uses a custom Node.js server to handle the static file serving and a REST APIL to manage the habits.

To add a habit you can type in the info that is requested to be provided at the top of the screen and the habit will be added onto the list below. 

To delete a habit select the "Delete" button on the habit you would like to delete.

To edit a habit select the "Edit" button on the habit you would like to edit. At the top of the screen the textbox and frequency will update with the selected habit information, allowing the user to make changes. Once changes are made users select "Update Habit" to see their changes implemented in the list. 

## Technical Achievements
- **1: Single-Page App Behavior**: The interface for the habit tracker is single-page, meaning the form to add and the form to edit habits and the resulting habit table are all on the same page. When the user submits a new habit or edits an existing habit the frontend fetches the updated data and updates the table dynamically without haing to reload the page to update. It was importnat for me to keep in mind the user side of the habit table had to be in sync with the server to make sure any changes being made to the habit table were updateing properly.

- **2: Editing A Habit Function**: Instead of simply adding and deleting a habit, the user can edit existing habits. When the "Edit" button is selected the form to udpate is pre-filled with existing information and resubmitting the form sends a PUT request to the server which updates the field. This was a little tricky for me to manage the Add/Edit differences in the form.

- **3: Overdue Habits Highlighted**: For user accessibility I automated the habits that are past the next due date to be automatically highlighted in red in the main table. This is computing dynamically every time the table is rendered based on the current date.

### Design/Evaluation Achievements
- **1: UI Simple**: Maintained a simple and visually clean interface. Since this is a habit tracker it can get cluttered very quickly based on how detialed the user would like to be with their descriptions and just how many habits they are tracking. I wanted to make sure the webpage didn't feel overwhelming at any point and kept it to a very simple color palette, font formatting, etc. To make it more convenient and pop out to the user I wanted to make sure that overtime as the user uses the webpage and keeps track of their habits, overdue habits pop out by color (allowing it to grab the users attention immediately). 
- **2: User Testing (Very Informal)**: I briefly asked a few peers to naviagete the webpage with no guidance or suggestions from me. I observed that the wording and button placement was pretty intuitive. A reoccuring issue I did notice though is whenever the user clicked the Edit button they assumed they would be able to edit their habit info directly on the chart. I think I would try to visually create a distinction to avoid the confusion of editing the habit and adding the habit in the same location (either by color or changing the location of where the user edits the habit).