-- Resolve email from username so clients can sign in with Supabase Auth (password) using username or email.

create or replace function public.resolve_sign_in_email(p_identifier text)
returns text
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  trimmed text := trim(coalesce(p_identifier, ''));
  v_email text;
begin
  if trimmed = '' then
    return null;
  end if;
  -- Anything containing @ is treated as an email literal.
  if position('@' in trimmed) > 0 then
    return trimmed;
  end if;
  select au.email into v_email
  from auth.users au
  inner join public.profiles pr on pr.user_id = au.id
  where lower(pr.username) = lower(trimmed)
  limit 1;
  return v_email;
end;
$$;

comment on function public.resolve_sign_in_email(text) is
  'Maps username -> auth email for password login. Pass-through when identifier looks like email. SECURITY DEFINER; execute granted to anon.';

revoke all on function public.resolve_sign_in_email(text) from public;
grant execute on function public.resolve_sign_in_email(text) to anon;
grant execute on function public.resolve_sign_in_email(text) to authenticated;
