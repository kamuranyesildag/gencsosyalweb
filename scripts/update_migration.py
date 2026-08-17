with open('migrations/0014_colorful_retro_girl.sql', 'r', encoding='utf-8') as f:
    content = f.read()

cleanup_sql = """-- Clean up duplicate reposts before adding unique constraint
DELETE FROM "reposts" a USING (
  SELECT MIN(id) as id, user_id, post_id
  FROM "reposts"
  GROUP BY user_id, post_id HAVING COUNT(*) > 1
) b
WHERE a.user_id = b.user_id AND a.post_id = b.post_id AND a.id <> b.id;

"""

with open('migrations/0014_colorful_retro_girl.sql', 'w', encoding='utf-8') as f:
    f.write(cleanup_sql + content)

print("Migration updated.")
