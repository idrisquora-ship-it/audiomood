# Backend Smoke Checklist

Run these SQL checks in Supabase SQL editor after deploys/migrations.

## 1) Core New Module Tables Exist
```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'podcasts','podcast_episodes','podcast_followers','podcast_history','podcast_comments','podcast_categories','saved_podcast_episodes',
    'radio_sessions','radio_queue','radio_feedback','radio_preferences',
    'listening_parties','party_members','party_queue','party_messages','party_reactions','party_votes','party_playback_state',
    'live_rooms','live_room_participants','live_room_speakers','live_room_messages','live_room_reactions','live_room_requests',
    'notification_settings','privacy_settings','playback_settings','podcast_settings','mood_radio_settings','party_settings','live_room_settings','artist_settings',
    'push_tokens','push_delivery_logs','push_receipts'
  )
order by table_name;
```

## 2) Push Pipeline Schema
```sql
select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'push_delivery_logs'
order by ordinal_position;

select column_name, data_type
from information_schema.columns
where table_schema = 'public' and table_name = 'push_receipts'
order by ordinal_position;
```

## 3) RLS Enabled on Push Tables
```sql
select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
  and tablename in ('push_tokens','push_delivery_logs','push_receipts')
order by tablename;
```

## 4) Edge Function Health (manual invoke)
- `send-push-notification` payload:
```json
{
  "user_profile_id": "<profile-id>",
  "title": "Smoke Test",
  "body": "Push test from backend checklist",
  "data": { "type": "smoke_test" }
}
```
- `check-push-receipts` payload:
```json
{}
```

## 5) Verify Push Logs/Receipts Writes
```sql
select id, user_id, ticket_id, ticket_status, created_at
from public.push_delivery_logs
order by created_at desc
limit 20;

select id, ticket_id, receipt_status, created_at
from public.push_receipts
order by created_at desc
limit 20;
```

## 6) Notification Fanout Checks
```sql
select type, count(*) as total
from public.notifications
group by type
order by total desc;
```

## 7) Recommendation Signal Checks
```sql
select user_id, song_id, score, signals, updated_at
from public.recommendation_scores
order by updated_at desc
limit 30;
```
