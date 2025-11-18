-- Ensure public bucket exists
insert into storage.buckets (id, name, public)
values ('company-logos','company-logos', true)
on conflict (id) do nothing;

-- Public can read logos
do $$ begin
  if not exists (
    select 1 from pg_policies where policyname = 'Public can read company logos' and tablename = 'objects'
  ) then
    create policy "Public can read company logos"
      on storage.objects for select
      using (bucket_id = 'company-logos');
  end if;
end $$;

-- Authenticated users can upload to their own folder (userId/...)
do $$ begin
  if not exists (
    select 1 from pg_policies where policyname = 'Users can upload their own logos' and tablename = 'objects'
  ) then
    create policy "Users can upload their own logos"
      on storage.objects for insert to authenticated
      with check (
        bucket_id = 'company-logos'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;
end $$;

-- Update policy
do $$ begin
  if not exists (
    select 1 from pg_policies where policyname = 'Users can update their own logos' and tablename = 'objects'
  ) then
    create policy "Users can update their own logos"
      on storage.objects for update to authenticated
      using (
        bucket_id = 'company-logos'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;
end $$;

-- Delete policy
do $$ begin
  if not exists (
    select 1 from pg_policies where policyname = 'Users can delete their own logos' and tablename = 'objects'
  ) then
    create policy "Users can delete their own logos"
      on storage.objects for delete to authenticated
      using (
        bucket_id = 'company-logos'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;
end $$;