-- Reference of deployed objects. Do NOT rerun on the configured project.
-- Only for an empty project. No credentials or personal data in this file.
create table public.mcs_gps_devices (
 id uuid primary key default gen_random_uuid(),
 label text not null check (length(label) between 1 and 80),
 token_sha256 text not null unique check (token_sha256 ~ '^[a-f0-9]{64}$'),
 enabled boolean not null default false,
 receive_until timestamptz not null default now(),
 reports_remaining integer not null default 0 check (reports_remaining between 0 and 10),
 total_accepted bigint not null default 0,
 last_contact_at timestamptz,
 last_accepted_at timestamptz,
 rate_window_at timestamptz not null default now(),
 rate_count integer not null default 0 check (rate_count >= 0),
 created_at timestamptz not null default now()
);
create table public.mcs_gps_latest (
 device_id uuid primary key references public.mcs_gps_devices(id) on delete cascade,
 latitude double precision not null check (latitude between -90 and 90),
 longitude double precision not null check (longitude between -180 and 180),
 accuracy_m double precision not null check (accuracy_m between 0 and 100),
 captured_at timestamptz not null,
 received_at timestamptz not null default now(),
 expires_at timestamptz not null
);
create index mcs_gps_latest_expires_idx on public.mcs_gps_latest(expires_at);
alter table public.mcs_gps_devices enable row level security;
alter table public.mcs_gps_latest enable row level security;
revoke all on public.mcs_gps_devices, public.mcs_gps_latest from public, anon, authenticated;
grant select, insert, update, delete on public.mcs_gps_devices, public.mcs_gps_latest to service_role;
create function public.mcs_receive_gps(p_hash text,p_lat double precision,p_lon double precision,p_accuracy double precision,p_captured_at timestamptz)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
 d public.mcs_gps_devices%rowtype;
 t timestamptz := clock_timestamp();
 old_time timestamptz;
begin
 if p_hash is null or p_hash !~ '^[a-f0-9]{64}$' then return jsonb_build_object('code',401,'status','unauthorized','accepted',false); end if;
 select * into d from public.mcs_gps_devices where token_sha256=p_hash for update;
 if not found or not d.enabled then return jsonb_build_object('code',401,'status','unauthorized','accepted',false); end if;
 if d.receive_until <= t then return jsonb_build_object('code',403,'status','test_expired','accepted',false); end if;
 if d.rate_window_at <= t - interval '1 minute' then
  update public.mcs_gps_devices set rate_window_at=t, rate_count=1, last_contact_at=t where id=d.id;
 elsif d.rate_count >= 60 then return jsonb_build_object('code',429,'status','rate_limited','accepted',false);
 else update public.mcs_gps_devices set rate_count=rate_count+1,last_contact_at=t where id=d.id;
 end if;
 if d.reports_remaining <= 0 then return jsonb_build_object('code',200,'status','test_complete_no_more_positions_saved','accepted',false); end if;
 if (p_lat between -90 and 90) is not true or (p_lon between -180 and 180) is not true
  or (p_accuracy between 0 and 100) is not true or p_captured_at is null or not isfinite(p_captured_at)
 then return jsonb_build_object('code',200,'status','discarded_invalid_fix','accepted',false); end if;
 if p_captured_at < t - interval '3 minutes' or p_captured_at > t + interval '5 seconds'
 then return jsonb_build_object('code',200,'status','discarded_stale_or_future_fix','accepted',false); end if;
 select captured_at into old_time from public.mcs_gps_latest where device_id=d.id;
 if old_time is not null and old_time >= p_captured_at
 then return jsonb_build_object('code',200,'status','discarded_duplicate_or_out_of_order','accepted',false); end if;
 insert into public.mcs_gps_latest(device_id,latitude,longitude,accuracy_m,captured_at,received_at,expires_at)
 values(d.id,p_lat,p_lon,p_accuracy,p_captured_at,t,t+interval '30 minutes')
 on conflict(device_id) do update set latitude=excluded.latitude,longitude=excluded.longitude,
 accuracy_m=excluded.accuracy_m,captured_at=excluded.captured_at,received_at=excluded.received_at,expires_at=excluded.expires_at;
 update public.mcs_gps_devices set reports_remaining=reports_remaining-1,total_accepted=total_accepted+1,last_accepted_at=t where id=d.id;
 return jsonb_build_object('code',200,'status','position_received_private_test','accepted',true);
end;
$$;
revoke all on function public.mcs_receive_gps(text,double precision,double precision,double precision,timestamptz) from public,anon,authenticated;
grant execute on function public.mcs_receive_gps(text,double precision,double precision,double precision,timestamptz) to service_role;
create extension if not exists pg_cron;
select cron.schedule('mcs-gps-pilot-expiry','*/5 * * * *',$job$delete from public.mcs_gps_latest where expires_at <= now();$job$);
-- The platform created this event trigger when automatic RLS was selected.
-- Execute only when that function exists. It must remain owned by the admin.
do $$ begin
 if to_regprocedure('public.rls_auto_enable()') is not null then
  execute 'revoke execute on function public.rls_auto_enable() from public, anon, authenticated';
 end if;
end $$;
