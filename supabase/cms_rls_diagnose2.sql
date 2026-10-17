-- Read-only. Run by itself (the SQL editor only shows the last
-- statement's result when several are run together).
SELECT event_object_table, trigger_name, action_timing, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table IN ('contact_submissions', 'story_submissions', 'career_applications')
ORDER BY event_object_table;
