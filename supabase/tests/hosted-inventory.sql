select n.nspname as schema_name,c.relname as table_name,c.relrowsecurity as rls,
 (select count(*) from pg_constraint k where k.conrelid=c.oid) as constraints,
 (select count(*) from pg_index i where i.indrelid=c.oid) as indexes
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where c.relkind='r' and ((n.nspname='public' and c.relname like 'ayambil_test_%') or n.nspname='ayambil_private')
order by n.nspname,c.relname;
