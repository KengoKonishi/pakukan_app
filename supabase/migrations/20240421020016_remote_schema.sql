revoke delete on table "public"."admins" from "anon";

revoke insert on table "public"."admins" from "anon";

revoke references on table "public"."admins" from "anon";

revoke select on table "public"."admins" from "anon";

revoke trigger on table "public"."admins" from "anon";

revoke truncate on table "public"."admins" from "anon";

revoke update on table "public"."admins" from "anon";

revoke delete on table "public"."admins" from "authenticated";

revoke insert on table "public"."admins" from "authenticated";

revoke references on table "public"."admins" from "authenticated";

revoke select on table "public"."admins" from "authenticated";

revoke trigger on table "public"."admins" from "authenticated";

revoke truncate on table "public"."admins" from "authenticated";

revoke update on table "public"."admins" from "authenticated";

revoke delete on table "public"."admins" from "service_role";

revoke insert on table "public"."admins" from "service_role";

revoke references on table "public"."admins" from "service_role";

revoke select on table "public"."admins" from "service_role";

revoke trigger on table "public"."admins" from "service_role";

revoke truncate on table "public"."admins" from "service_role";

revoke update on table "public"."admins" from "service_role";

revoke delete on table "public"."owner_groups" from "anon";

revoke insert on table "public"."owner_groups" from "anon";

revoke references on table "public"."owner_groups" from "anon";

revoke select on table "public"."owner_groups" from "anon";

revoke trigger on table "public"."owner_groups" from "anon";

revoke truncate on table "public"."owner_groups" from "anon";

revoke update on table "public"."owner_groups" from "anon";

revoke delete on table "public"."owner_groups" from "authenticated";

revoke insert on table "public"."owner_groups" from "authenticated";

revoke references on table "public"."owner_groups" from "authenticated";

revoke select on table "public"."owner_groups" from "authenticated";

revoke trigger on table "public"."owner_groups" from "authenticated";

revoke truncate on table "public"."owner_groups" from "authenticated";

revoke update on table "public"."owner_groups" from "authenticated";

revoke delete on table "public"."owner_groups" from "service_role";

revoke insert on table "public"."owner_groups" from "service_role";

revoke references on table "public"."owner_groups" from "service_role";

revoke select on table "public"."owner_groups" from "service_role";

revoke trigger on table "public"."owner_groups" from "service_role";

revoke truncate on table "public"."owner_groups" from "service_role";

revoke update on table "public"."owner_groups" from "service_role";

alter table "public"."admins" drop constraint "public_admins_owner_group_id_fkey";

alter table "public"."admins" drop constraint "public_admins_user_id_fkey";

alter table "public"."cleaners" drop constraint "public_cleaners_user_id_fkey";

alter table "public"."admins" drop constraint "admins_pkey";

alter table "public"."owner_groups" drop constraint "owner_groups_pkey";

drop index if exists "public"."admins_pkey";

drop index if exists "public"."owner_groups_pkey";

drop table "public"."admins";

drop table "public"."owner_groups";

alter table "public"."cleaners" drop column "user_id";

CREATE UNIQUE INDEX cleaners_line_user_id_key ON public.cleaners USING btree (line_user_id);

alter table "public"."cleaners" add constraint "cleaners_line_user_id_key" UNIQUE using index "cleaners_line_user_id_key";


