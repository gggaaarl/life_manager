-- Dom 23-ago: quitar carrera Yape S/10.50 (no corresponde)

delete from public.finance_movements fm
using public.profiles p
where fm.user_id = p.id
  and p.email = 'jcacerespdl@gmail.com'
  and fm.source = 'driver_income'
  and fm.amount_soles = 10.50
  and fm.occurred_at >= '2026-08-23T05:00:00Z'
  and fm.occurred_at < '2026-08-24T05:00:00Z';
