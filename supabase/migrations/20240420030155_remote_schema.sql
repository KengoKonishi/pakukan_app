drop policy "Enable read access for owner" on "public"."guest_houses";

alter table "public"."cleaners" drop constraint "public_cleaners_owner_group_id_fkey";

alter table "public"."guest_houses" drop constraint "public_guest_houses_owner_group_id_fkey";

alter table "public"."cleaners" drop column "line_access_token";

alter table "public"."cleaners" drop column "owner_group_id";

alter table "public"."cleaners" add column "line_user_id" character varying not null default ''::character varying;

alter table "public"."cleaners" alter column "created_at" set default now();

alter table "public"."cleaners" alter column "is_deleted" set default '0'::smallint;

alter table "public"."cleaners" alter column "updated_at" set default now();

alter table "public"."cleaning_schedules" alter column "cleaner_id" drop not null;

alter table "public"."cleaning_status" disable row level security;

alter table "public"."guest_houses" drop column "owner_group_id";

alter table "public"."guest_houses" disable row level security;


